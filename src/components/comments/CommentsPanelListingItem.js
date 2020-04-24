import React from 'react';
import counterpart from 'counterpart';
import PropTypes from 'prop-types';

const CommentsPanelListingItem = (props) => {
  const { createdBy, text, created } = props.data;
  return (
    <div className="col-lg-12">
      <div className="row">
        <div className="panel panel-spaced panel-distance panel-bordered panel-primary">
          <div className="col-lg-1 float-left">&nbsp;</div>
          <div className="col-lg-11 float-right">{text}</div>
          <div className="clearfix" />

          <div className="col-lg-1 float-left">
            {counterpart.translate('view.about.created')}
          </div>
          <div className="col-lg-11 float-right">{created}</div>
          <div className="clearfix" />
          <div className="col-lg-1 float-left">
            {counterpart.translate('view.about.createdBy')}
          </div>
          <div className="col-lg-11 float-right">{createdBy}</div>
        </div>
      </div>
    </div>
  );
};

CommentsPanelListingItem.propTypes = {
  data: PropTypes.object,
};

export default CommentsPanelListingItem;
