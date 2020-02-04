import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import counterpart from 'counterpart';

import { referencesRequest } from '../../actions/GenericActions';
import { setFilter } from '../../actions/ListActions';
import keymap from '../../shortcuts/keymap';

class TableContextMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contextMenu: {
        x: 0,
        y: 0,
      },
      references: [],
    };
  }

  componentDidMount() {
    const {
      x,
      y,
      fieldName,
      supportZoomInto,
      supportFieldEdit,
      docId,
    } = this.props;

    this.setPosition(
      x,
      y,
      fieldName,
      supportZoomInto,
      supportFieldEdit,
      this.contextMenu
    );

    if (docId) {
      this.getReferences();
    }
  }

  getPosition = (dir, pos, element) => {
    if (element) {
      const windowSize = dir === 'x' ? window.innerWidth : window.innerHeight;
      const elementSize =
        dir === 'x' ? element.offsetWidth : element.offsetHeight;

      if (windowSize - pos > elementSize) {
        return pos;
      } else {
        return windowSize - elementSize;
      }
    }
  };

  setPosition = (x, y, fieldName, supportZoomInto, supportFieldEdit, elem) => {
    this.setState({
      contextMenu: {
        x: this.getPosition('x', x, elem),
        y: this.getPosition('y', y, elem),
        fieldName,
        supportZoomInto,
        supportFieldEdit,
      },
    });
  };

  getReferences = () => {
    const { docId, tabId, windowId, selected } = this.props;

    referencesRequest('window', windowId, docId, tabId, selected[0]).then(
      response => {
        this.setState({
          references: response.data.references,
        });
      }
    );
  };

  handleReferenceClick = (refType, filter) => {
    const { dispatch, windowId, docId, tabId, selected } = this.props;

    dispatch(setFilter(filter, refType));

    window.open(
      `/window/${refType}?refType=${windowId}&refId=${docId}&refTabId=${tabId}&refRowIds=${JSON.stringify(
        selected || []
      )}`,
      '_blank'
    );
  };

  handleOpenNewTab = () => {
    const { selected, windowId, onOpenNewTab } = this.props;

    onOpenNewTab(windowId, selected);
  };

  render() {
    const {
      blur,
      selected,
      mainTable,
      handleAdvancedEdit,
      handleDelete,
      handleFieldEdit,
      handleZoomInto,
    } = this.props;

    const { contextMenu, references } = this.state;

    const isSelectedOne = selected.length === 1;
    const showFieldEdit =
      isSelectedOne &&
      mainTable &&
      contextMenu.supportFieldEdit &&
      handleFieldEdit;

    return (
      <div
        ref={c => {
          this.contextMenu = c;
          if (c) {
            c.focus();
          }
        }}
        style={{
          left: contextMenu.x,
          top: contextMenu.y,
        }}
        className={
          'context-menu context-menu-open panel-bordered panel-primary'
        }
        tabIndex="0"
        onBlur={blur}
      >
        {contextMenu.supportZoomInto && (
          <div
            className="context-menu-item"
            onClick={() => handleZoomInto(contextMenu.fieldName)}
          >
            <i className="meta-icon-share" />
            {` ${counterpart.translate('window.table.zoomInto')}`}
          </div>
        )}

        {showFieldEdit && (
          <div className="context-menu-item" onClick={handleFieldEdit}>
            <i className="meta-icon-edit" />
            {` ${counterpart.translate('window.table.editField')}`}
          </div>
        )}

        {(contextMenu.supportZoomInto || showFieldEdit) && (
          <hr className="context-menu-separator" />
        )}

        {isSelectedOne && !mainTable && (
          <div className="context-menu-item" onClick={handleAdvancedEdit}>
            <i className="meta-icon-edit" />
            {` ${counterpart.translate('window.table.advancedEdit')}`}
            <span className="tooltip-inline">{keymap.ADVANCED_EDIT}</span>
          </div>
        )}

        {mainTable && (
          <div className="context-menu-item" onClick={this.handleOpenNewTab}>
            <i className="meta-icon-file" />
            {` ${counterpart.translate('window.table.openInNewTab')}`}
            <span className="tooltip-inline">{keymap.OPEN_SELECTED}</span>
          </div>
        )}

        {handleDelete && (
          <div className="context-menu-item" onClick={handleDelete}>
            <i className="meta-icon-trash" />
            {` ${counterpart.translate('window.delete.caption')}`}
            <span className="tooltip-inline">{keymap.REMOVE_SELECTED}</span>
          </div>
        )}

        {references && <hr className="context-menu-separator" />}

        {references &&
          references.map((item, index) => (
            <div
              className="context-menu-item"
              key={index}
              onClick={() => {
                this.handleReferenceClick(item.documentType, item.filter);
              }}
            >
              <i className="meta-icon-share" /> {item.caption}
            </div>
          ))}
      </div>
    );
  }
}

TableContextMenu.propTypes = {
  dispatch: PropTypes.func.isRequired,
  onOpenNewTab: PropTypes.func,
  x: PropTypes.number,
  y: PropTypes.number,
  fieldName: PropTypes.string,
  supportZoomInto: PropTypes.bool,
  supportFieldEdit: PropTypes.bool,
  docId: PropTypes.string,
  tabId: PropTypes.string,
  windowId: PropTypes.string,
  selected: PropTypes.string,
  blur: PropTypes.any,
  mainTable: PropTypes.any,
  handleAdvancedEdit: PropTypes.func,
  handleDelete: PropTypes.func,
  handleFieldEdit: PropTypes.func,
  handleZoomInto: PropTypes.func,
};

export default connect()(TableContextMenu);
