import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import TetherComponent from 'react-tether';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { debounce } from 'throttle-debounce';

import {
  autocompleteRequest,
  autocompleteModalRequest,
} from '../../../actions/GenericActions';
import { getViewAttributeTypeahead } from '../../../actions/ViewAttributesActions';
import { openModal } from '../../../actions/WindowActions';
import SelectionDropdown from '../SelectionDropdown';

export class RawLookup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: '',
      list: [],
      isInputEmpty: true,
      selected: null,
      direction: null,
      loading: false,
      oldValue: '',
      shouldBeFocused: true,
      isFocused: false,
      parentElement: undefined,
    };

    const debounceTime = props.item.lookupSearchStartDelayMillis || 100;
    this.minQueryLength = props.item.lookupSearchStringMinLength || 0;

    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleValueChanged = this.handleValueChanged.bind(this);
    this.typeaheadRequest = this.typeaheadRequest.bind(this);

    this.autocompleteSearchDebounced = debounce(
      debounceTime,
      this.typeaheadRequest
    );
  }

  componentDidMount() {
    const { defaultValue, initialFocus } = this.props;

    this.handleValueChanged();

    if (defaultValue) {
      this.inputSearch.value = defaultValue.caption;
    }

    if (initialFocus && !this.inputSearch.value) {
      this.inputSearch.focus();
    }
  }

  componentDidUpdate(prevProps) {
    this.handleValueChanged();

    const {
      autoFocus,
      defaultValue,
      handleInputEmptyStatus,
      filterWidget,
      lookupEmpty,
      localClearing,
      fireDropdownList,
      parentElement,
    } = this.props;
    const { shouldBeFocused } = this.state;

    if (parentElement && !prevProps.parentElement) {
      // eslint-disable-next-line react/no-find-dom-node
      let parentEl = ReactDOM.findDOMNode(parentElement);

      this.setState({
        parentElement: parentEl,
      });
    }

    if (localClearing && !defaultValue) {
      this.inputSearch.value = '';
    }

    if (autoFocus && !this.inputSearch.value && shouldBeFocused) {
      this.inputSearch.focus();

      this.setState({
        shouldBeFocused: false,
      });
    }

    if (
      defaultValue &&
      (prevProps.defaultValue == null ||
        (prevProps.defaultValue &&
          prevProps.defaultValue.caption !== defaultValue.caption))
    ) {
      handleInputEmptyStatus && handleInputEmptyStatus(false);
    }

    if (filterWidget && lookupEmpty && defaultValue === null) {
      this.inputSearch.value = defaultValue;
    }

    if (fireDropdownList && prevProps.fireDropdownList !== fireDropdownList) {
      this.handleChange('', true);
    }

    this.checkIfComponentOutOfFilter();
  }

  checkIfComponentOutOfFilter = () => {
    if (!this.lookupList) return;
    // eslint-disable-next-line react/no-find-dom-node
    let element = ReactDOM.findDOMNode(this.lookupList);
    const { top } = element.getBoundingClientRect();
    const { filter, isOpen } = this.props;

    if (
      isOpen &&
      filter.visible &&
      (top + 20 > filter.boundingRect.bottom ||
        top - 20 < filter.boundingRect.top)
    ) {
      this.props.onDropdownListToggle(false);
    }
  };

  clearState = () => {
    this.setState({
      list: [],
      isInputEmpty: true,
      selected: null,
      loading: false,
    });
  };

  handleSelect = (select, mouse) => {
    const {
      onChange,
      handleInputEmptyStatus,
      mainProperty,
      setNextProperty,
      filterWidget,
      subentity,
    } = this.props;
    let selected = select;
    let mainProp = mainProperty[0];

    this.setState({
      selected: null,
    });

    if (select && select.key === 'NEW') {
      this.handleAddNew();

      return;
    } else if (select.key === null) {
      selected = null;
    }

    if (filterWidget) {
      const promise = onChange(mainProp.parameterName, selected);

      if (promise) {
        promise.then(() => {
          setNextProperty(mainProp.parameterName);
        });
      } else {
        setNextProperty(mainProp.parameterName);
      }
    } else {
      if (subentity === 'quickInput') {
        onChange(mainProperty[0].field, selected, () =>
          setNextProperty(mainProp.field)
        );
      } else {
        const promise = onChange(mainProp.field, selected);

        if (promise) {
          promise.then(() => {
            setNextProperty(mainProp.field);
          });
        } else {
          setNextProperty(mainProp.field);
        }
      }
    }

    if (select) {
      this.inputSearch.value = select.caption;
    }

    handleInputEmptyStatus && handleInputEmptyStatus(false);

    setTimeout(() => {
      this.inputSearch.focus();
    }, 0);

    this.handleBlur(mouse);
  };

  handleAddNew = () => {
    const {
      dispatch,
      newRecordWindowId,
      newRecordCaption,
      filterWidget,
      parameterName,
      mainProperty,
    } = this.props;

    this.handleBlur();

    dispatch(
      openModal(
        newRecordCaption,
        newRecordWindowId,
        'window',
        null,
        null,
        null,
        null,
        null,
        'NEW',
        filterWidget ? parameterName : mainProperty[0].field
      )
    );
  };

  handleBlur(mouse) {
    this.setState(
      {
        isFocused: false,
      },
      () => {
        this.props.onDropdownListToggle(false, mouse);
      }
    );
  }

  handleFocus(mouse = true) {
    const { mandatory } = this.props;

    if (mouse && this.state.isFocused) {
      this.handleBlur(mouse);
    } else {
      this.setState(
        {
          isFocused: true,
        },
        () => {
          if (!mandatory && mouse) {
            this.props.onDropdownListToggle(true);
          }
        }
      );
    }
  }

  typeaheadRequest = () => {
    const {
      windowType,
      dataId,
      filterWidget,
      parameterName,
      tabId,
      rowId,
      entity,
      subentity,
      subentityId,
      viewId,
      mainProperty,
      isModal,
      newRecordCaption,
      mandatory,
      placeholder,
    } = this.props;
    const inputValue = this.inputSearch.value;

    let typeaheadRequest;
    const typeaheadParams = {
      docId: filterWidget ? viewId : dataId,
      propertyName: filterWidget ? parameterName : mainProperty[0].field,
      query: inputValue,
      rowId,
      tabId,
    };

    if (entity === 'documentView' && !filterWidget) {
      typeaheadRequest = getViewAttributeTypeahead(
        windowType,
        viewId,
        dataId,
        mainProperty[0].field,
        inputValue
      );
    } else if (viewId && !filterWidget) {
      typeaheadRequest = autocompleteModalRequest({
        ...typeaheadParams,
        docType: windowType,
        entity: 'documentView',
        viewId,
      });
    } else {
      typeaheadRequest = autocompleteRequest({
        ...typeaheadParams,
        docType: windowType,
        entity,
        subentity,
        subentityId,
      });
    }

    typeaheadRequest.then(response => {
      let values = response.data.values || [];
      let list = null;
      const newState = {
        loading: false,
      };

      if (values.length === 0 && !isModal) {
        const optionNew = { key: 'NEW', caption: newRecordCaption };
        list = [optionNew];

        newState.forceEmpty = true;
        newState.selected = optionNew;
      } else {
        list = values;

        newState.forceEmpty = false;
        newState.selected = values[0];
      }

      if (!mandatory) {
        list.push({
          caption: placeholder,
          key: null,
        });
      }
      newState.list = [...list];

      this.setState({ ...newState });
    });
  };

  handleChange = (handleChangeOnFocus, allowEmpty) => {
    const {
      recent,
      handleInputEmptyStatus,
      enableAutofocus,
      isOpen,
      onDropdownListToggle,
    } = this.props;

    enableAutofocus();

    if (this.props.localClearing) {
      this.props.resetLocalClearing();
    }

    const inputValue = this.inputSearch.value;

    if (inputValue || allowEmpty) {
      !allowEmpty && handleInputEmptyStatus && handleInputEmptyStatus(false);

      if (!isOpen) {
        onDropdownListToggle(true);
      }

      this.setState(
        {
          isInputEmpty: false,
          loading: true,
          query: inputValue,
        },
        () => {
          const q = this.state.query;
          if (q.length >= this.minQueryLength) {
            this.autocompleteSearchDebounced();
          }
        }
      );
    } else {
      this.setState({
        isInputEmpty: true,
        query: inputValue,
        list: recent,
      });

      handleInputEmptyStatus && handleInputEmptyStatus(true);
    }
  };

  handleValueChanged() {
    const { defaultValue, filterWidget, mandatory, placeholder } = this.props;
    const { oldValue, isInputEmpty } = this.state;

    if (!filterWidget && !!defaultValue && this.inputSearch) {
      const init = [defaultValue];
      const inputValue = defaultValue.caption;

      if (!mandatory) {
        init.push({
          caption: placeholder,
          key: null,
        });
      }

      if (inputValue !== oldValue) {
        this.inputSearch.value = inputValue;

        this.setState({
          oldValue: inputValue,
          isInputEmpty: false,
          list: init,
        });
      } else if (isInputEmpty) {
        this.setState({
          isInputEmpty: false,
          list: init,
        });
      }
    } else if (oldValue && !defaultValue && this.inputSearch) {
      const inputEmptyValue = defaultValue;

      if (inputEmptyValue !== oldValue) {
        this.inputSearch.value = inputEmptyValue;

        this.setState({
          oldValue: inputEmptyValue,
          isInputEmpty: true,
        });
      }
    }
  }

  handleTemporarySelection = selected => {
    this.setState({ selected });
  };

  render() {
    const { align, readonly, disabled, tabIndex, isOpen, idValue } = this.props;
    const {
      isInputEmpty,
      list,
      loading,
      selected,
      forceEmpty,
      isFocused,
      parentElement,
      query,
    } = this.state;
    const tetherProps = {};
    let showDropdown = false;

    if (parentElement) {
      tetherProps.target = parentElement;
    }

    if (query.length >= this.minQueryLength) {
      showDropdown = true;
    }

    return (
      <TetherComponent
        attachment="top left"
        {...tetherProps}
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
        <div id={idValue || ''} className="raw-lookup-wrapper">
          <div
            className={classnames(
              'lookup-widget-wrapper lookup-widget-wrapper-bcg',
              {
                'raw-lookup-disabled': disabled,
                'input-disabled': readonly,
                focused: isFocused,
              }
            )}
            ref={ref => (this.wrapper = ref)}
          >
            <div className={'input-dropdown input-block'}>
              <div
                className={'input-editable' + (align ? ' text-' + align : '')}
              >
                <input
                  ref={c => (this.inputSearch = c)}
                  type="text"
                  className="input-field js-input-field font-weight-semibold"
                  autoComplete="new-password"
                  readOnly={readonly}
                  disabled={readonly && !disabled}
                  tabIndex={tabIndex}
                  placeholder={this.props.item.emptyText}
                  onChange={this.handleChange}
                  onClick={this.handleFocus}
                />
              </div>
            </div>
          </div>
          {showDropdown && isOpen && !isInputEmpty && (
            <SelectionDropdown
              loading={loading}
              options={list}
              empty="No results found"
              forceEmpty={forceEmpty}
              selected={selected}
              width={
                this.props.forcedWidth
                  ? this.props.forcedWidth
                  : this.wrapper && this.wrapper.offsetWidth
              }
              height={
                this.props.forceHeight
                  ? this.props.forceHeight - this.wrapper.offsetHeight
                  : undefined
              }
              onChange={this.handleTemporarySelection}
              onSelect={this.handleSelect}
              onCancel={this.handleBlur}
            />
          )}
        </div>
      </TetherComponent>
    );
  }
}

const mapStateToProps = state => ({
  filter: state.windowHandler.filter,
});

RawLookup.propTypes = {
  item: PropTypes.object,
  defaultValue: PropTypes.any,
  initialFocus: PropTypes.bool,
  autoFocus: PropTypes.bool,
  filter: PropTypes.object,
  handleInputEmptyStatus: PropTypes.any,
  isOpen: PropTypes.bool,
  selected: PropTypes.object,
  forcedWidth: PropTypes.number,
  forceHeight: PropTypes.number,
  dispatch: PropTypes.func.isRequired,
  onDropdownListToggle: PropTypes.func,
  isComposed: PropTypes.bool,
  mainProperty: PropTypes.any,
  filterWidget: PropTypes.any,
  lookupEmpty: PropTypes.any,
  localClearing: PropTypes.any,
  fireDropdownList: PropTypes.any,
  parentElement: PropTypes.any,
  onChange: PropTypes.func,
  setNextProperty: PropTypes.any,
  subentity: PropTypes.any,
  newRecordWindowId: PropTypes.any,
  newRecordCaption: PropTypes.any,
  parameterName: PropTypes.string,
  mandatory: PropTypes.bool,
  windowType: PropTypes.string,
  dataId: PropTypes.string,
  tabId: PropTypes.string,
  rowId: PropTypes.string,
  entity: PropTypes.any,
  subentityId: PropTypes.string,
  viewId: PropTypes.string,
  isModal: PropTypes.bool,
  placeholder: PropTypes.string,
  recent: PropTypes.any,
  enableAutofocus: PropTypes.func,
  resetLocalClearing: PropTypes.any,
  align: PropTypes.bool,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  tabIndex: PropTypes.number,
  idValue: PropTypes.string,
};

export default connect(mapStateToProps)(RawLookup);
