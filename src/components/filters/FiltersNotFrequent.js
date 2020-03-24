import counterpart from 'counterpart';
import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import onClickOutside from 'react-onclickoutside';
import classnames from 'classnames';

import { getItemsByProperty } from '../../utils';
import FiltersItem from './FiltersItem';

/**
 * @file Class based component.
 * @module FiltersNotFrequent
 * @extends Component
 */
class FiltersNotFrequent extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isOpenDropdown: false,
      openFilterId: null,
    };
  }

  /**
   * @method handleClickOutside
   * @summary ToDo: Describe the method
   * @param {*} target
   * @todo Write the documentation
   */
  handleClickOutside = ({ target }) => {
    const { widgetShown, dropdownToggled, allowOutsideClick } = this.props;

    if (target.classList && target.classList.contains('input-dropdown-list')) {
      return;
    }

    if (allowOutsideClick && !widgetShown) {
      dropdownToggled();
      this.toggleDropdown(false);
      this.toggleFilter(null);
    }
  };

  /**
   * @method toggleDropdown
   * @summary Executed when you clock on a filter and dropdown should show up
   * @param {*} value
   * @todo Write the documentation
   */
  toggleDropdown = (value) => {
    const { active, data } = this.props;
    const toCheckAgainst = data.map((item) => item.filterId);
    let openFilterIdValue;
    if (active !== null) {
      const foundInActive = active.filter((activeItem) =>
        toCheckAgainst.includes(activeItem.filterId)
      );
      openFilterIdValue =
        foundInActive.length && active ? active[0].filterId : null;
    } else {
      openFilterIdValue = null;
    }
    this.setState({
      isOpenDropdown: value,
      openFilterId: openFilterIdValue,
    });
  };

  /**
   * @method toggleFilter
   * @summary ToDo: Describe the method
   * @param {*} index
   * @todo Write the documentation
   */
  toggleFilter = (index) => {
    this.setState({
      openFilterId: index,
    });
  };

  // wrappers around props.handleShow to skip creating anonymous functions on render
  handleShowTrue = () => this.props.handleShow(true);
  handleShowFalse = () => this.props.handleShow(false);

  /**
   * @method render
   * @summary ToDo: Describe the method
   * @todo Write the documentation
   */
  render() {
    const {
      data,
      windowType,
      notValidFields,
      viewId,
      applyFilters,
      clearFilters,
      active,
      modalVisible,
      activeFiltersCaptions,
      resetInitialValues,
    } = this.props;

    const { isOpenDropdown, openFilterId } = this.state;
    const openFilter = getItemsByProperty(data, 'filterId', openFilterId)[0];
    const activeFilters = data.filter((filter) => filter.isActive);
    const activeFilter = activeFilters.length && activeFilters[0];

    const captions =
      (activeFilter &&
        activeFiltersCaptions &&
        activeFiltersCaptions[activeFilter.filterId]) ||
      [];
    let panelCaption = activeFilter.isActive ? activeFilter.caption : '';
    let buttonCaption = activeFilter.isActive ? activeFilter.caption : 'Filter';

    if (captions.length) {
      buttonCaption = captions[0];
      panelCaption = captions[1];
    }

    return (
      <div className="filter-wrapper filters-not-frequent">
        <button
          onClick={() => this.toggleDropdown(true)}
          className={classnames(
            'btn btn-filter btn-meta-outline-secondary toggle-filters',
            'btn-distance btn-sm',
            {
              'btn-select': isOpenDropdown,
              'btn-active': captions.length,
            }
          )}
          title={buttonCaption}
          tabIndex={modalVisible ? -1 : 0}
        >
          <i className="meta-icon-preview" />
          {activeFilter ? (
            activeFilter.parameters &&
            activeFilter.parameters.length === 1 &&
            activeFilter.captionValue ? (
              <Fragment>
                {`${activeFilter.caption}: `}
                {activeFilter.captionValue}
              </Fragment>
            ) : (
              `${counterpart.translate(
                'window.filters.caption2'
              )}: ${buttonCaption}`
            )
          ) : (
            'Filter'
          )}
        </button>

        {isOpenDropdown && (
          <div className="filters-overlay">
            {!openFilterId ? (
              <ul className="filter-menu">
                {data.map((item, index) => (
                  <li
                    className={`filter-option-${item.filterId}`}
                    key={index}
                    onClick={() => this.toggleFilter(item.filterId)}
                  >
                    {item.caption}
                  </li>
                ))}
              </ul>
            ) : (
              <FiltersItem
                {...{
                  panelCaption,
                  windowType,
                  active,
                  viewId,
                  resetInitialValues,
                  applyFilters,
                  clearFilters,
                }}
                captionValue={activeFilter.captionValue}
                data={
                  activeFilter.isActive && !Array.isArray(activeFilter.isActive)
                    ? activeFilter
                    : openFilter
                }
                closeFilterMenu={() => this.toggleDropdown(false)}
                returnBackToDropdown={() => this.toggleFilter(null)}
                notValidFields={notValidFields}
                isActive={activeFilter.isActive}
                onShow={this.handleShowTrue}
                onHide={this.handleShowFalse}
                openedFilter={true}
                filtersWrapper={this.props.filtersWrapper}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}

/**
 * @typedef {object} Props Component props
 * @prop {bool} allowOutsideClick
 * @prop {func} resetInitialValues
 * @prop {bool} modalVisible
 * @prop {*} [filtersWrapper]
 * @prop {object} [activeFiltersCaptions]
 * @prop {*} data
 * @prop {*} windowType
 * @prop {*} notValidFields
 * @prop {*} viewId
 * @prop {*} handleShow
 * @prop {*} applyFilters
 * @prop {*} clearFilters
 * @prop {*} active
 * @prop {*} widgetShown
 * @prop {*} dropdownToggled
 * @todo Check title, buttons. Which proptype? Required or optional?
 */
FiltersNotFrequent.propTypes = {
  allowOutsideClick: PropTypes.bool.isRequired,
  resetInitialValues: PropTypes.func.isRequired,
  modalVisible: PropTypes.bool.isRequired,
  filtersWrapper: PropTypes.any,
  activeFiltersCaptions: PropTypes.object,
  data: PropTypes.any,
  windowType: PropTypes.any,
  notValidFields: PropTypes.any,
  viewId: PropTypes.any,
  handleShow: PropTypes.any,
  applyFilters: PropTypes.any,
  clearFilters: PropTypes.any,
  active: PropTypes.any,
  widgetShown: PropTypes.any,
  dropdownToggled: PropTypes.any,
};

export default onClickOutside(FiltersNotFrequent);
