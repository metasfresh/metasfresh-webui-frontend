import counterpart from 'counterpart';
import cx from 'classnames';
import React, { Component } from 'react';
// import { connect } from 'react-redux';
// import { push } from 'react-router-redux';
// import { Map, List, Set } from 'immutable';
// import currentDevice from 'current-device';
// import { get } from 'lodash';

// import {
//   getViewLayout,
//   locationSearchRequest,
//   locationConfigRequest,
//   createViewRequest,
//   deleteStaticFilter,
//   filterViewRequest,
//   getViewRowsByIds,
// } from '../../api';

// import { fetchDocument } from '../../actions/DataFetching';

// import {
//   closeListIncludedView,
//   setListId,
//   setListIncludedView,
//   setPagination,
//   setSorting,
// } from '../../actions/ListActions';
// import {
//   updateRawModal,
//   indicatorState,
//   selectTableItems,
//   deselectTableItems,
//   removeSelectedTableItems,
// } from '../../actions/WindowActions';
// import { connectWS, disconnectWS } from '../../utils/websockets';
import { getRowsData } from '../../../utils/documentListHelper';
// import { getSelectionDirect } from '../../reducers/windowHandler';
import {
  // DLpropTypes,
  // DLmapStateToProps,
  // NO_SELECTION,
  NO_VIEW,
  PANEL_WIDTHS,
  GEO_PANEL_STATES,
  // getSortingQuery,
  redirectToNewDocument,
  doesSelectionExist,
  filtersToMap,
  // mergeColumnInfosIntoViewRows,
  // mergeRows,
} from '../../../utils/documentListHelper';
import Spinner from '../../app/SpinnerOverlay';
import BlankPage from '../../BlankPage';
import DataLayoutWrapper from '../../DataLayoutWrapper';
import Filters from '../../filters/Filters';
import FiltersStatic from '../../filters/FiltersStatic';
import Table from '../../table/Table';
import QuickActions from '../QuickActions';
import SelectionAttributes from '../SelectionAttributes';
import GeoMap from '../../maps/GeoMap';

/**
 * @file Class based component.
 * @module DocumentList
 * @extends Component
 */
export default class DocumentList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickOutsideLock: false,
      toggleWidth: 0,
      // toggleState: GEO_PANEL_STATES[0],
    };

    this.supportAttribute = false;
  }

  /**
   * @method setClickOutsideLock
   * @summary ToDo: Describe the method.
   */
  setClickOutsideLock = value => {
    this.setState({
      clickOutsideLock: !!value,
    });
  };

  /**
   * @method adjustWidth
   * @summary ToDo: Describe the method.
   */
  adjustWidth = () => {
    const widthIdx =
      this.state.toggleWidth + 1 === PANEL_WIDTHS.length
        ? 0
        : this.state.toggleWidth + 1;

    this.setState({
      toggleWidth: widthIdx,
    });
  };

  collapseGeoPanels = () => {
    const { onToggleState, panelsState } = this.props;
    const stateIdx = GEO_PANEL_STATES.indexOf(panelsState);
    const newStateIdx =
      stateIdx + 1 === GEO_PANEL_STATES.length ? 0 : stateIdx + 1;

    // TODO: Pass function from the container to set this
    // this.setState({
    //   toggleState: GEO_PANEL_STATES[newStateIdx],
    // });
    onToggleState(GEO_PANEL_STATES[newStateIdx]);
  };

  /**
   * @method updateQuickActions
   * @summary ToDo: Describe the method.
   */
  updateQuickActions = childSelection => {
    if (this.quickActionsComponent) {
      this.quickActionsComponent.updateActions(childSelection);
    }
  };

  /**
   * @method loadSupportAttributeFlag
   * @summary Load supportAttribute of the selected row from the table.
   */
  loadSupportAttributeFlag = ({ selected }) => {
    const { reduxData } = this.props;
    // const { data } = this.state;
    if (!reduxData.data) {
      return;
    }
    const rows = getRowsData(reduxData.data);

    if (selected.length === 1) {
      const selectedRow = rows.find(row => row.id === selected[0]);

      this.supportAttribute = selectedRow && selectedRow.supportAttributes;
      this.setState({
        supportAttribute: selectedRow && selectedRow.supportAttributes,
      });
    } else {
      this.supportAttribute = false;
      this.setState({
        supportAttribute: false,
      });
    }
  };

  /**
   * @method resetInitialFilters
   * @summary ToDo: Describe the method.
   */
  resetInitialFilters = (filterId, parameterName) => {
    let { initialValuesNulled } = this.state;
    let filterParams = initialValuesNulled.get(filterId);

    if (!filterParams && parameterName) {
      filterParams = Set([parameterName]);
    } else if (filterParams && parameterName) {
      filterParams = filterParams.add(parameterName);
    }

    if (!parameterName) {
      initialValuesNulled = initialValuesNulled.delete(filterId);
    } else {
      initialValuesNulled = initialValuesNulled.set(filterId, filterParams);
    }

    this.setState({
      initialValuesNulled,
    });
  };

  /**
   * @method setTableRowEdited
   * @summary ToDo: Describe the method.
   */
  setTableRowEdited = val => {
    this.setState(
      {
        rowEdited: val,
      },
      () => this.updateQuickActions()
    );
  };

  /**
   * @method adjustWidth
   * @summary ToDo: Describe the method.
   */
  adjustWidth = () => {
    const widthIdx =
      this.state.toggleWidth + 1 === PANEL_WIDTHS.length
        ? 0
        : this.state.toggleWidth + 1;

    this.setState({
      toggleWidth: widthIdx,
    });
  };

  render() {
    const {
      windowType,
      viewProfileId,
      open,
      closeOverlays,
      parentDefaultViewId,
      inBackground,
      fetchQuickActionsOnInit,
      isModal,
      processStatus,
      readonly,
      includedView,
      isIncluded,
      disablePaginationShortcuts,
      notfound,
      disconnectFromState,
      autofocus,
      inModal,
      updateParentSelectedIds,
      modal,
      dispatch,
      parentWindowType,
      reduxData,
      layout,
      page,
      pageLength,
      sort,
      panelsState,
      onGetSelected,
      onFetchLayoutAndData,
      onChangePage,

      filtersActive,
      isShowIncluded,
      hasShowIncluded,
      refreshSelection,
      mapConfig,
      initialValuesNulled,

      viewId,
      onFilterChange,
    } = this.props;
    const {
      // page,
      rowDataMap,
      // viewId,
      size,
      staticFilters,
      orderBy,
      queryLimitHit,
    } = reduxData;

    const {
      // layout,
      // data,
      // viewId,
      // page,
      // rowDataMap,
      
      // filtersActive,
      // isShowIncluded,
      // hasShowIncluded,
      // refreshSelection, 
      // mapConfig,
      // initialValuesNulled,

      supportAttribute,
      rowEdited,
      clickOutsideLock,
      toggleWidth,
    } = this.state;
    let { selected, childSelected, parentSelected } = onGetSelected();
    const modalType = modal ? modal.modalType : null;
    const stopShortcutPropagation =
      (isIncluded && !!selected) || (inModal && modalType === 'process');

    const styleObject = {};
    if (toggleWidth !== 0) {
      styleObject.flex = PANEL_WIDTHS[toggleWidth];
    }

    const hasIncluded =
      layout &&
      layout.includedView &&
      includedView &&
      includedView.windowType &&
      includedView.viewId;

    const selectionValid = doesSelectionExist({
      // data,
      reduxData,
      selected,
      hasIncluded,
    });

    if (!selectionValid) {
      selected = null;
    }

    const blurWhenOpen =
      layout && layout.includedView && layout.includedView.blurWhenOpen;

    // TODO: handle notfound properly both in store and here (DocList too?)
    if (notfound || layout === 'notfound' || reduxData.notfound === 'notfound') {
      return (
        <BlankPage what={counterpart.translate('view.error.windowName')} />
      );
    }

    // console.log('RowDataMap: ', rowDataMap)

    const showQuickActions = true;
    const showModalResizeBtn =
      layout && isModal && hasIncluded && hasShowIncluded;
    const showGeoResizeBtn =
      layout &&
      layout.supportGeoLocations &&
      reduxData &&
      reduxData.locationData &&
      mapConfig.provider !== 'OpenStreetMap';

    return (
      <div
        className={cx('document-list-wrapper', {
          'document-list-included': isShowIncluded || isIncluded,
          'document-list-has-included': hasShowIncluded || hasIncluded,
        })}
        style={styleObject}
      >
        {showModalResizeBtn && (
          <div className="column-size-button col-xxs-3 col-md-0 ignore-react-onclickoutside">
            <button
              className={cx(
                'btn btn-meta-outline-secondary btn-sm ignore-react-onclickoutside',
                {
                  normal: toggleWidth === 0,
                  narrow: toggleWidth === 1,
                  wide: toggleWidth === 2,
                }
              )}
              onClick={this.adjustWidth}
            />
          </div>
        )}

        {layout && !readonly && (
          <div
            className={cx(
              'panel panel-primary panel-spaced panel-inline document-list-header',
              {
                posRelative: showGeoResizeBtn,
              }
            )}
          >
            <div className={cx('header-element', { disabled: hasIncluded })}>
              {layout.supportNewRecord && !isModal && (
                <button
                  className="btn btn-meta-outline-secondary btn-distance btn-sm hidden-sm-down btn-new-document"
                  onClick={() => redirectToNewDocument(dispatch, windowType)}
                  title={layout.newRecordCaption}
                >
                  <i className="meta-icon-add" />
                  {layout.newRecordCaption}
                </button>
              )}

              {layout.filters && (
                <Filters
                  {...{
                    windowType,
                    viewId,
                    filtersActive,
                    initialValuesNulled,
                  }}
                  filterData={filtersToMap(layout.filters)}
                  updateDocList={onFilterChange}
                  resetInitialValues={this.resetInitialFilters}
                />
              )}

              {reduxData.data && staticFilters && (
                <FiltersStatic
                  {...{ windowType, viewId }}
                  data={staticFilters}
                  clearFilters={this.clearStaticFilters}
                />
              )}
            </div>

            {showGeoResizeBtn && (
              <div className="header-element pane-size-button ignore-react-onclickoutside">
                <button
                  className={cx(
                    'btn btn-meta-outline-secondary btn-sm btn-switch ignore-react-onclickoutside'
                  )}
                  onClick={this.collapseGeoPanels}
                >
                  <i
                    className={cx('icon icon-grid', {
                      greyscaled: panelsState === 'map',
                    })}
                  />
                  <i className="icon text-middle">/</i>
                  <i
                    className={cx('icon icon-map', {
                      greyscaled: panelsState === 'grid',
                    })}
                  />
                </button>
              </div>
            )}

            {reduxData.data && showQuickActions && (
              <QuickActions
                className="header-element align-items-center"
                processStatus={processStatus}
                ref={c => {
                  this.quickActionsComponent = c;
                }}
                selected={selected}
                viewId={viewId}
                windowType={windowType}
                viewProfileId={viewProfileId}
                fetchOnInit={fetchQuickActionsOnInit}
                disabled={hasIncluded && blurWhenOpen}
                shouldNotUpdate={inBackground && !hasIncluded}
                inBackground={disablePaginationShortcuts}
                inModal={inModal}
                stopShortcutPropagation={stopShortcutPropagation}
                childView={
                  hasIncluded
                    ? {
                        viewId: includedView.viewId,
                        viewSelectedIds: childSelected,
                        windowType: includedView.windowType,
                      }
                    : NO_VIEW
                }
                parentView={
                  isIncluded
                    ? {
                        viewId: parentDefaultViewId,
                        viewSelectedIds: parentSelected,
                        windowType: parentWindowType,
                      }
                    : NO_VIEW
                }
                onInvalidViewId={onFetchLayoutAndData}
              />
            )}
          </div>
        )}

        <Spinner
          parent={this}
          delay={300}
          iconSize={50}
          displayCondition={!!(layout && this.state.triggerSpinner)}
          hideCondition={!!(reduxData.data && !this.state.triggerSpinner)}
        />

        {layout && reduxData.data && (
          <div className="document-list-body">
            <div className="row table-row">
              <Table
                entity="documentView"
                ref={c => (this.table = c)}
                rowData={rowDataMap}
                cols={layout.elements}
                collapsible={layout.collapsible}
                expandedDepth={layout.expandedDepth}
                tabId={1}
                windowId={windowType}
                emptyText={layout.emptyResultText}
                emptyHint={layout.emptyResultHint}
                readonly={true}
                supportOpenRecord={layout.supportOpenRecord}
                rowEdited={rowEdited}
                onRowEdited={this.setTableRowEdited}
                keyProperty="id"
                onDoubleClick={this.redirectToDocument}
                size={size}
                pageLength={pageLength}
                handleChangePage={onChangePage}
                onSelectionChanged={updateParentSelectedIds}
                mainTable={true}
                updateDocList={onFetchLayoutAndData}
                sort={this.sortData}
                orderBy={orderBy}
                tabIndex={0}
                indentSupported={layout.supportTree}
                disableOnClickOutside={clickOutsideLock}
                limitOnClickOutside={isModal}
                defaultSelected={selected}
                refreshSelection={refreshSelection}
                queryLimitHit={queryLimitHit}
                showIncludedViewOnSelect={this.showIncludedViewOnSelect}
                openIncludedViewOnSelect={
                  layout.includedView && layout.includedView.openOnSelect
                }
                blurOnIncludedView={blurWhenOpen}
                focusOnFieldName={layout.focusOnFieldName}

                toggleState={panelsState}
                {...{
                  isIncluded,
                  disconnectFromState,
                  autofocus,
                  open,
                  page,
                  closeOverlays,
                  inBackground,
                  disablePaginationShortcuts,
                  isModal,
                  hasIncluded,
                  viewId,
                  windowType,
                }}
              >
                {layout.supportAttributes && !isIncluded && !hasIncluded && (
                  <DataLayoutWrapper
                    className="table-flex-wrapper attributes-selector js-not-unselect"
                    entity="documentView"
                    {...{ windowType, viewId }}
                    onRowEdited={this.setTableRowEdited}
                  >
                    <SelectionAttributes
                      supportAttribute={supportAttribute}
                      setClickOutsideLock={this.setClickOutsideLock}
                      selected={selectionValid ? selected : undefined}
                      shouldNotUpdate={inBackground}
                    />
                  </DataLayoutWrapper>
                )}
              </Table>
              <GeoMap
                toggleState={panelsState}
                mapConfig={mapConfig}
                data={reduxData.locationData}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
