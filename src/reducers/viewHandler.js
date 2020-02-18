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
  CREATE_VIEW,
  CREATE_VIEW_SUCCESS,
  CREATE_VIEW_ERROR,
  FILTER_VIEW,
  FILTER_VIEW_SUCCESS,
  FILTER_VIEW_ERROR,
} from '../actions/ViewActions';

const initialState = {
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
  page: 1,
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
      } = action.payload;

      //WTF prettier?
      //eslint-disable-next-line
      const page = (firstRow / pageLength) + 1;

      return {
        ...state,
        firstRow,
        headerProperties,
        pageLength,
        size,
        type,
        viewId,
        windowId,
        orderBy,
        page,
        data: result,
        rowDataMap: Map({ 1: result }),
        pending: false,
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
        layout: {
          ...state.layout,
          ...action.payload,
          pending: false,
          error: null,
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

    case CREATE_VIEW:
      return {
        ...state,
        pending: true,
        error: null,
      };
    case CREATE_VIEW_SUCCESS:
      return {
        ...state,
        viewId: action.payload.viewId,
        pending: false,
        notfound: false,
      };

    case CREATE_VIEW_ERROR:
      return {
        ...state,
        pending: false,
        notfound: true,
        error: action.error,
      };
    case FILTER_VIEW:
      return {
        ...state,
        pending: true,
        error: null,
      };
    case FILTER_VIEW_SUCCESS: {
      const { filters, viewId, size } = action.payload;

      return {
        ...state,
        filters,
        viewId,
        size,
        // TODO: Should we always set it to 1 ?
        page: 1,
        pending: false,
        notfound: false,
      };
    }
    case FILTER_VIEW_ERROR:
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
