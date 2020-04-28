import React from 'react';
import { translateCaption } from '../../utils/index';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { DATE_FIELD_FORMATS } from '../../constants/Constants';

const CommentsPanelListingItem = (props) => {
  const { createdBy, text, created } = props.data;

  const elementRender = ({ labelText, actualValue }) => (
    <div className="elements-line">
      <div className="form-group row  form-field-Value">
        <div className="form-control-label col-sm-3">{labelText}</div>
        <div className="col-sm-9 ">
          <div className="input-body-container">
            <span />
            <div className="input-block input-icon-container input-disabled input-secondary pulse-off">
              <input
                className="input-field js-input-field"
                disabled
                tabIndex="-1"
                type="text"
                value={actualValue}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  elementRender.propTypes = {
    labelText: PropTypes.string,
    actualValue: PropTypes.string,
  };

  return (
    <div className="col-12">
      <div className="panel panel-spaced panel-distance panel-bordered panel-primary">
        {elementRender({
          labelText: translateCaption('view.comments.created'),
          actualValue: Moment(created).format(DATE_FIELD_FORMATS['DateTime']),
        })}
        {elementRender({
          labelText: translateCaption('view.comments.createdBy'),
          actualValue: createdBy,
        })}
        {elementRender({
          labelText: '',
          actualValue: text,
        })}
      </div>
    </div>
  );
};

CommentsPanelListingItem.propTypes = {
  data: PropTypes.object,
};

export default CommentsPanelListingItem;
