// import update from 'immutability-helper';
import { Map /*, List, Set*/ } from 'immutable';
// import _ from 'lodash';
// import { createSelector } from 'reselect';
// import uuid from 'uuid/v4';

import {
  FETCH_DOCUMENT_PENDING,
  FETCH_DOCUMENT_SUCCESS,
  FETCH_DOCUMENT_ERROR,
} from '../actions/DataFetching';

const initialState = {
  master: {
    // layout: {
    //   activeTab: null,
    // },
    data: [],
    // rowData is an immutable Map with tabId's as keys, and Lists as values.
    // List's elements are plain objects for now
    rowDataMap: Map(),
    docId: undefined,
    type: null,
    viewId: null,
    windowId: null,
    filters: null,
    firstRow: 0,
    headerProperties: null,
    pageLength: 0,
    size: 0,

    description: null,

    sort: null,
    staticFilters: null,
    orderBy: null,
    queryLimitHit: null,

    // columnsByFieldName: null,
    // websocket: null,

    // saveStatus: {},
    // validStatus: {},
    // includedTabsInfo: {},
    notfound: false,
    pending: false,
    error: null,
  },
};

export default function dataHandler(state = initialState, action) {
  switch (action.type) {
    case FETCH_DOCUMENT_PENDING:
      return {
        ...state,
        pending: true,
        notFound: true,
        error: null,
      };
    case FETCH_DOCUMENT_SUCCESS: {
      const {
        filters,
        firstRow,
        headerProperties,
        pageLength,
        result,
        size,
        type,
        viewId,
        windowId,
      } = action.payload;

      const master = {
        ...state.master,
        filters,
        firstRow,
        headerProperties,
        pageLength,
        size,
        type,
        viewId,
        windowId,
        data: result,
        rowDataMap: Map({ 1: result }),
        pending: false,
      };

      return {
        ...state,
        master,
      };
    }
    case FETCH_DOCUMENT_ERROR:
      return {
        ...state,
        pending: false,
        notfound: true,
        error: action.error,
      };
    default:
      return state;
  }
}
