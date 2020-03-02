import {
  browseViewRequest,
  createViewRequest,
  getViewLayout,
  /*,getLayout*/
} from '../api';

export const FETCH_DOCUMENT_PENDING = 'FETCH_DOCUMENT_PENDING';
export const FETCH_DOCUMENT_SUCCESS = 'FETCH_DOCUMENT_SUCCESS';
export const FETCH_DOCUMENT_ERROR = 'FETCH_DOCUMENT_ERROR';
export const FETCH_LAYOUT_PENDING = 'FETCH_LAYOUT_PENDING';
export const FETCH_LAYOUT_SUCCESS = 'FETCH_LAYOUT_SUCCESS';
export const FETCH_LAYOUT_ERROR = 'FETCH_LAYOUT_ERROR';
export const CREATE_VIEW = 'CREATE_VIEW';
export const CREATE_VIEW_SUCCESS = 'CREATE_VIEW_SUCCESS';
export const CREATE_VIEW_ERROR = 'CREATE_VIEW_ERROR';

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
    payload: { ...data },
  };
}

export function createViewError(error) {
  return {
    type: CREATE_VIEW_ERROR,
    error,
  };
}

export function fetchDocument(windowId, viewId, page, pageLength, orderBy) {
  return dispatch => {
    dispatch(fetchDocumentPending());

    return browseViewRequest({ windowId, viewId, page, pageLength, orderBy })
      .then(response => {
        dispatch(fetchDocumentSuccess(response.data));

        return Promise.resolve(response.data);
      })
      .catch(error => {
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
  return dispatch => {
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
      .then(response => {
        dispatch(createViewSuccess(response.data));

        return Promise.resolve(response.data);
      })
      .catch(error => {
        dispatch(createViewError(error));

        //show error message ?
        return Promise.resolve(error);
      });
  };
}

export function fetchLayout(windowId, viewType, viewProfileId = null) {
  return dispatch => {
    dispatch(fetchLayoutPending());

    return getViewLayout(windowId, viewType, viewProfileId)
      .then(response => {
        dispatch(fetchLayoutSuccess(response.data));

        return Promise.resolve(response.data);
      })
      .catch(error => {
        dispatch(fetchLayoutError(error));

        //show error message ?
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
