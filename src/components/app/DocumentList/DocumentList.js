import counterpart from 'counterpart';
import classnames from 'classnames';
import React, { Component } from 'react';

import {
  NO_VIEW,
  PANEL_WIDTHS,
  redirectToNewDocument,
  doesSelectionExist,
  filtersToMap,
  getRowsData,
} from '../../../utils/documentListHelper';
import Spinner from '../../app/SpinnerOverlay';
import BlankPage from '../../BlankPage';
import DataLayoutWrapper from '../../DataLayoutWrapper';
import Filters from '../../filters/Filters';
import FiltersStatic from '../../filters/FiltersStatic';
import Table from '../../table/Table';
import QuickActions from '../QuickActions';
import SelectionAttributes from '../SelectionAttributes';

/**
 * @file Class based component.
 * @module DocumentList
 * @extends Component
 */
export default class DocumentList extends Component {
  constructor(props) {
    super(props);

    this.supportAttribute = false;
  }

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
    const { data } = this.state;
    if (!data) {
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
   * @method setClickOutsideLock
   * @summary ToDo: Describe the method.
   */
  setClickOutsideLock = value => {
    this.setState({
      clickOutsideLock: !!value,
    });
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
      reduxData,
      pageLength,

      page,
      sort,
      viewId,

      onGetSelected,
      onShowIncludedViewOnSelect,
      onSortData,
      onFetchLayoutAndData,
      onChangePage,
      onFilterChange,
      onRedirectToDocument,
      onClearStaticFilters,
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
      layout,
      clickOutsideLock,
      // page,
      filtersActive,
      isShowIncluded,
      hasShowIncluded,
      refreshSelection,
      supportAttribute,
      toggleWidth,
      rowEdited,
      initialValuesNulled,
      triggerSpinner,
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
      reduxData,
      selected,
      hasIncluded,
    });

    if (!selectionValid) {
      selected = null;
    }

    const blurWhenOpen =
      layout && layout.includedView && layout.includedView.blurWhenOpen;

    if (notfound || layout === 'notfound' || reduxData.notfound === 'notfound') {
      return (
        <BlankPage what={counterpart.translate('view.error.windowName')} />
      );
    }

    const showQuickActions = true;

    return (
      <div
        className={classnames('document-list-wrapper', {
          'document-list-included': isShowIncluded || isIncluded,
          'document-list-has-included': hasShowIncluded || hasIncluded,
        })}
        style={styleObject}
      >
        {layout && isModal && hasIncluded && hasShowIncluded && (
          <div className="column-size-button col-xxs-3 col-md-0 ignore-react-onclickoutside">
            <button
              className={classnames(
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
          <div className="panel panel-primary panel-spaced panel-inline document-list-header">
            <div className={hasIncluded ? 'disabled' : ''}>
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
                  clearFilters={onClearStaticFilters}
                />
              )}
            </div>

            {reduxData.data && showQuickActions && (
              <QuickActions
                processStatus={processStatus}
                ref={c => {
                  this.quickActionsComponent = c && c.getWrappedInstance();
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
                      }
                    : NO_VIEW
                }
                parentView={
                  isIncluded
                    ? {
                        viewId: parentDefaultViewId,
                        viewSelectedIds: parentSelected,
                      }
                    : NO_VIEW
                }
              />
            )}
          </div>
        )}

        <Spinner
          parent={this}
          delay={300}
          iconSize={50}
          displayCondition={!!(layout && triggerSpinner)}
          hideCondition={!!(reduxData.data && !triggerSpinner)}
        />

        {layout && reduxData.data && (
          <div className="document-list-body">
            <Table
              entity="documentView"
              ref={c =>
                (this.table =
                  c &&
                  c.getWrappedInstance() &&
                  c.getWrappedInstance().instanceRef)
              }
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
              onDoubleClick={onRedirectToDocument}
              size={size}
              pageLength={pageLength}
              handleChangePage={onChangePage}
              onSelectionChanged={updateParentSelectedIds}
              mainTable={true}
              updateDocList={onFetchLayoutAndData}
              sort={onSortData}
              orderBy={orderBy}
              tabIndex={0}
              indentSupported={layout.supportTree}
              disableOnClickOutside={clickOutsideLock}
              limitOnClickOutside={isModal}
              defaultSelected={selected}
              refreshSelection={refreshSelection}
              queryLimitHit={queryLimitHit}
              showIncludedViewOnSelect={onShowIncludedViewOnSelect}
              openIncludedViewOnSelect={
                layout.includedView && layout.includedView.openOnSelect
              }
              blurOnIncludedView={blurWhenOpen}
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
          </div>
        )}
      </div>
    );
  }
}
