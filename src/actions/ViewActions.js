import {
  browseViewRequest,
  createViewRequest,
  filterViewRequest,
  getViewLayout,
  // locationSearchRequest,
  locationConfigRequest,
} from '../api';

export const RESET_VIEW = 'RESET_VIEW';
export const FETCH_DOCUMENT_PENDING = 'FETCH_DOCUMENT_PENDING';
export const FETCH_DOCUMENT_SUCCESS = 'FETCH_DOCUMENT_SUCCESS';
export const FETCH_DOCUMENT_ERROR = 'FETCH_DOCUMENT_ERROR';
export const FETCH_LAYOUT_PENDING = 'FETCH_LAYOUT_PENDING';
export const FETCH_LAYOUT_SUCCESS = 'FETCH_LAYOUT_SUCCESS';
export const FETCH_LAYOUT_ERROR = 'FETCH_LAYOUT_ERROR';
export const CREATE_VIEW = 'CREATE_VIEW';
export const CREATE_VIEW_SUCCESS = 'CREATE_VIEW_SUCCESS';
export const CREATE_VIEW_ERROR = 'CREATE_VIEW_ERROR';
export const FILTER_VIEW_PENDING = 'FILTER_VIEW_PENDING';
export const FILTER_VIEW_SUCCESS = 'FILTER_VIEW_SUCCESS';
export const FILTER_VIEW_ERROR = 'FILTER_VIEW_ERROR';
export const UPDATE_VIEW_DATA = 'UPDATE_VIEW_DATA';
export const FETCH_LOCATION_CONFIG_SUCCESS = 'FETCH_LOCATION_CONFIG_SUCCESS';
export const FETCH_LOCATION_CONFIG_ERROR = 'FETCH_LOCATION_CONFIG_ERROR';

export function resetView() {
  return {
    type: RESET_VIEW,
  };
}

function fetchDocumentPending() {
  return {
    type: FETCH_DOCUMENT_PENDING,
  };
}

function fetchDocumentSuccess(data) {
  return {
    type: FETCH_DOCUMENT_SUCCESS,
    payload: data,
  };
}

function fetchDocumentError(error) {
  return {
    type: FETCH_DOCUMENT_ERROR,
    error,
  };
}

function fetchLayoutPending() {
  return {
    type: FETCH_LAYOUT_PENDING,
  };
}

function fetchLayoutSuccess(layout) {
  return {
    type: FETCH_LAYOUT_SUCCESS,
    payload: layout,
  };
}

function fetchLayoutError(error) {
  return {
    type: FETCH_LAYOUT_ERROR,
    error,
  };
}

function createViewPending() {
  return {
    type: CREATE_VIEW,
  };
}

function createViewSuccess(data) {
  return {
    type: CREATE_VIEW_SUCCESS,
    payload: { viewId: data.viewId },
  };
}

function createViewError(error) {
  return {
    type: CREATE_VIEW_ERROR,
    error,
  };
}

function filterViewPending() {
  return {
    type: FILTER_VIEW_PENDING,
  };
}

function filterViewSuccess(data) {
  return {
    type: FILTER_VIEW_SUCCESS,
    payload: { ...data },
  };
}

function filterViewError(error) {
  return {
    type: FILTER_VIEW_ERROR,
    error,
  };
}

export function updateViewData(rows, tabId) {
  return {
    type: UPDATE_VIEW_DATA,
    payload: {
      rows,
      tabId,
    },
  };
}

function fetchLocationConfigSuccess(data) {
  return {
    type: FETCH_LOCATION_CONFIG_SUCCESS,
    payload: { data },
  };
}

function fetchLocationConfigError(error) {
  return {
    type: FETCH_LOCATION_CONFIG_ERROR,
    error,
  };
}

// THUNK ACTIONS

export function fetchDocument(windowId, viewId, page, pageLength, orderBy) {
  return (dispatch) => {
    dispatch(fetchDocumentPending());

    return browseViewRequest({ windowId, viewId, page, pageLength, orderBy })
      .then((response) => {
        dispatch(fetchDocumentSuccess(response.data));

        return Promise.resolve(response.data);
      })
      .catch((error) => {
        dispatch(fetchDocumentError(error));

        //show error message ?
        return Promise.resolve(error);
      });
  };
}

export function createView(
  windowId,
  viewType,
  filters,
  refDocType,
  refDocId,
  refTabId,
  refRowIds
) {
  return (dispatch) => {
    dispatch(createViewPending());

    return createViewRequest({
      windowId,
      viewType,
      filters,
      refDocType,
      refDocId,
      refTabId,
      refRowIds,
    })
      .then((response) => {
        dispatch(createViewSuccess(response.data));

        return Promise.resolve(response.data);
      })
      .catch((error) => {
        dispatch(createViewError(error));

        //show error message ?
        return Promise.resolve(error);
      });
  };
}

export function fetchLayout(windowId, viewType, viewProfileId = null) {
  return (dispatch) => {
    dispatch(fetchLayoutPending());

    return getViewLayout(windowId, viewType, viewProfileId)
      .then((response) => {
        dispatch(fetchLayoutSuccess(response.data));

        return Promise.resolve(response.data);
      })
      .catch(error => {
        dispatch(fetchLayoutError(error));

        return Promise.resolve(error);
      });
  };
}

export function filterView(windowId, viewId, filters) {
  return (dispatch) => {
    dispatch(filterViewPending());

    // TODO: This should send object, like with other requests
    return filterViewRequest(windowId, viewId, filters)
      .then((response) => {
        dispatch(filterViewSuccess(response.data));

        return Promise.resolve(response.data);
      })
      .catch((error) => {
        dispatch(filterViewError(error));

        return Promise.resolve(error);
      });
  };
}

export function fetchLocationConfig() {
  return (dispatch) => {
    return locationConfigRequest()
      .then((response) => {
        dispatch(fetchLocationConfigSuccess(response.data));
      })
      .catch((error) => {
        dispatch(fetchLocationConfigError(error));

        return Promise.resolve(error);
      });
  };
}

// export function initDataSuccess({
//   data,
//   docId,
//   includedTabsInfo,
//   saveStatus,
//   scope,
//   standardActions,
//   validStatus,
//   websocket,
// }) {
//   return {
//     data,
//     docId,
//     includedTabsInfo,
//     saveStatus,
//     scope,
//     standardActions,
//     type: INIT_DATA_SUCCESS,
//     validStatus,
//     websocket,
//   };
// }
// export function fetchLayout(windowId, viewId, page, pageLength, orderBy) {
//   return dispatch => {
//     dispatch(fetchDocumentPending());

//     return getLayout(windowId, viewId, page, pageLength, orderBy)
//       .then(response => {
//         dispatch(fetchLayoutSuccess(response.data));

//         return Promise.resolve(response.data);
//       })
//       .catch(error => {
//         dispatch(fetchLayoutError(error));

//         //show error message ?
//         return Promise.resolve(error);
//       });
//   };
// }
