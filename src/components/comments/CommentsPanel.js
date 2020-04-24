import React from 'react';
import CommentsPanelListing from './CommentsPanelListing';
import CommentsPanelForm from './CommentsPanelForm';

const CommentsPanel = () => {
  return (
    <div className="panel-full-width">
      <CommentsPanelListing />
      <CommentsPanelForm />
    </div>
  );
};

export default CommentsPanel;
