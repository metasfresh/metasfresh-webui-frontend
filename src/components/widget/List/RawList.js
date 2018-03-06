import React, { PureComponent, Fragment } from 'react';
import { List } from 'immutable';
import onClickOutside from 'react-onclickoutside';
import TetherComponent from 'react-tether';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import RawListDropdown from './RawListDropdown';

const UP = Symbol('up');
const DOWN = Symbol('down');

const setSelectedValue = function(dropdownList, selected) {
  const changedValues = {};
  let idx = 0;

  if (selected) {
    idx = dropdownList.findIndex(item => item.caption === selected.caption);
  }

  if (idx !== 0) {
    const item = dropdownList.get(idx);
    dropdownList = dropdownList.delete(idx);
    dropdownList = dropdownList.insert(0, item);
    changedValues.dropdownList = dropdownList;
    idx = 0;
  }

  changedValues.selected = dropdownList.get(idx);

  return changedValues;
};

class RawList extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selected: props.selected || null,
      direction: null,
      dropdownList: props.list,
    };
  }

  componentWillMount() {
    window.addEventListener('keydown', this.handleTab);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleTab);
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      list,
      mandatory,
      defaultValue,
      selected,
      autoFocus,
      emptyText,
    } = this.props;

    let dropdownList = List(list);
    let changedValues = {};

    if (prevProps.list !== list) {
      if (!mandatory && emptyText) {
        dropdownList = dropdownList.unshift({
          caption: emptyText,
          key: null,
        });
      }

      changedValues.dropdownList = dropdownList;

      if (dropdownList.size > 0) {
        let selectedOption = null;

        if (selected || defaultValue) {
          selectedOption = selected ? selected : defaultValue;
        }
        changedValues = {
          ...changedValues,
          ...setSelectedValue(dropdownList, selectedOption),
        };
      } else {
        changedValues.selected = null;
      }
    }

    if (
      !changedValues.selected &&
      (prevProps.selected !== selected ||
        prevState.selected !== this.state.selected)
    ) {
      if (
        dropdownList.size > 0 &&
        (prevProps.list !== list || !this.state.selected)
      ) {
        changedValues = {
          ...changedValues,
          ...setSelectedValue(dropdownList, defaultValue),
        };
      }
    }

    if (Object.keys(changedValues).length) {
      this.setState(
        {
          ...changedValues,
        },
        () => {
          autoFocus && this.dropdown.focus();
        }
      );
    }

    // Delaying with requestAnimationFrame is needed to get the latest ref
    requestAnimationFrame(() => {
      this.checkIfDropDownListOutOfFilter();
      this.scrollIntoView();
    });
  }

  scrollIntoView = () => {
    const { list, selected } = this;

    if (!list || !selected) {
      return;
    }

    const { direction } = this.state;
    const { top: topMax, bottom: bottomMax } = list.getBoundingClientRect();
    const { top, bottom } = selected.getBoundingClientRect();

    if (top < topMax || bottom > bottomMax) {
      selected.scrollIntoView(direction === UP ? true : false);
    }
  };

  checkIfDropDownListOutOfFilter = () => {
    if (!this.list) {
      return;
    }

    const { top } = this.list.getBoundingClientRect();
    const { filter, isToggled, onCloseDropdown } = this.props;

    if (
      isToggled &&
      filter.visible &&
      (top + 20 > filter.boundingRect.bottom ||
        top - 20 < filter.boundingRect.top)
    ) {
      onCloseDropdown();
    }
  };

  handleOpenDropdown = () => {
    const { onOpenDropdown } = this.props;

    this.dropdown.focus();
    onOpenDropdown();
  };

  handleCloseDropdown = () => {
    const { selected, onCloseDropdown, onBlur } = this.props;

    this.setState(
      {
        selected: selected || null,
      },
      () => {
        onCloseDropdown();
        onBlur();
      }
    );
  };

  handleClickOutside = event => {
    const { list, handleCloseDropdown } = this;
    const { isToggled } = this.props;

    if (!list || !isToggled) {
      return;
    }

    const { top, right, bottom, left } = list.getBoundingClientRect();

    if (
      event.clientX >= left &&
      event.clientX <= right &&
      event.clientY >= top &&
      event.clientY <= bottom
    ) {
      return;
    }

    if (isToggled) {
      handleCloseDropdown();
    }
  };

  handleBlur() {
    const { onBlur } = this.props;

    this.dropdown.blur();
    onBlur();
  }

  /*
   * Alternative method to open dropdown, in case of disabled opening
   * on focus.
   */
  handleClick = () => {
    const { handleOpenDropdown } = this;
    const { isToggled } = this.props;

    if (isToggled) {
      return;
    }

    handleOpenDropdown();
  };

  handleSelect = selected => {
    const { onSelect, onCloseDropdown } = this.props;

    this.setState(
      {
        selected: null,
      },
      () => {
        if (selected.key === null) {
          onSelect(null);
        } else {
          onSelect(selected);
        }
        onCloseDropdown();
      }
    );
  };

  handleSwitch = selected => {
    this.setState({
      selected,
    });
  };

  handleKeyDown = event => {
    const { handleSelect, navigate } = this;
    const {
      onSelect,
      list,
      readonly,
      isToggled,
      onCloseDropdown,
      onOpenDropdown,
    } = this.props;
    const { selected } = this.state;

    if (event.keyCode > 47 && event.keyCode < 123) {
      this.navigateToAlphanumeric(event.key);
    } else {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          this.navigate(true);

          break;
        case 'ArrowDown':
          event.preventDefault();

          if (!isToggled) {
            onOpenDropdown();
          } else {
            navigate(false);
          }
          break;
        case 'Enter':
          event.preventDefault();

          if (isToggled) {
            event.stopPropagation();
          }

          if (selected) {
            handleSelect(selected);
          } else {
            onSelect(null);
          }
          break;
        case 'Escape':
          event.preventDefault();

          this.handleSwitch(null);
          onCloseDropdown();
          break;
        case 'Tab':
          list.size === 0 && !readonly && onSelect(null);
          break;
      }
    }
  };

  handleTab = event => {
    const { isToggled, isFocused, onCloseDropdown } = this.props;

    if (event.key === 'Tab' && isFocused) {
      if (isToggled) {
        event.preventDefault();
        onCloseDropdown();
      } else {
        this.handleBlur();
      }
    }
  };

  navigateToAlphanumeric = char => {
    const { handleOpenDropdown } = this;
    const { isToggled } = this.props;
    const { selected, dropdownList } = this.state;

    if (!isToggled) {
      handleOpenDropdown();
    }

    const items = dropdownList.filter(
      item => item.caption.toUpperCase() === char.toUpperCase()
    );

    const selectedIndex = items.indexOf(selected);
    const item =
      selectedIndex > -1 ? items.get(selectedIndex + 1) : items.get(0);

    if (!item) {
      return;
    }

    this.handleSwitch(item);
  };

  navigate = up => {
    const { handleOpenDropdown } = this;
    const { isToggled } = this.props;
    const { selected, dropdownList } = this.state;

    if (!isToggled) {
      handleOpenDropdown();
    }

    const selectedIndex = dropdownList.findIndex(
      item => item.caption === selected.caption
    );

    const next = up ? selectedIndex - 1 : selectedIndex + 1;

    this.setState({
      selected:
        next >= 0 && next <= dropdownList.size - 1
          ? dropdownList.get(next)
          : selected,
      direction: up ? UP : DOWN,
    });
  };

  getRow = option => {
    const { selected } = this.state;
    let selectedRow = false;

    if (
      selected != null &&
      (selected.key === option.key ||
        (selected.key === null && selected.caption === option.caption))
    ) {
      selectedRow = true;
    }

    const props = {};

    if (selectedRow) {
      props.ref = ref => (this.selected = ref);
    }

    return (
      <div
        key={option.key}
        className={classnames(
          'input-dropdown-list-option ignore-react-onclickoutside',
          {
            'input-dropdown-list-option-key-on': selectedRow,
          }
        )}
        onClick={() => this.handleSelect(option)}
        onMouseEnter={() => this.handleSwitch(option)}
        {...props}
      >
        <p className="input-dropdown-item-title">{option.caption}</p>
      </div>
    );
  };

  renderOptions = () => {
    const { dropdownList } = this.state;

    return <Fragment>{dropdownList.map(this.getRow)}</Fragment>;
  };

  render() {
    const {
      list,
      rank,
      readonly,
      defaultValue,
      selected,
      align,
      updated,
      loading,
      rowId,
      isModal,
      tabIndex,
      disabled,
      mandatory,
      validStatus,
      lookupList,
      isToggled,
      isFocused,
      onFocus,
    } = this.props;

    let value = '';
    let placeholder = '';
    const isListEmpty = list.size === 0;

    if (typeof defaultValue === 'string') {
      placeholder = defaultValue;
    } else {
      placeholder = defaultValue && defaultValue.caption;
    }

    if (lookupList) {
      value = placeholder;
    } else if (selected) {
      value = selected.caption;
    }

    return (
      <div
        ref={c => (this.dropdown = c)}
        className={classnames('input-dropdown-container', {
          'input-disabled': readonly,
          'input-dropdown-container-static': rowId,
          'input-table': rowId && !isModal,
          'lookup-dropdown': lookupList,
          'select-dropdown': !lookupList,
          focused: isFocused,
          opened: isToggled,
          'input-mandatory': !lookupList && mandatory && !selected,
        })}
        tabIndex={tabIndex ? tabIndex : 0}
        onFocus={readonly ? null : onFocus}
        onClick={readonly ? null : this.handleClick}
        onKeyDown={this.handleKeyDown}
      >
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
          <div
            className={classnames('input-dropdown input-block input-readonly', {
              'input-secondary': rank,
              pulse: updated,
              'input-mandatory': mandatory && !selected,
              'input-error':
                validStatus &&
                (!validStatus.valid && !validStatus.initialValue) &&
                !isToggled,
            })}
            ref={c => (this.inputContainer = c)}
          >
            <div
              className={classnames('input-editable input-dropdown-focused', {
                [`text-xs-${align}`]: align,
              })}
            >
              <input
                type="text"
                className={classnames(
                  'input-field js-input-field',
                  'font-weight-semibold',
                  {
                    'input-disabled': disabled,
                  }
                )}
                readOnly
                tabIndex={-1}
                placeholder={placeholder}
                value={value}
                disabled={readonly || disabled}
              />
            </div>

            <div className="input-icon">
              <i className="meta-icon-down-1 input-icon-sm" />
            </div>
          </div>
          {isFocused &&
            isToggled && (
              <RawListDropdown
                childRef={ref => (this.list = ref)}
                isListEmpty={isListEmpty}
                offsetWidth={this.dropdown.offsetWidth}
                loading={loading}
              >
                {this.renderOptions()}
              </RawListDropdown>
            )}
        </TetherComponent>
      </div>
    );
  }
}

RawList.propTypes = {
  filter: PropTypes.object,
  readonly: PropTypes.bool,
  // Immutable List
  list: PropTypes.object,
  rank: PropTypes.any,
  defaultValue: PropTypes.any,
  selected: PropTypes.any,
  align: PropTypes.any,
  emptyText: PropTypes.string,
  lastProperty: PropTypes.any,
  updated: PropTypes.bool,
  loading: PropTypes.bool,
  rowId: PropTypes.any,
  isModal: PropTypes.bool,
  tabIndex: PropTypes.number,
  disabled: PropTypes.bool,
  mandatory: PropTypes.bool,
  validStatus: PropTypes.any,
  lookupList: PropTypes.any,
  initialFocus: PropTypes.any,
  doNotOpenOnFocus: PropTypes.bool,
  isFocused: PropTypes.bool.isRequired,
  isToggled: PropTypes.bool.isRequired,
  autoFocus: PropTypes.bool,
  disableAutofocus: PropTypes.func,
  onFocus: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onOpenDropdown: PropTypes.func.isRequired,
  onCloseDropdown: PropTypes.func.isRequired,
};

export default onClickOutside(RawList);
