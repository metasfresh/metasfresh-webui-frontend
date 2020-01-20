import counterpart from 'counterpart';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import TetherComponent from 'react-tether';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import Moment from 'moment-timezone';

import keymap from '../../shortcuts/keymap';
import OverlayField from '../app/OverlayField';
import ModalContextShortcuts from '../keyshortcuts/ModalContextShortcuts';
import Tooltips from '../tooltips/Tooltips.js';
import RawWidget from '../widget/RawWidget';
import { openFilterBox, closeFilterBox } from '../../actions/WindowActions';
import { DATE_FIELD_FORMATS } from '../../constants/Constants';

import { parseDateToReadable } from './Filters';

/**
 * @file Class based component.
 * @module FiltersItem
 * @extends Component
 * This component is responsible for rendering the actual widgets for filtering.
 * It stores a local copy of filters (since filters data come without values,
 * we need to cross-reference active filters with filters widgets to get the value
 * of fields) and active filters (to store values before submitting them to the
 * backend), which are then synced with the API via `Filters` class when applied.
 *
 * @TODO: Filters should be stored in the redux state, and the merge should also
 * happen there. This way we wouldn't have to listen for props changes in the
 * lifecycle methods as updated props would be passed directly.
 */
class FiltersItem extends PureComponent {
  constructor(props) {
    super(props);

    const { active, data } = props;
    let activeFilter = null;
    if (active) {
      activeFilter = active.find(item => item.filterId === data.filterId);
    }

    this.state = {
      filter: _.cloneDeep(props.data),
      activeFilter: activeFilter ? _.cloneDeep(activeFilter) : null,
      isTooltipShow: false,
      maxWidth: null,
      maxHeight: null,
    };
  }

  UNSAFE_componentWillMount() {
    this.init();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { active } = this.props;

    if (JSON.stringify(active) !== JSON.stringify(nextProps.active)) {
      this.init();
    }
  }

  componentDidMount() {
    if (this.widgetsContainer) {
      this.widgetsContainer.addEventListener('scroll', this.handleScroll);
    }

    if (this.props.filtersWrapper && this.widgetsContainer) {
      /* eslint-disable react/no-find-dom-node */
      const widgetElement = ReactDOM.findDOMNode(this.widgetsContainer);
      const buttonElement = widgetElement.closest('.filter-wrapper');
      const buttonClientRect = buttonElement.getBoundingClientRect();
      const wrapperElement = ReactDOM.findDOMNode(this.props.filtersWrapper);
      /* eslint-enablereact/no-find-dom-node */
      const wrapperRight = wrapperElement.getBoundingClientRect().right;
      const documentElement = wrapperElement.closest('.document-lists-wrapper');
      const documentClientRect = documentElement.getBoundingClientRect();

      if (parent) {
        const offset = ~~(
          documentClientRect.right -
          wrapperRight +
          buttonClientRect.width
        );
        const height =
          ~~(documentClientRect.top + documentClientRect.height) -
          ~~(buttonClientRect.top + buttonClientRect.height);

        this.setState({
          maxWidth: offset,
          maxHeight: height,
        });
      }
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;

    if (this.widgetsContainer) {
      this.widgetsContainer.removeEventListener('scroll', this.handleScroll);
    }

    dispatch(closeFilterBox());
  }

  /**
   * @method init
   * @summary This function merges filters with applied filters to get the
   * values for widgets when `active` filter props change, or component is mounted
   */
  init = () => {
    const { data, active } = this.props;
    let activeFilter = null;
    if (active) {
      activeFilter = active.find(item => item.filterId === data.filterId);
    }

    if (data.parameters) {
      this.mergeData(data.parameters);

      if (
        activeFilter &&
        activeFilter.parameters &&
        activeFilter.filterId === data.filterId
      ) {
        this.mergeData(activeFilter.parameters, true);
      }
    }
  };

  /**
   * @method setValue
   * @summary Called from the widgets to set the filter value. It then pushes the
   * change to the active filter.
   *
   * @param {object|array} parameter
   * @param {*} value
   * @param {*} id
   * @param {*} valueTo
   * @param {*} filterId
   * @param {*} defaultValue
   */
  setValue = (parameter, value, id, valueTo = '', filterId, defaultValue) => {
    const { resetInitialValues } = this.props;

    // if user changed field value and defaultValue is not null, then we need
    // to reset it's initial value so that it won't be set
    if (defaultValue != null) {
      resetInitialValues && resetInitialValues(filterId, parameter);
    }

    //@TODO: LOOKUPS GENERATE DIFFERENT TYPE OF parameters parameters
    // IT HAS TO BE UNIFIED
    //
    // OVERWORKED WORKAROUND
    if (!Array.isArray(parameter)) {
      parameter = [parameter];
    }

    parameter = parameter.map(param => ({
      parameterName: param,
      value,
      valueTo,
    }));

    const { filter, activeFilter } = this.mergeSingle(parameter, true);

    this.setState({ filter, activeFilter });
  };

  /**
   * @method mergeData
   * @summary Fetches the cross-merged filters/activeFilters data and saves
   * the result to the local state
   *
   * @param {obj} parameters - filter parameters object
   * @param {bool} active - defines if we're merging filter or active filter
   * parameters
   */
  mergeData = (parameters, active = false) => {
    const { filter, activeFilter } = this.mergeSingle(parameters, active);

    this.setState({ filter, activeFilter });
  };

  /**
   * @method mergeSingle
   * @summary This method syncs values between filters/active filters. It takes an array
   * of params (be it initial parameters, or updated when the widget value changes) and
   * traverses the local filter and activeFilter objects updating the values when needed.
   * If value for parameter exists it will be updated, if not - nulled. In case of active
   * filters, paremeters without values will be removed (and in case there are no more
   * parameters left the filter will be removed from active)
   *
   * @param {obj} parameters - filter parameters object
   * @param {bool} active - defines if we're merging filter or active filter
   * parameters
   */
  mergeSingle = (parameters, active) => {
    const { activeFilter, filter } = this.state;
    let newActiveFilter = activeFilter
      ? { ...activeFilter }
      : {
          filterId: filter.filterId,
          parameters: [],
        };
    let value = '';
    let valueTo = '';
    let activeValue = '';
    let activeValueTo = '';
    const paramsMap = {};
    const updatedParameters = {};

    parameters.forEach(parameter => {
      const parameterName = parameter.parameterName;

      // if filter has defaultValue, update local filters data to include
      // it for displaying

      // for active filter
      if (active) {
        value = parameter.value != null ? parameter.value : '';
        valueTo = parameter.valueTo != null ? parameter.valueTo : '';

        // if filter has value property, use it instead of defaultValue
        activeValue =
          parameter.value !== undefined
            ? parameter.value
            : parameter.defaultValue;
        activeValueTo =
          parameter.valueTo !== undefined
            ? parameter.valueTo
            : parameter.defaultValueTo;
      }

      // we need this hashmap to easily now which parameters in the local `filter`
      // should be updated
      paramsMap[parameterName] = {
        value,
        valueTo,
        activeValue,
        activeValueTo,
      };

      // update values for active filters, as we then bubble them up to use
      // this data in PATCH request updating them on the server
      const updateActive =
        active || (!active && parameter.defaultValue) ? true : false;

      if (updateActive) {
        updatedParameters[parameterName] = {
          activeValue,
          activeValueTo,
        };
      }
    });

    // updated activeFilter parameters
    const parametersArray = [];

    newActiveFilter.parameters.forEach(param => {
      if (updatedParameters[param.parameterName]) {
        const { value, activeValue, activeValueTo } = paramsMap[
          param.parameterName
        ];

        // if there's no value but param exists in the updated parameters,
        // remove the parameter from active filter.
        // Otherwise just update it's value
        if (value) {
          parametersArray.push({
            ...param,
            value: parseDateToReadable(param.widgetType, activeValue),
            valueTo: parseDateToReadable(param.widgetType, activeValueTo),
            defaultValue: null,
            defaultValueTo: null,
          });
        }

        delete updatedParameters[param.parameterName];
      } else {
        // copy params that were not updated
        parametersArray.push({
          ...param,
          defaultValue: null,
          defaultValueTo: null,
        });
      }
    });

    _.forEach(updatedParameters, ({ activeValue, activeValueTo }, key) => {
      parametersArray.push({
        parameterName: key,
        value: activeValue,
        valueTo: activeValueTo,
        defaultValue: null,
        defaultValueTo: null,
      });
    });

    // if there are no parameters, filter is not active anymore so null it
    if (_.size(parametersArray)) {
      newActiveFilter.parameters = _.map(parametersArray, val => val);
    } else {
      newActiveFilter = null;
    }

    const returnFilter = {
      ...filter,
      parameters: filter.parameters.map(param => {
        if (paramsMap[param.parameterName]) {
          const { value, valueTo } = paramsMap[param.parameterName];

          if (value) {
            return {
              ...param,
              value: parseDateToReadable(param.widgetType, value),
              valueTo: parseDateToReadable(param.widgetType, valueTo),
            };
          }
          return {
            ...param,
            value: '',
            valueTo: '',
          };
        }

        return param;
      }),
    };

    return { filter: returnFilter, activeFilter: newActiveFilter };
  };

  /**
   * @method handleScroll
   * @summary ToDo: Describe the method
   * @todo Write the documentation
   */
  handleScroll = () => {
    const { dispatch } = this.props;
    const {
      top,
      left,
      bottom,
      right,
    } = this.widgetsContainer.getBoundingClientRect();

    dispatch(openFilterBox({ top, left, bottom, right }));
  };

  /**
   * @method handleApply
   * @summary ToDo: Describe the method
   * @todo Write the documentation
   */
  handleApply = () => {
    const { applyFilters, closeFilterMenu, returnBackToDropdown } = this.props;
    const { filter, activeFilter } = this.state;

    if (
      (filter &&
        filter.parametersLayoutType === 'singleOverlayField' &&
        !filter.parameters[0].value) ||
      activeFilter === null
    ) {
      return this.handleClear();
    }

    if (!filter.parameters) {
      this.setState(
        {
          activeFilter: filter,
        },
        () => {
          applyFilters(this.state.activeFilter, () => {
            closeFilterMenu();
            returnBackToDropdown && returnBackToDropdown();
          });
        }
      );
    } else {
      applyFilters(activeFilter, () => {
        closeFilterMenu();
        returnBackToDropdown && returnBackToDropdown();
      });
    }
  };

  /**
   * @method handleClear
   * @summary clears this filter completely, removing it from the active filters
   */
  handleClear = () => {
    const {
      clearFilters,
      closeFilterMenu,
      returnBackToDropdown,
      resetInitialValues,
    } = this.props;
    const { filter } = this.state;

    resetInitialValues && resetInitialValues(filter.filterId);
    clearFilters(filter);
    closeFilterMenu();
    returnBackToDropdown && returnBackToDropdown();
  };

  /**
   * @method toggleTooltip
   * @summary shows/hides tooltip
   * @param {bool} visible
   */
  toggleTooltip = visible => {
    this.setState({
      isTooltipShow: visible,
    });
  };

  // wrappers around toggleTooltip to skip creating anonymous functions on render
  showTooltip = () => this.toggleTooltip(true);
  hideTooltip = () => this.toggleTooltip(false);

  render() {
    const {
      data,
      notValidFields,
      isActive,
      windowType,
      onShow,
      onHide,
      viewId,
      outsideClick,
      closeFilterMenu,
      captionValue,
      openedFilter,
      panelCaption,
    } = this.props;
    const { filter, isTooltipShow, maxWidth, maxHeight } = this.state;
    const style = {};

    if (maxWidth) {
      style.width = maxWidth;
      style.maxHeight = maxHeight;
    }

    return (
      <div>
        {data.parametersLayoutType === 'singleOverlayField' ? (
          <div className="screen-freeze js-not-unselect light">
            <OverlayField
              type={windowType}
              filter
              captionValue={captionValue}
              layout={filter}
              handlePatch={this.setValue}
              handleChange={this.setValue}
              closeOverlay={outsideClick ? outsideClick : closeFilterMenu}
              handleSubmit={this.handleApply}
              {...{ windowType, onShow, onHide, viewId }}
            />
          </div>
        ) : (
          <div
            className="filter-menu filter-widget"
            style={style}
            ref={c => (this.widgetsContainer = c)}
          >
            <div className="filter-controls">
              <div>
                {counterpart.translate('window.activeFilter.caption')}:
                <span className="filter-active">{panelCaption}</span>
              </div>
              {isActive && (
                <span className="filter-clear" onClick={this.handleClear}>
                  {counterpart.translate('window.clearFilter.caption')}
                  <i className="meta-icon-trash" />
                </span>
              )}
            </div>
            <div
              className={`form-group row filter-content filter-${
                data.filterId
              }`}
            >
              <div className="col-sm-12">
                {filter.parameters &&
                  filter.parameters.map((item, index) => {
                    const { widgetType } = item;
                    item.field = item.parameterName;

                    return (
                      <RawWidget
                        entity="documentView"
                        subentity="filter"
                        subentityId={filter.filterId}
                        handlePatch={(property, value, id, valueTo) =>
                          this.setValue(
                            property,
                            value,
                            id,
                            valueTo,
                            filter.filterId,
                            item.defaultValue
                          )
                        }
                        handleChange={(property, value, id, valueTo) => {
                          if (
                            (DATE_FIELD_FORMATS[widgetType] &&
                              Moment.isMoment(value)) ||
                            !DATE_FIELD_FORMATS[widgetType]
                          ) {
                            this.setValue(
                              property,
                              value,
                              id,
                              valueTo,
                              filter.filterId,
                              item.defaultValue
                            );
                          }
                        }}
                        widgetType={item.widgetType}
                        fields={[item]}
                        type={item.type}
                        widgetData={[item]}
                        key={index}
                        id={index}
                        range={item.range}
                        caption={item.caption}
                        noLabel={false}
                        filterWidget={true}
                        {...{
                          viewId,
                          windowType,
                          onShow,
                          onHide,
                        }}
                      />
                    );
                  })}
              </div>
              <div className="col-sm-12 text-right">
                {notValidFields && (
                  <div className="input-error">
                    {counterpart.translate('window.noMandatory.caption')}
                  </div>
                )}
              </div>
            </div>
            <div className="filter-btn-wrapper">
              <TetherComponent
                attachment="top left"
                targetAttachment="bottom left"
                constraints={[
                  {
                    to: 'scrollParent',
                  },
                  {
                    to: 'window',
                    pin: ['bottom'],
                  },
                ]}
              >
                {filter.isActive && !filter.parameters ? (
                  <span />
                ) : (
                  <button
                    className="applyBtn btn btn-sm btn-success"
                    onClick={this.handleApply}
                    onMouseEnter={this.showTooltip}
                    onMouseLeave={this.hideTooltip}
                  >
                    {counterpart.translate('window.apply.caption')}
                  </button>
                )}
                {isTooltipShow && (
                  <Tooltips
                    className="filter-tooltip"
                    name={keymap.DONE}
                    action={counterpart.translate('window.apply.caption')}
                    type={''}
                  />
                )}
              </TetherComponent>
            </div>
          </div>
        )}
        <ModalContextShortcuts
          done={this.handleApply}
          visibleFilter={openedFilter}
        />
      </div>
    );
  }
}

/**
 * @typedef {object} Props Component props
 * @prop {func} dispatch
 * @prop {func} applyFilters
 * @prop {func} [resetInitialValues]
 * @prop {func} [clearFilters]
 * @prop {*} [filterWrapper]
 * @prop {string} [panelCaption]
 * @prop {array} [active]
 * @prop {*} data
 * @prop {*} notValidFields
 * @prop {*} isActive
 * @prop {*} windowType
 * @prop {*} onShow
 * @prop {*} onHide
 * @prop {*} viewId
 * @prop {*} outsideClick
 * @prop {*} closeFilterMenu
 * @prop {*} captionValue
 * @prop {*} openedFilter
 * @prop {*} returnBackToDropdown
 * @todo Check props. Which proptype? Required or optional?
 */
FiltersItem.propTypes = {
  dispatch: PropTypes.func.isRequired,
  applyFilters: PropTypes.func.isRequired,
  resetInitialValues: PropTypes.func,
  clearFilters: PropTypes.func,
  filtersWrapper: PropTypes.any,
  panelCaption: PropTypes.string,
  active: PropTypes.array,
  data: PropTypes.any,
  notValidFields: PropTypes.any,
  isActive: PropTypes.any,
  windowType: PropTypes.any,
  onShow: PropTypes.any,
  onHide: PropTypes.any,
  viewId: PropTypes.any,
  outsideClick: PropTypes.any,
  closeFilterMenu: PropTypes.any,
  captionValue: PropTypes.any,
  openedFilter: PropTypes.any,
  returnBackToDropdown: PropTypes.any,
};

export default connect()(FiltersItem);
