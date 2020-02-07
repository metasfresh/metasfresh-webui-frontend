// import counterpart from 'counterpart';
// import cx from 'classnames';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';
import { Map, List, Set } from 'immutable';
import currentDevice from 'current-device';
import { get } from 'lodash';

import {
  // getViewLayout,
  locationSearchRequest,
  locationConfigRequest,
  // createViewRequest,
  deleteStaticFilter,
  filterViewRequest,
  getViewRowsByIds,
} from '../../../api';

import {
  fetchDocument,
  fetchLayout,
  createView,
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
  // NO_VIEW,
  // PANEL_WIDTHS,
  GEO_PANEL_STATES,
  getSortingQuery,
  // redirectToNewDocument,
  doesSelectionExist,
  filtersToMap,
  mergeColumnInfosIntoViewRows,
  mergeRows,
  parseToDisplay,

  // TODO: Figure out where this was used
  getRowsData,
} from '../../../utils/documentListHelper';

import DocumentList from './DocumentList';

class DocumentListContainer extends Component {
  constructor(props) {
    super(props);

    const { defaultViewId, defaultPage /*, defaultSort*/ } = props;

    // TODO: Why it's not in the state?
    this.pageLength =
      currentDevice.type === 'mobile' || currentDevice.type === 'tablet'
        ? 9999
        : 20;
    // this.supportAttribute = false;

    this.state = {
      data: null, // view result (result, firstRow, pageLength etc)
      // layout: null,
      pageColumnInfosByFieldName: null,
      // toggleWidth: 0,
      panelsState: GEO_PANEL_STATES[0],
      mapConfig: null,
      viewId: defaultViewId,
      page: defaultPage || 1,
      // sort: defaultSort,
      filtersActive: Map(),
      initialValuesNulled: Map(),
      // clickOutsideLock: false,
      isShowIncluded: false,
      hasShowIncluded: false,
      triggerSpinner: true,

      // in some scenarios we don't want to reload table data
      // after edit, as it triggers request, collapses rows and looses selection
      rowEdited: false,
    };

    this.fetchLayoutAndData();
  }

  UNSAFE_componentWillMount() {
    locationConfigRequest().then(resp => {
      if (resp.data.provider === 'GoogleMaps') {
        this.setState({
          mapConfig: resp.data,
        });
      }
    });
  }

  componentDidMount = () => {
    this.mounted = true;
  };

  componentWillUnmount() {
    this.mounted = false;
    disconnectWS.call(this);
  }

  _UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      defaultPage: nextDefaultPage,
      defaultSort: nextDefaultSort,
      defaultViewId: nextDefaultViewId,
      includedView: nextIncludedView,
      isIncluded: nextIsIncluded,
      refId: nextRefId,
      windowType: nextWindowType,
    } = nextProps;

    const {
      defaultPage,
      defaultSort,
      defaultViewId,
      includedView,
      isIncluded,
      refId,
      windowType,
      reduxData,
      removeSelectedTableItems,
      closeListIncludedView,

      // TODO: pagination & sorting
      sort,
      page,
      viewId,
    } = this.props;
    // const { viewId } = reduxData;
    const { /*page, /*sort, viewId, */ staticFilterCleared } = this.state;
    const included =
      includedView && includedView.windowType && includedView.viewId;
    const nextIncluded =
      nextIncludedView &&
      nextIncludedView.windowType &&
      nextIncludedView.viewId;
    const location = document.location;

    // TODO: What should we do with this ??
    // this.loadSupportAttributeFlag(nextProps);

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
      (nextDefaultViewId === undefined &&
        nextDefaultViewId !== defaultViewId) ||
      (nextWindowType === windowType &&
        ((nextDefaultViewId !== defaultViewId &&
          isIncluded &&
          nextIsIncluded) ||
          location.hash === '#notification')) ||
      nextRefId !== refId
    ) {
      this.setState(
        {
          // data: null,
          // rowDataMap: Map({ 1: List() }),
          // layout: null,
          filtersActive: Map(),
          initialValuesNulled: Map(),
          viewId: location.hash === '#notification' ? viewId : null,
          staticFilterCleared: false,
          triggerSpinner: true,
          panelsState: 0,
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

    //TODO: Handle sorting/pagination from redux
    if (nextDefaultSort !== defaultSort && nextDefaultSort !== sort) {
      stateChanges.sort = nextDefaultSort;
    }

    if (nextDefaultPage !== defaultPage && nextDefaultPage !== page) {
      stateChanges.page = nextDefaultPage || 1;
    }

    if (nextDefaultViewId !== viewId) {
      // TODO: Handle selection
      removeSelectedTableItems({ viewId: viewId, windowType });

      stateChanges.viewId = nextDefaultViewId;
      stateChanges.refreshSelection = true;
    }

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

  // shouldComponentUpdate(nextProps, nextState) {
  //   return !!nextState.layout && !!nextState.data;
  // }

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
    const { windowType, deselectTableItems, viewId } = this.props;
    // const { viewId } = this.state;

    connectWS.call(this, `/view/${viewId}`, msg => {
      const { fullyChanged, changedIds } = msg;

      // TODO: Handle WS data
      if (changedIds) {
        getViewRowsByIds(windowType, viewId, changedIds.join()).then(
          response => {
            const {
              data,
              pageColumnInfosByFieldName,
              filtersActive,
            } = this.state;
            const toRows = data.result;
            const { rows, removedRows } = mergeRows({
              toRows,
              fromRows: [...response.data],
              columnInfosByFieldName: pageColumnInfosByFieldName,
              changedIds,
            });
            const rowsList = List(rows);

            if (removedRows.length) {
              deselectTableItems(removedRows, windowType, viewId);
            } else {
              if (filtersActive.size) {
                this.filterView();
              }

              // force updating actions
              this.updateQuickActions();
            }

            this.setState({
              data: {
                ...this.state.data,
                result: rowsList,
              },
              // rowDataMap: Map({ 1: rowsList }),
            });
          }
        );
      }

      if (fullyChanged == true) {
        const { selectTableItems, windowType, selections, viewId } = this.props;
        // const { viewId } = this.state;
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
  // loadSupportAttributeFlag = ({ selected }) => {
  //   const { reduxData } = this.props;
  //   const { data } = this.state;
  //   if (!data) {
  //     return;
  //   }
  //   const rows = getRowsData(reduxData.data);

  //   if (selected.length === 1) {
  //     const selectedRow = rows.find(row => row.id === selected[0]);

  //     this.supportAttribute = selectedRow && selectedRow.supportAttributes;
  //     this.setState({
  //       supportAttribute: selectedRow && selectedRow.supportAttributes,
  //     });
  //   } else {
  //     this.supportAttribute = false;
  //     this.setState({
  //       supportAttribute: false,
  //     });
  //   }
  // };

  /**
   * @method clearStaticFilters
   * @summary ToDo: Describe the method.
   */
  clearStaticFilters = filterId => {
    const { push, windowType } = this.props;
    const { viewId } = this.state;

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
      setNotFound,
      viewId,
      fetchLayout,
      updateRawModal,
    } = this.props;
    // const { viewId } = this.state;

    // console.log('A: ', windowType, type, viewProfileId);

    fetchLayout(windowType, type, viewProfileId)
      .then(response => {
        // console.log('RESPONSE FETCH: ', this.mounted, response)
        if (this.mounted) {
          //     this.setState(
          //       {
          //         layout: response.data,
          //       },
          //       () => {
          const { allowedCloseActions } = response;

          if (allowedCloseActions) {
            updateRawModal(windowType, { allowedCloseActions });
          }

          if (viewId) {
            this.connectWebSocket(viewId);

            if (!isNewFilter) {
              // console.log('fetch 1')
              this.browseView();
            } else {
              // console.log('fetch 2')
              this.filterView(locationAreaSearch);
            }
          } else {
            // console.log('fetch 3')
            this.createView();
          }

          // TODO: Should we handle this in the action creator ?
          setModalTitle && setModalTitle(response.data.caption);
        }
        // );
      })
      .catch(e => {
        console.log('FETCH ERROR: ', e)
        // We have to always update that fields to refresh that view!
        // Check the shouldComponentUpdate method
        this.setState(
          {
            //       layout: 'notfound',
            triggerSpinner: false,
          }
          //     () => {
          //       setNotFound && setNotFound(true);
          //     }
        );
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

    createView(
      windowType,
      type,
      filtersActive.toIndexedSeq().toArray(),
      refType,
      refId,
      refTabId,
      refRowIds
    )
      .then(response => {
        this.mounted &&
          this.setState(
            {
              //   data: {
              //     ...response.data,
              //   },
              //   viewId: response.data.viewId,
              triggerSpinner: false,
            },
            () => {
              this.connectWebSocket(response.viewId);
              this.getData(response.viewId, page, sort);
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
    } = this.props;
    const { /*page, sort, viewId, */ filtersActive } = this.state;

    filterViewRequest(
      windowType,
      viewId,
      filtersActive.toIndexedSeq().toArray()
    )
      .then(response => {
        const viewId = response.data.viewId;

        if (isIncluded) {
          setListIncludedView({ windowType, viewId });
        }

        this.mounted &&
          this.setState(
            {
              data: {
                ...response.data,
              },
              viewId: viewId,
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
      setNotFound,
      type,
      isIncluded,
      fetchDocument,
      indicatorState,
      selectTableItems,
      updateRawModal,
    } = this.props;
    const { viewId } = this.state;

    console.log('B')

    if (setNotFound) {
      setNotFound(false);
    }
    indicatorState('pending');

    if (updateUri) {
      id && updateUri('viewId', id);
      page && updateUri('page', page);
      sortingQuery && updateUri('sort', sortingQuery);
    }

    return (
      fetchDocument(
        windowType,
        id,
        page,
        // TODO: What ?
        this.pageLength,
        sortingQuery
      )
        .then(response => {
          const result = List(response.result);
          result.hashCode();

          const resultById = {};
          const selection = getSelectionDirect(selections, windowType, viewId);
          const forceSelection =
            (type === 'includedView' || isIncluded) &&
            response &&
            result.size > 0 &&
            (selection.length === 0 ||
              !doesSelectionExist({
                data: {
                  ...response,
                  result,
                  // resultById,
                },
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
              // rowDataMap: Map({ 1: result }),
              // pageColumnInfosByFieldName: pageColumnInfosByFieldName,
              // triggerSpinner: false,
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
              if (forceSelection && response && result && result.size > 0) {
                const selection = [result.get(0).id];

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
        // TODO: Handle spinner in component ?
        .catch(() => {
          this.setState({ triggerSpinner: false });
        })
    );
  };

  // TODO: Handle location search
  getLocationData = resultById => {
    const { windowType } = this.props;
    const { viewId, mapConfig } = this.state;

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

      const newState = {
        data: {
          ...this.state.data,
          locationData,
        },
      };

      if (mapConfig && mapConfig.provider) {
        // for mobile show map
        // for desktop show half-n-half
        newState.panelsState = GEO_PANEL_STATES[1];
      }

      this.setState(newState);
    });
  };

  // MANAGING SORT, PAGINATION, FILTERS --------------------------------------

  /**
   * @method handleChangePage
   * @summary ToDo: Describe the method.
   */
  handleChangePage = index => {
    const { reduxData } = this.props;
    // const { data } = this.state;
    let currentPage = reduxData.page;

    switch (index) {
      case 'up':
        currentPage * reduxData.pageLength < reduxData.size ? currentPage++ : null;
        break;
      case 'down':
        currentPage != 1 ? currentPage-- : null;
        break;
      default:
        currentPage = index;
    }

    this.setState(
      {
        page: currentPage,
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
    const { viewId, page } = this.state;

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

    // TODO: handle page change, filters should be kept in redux
    this.setState(
      {
        filtersActive: activeFilters,
        // page: 1,
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

  toggleState = state => {
    this.setState({ panelsState: state });
  };

  /**
   * @method redirectToDocument
   * @summary ToDo: Describe the method.
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
    // const { sort, page } = this.state;

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
    // let { selected, childSelected, parentSelected } = this.getSelected();
    return (
      <DocumentList
        {...this.props}
        {...this.state}
        onToggleState={this.toggleState}
        pageLength={this.pageLength}
        onGetSelected={this.getSelected}
        onShowIncludedViewOnSelect={this.showIncludedViewOnSelect}
        onSortData={this.sortData}
        onFetchLayoutAndData={this.fetchLayoutAndData}
        onChangePage={this.handleChangePage}
        onFilterChange={this.handleFilterChange}
        onRedirectToDocument={this.redirectToDocument}
        onClearStaticFilters={this.clearStaticFilters}
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
      fetchDocument,
      fetchLayout,
      createView,
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
    },
    null,
    { forwardRef: true }
  )(DocumentListContainer)
);
