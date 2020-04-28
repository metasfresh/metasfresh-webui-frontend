import React from 'react';
import CommentsPanelListing from './CommentsPanelListing';
import CommentsPanelForm from './CommentsPanelForm';

const CommentsPanel = (props) => {
  return (
    <div className="panel-full-width">
      <CommentsPanelForm {...props} />
      <CommentsPanelListing />
    </div>
  );
};

export default CommentsPanel;
