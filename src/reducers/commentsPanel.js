import * as types from '../constants/CommentTypes';

export const initialState = {
  data: [],
  textInput: '',
};

export default function commentsPanel(state = initialState, action) {
  switch (action.type) {
    case types.UPDATE_COMMENTS_PANEL: {
      return { ...state, data: action.payload };
    }

    case types.UPDATE_COMMENTS_PANEL_TEXT_INPUT: {
      return { ...state, textInput: action.payload };
    }

    default: {
      return state;
    }
  }
}
