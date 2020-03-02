import { Map } from 'immutable';
import { get } from 'lodash';

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
  UPDATE_VIEW_DATA,
  FETCH_LOCATION_CONFIG_SUCCESS,
  FETCH_LOCATION_CONFIG_ERROR,
  RESET_VIEW,
} from '../actions/ViewActions';

export const viewState = {
  layout: {
    activeTab: null,
    // data: [],
    pending: false,
    error: null,
    notfound: false,
  },
  // rowData is an immutable Map with tabId's as keys, and Lists as values.
  // List's elements are plain objects for now
  rowData: Map(),
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
  mapConfig: null,
  notfound: false,
  pending: false,
  error: null,
  isActive: false,
};

const initialState = { views: {} };

const getView = (id, state) => {
  return get(state, ['views', id], viewState);
};

export default function viewHandler(state = initialState, action) {
  switch (action.type) {
    // LAYOUT
    case FETCH_LAYOUT_PENDING: {
      const { id } = action.payload;
      const view = getView(id, state);

      return {
        ...state,
        views: {
          ...state.views,
          [`${id}`]: {
            ...view,
            layout: {
              ...view.layout,
              notfound: false,
              pending: true,
            },
          },
        },
      };
    }
    case FETCH_LAYOUT_SUCCESS: {
      const { id, layout } = action.payload;
      const view = getView(id, state);

      console.log('WTF: ', )

      return {
        ...state,
        views: {
          ...state.views,
          [`${id}`]: {
            ...view,
            layout: {
              ...view.layout,
              ...layout,
              error: null,
              pending: false,
            },
          },
        },
      };
    }
    case FETCH_LAYOUT_ERROR: {
      const { id, error } = action.payload;
      const view = getView(id, state);

      return {
        ...state,
        views: {
          ...state.views,
          [`${id}`]: {
            ...view,
            layout: {
              ...view.layout,
              notfound: true,
              error: error,
              pending: false,
            },
          },
        },
      };
    }

    case FETCH_DOCUMENT_PENDING: {
      const { id } = action.payload;
      const view = getView(id, state);

      return {
        ...state,
        views: {
          ...state.views,
          [`${id}`]: {
            ...view,
            notfound: false,
            pending: true,
            error: null,
          },
        },
      };
    }
    case FETCH_DOCUMENT_SUCCESS: {
      // TODO: Maybe just use `_.omit` to remove `result` ?
      const {
        id,
        data: {
          firstRow,
          headerProperties,
          pageLength,
          result,
          size,
          type,
          viewId,
          windowId,
          orderBy,
          queryLimit,
          queryLimitHit,
        },
      } = action.payload;

      //WTF prettier?
      //eslint-disable-next-line
      const page = size > 1 ? (firstRow / pageLength) + 1 : 1;
      const view = getView(id, state);
      const viewState = {
        ...view,
        firstRow,
        headerProperties,
        pageLength,
        size,
        type,
        viewId,
        windowId,
        orderBy,
        page,
        queryLimit,
        queryLimitHit,
        rowData: Map({ [`${action.payload.tabId || 1}`]: result }),
        pending: false,
      };

      return {
        ...state,
        views: {
          ...state.views,
          [`${id}`]: { ...viewState },
        },
      };
    }
    case FETCH_DOCUMENT_ERROR: {
      const { id, error } = action.payload;
      const view = getView(id, state);

      return {
        ...state,
        views: {
          ...state.views,
          [`${id}`]: {
            ...view,
            pending: false,
            notfound: true,
            error,
          },
        },
      };
    }

    // VIEW OPERATIONS
    case CREATE_VIEW: {
      const { id } = action.payload;
      const view = getView(id, state);

      return {
        ...state,
        views: {
          ...state.views,
          [`${id}`]: {
            ...view,
            pending: true,
            error: null,
          },
        },
      };
    }
    case CREATE_VIEW_SUCCESS: {
      const { id, viewId } = action.payload;
      const view = getView(id, state);

      return {
        ...state,
        views: {
          ...state.views,
          [`${id}`]: {
            ...view,
            viewId,
            pending: false,
            notfound: false,
          },
        },
      };
    }
    case CREATE_VIEW_ERROR: {
      const { id, error } = action.payload;
      const view = getView(id, state);

      return {
        ...state,
        views: {
          ...state.views,
          [`${id}`]: {
            ...view,
            pending: false,
            notfound: true,
            error,
          },
        },
      };
    }
    case FILTER_VIEW:
      return {
        ...state,
        notfound: false,
        pending: true,
        error: null,
      };
    case FILTER_VIEW_SUCCESS: {
      const {
        id,
        data: { filters, viewId, size },
      } = action.payload;

      return {
        ...state,
        filters,
        viewId,
        size,
        // TODO: Should we always set it to 1 ?
        page: 1,
        pending: false,
      };
    }
    case FILTER_VIEW_ERROR:
      return {
        ...state,
        pending: false,
        notfound: true,
        error: action.error,
      };

    case UPDATE_VIEW_DATA: {
      const tabId = action.payload.tabId || 1;
      const updatedRowsData = state.rowData.set(tabId, action.payload.rows);

      return {
        ...state,
        rowData: updatedRowsData,
      };
    }

    case FETCH_LOCATION_CONFIG_SUCCESS: {
      const { payload } = action;

      if (payload.data.provider === 'GoogleMaps') {
        return {
          ...state,
          mapConfig: payload.data,
        };
      }

      return state;
    }
    case FETCH_LOCATION_CONFIG_ERROR:
      return {
        ...state,
        error: action.error,
      };

    case RESET_VIEW: {
      const id = action.payload.id;

      return {
        views: {
          ...state.views,
          [`${id}`]: { ...viewState },
        },
      };
    }
    default:
      return state;
  }
}
