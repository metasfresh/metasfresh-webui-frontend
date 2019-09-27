import React, { Component } from 'react';
import { connect, withRouter } from 'react-redux';
import { push } from 'react-router-redux';
import { Map, List } from 'immutable';
import currentDevice from 'current-device';

import {
  getViewLayout,
  createViewRequest,
  deleteStaticFilter,
  filterViewRequest,
  getViewRowsByIds,
} from '../../api';

import { fetchDocument } from '../../actions/DataFetching';

import {
  closeListIncludedView,
  setListId,
  setListIncludedView,
  setPagination,
  setSorting,
} from '../../actions/ListActions';
import {
  connectWS,
  disconnectWS,
  updateRawModal,
  indicatorState,
  selectTableItems,
  deselectTableItems,
  removeSelectedTableItems,
} from '../../actions/WindowActions';
import { parseToDisplay } from '../../utils/documentListHelper';
import { getSelectionDirect } from '../../reducers/windowHandler';
import {
  DLpropTypes,
  DLcontextTypes,
  DLmapStateToProps,
  NO_SELECTION,
  getSortingQuery,
  doesSelectionExist,
  filtersToMap,
  mergeColumnInfosIntoViewRows,
  mergeRows,
} from '../../utils/documentListHelper';

import DocumentList from './DocumentList';

class DocumentListContainer extends Component {
  constructor(props) {
    super(props);

    // const { viewId } = props;

    this.state = {
      data: null, // view result (result, firstRow, pageLength etc)
      layout: null,
      pageColumnInfosByFieldName: null,
      toggleWidth: 0,
      // viewId: defaultViewId,
      filtersActive: Map(),
      initialValuesNulled: Map(),
      clickOutsideLock: false,
      isShowIncluded: false,
      hasShowIncluded: false,
      triggerSpinner: true,

      // in some scenarios we don't want to reload table data
      // after edit, as it triggers request, collapses rows and looses selection
      rowEdited: false,
    };

    this.pageLength =
      currentDevice.type === 'mobile' || currentDevice.type === 'tablet'
        ? 9999
        : 20;

    this.fetchLayoutAndData();
  }

  componentDidMount = () => {
    this.mounted = true;
  };

  componentWillUnmount() {
    this.mounted = false;
    disconnectWS.call(this);
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
      viewId,
      includedView,
      isIncluded,
      refId,
      windowType,
      dispatch,
      // reduxData,
      location,
    } = this.props;
    const { staticFilterCleared } = this.state;
    const included =
      includedView && includedView.windowType && includedView.viewId;
    const nextIncluded =
      nextIncludedView &&
      nextIncludedView.windowType &&
      nextIncludedView.viewId;
    // const location = document.location;

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
      (nextViewId === undefined && nextViewId !== viewId) ||
      (nextWindowType === windowType &&
        ((nextViewId !== viewId && isIncluded && nextIsIncluded) ||
          location.hash === '#notification')) ||
      nextRefId !== refId
    ) {
      this.setState(
        {
          // data: null,
          // rowDataMap: Map({ 1: List() }),
          layout: null,
          filtersActive: Map(),
          initialValuesNulled: Map(),
          // viewId: location.hash === '#notification' ? this.state.viewId : null,
          staticFilterCleared: false,
          triggerSpinner: true,
        },
        () => {
          if (included) {
            dispatch(closeListIncludedView(includedView));
          }

          this.fetchLayoutAndData();
        }
      );
    }

    const stateChanges = {};

    if (nextViewId !== viewId) {
      dispatch(removeSelectedTableItems({ viewId, windowType }));

      stateChanges.viewId = nextViewId;
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

  shouldComponentUpdate(nextProps, nextState) {
    return !!nextState.layout && !!nextState.data;
  }

  componentDidUpdate(prevProps) {
    const { setModalDescription, reduxData } = this.props;
    // const { data } = this.state;

    if (prevProps.reduxData !== reduxData && setModalDescription) {
      setModalDescription(reduxData.description);
    }
  }

  /**
   * @method connectWebSocket
   * @summary ToDo: Describe the method.
   */
  connectWebSocket = () => {
    const { windowType, dispatch, viewId } = this.props;
    // const { viewId } = this.state;

    connectWS.call(this, `/view/${viewId}`, msg => {
      const { fullyChanged, changedIds } = msg;

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
              dispatch(deselectTableItems(removedRows, windowType, viewId));
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
              rowDataMap: Map({ 1: rowsList }),
            });
          }
        );
      }

      if (fullyChanged == true) {
        const { dispatch, windowType, selections, viewId } = this.props;
        // const { viewId } = this.state;
        const selection = getSelectionDirect(selections, windowType, viewId);

        // Reload Attributes after QuickAction is done
        selection.length &&
          dispatch(
            selectTableItems({
              windowType,
              viewId,
              ids: [selection[0]],
            })
          );

        this.browseView();
        this.updateQuickActions();
      }
    });
  };

  /**
   * @method clearStaticFilters
   * @summary ToDo: Describe the method.
   */
  clearStaticFilters = filterId => {
    const { dispatch, windowType, viewId } = this.props;
    // const { viewId } = this.state;

    deleteStaticFilter(windowType, viewId, filterId).then(response => {
      this.setState({ staticFilterCleared: true }, () =>
        dispatch(push(`/window/${windowType}?viewId=${response.data.viewId}`))
      );
    });
  };

  // FETCHING LAYOUT && DATA -------------------------------------------------
  /**
   * @method fetchLayoutAndData
   * @summary ToDo: Describe the method.
   */
  fetchLayoutAndData = isNewFilter => {
    const {
      windowType,
      type,
      dispatch,
      viewProfileId,
      setModalTitle,
      setNotFound,

      viewId,
    } = this.props;
    // const { viewId } = this.state;

    getViewLayout(windowType, type, viewProfileId)
      .then(response => {
        this.mounted &&
          this.setState(
            {
              layout: response.data,
            },
            () => {
              const { allowedCloseActions } = response.data;

              if (allowedCloseActions) {
                dispatch(updateRawModal(windowType, { allowedCloseActions }));
              }

              if (viewId) {
                this.connectWebSocket(viewId);

                if (!isNewFilter) {
                  this.browseView();
                } else {
                  this.filterView();
                }
              } else {
                this.createView();
              }
              setModalTitle && setModalTitle(response.data.caption);
            }
          );
      })
      .catch(() => {
        // We have to always update that fields to refresh that view!
        // Check the shouldComponentUpdate method
        this.setState(
          {
            layout: 'notfound',
            triggerSpinner: false,
          },
          () => {
            setNotFound && setNotFound(true);
          }
        );
      });
  };

  /**
   * @method browseView
   * @summary If viewId exist, than browse that view.
   */
  browseView = () => {
    const { viewId, page, sort } = this.props;
    // const { viewId, page, sort } = this.state;

    // in case of redirect from a notification, first call will have viewId empty
    if (viewId) {
      this.getData(viewId, page, sort).catch(err => {
        if (err.response && err.response.status === 404) {
          this.createView();
        }
      });
    }
  };

  /**
   * @method createView
   * @summary ToDo: Describe the method.
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
    } = this.props;
    const { /*page, sort,*/ filtersActive } = this.state;

    createViewRequest({
      windowId: windowType,
      viewType: type,
      filters: filtersActive.toIndexedSeq().toArray(),
      refDocType: refType,
      refDocId: refId,
      refTabId,
      refRowIds,
    }).then(response => {
      this.mounted &&
        this.setState(
          {
            data: {
              ...response.data,
            },
            viewId: response.data.viewId,
            triggerSpinner: false,
          },
          () => {
            this.connectWebSocket(response.data.viewId);
            this.getData(response.data.viewId, page, sort);
          }
        );
    });
  };

  // TODO: Handle filtering
  /**
   * @method filterView
   * @summary ToDo: Describe the method.
   */
  filterView = () => {
    const { windowType, isIncluded, dispatch, page, sort, viewId } = this.props;
    const { filtersActive } = this.state;

    filterViewRequest(
      windowType,
      viewId,
      filtersActive.toIndexedSeq().toArray()
    ).then(response => {
      const viewId = response.data.viewId;

      if (isIncluded) {
        dispatch(setListIncludedView({ windowType, viewId }));
      }

      this.mounted &&
        this.setState(
          {
            data: {
              ...response.data,
            },
            // viewId: viewId,
            triggerSpinner: false,
          },
          () => {
            this.getData(viewId, page, sort);
          }
        );
    });
  };

  /**
   * @method getData
   * @summary Loads view/included tab data from REST endpoint
   */
  getData = (id, page, sortingQuery) => {
    const {
      dispatch,
      windowType,
      selections,
      updateUri,
      setNotFound,
      type,
      isIncluded,

      viewId,
    } = this.props;
    // const { viewId } = this.state;

    if (setNotFound) {
      setNotFound(false);
    }
    dispatch(indicatorState('pending'));

    if (updateUri) {
      id && updateUri('viewId', id);
      page && updateUri('page', page);
      sortingQuery && updateUri('sort', sortingQuery);
    }

    return dispatch(
      fetchDocument({
        windowId: windowType,
        viewId: id,
        page,
        pageLength: this.pageLength,
        orderBy: sortingQuery,
      })
    ).then(response => {
      const result = List(response.result);
      result.hashCode();

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
            },
            selected: selection,
          }));

      result.map(row => {
        row.fieldsByName = parseToDisplay(row.fieldsByName);
      });

      const pageColumnInfosByFieldName = response.columnsByFieldName;

      mergeColumnInfosIntoViewRows(pageColumnInfosByFieldName, response.result);

      if (this.mounted) {
        const newState = {
          pageColumnInfosByFieldName: pageColumnInfosByFieldName,
          triggerSpinner: false,
        };

        if (response.filters) {
          newState.filtersActive = filtersToMap(response.filters);
        }

        this.setState({ ...newState }, () => {
          if (forceSelection && response && result && result.size > 0) {
            const selection = [result.get(0).id];

            dispatch(
              selectTableItems({
                windowType,
                viewId,
                ids: selection,
              })
            );
          }
        });

        // process modal specific
        const { parentViewId, parentWindowId, headerProperties } = response;
        dispatch(
          updateRawModal(windowType, {
            parentViewId,
            parentWindowId,
            headerProperties,
          })
        );
      }

      dispatch(indicatorState('saved'));
    });
  };

  /**
   * @method handleChangePage
   * @summary ToDo: Describe the method.
   */
  handleChangePage = index => {
    const { reduxData, sort, viewId } = this.props;
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
        // page: currentPage,
        triggerSpinner: true,
      },
      () => {
        this.getData(viewId, currentPage, sort);
      }
    );
  };

  /**
   * @method sortData
   * @summary ToDo: Describe the method.
   */
  sortData = (asc, field, startPage) => {
    // const { viewId, page } = this.state;
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
    this.setState(
      {
        filtersActive: activeFilters,
        page: 1,
        triggerSpinner: true,
      },
      () => {
        this.fetchLayoutAndData(true);
      }
    );
  };

  /**
   * @method redirectToDocument
   * @summary ToDo: Describe the method.
   */
  redirectToDocument = id => {
    const {
      dispatch,
      isModal,
      windowType,
      isSideListShow,
      reduxData,
    } = this.props;
    const { sort, page } = this.state;

    if (isModal) {
      return;
    }

    dispatch(push(`/window/${windowType}/${id}`));

    if (!isSideListShow) {
      // Caching last settings
      dispatch(setPagination(page, windowType));
      dispatch(setSorting(sort, windowType));
      dispatch(setListId(reduxData.viewId, windowType));
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
    const { dispatch } = this.props;

    this.setState(
      {
        isShowIncluded: !!showIncludedView,
        hasShowIncluded: !!showIncludedView,
      },
      () => {
        if (showIncludedView) {
          dispatch(setListIncludedView({ windowType, viewId }));
        }
      }
    );

    // can't use setState callback because component might be unmounted and
    // callback is never called
    if (!showIncludedView) {
      dispatch(closeListIncludedView({ windowType, viewId, forceClose }));
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
    return (
      <DocumentList
        {...this.props}
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

DocumentList.propTypes = { ...DLpropTypes };

DocumentList.contextTypes = { ...DLcontextTypes };

export default withRouter(
  connect(
    DLmapStateToProps,
    null,
    null,
    { withRef: true }
  )(DocumentListContainer)
);
