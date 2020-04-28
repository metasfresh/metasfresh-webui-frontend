import React from 'react';
import counterpart from 'counterpart';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { DATE_FORMAT, TIME_FORMAT } from '../../constants/Constants';

const CommentsPanelListingItem = (props) => {
  const { createdBy, text, created } = props.data;
  return (
    <div className="col-lg-12">
      <div className="row">
        <div className="panel panel-spaced panel-distance panel-bordered panel-primary">
          <div className="col-lg-1 col-md-4 col-sm-6 float-left">&nbsp;</div>
          <div className="col-lg-11 col-md-8 col-sm-6 float-right">{text}</div>
          <div className="clearfix" />

          <div className="col-lg-1 col-md-4 col-sm-6 float-left">
            {counterpart.translate('view.about.created')}
          </div>
          <div className="col-lg-11 col-md-8 col-sm-6 float-right">
            {Moment(created).format(`${DATE_FORMAT} ${TIME_FORMAT}`)}
          </div>
          <div className="clearfix" />
          <div className="col-lg-1 col-md-4 col-sm-6 float-left">
            {counterpart.translate('view.about.createdBy')}
          </div>
          <div className="col-lg-11 col-md-8 col-sm-6 float-right">
            {createdBy}
          </div>
        </div>
      </div>
    </div>
  );
};

CommentsPanelListingItem.propTypes = {
  data: PropTypes.object,
};

export default CommentsPanelListingItem;
