import { browseViewRequest } from '../api';

export const FETCH_DOCUMENT_PENDING = 'FETCH_DOCUMENT_PENDING';
export const FETCH_DOCUMENT_SUCCESS = 'FETCH_DOCUMENT_SUCCESS';
export const FETCH_DOCUMENT_ERROR = 'FETCH_DOCUMENT_ERROR';

export function fetchDocumentPending() {
  return {
    type: FETCH_DOCUMENT_PENDING,
  };
}

export function fetchDocumentSuccess(data) {
  return {
    type: FETCH_DOCUMENT_SUCCESS,
    payload: data,
  };
}

export function fetchDocumentError(error) {
  return {
    type: FETCH_DOCUMENT_ERROR,
    error,
  };
}

export function fetchDocument(windowId, viewId, page, pageLength, orderBy) {
  return dispatch => {
    dispatch(fetchDocumentPending());

    return browseViewRequest(windowId, viewId, page, pageLength, orderBy)
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
