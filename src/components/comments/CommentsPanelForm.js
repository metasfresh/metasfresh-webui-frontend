import React, { useEffect, useRef } from 'react';
import counterpart from 'counterpart';
import { callAPI } from '../../actions/WindowActions';
import { updateCommentsPanelTextInput } from '../../actions/CommentsPanelActions';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';

const CommentsPanelForm = (props) => {
  const { textInput, postComment, updateText, docId, windowId } = props;
  const textRef = useRef(null);
  const btnTranslated = counterpart.translate('comments.send.caption');
  // show a default placeholder in case translation is missing such that the BE would know what specific key they need to add
  const sendButton = !btnTranslated.includes('{')
    ? btnTranslated
    : '{comments.send.caption}';

  /**
   * Focus by default on the text input
   */
  useEffect(() => {
    textRef.current.focus();
  }, []);

  return (
    <div className="col-lg-12">
      <div className="row">
        <div className="panel panel-spaced panel-distance panel-bordered panel-primary">
          <div className="col-lg-10 col-md-10 col-sm-10 float-left">
            <textarea
              ref={textRef}
              onKeyPress={(e) => updateText(e.target.value)}
              onChange={(e) => updateText(e.target.value)}
              className="form-control"
              value={textInput}
            />
          </div>
          <div className="col-lg-2 col-md-2 col-sm-2 float-right">
            <button
              className="btn btn-sm btn-block btn-meta-success"
              onClick={() => {
                !textInput && textRef.current.focus();
                textInput &&
                  postComment({
                    windowId,
                    docId,
                    tabId: null,
                    rowId: null,
                    target: 'comments',
                    verb: 'POST',
                    data: textInput,
                  });
              }}
              tabIndex={0}
            >
              {sendButton}
            </button>
          </div>
          <div className="clearfix" />
        </div>
      </div>
    </div>
  );
};

CommentsPanelForm.propTypes = {
  textInput: PropTypes.string,
  updateText: PropTypes.func,
  postComment: PropTypes.func,
  dispatch: PropTypes.func,
  docId: PropTypes.string,
  windowId: PropTypes.string,
};

const mapStateToProps = ({ commentsPanel }) => ({
  textInput: commentsPanel.textInput,
});

const mapDispatchToProps = (dispatch) => {
  return {
    updateText: (data) => dispatch(updateCommentsPanelTextInput(data)),
    postComment: (data) => dispatch(callAPI(data)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CommentsPanelForm);
