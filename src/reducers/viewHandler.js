// import update from 'immutability-helper';
import { Map, List, /*Set*/ } from 'immutable';
// import _ from 'lodash';
// import { createSelector } from 'reselect';
// import uuid from 'uuid/v4';

import {
  FETCH_DOCUMENT_PENDING,
  FETCH_DOCUMENT_SUCCESS,
  FETCH_DOCUMENT_ERROR,
  FETCH_LAYOUT_PENDING,
  FETCH_LAYOUT_SUCCESS,
  FETCH_LAYOUT_ERROR,
} from '../actions/ViewActions';

const initialState = {
  master: {
    layout: {
      activeTab: null,
      data: [],
      pending: false,
      error: null,
    },
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

export default function viewHandler(state = initialState, action) {
  switch (action.type) {
    case FETCH_DOCUMENT_PENDING:
      return {
        ...state,
        pending: true,
        error: null,
      };
    case FETCH_DOCUMENT_SUCCESS: {
      const {
        firstRow,
        headerProperties,
        pageLength,
        result,
        size,
        type,
        viewId,
        windowId,
        orderBy,
        // queryLimit,
        // queryLimitHit,
      } = action.payload;

      const master = {
        ...state.master,
        firstRow,
        headerProperties,
        pageLength,
        size,
        type,
        viewId,
        windowId,
        orderBy,
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

    // LAYOUT
    case FETCH_LAYOUT_PENDING:
      return {
        ...state,
        layout: {
          ...state.layout,
          pending: true,
        },
      };
    case FETCH_LAYOUT_SUCCESS: {
      return {
        ...state,
        master: {
          ...state.master,
          layout: {
            ...state.master.layout,
            ...action.payload,
            pending: false,
            error: null,
          },
        },
      };
    }
    case FETCH_LAYOUT_ERROR:
      return {
        ...state,
        layout: {
          ...state.layout,
          pending: false,
          error: action.error,
        },
      };
    default:
      return state;
  }
}
