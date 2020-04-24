import { UPDATE_COMMENTS_PANEL } from '../constants/CommentTypes';

export function updateCommentsPanel(data) {
  return {
    type: UPDATE_COMMENTS_PANEL,
    payload: data,
  };
}
