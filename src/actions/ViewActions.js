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

export function resetView(id) {
  return {
    type: RESET_VIEW,
    payload: { id },
  };
}

function fetchDocumentPending(id) {
  return {
    type: FETCH_DOCUMENT_PENDING,
    payload: { id },
  };
}

function fetchDocumentSuccess(id, data) {
  return {
    type: FETCH_DOCUMENT_SUCCESS,
    payload: { id, data },
  };
}

function fetchDocumentError(id, error) {
  return {
    type: FETCH_DOCUMENT_ERROR,
    payload: { id, error },
  };
}

function fetchLayoutPending(id) {
  return {
    type: FETCH_LAYOUT_PENDING,
    payload: { id },
  };
}

function fetchLayoutSuccess(id, layout) {
  return {
    type: FETCH_LAYOUT_SUCCESS,
    payload: { id, layout },
  };
}

function fetchLayoutError(id, error) {
  return {
    type: FETCH_LAYOUT_ERROR,
    payload: { id, error },
  };
}

function createViewPending(id) {
  return {
    type: CREATE_VIEW,
    payload: { id },
  };
}

function createViewSuccess(id, data) {
  return {
    type: CREATE_VIEW_SUCCESS,
    payload: { id, viewId: data.viewId },
  };
}

function createViewError(id, error) {
  return {
    type: CREATE_VIEW_ERROR,
    payload: { id, error },
  };
}

function filterViewPending(id) {
  return {
    type: FILTER_VIEW_PENDING,
    payload: { id },
  };
}

function filterViewSuccess(id, data) {
  return {
    type: FILTER_VIEW_SUCCESS,
    payload: { id, data },
  };
}

function filterViewError(id, error) {
  return {
    type: FILTER_VIEW_ERROR,
    payload: { id, error },
  };
}

export function updateViewData(id, rows, tabId) {
  return {
    type: UPDATE_VIEW_DATA,
    payload: {
      id,
      rows,
      tabId,
    },
  };
}

function fetchLocationConfigSuccess(id, data) {
  return {
    type: FETCH_LOCATION_CONFIG_SUCCESS,
    payload: { id, data },
  };
}

function fetchLocationConfigError(id, error) {
  return {
    type: FETCH_LOCATION_CONFIG_ERROR,
    payload: { id, error },
  };
}

// THUNK ACTIONS

export function fetchDocument(windowId, viewId, page, pageLength, orderBy) {
  return (dispatch) => {
    dispatch(fetchDocumentPending(windowId));

    return browseViewRequest({ windowId, viewId, page, pageLength, orderBy })
      .then((response) => {
        dispatch(fetchDocumentSuccess(windowId, response.data));

        return Promise.resolve(response.data);
      })
      .catch((error) => {
        dispatch(fetchDocumentError(windowId, error));

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
    dispatch(createViewPending(windowId));

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
        dispatch(createViewSuccess(windowId, response.data));

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
    dispatch(fetchLayoutPending(windowId));

    return getViewLayout(windowId, viewType, viewProfileId)
      .then((response) => {
        dispatch(fetchLayoutSuccess(windowId, response.data));

        return Promise.resolve(response.data);
      })
      .catch((error) => {
        dispatch(fetchLayoutError(windowId, error));

        return Promise.resolve(error);
      });
  };
}

export function filterView(windowId, viewId, filters) {
  return (dispatch) => {
    dispatch(filterViewPending(windowId));

    // TODO: This should send object, like with other requests
    return filterViewRequest(windowId, viewId, filters)
      .then((response) => {
        dispatch(filterViewSuccess(windowId, response.data));

        return Promise.resolve(response.data);
      })
      .catch((error) => {
        dispatch(filterViewError(windowId, error));

        return Promise.resolve(error);
      });
  };
}

export function fetchLocationConfig(windowId) {
  return (dispatch) => {
    return locationConfigRequest()
      .then((response) => {
        dispatch(fetchLocationConfigSuccess(windowId, response.data));
      })
      .catch((error) => {
        dispatch(fetchLocationConfigError(windowId, error));

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
