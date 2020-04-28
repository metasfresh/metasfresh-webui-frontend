import {
  UPDATE_COMMENTS_PANEL,
  UPDATE_COMMENTS_PANEL_TEXT_INPUT,
} from '../constants/CommentTypes';

export function updateCommentsPanel(data) {
  return {
    type: UPDATE_COMMENTS_PANEL,
    payload: data,
  };
}

export function updateCommentsPanelTextInput(data) {
  return {
    type: UPDATE_COMMENTS_PANEL_TEXT_INPUT,
    payload: data,
  };
}
