import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';
import { Map, List, Set } from 'immutable';
import currentDevice from 'current-device';
import { get } from 'lodash';

import {
  locationSearchRequest,
  deleteStaticFilter,
  getViewRowsByIds,
} from '../../../api';
import {
  createView,
  fetchDocument,
  fetchLayout,
  fetchLocationConfig,
  filterView,
  resetView,
  updateViewData,
} from '../../../actions/ViewActions';
import {
  closeListIncludedView,
  setListId,
  setListIncludedView,
  setPagination,
  setSorting,
} from '../../../actions/ListActions';
import {
  updateRawModal,
  indicatorState,
  selectTableItems,
  deselectTableItems,
  removeSelectedTableItems,
} from '../../../actions/WindowActions';
import { connectWS, disconnectWS } from '../../../utils/websockets';
import { getSelectionDirect } from '../../../reducers/windowHandler';
import {
  DLpropTypes,
  DLmapStateToProps,
  NO_SELECTION,
  GEO_PANEL_STATES,
  getSortingQuery,
  doesSelectionExist,
  filtersToMap,
  mergeColumnInfosIntoViewRows,
  mergeRows,
  parseToDisplay,
  getRowsData,
} from '../../../utils/documentListHelper';

import DocumentList from './DocumentList';

class DocumentListContainer extends Component {
  constructor(props) {
    super(props);

    // TODO: Why it's not in the state?
    this.pageLength =
      currentDevice.type === 'mobile' || currentDevice.type === 'tablet'
        ? 9999
        : 20;

    this.state = {
      pageColumnInfosByFieldName: null,
      panelsState: GEO_PANEL_STATES[0],
      filtersActive: Map(),
      initialValuesNulled: Map(),
      isShowIncluded: false,
      hasShowIncluded: false,
      triggerSpinner: true,
      supportAttribute: false,
    };

    this.fetchLayoutAndData();
  }

  UNSAFE_componentWillMount() {
    this.props.fetchLocationConfig();
  }

  componentDidMount = () => {
    this.mounted = true;
  };

  componentWillUnmount() {
    this.mounted = false;
    disconnectWS.call(this);

    this.props.resetView();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      viewId: nextViewId,
      includedView: nextIncludedView,
      isIncluded: nextIsIncluded,
      refId: nextRefId,
      windowType: nextWindowType,
    } = nextProps;
    const {
      includedView,
      isIncluded,
      refId,
      windowType,
      closeListIncludedView,

      // TODO: sorting
      // sort,
      viewId,
      resetView,
    } = this.props;
    const { staticFilterCleared } = this.state;

    const included =
      includedView && includedView.windowType && includedView.viewId;
    const nextIncluded =
      nextIncludedView &&
      nextIncludedView.windowType &&
      nextIncludedView.viewId;
    const location = document.location;

    // TODO: What should we do with this ??
    this.loadSupportAttributeFlag(nextProps);

    /*
     * If we browse list of docs, changing type of Document
     * does not re-construct component, so we need to
     * make it manually while the windowType changes.
     * OR
     * We want to refresh the window (generate new viewId)
     * OR
     * The reference ID is changed
     */
    if (
      staticFilterCleared ||
      nextWindowType !== windowType ||
      // (nextDefaultViewId === undefined &&
      //   nextDefaultViewId !== defaultViewId) ||
      (nextWindowType === windowType &&
        // ((nextDefaultViewId !== defaultViewId &&
        ((nextViewId !== viewId && isIncluded && nextIsIncluded) ||
          location.hash === '#notification')) ||
      nextRefId !== refId
    ) {
      // TODO: Check if handling reset only via middleware is enough
      resetView();

      this.setState(
        {
          filtersActive: Map(),
          initialValuesNulled: Map(),
          staticFilterCleared: false,
          triggerSpinner: true,
          panelsState: GEO_PANEL_STATES[0],
        },
        () => {
          if (included) {
            closeListIncludedView(includedView);
          }

          this.fetchLayoutAndData();
        }
      );
    }

    const stateChanges = {};

    if (included && !nextIncluded) {
      stateChanges.isShowIncluded = false;
      stateChanges.hasShowIncluded = false;
    }

    if (Object.keys(stateChanges).length) {
      this.setState({
        ...stateChanges,
      });
    }
  }

  // TODO: Set modal description if data changed
  // No idea who came up with this...
  // componentDidUpdate(prevProps, prevState) {
  //   const { setModalDescription } = this.props;
  //   const { data } = this.state;

  //   if (prevState.data !== data && setModalDescription) {
  //     setModalDescription(data.description);
  //   }
  // }

  /**
   * @method connectWebSocket
   * @summary ToDo: Describe the method.
   */
  connectWebSocket = () => {
    const {
      windowType,
      deselectTableItems,
      viewId,
      updateViewData,
    } = this.props;

    connectWS.call(this, `/view/${viewId}`, msg => {
      const { fullyChanged, changedIds } = msg;

      if (changedIds) {
        getViewRowsByIds(windowType, viewId, changedIds.join()).then(
          response => {
            const { reduxData } = this.props;
            const { pageColumnInfosByFieldName, filtersActive } = this.state;
            const toRows = reduxData.rowData.get('1');

            // merge changed rows with data in the store
            const { rows, removedRows } = mergeRows({
              toRows,
              fromRows: [...response.data],
              columnInfosByFieldName: pageColumnInfosByFieldName,
              changedIds,
            });

            if (removedRows.length) {
              deselectTableItems(removedRows, windowType, viewId);
            } else {
              if (filtersActive.size) {
                this.filterView();
              }

              // force updating actions
              this.updateQuickActions();
            }

            updateViewData(rows);
          }
        );
      }

      if (fullyChanged == true) {
        const { selectTableItems, windowType, selections, viewId } = this.props;
        const selection = getSelectionDirect(selections, windowType, viewId);

        // Reload Attributes after QuickAction is done
        selection.length &&
          selectTableItems({
            windowType,
            viewId,
            ids: [selection[0]],
          });

        this.browseView();
        this.updateQuickActions();
      }
    });
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

    if (!reduxData.rowDataMap) {
      return;
    }
    const rows = getRowsData(reduxData.rowDataMap.get('1'));

    if (selected.length === 1) {
      const selectedRow = rows.find(row => row.id === selected[0]);

      this.setState({
        supportAttribute: selectedRow && selectedRow.supportAttributes,
      });
    } else {
      this.setState({
        supportAttribute: false,
      });
    }
  };

  // TODO: I think this should be stored in redux too
  /**
   * @method clearStaticFilters
   * @summary ToDo: Describe the method.
   */
  clearStaticFilters = filterId => {
    const { push, windowType, viewId } = this.props;

    deleteStaticFilter(windowType, viewId, filterId).then(response => {
      this.setState({ staticFilterCleared: true }, () =>
        push(`/window/${windowType}?viewId=${response.data.viewId}`)
      );
    });
  };

  // FETCHING LAYOUT && DATA -------------------------------------------------
  /**
   * @method fetchLayoutAndData
   * @summary ToDo: Describe the method.
   */
  fetchLayoutAndData = (isNewFilter, locationAreaSearch) => {
    const {
      windowType,
      type,
      viewProfileId,
      setModalTitle,
      viewId,
      fetchLayout,
      updateRawModal,
    } = this.props;

    // TODO: Spin the spinner
    fetchLayout(windowType, type, viewProfileId)
      .then(response => {
        if (this.mounted) {
          const { allowedCloseActions } = response;

          if (allowedCloseActions) {
            updateRawModal(windowType, { allowedCloseActions });
          }

          if (viewId) {
            this.connectWebSocket(viewId);

            if (!isNewFilter) {
              this.browseView();
            } else {
              this.filterView(locationAreaSearch);
            }
          } else {
            this.createView();
          }

          // TODO: Should we handle this in the action creator ?
          setModalTitle && setModalTitle(response.data.caption);
        }
      })
      .catch(() => {
        // We have to always update that fields to refresh that view!
        // Check the shouldComponentUpdate method
        this.setState({ triggerSpinner: false });
      });
  };

  /**
   * @method browseView
   * @summary If viewId exists, than browse that view.
   */
  browseView = () => {
    const { viewId, page, sort } = this.props;
    const { filtersActive } = this.state;
    const locationSearchFilter = filtersActive.has(`location-area-search`);

    // in case of redirect from a notification, first call will have viewId empty
    if (viewId) {
      this.getData(viewId, page, sort, locationSearchFilter).catch(err => {
        if (err.response && err.response.status === 404) {
          this.createView();
        }
      });
    }
  };

  /**
   * @method createView
   * @summary Create a new view, on visiting the page for the first time
   */
  createView = () => {
    const {
      windowType,
      type,
      refType,
      refId,
      refTabId,
      refRowIds,
      page,
      sort,
      createView,
    } = this.props;
    const { filtersActive } = this.state;

    // TODO: spin the spinner
    createView(
      windowType,
      type,
      filtersActive.toIndexedSeq().toArray(),
      refType,
      refId,
      refTabId,
      refRowIds
    )
      .then(({ viewId }) => {
        this.mounted &&
          this.setState(
            {
              triggerSpinner: false,
            },
            () => {
              this.connectWebSocket(viewId);
              this.getData(viewId, page, sort);
            }
          );
      })
      .catch(() => {
        this.setState({ triggerSpinner: false });
      });
  };

  /**
   * @method filterView
   * @summary apply filters and re-fetch layout, data. Then rebuild the page
   */
  filterView = locationAreaSearch => {
    const {
      windowType,
      isIncluded,
      page,
      sort,
      viewId,
      setListIncludedView,
      filterView,
    } = this.props;
    const { filtersActive } = this.state;

    filterView(windowType, viewId, filtersActive.toIndexedSeq().toArray())
      .then(response => {
        const viewId = response.viewId;

        if (isIncluded) {
          setListIncludedView({ windowType, viewId });
        }

        this.mounted &&
          this.setState(
            {
              triggerSpinner: false,
            },
            () => {
              this.getData(viewId, page, sort, locationAreaSearch);
            }
          );
      })
      .catch(() => {
        this.setState({ triggerSpinner: false });
      });
  };

  /**
   * @method getData
   * @summary Loads view/included tab data from REST endpoint
   */
  getData = (id, page, sortingQuery, locationAreaSearch) => {
    const {
      windowType,
      selections,
      updateUri,
      type,
      isIncluded,
      fetchDocument,
      indicatorState,
      selectTableItems,
      updateRawModal,
      viewId,
    } = this.props;

    indicatorState('pending');

    if (updateUri) {
      id && updateUri('viewId', id);
      page && updateUri('page', page);
      sortingQuery && updateUri('sort', sortingQuery);
    }

    return fetchDocument(
      windowType,
      id,
      page,
      // TODO: What ?
      this.pageLength,
      sortingQuery
    )
      .then(response => {
        const result = response.result;
        const resultById = {};
        const selection = getSelectionDirect(selections, windowType, viewId);
        const forceSelection =
          (type === 'includedView' || isIncluded) &&
          response &&
          result.length > 0 &&
          (selection.length === 0 ||
            !doesSelectionExist({
              data: { result },
              selected: selection,
            }));

        result.map(row => {
          const parsed = parseToDisplay(row.fieldsByName);
          resultById[`${row.id}`] = parsed;
          row.fieldsByName = parsed;
        });

        const pageColumnInfosByFieldName = response.columnsByFieldName;

        mergeColumnInfosIntoViewRows(
          pageColumnInfosByFieldName,
          response.result
        );

        if (this.mounted) {
          const newState = {
            pageColumnInfosByFieldName: pageColumnInfosByFieldName,
            triggerSpinner: false,
          };

          if (response.filters) {
            newState.filtersActive = filtersToMap(response.filters);
          }

          if (
            locationAreaSearch ||
            (newState.filtersActive &&
              newState.filtersActive.has(`location-area-search`))
          ) {
            this.getLocationData(resultById);
          }

          this.setState({ ...newState }, () => {
            if (forceSelection && response && result && result.length > 0) {
              const selection = [result[0].id];

              selectTableItems({
                windowType,
                viewId,
                ids: selection,
              });
            }
          });

          // process modal specific
          const { parentViewId, parentWindowId, headerProperties } = response;

          updateRawModal(windowType, {
            parentViewId,
            parentWindowId,
            headerProperties,
          });
        }

        indicatorState('saved');
      })
      .catch(() => {
        this.setState({ triggerSpinner: false });
      });
  };

  // TODO: Handle location search
  getLocationData = resultById => {
    const {
      windowType,
      viewId,
      reduxData: { mapConfig },
    } = this.props;

    locationSearchRequest({ windowId: windowType, viewId }).then(({ data }) => {
      const locationData = data.locations.map(location => {
        const name = get(
          resultById,
          [location.rowId, 'C_BPartner_ID', 'value', 'caption'],
          location.rowId
        );

        return {
          ...location,
          name,
        };
      });

      console.log('index getLocationData: ', data, locationData);

      // const newState = {
      //   data: {
      //     ...this.state.data,
      //     locationData,
      //   },
      // };
      if (mapConfig && mapConfig.provider) {
        // for mobile show map
        // for desktop show half-n-half

        this.setState({ panelsState: GEO_PANEL_STATES[1]  });
      }
      // this.setState(newState);
    });
  };

  // MANAGING SORT, PAGINATION, FILTERS --------------------------------------

  /**
   * @method handleChangePage
   * @summary ToDo: Describe the method.
   */
  handleChangePage = index => {
    const { reduxData } = this.props;
    let currentPage = reduxData.page;

    switch (index) {
      case 'up':
        currentPage * reduxData.pageLength < reduxData.size
          ? currentPage++
          : null;
        break;
      case 'down':
        currentPage != 1 ? currentPage-- : null;
        break;
      default:
        currentPage = index;
    }

    this.setState(
      {
        triggerSpinner: true,
      },
      () => {
        this.getData(reduxData.viewId, currentPage, reduxData.sort);
      }
    );
  };

  /**
   * @method sortData
   * @summary ToDo: Describe the method.
   */
  sortData = (asc, field, startPage) => {
    const { viewId, page } = this.props;

    this.setState(
      {
        // sort: getSortingQuery(asc, field),
        triggerSpinner: true,
      },
      () => {
        this.getData(viewId, startPage ? 1 : page, getSortingQuery(asc, field));
      }
    );
  };

  /**
   * @method handleFilterChange
   * @summary ToDo: Describe the method.
   */
  handleFilterChange = activeFilters => {
    const locationSearchFilter = activeFilters.has(`location-area-search`);

    // TODO: filters should be kept in the redux state
    this.setState(
      {
        filtersActive: activeFilters,
        triggerSpinner: true,
      },
      () => {
        this.fetchLayoutAndData(true, locationSearchFilter);
      }
    );
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

  // END OF MANAGING SORT, PAGINATION, FILTERS -------------------------------

  toggleState = state => {
    this.setState({ panelsState: state });
  };

  /**
   * @method redirectToDocument
   * @summary ToDo: Redirect to document details
   */
  redirectToDocument = id => {
    const {
      isModal,
      windowType,
      isSideListShow,
      reduxData,
      push,
      page,
      sort,
    } = this.props;

    if (isModal) {
      return;
    }

    push(`/window/${windowType}/${id}`);

    if (!isSideListShow) {
      // Caching last settings
      setPagination(page, windowType);
      setSorting(sort, windowType);
      setListId(reduxData.viewId, windowType);
    }
  };

  /**
   * @method redirectToDocument
   * @summary Redirect to a new document
   */
  redirectToNewDocument = () => {
    const { push, windowType } = this.props;

    push(`/window/${windowType}/new`);
  };

  /**
   * @method showIncludedView
   * @summary ToDo: Describe the method.
   */
  showIncludedViewOnSelect = ({
    showIncludedView,
    windowType,
    viewId,
    forceClose,
  } = {}) => {
    this.setState(
      {
        isShowIncluded: !!showIncludedView,
        hasShowIncluded: !!showIncludedView,
      },
      () => {
        if (showIncludedView) {
          setListIncludedView({ windowType, viewId });
        }
      }
    );

    // can't use setState callback because component might be unmounted and
    // callback is never called
    if (!showIncludedView) {
      closeListIncludedView({ windowType, viewId, forceClose });
    }
  };

  // TODO: Cleanup the selections mess
  /**
   * @method getSelected
   * @summary ToDo: Describe the method.
   */
  getSelected = () => {
    const {
      selections,
      windowType,
      includedView,
      parentWindowType,
      parentDefaultViewId,
      reduxData: { viewId },
    } = this.props;

    return {
      selected: getSelectionDirect(selections, windowType, viewId),
      childSelected:
        includedView && includedView.windowType
          ? getSelectionDirect(
              selections,
              includedView.windowType,
              includedView.viewId
            )
          : NO_SELECTION,
      parentSelected: parentWindowType
        ? getSelectionDirect(selections, parentWindowType, parentDefaultViewId)
        : NO_SELECTION,
    };
  };

  render() {
    const {
      includedView,
      layout,
      reduxData: { rowData },
    } = this.props;
    let { selected } = this.getSelected();

    const hasIncluded =
      layout &&
      layout.includedView &&
      includedView &&
      includedView.windowType &&
      includedView.viewId;

    const selectionValid = doesSelectionExist({
      rowData,
      selected,
      hasIncluded,
    });

    return (
      <DocumentList
        {...this.props}
        {...this.state}
        hasIncluded={hasIncluded}
        selectionValid={selectionValid}
        onToggleState={this.toggleState}
        pageLength={this.pageLength}
        onGetSelected={this.getSelected}
        onShowIncludedViewOnSelect={this.showIncludedViewOnSelect}
        onSortData={this.sortData}
        onFetchLayoutAndData={this.fetchLayoutAndData}
        onChangePage={this.handleChangePage}
        onFilterChange={this.handleFilterChange}
        onRedirectToDocument={this.redirectToDocument}
        onRedirectToNewDocument={this.onRedirectToNewDocument}
        onClearStaticFilters={this.clearStaticFilters}
        onResetInitialFilters={this.resetInitialFilters}
      />
    );
  }
}

/**
 * @typedef {object} Props Component props
 * @prop {object} DLpropTypes
 */
DocumentListContainer.propTypes = { ...DLpropTypes };

export default withRouter(
  connect(
    DLmapStateToProps,
    {
      resetView,
      fetchDocument,
      fetchLayout,
      createView,
      filterView,
      setListIncludedView,
      indicatorState,
      closeListIncludedView,
      setPagination,
      setSorting,
      setListId,
      push,
      updateRawModal,
      selectTableItems,
      deselectTableItems,
      removeSelectedTableItems,
      updateViewData,
      fetchLocationConfig,
    },
    null,
    { forwardRef: true }
  )(DocumentListContainer)
);
