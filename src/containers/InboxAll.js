import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import Container from '../components/Container';
import Inbox from '../components/inbox/Inbox';

const mapStateToProps = state => ({
  inbox: state.appHandler.inbox,
  processStatus: state.appHandler.processStatus,
  modal: state.windowHandler.modal,
  rawModal: state.windowHandler.rawModal,
  pluginModal: state.windowHandler.pluginModal,
  indicator: state.windowHandler.indicator,
  includedView: state.listHandler.includedView,
});

class InboxAll extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    inbox: PropTypes.object.isRequired,
    pluginModal: PropTypes.object,
  };

  render() {
    const {
      inbox,
      modal,
      rawModal,
      pluginModal,
      processStatus,
      indicator,
      includedView,
    } = this.props;

    return (
      <Container
        siteName="Inbox"
        modal={modal}
        rawModal={rawModal}
        pluginModal={pluginModal}
        processStatus={processStatus}
        indicator={indicator}
        includedView={includedView}
      >
        <Inbox all inbox={inbox} />
      </Container>
    );
  }
}

InboxAll.PropTypes = {
  modal: PropTypes.any,
  rawModal: PropTypes.any,
  processStatus: PropTypes.any,
  indicator: PropTypes.any,
  includedView: PropTypes.any,
};

export default connect(mapStateToProps)(InboxAll);
