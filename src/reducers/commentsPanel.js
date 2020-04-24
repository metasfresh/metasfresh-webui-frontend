import * as types from '../constants/CommentTypes';

export const initialState = {
  data: [],
};

export default function commentsPanel(state = initialState, action) {
  switch (action.type) {
    case types.UPDATE_COMMENTS_PANEL: {
      return { ...state, data: action.payload };
    }

    default: {
      return state;
    }
  }
}
