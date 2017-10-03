import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import update from 'immutability-helper';
import {push} from 'react-router-redux';

import {
    getData, patchRequest, deleteRequest, getRequest
} from '../actions/GenericActions';
import {
    getElementBreadcrumb
} from '../actions/MenuActions';
import {connectWS, disconnectWS} from '../actions/WindowActions';
import {addCard} from '../actions/BoardActions';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Container from '../components/Container';
import BlankPage from '../components/BlankPage';
import Lanes from '../components/board/Lanes';
import Sidenav from '../components/board/Sidenav';

class PluginHost extends Component {
    constructor(props){
        super(props);
    }

    componentDidMount = () => {
        const hostApp = this.getHostApp();
        const { pluginName } = this.props;

        if (
            hostApp && hostApp.pluginsRegistry &&
            pluginName && this.container
        ) {
            hostApp.pluginsRegistry.mount(pluginName, this.container);
        }
    }

    componentWillUnmount = () => {
        const hostApp = this.getHostApp();
        const { pluginName } = this.props;

        if (
            hostApp && hostApp.pluginsRegistry &&
            pluginName && this.container
        ) {
            hostApp.pluginsRegistry.unmount(pluginName, this.container);
        }
    }

    getHostApp() {
        return window.META_HOST_APP;
    }

    render() {
        const {
            rawModal, modal, pluginName
        } = this.props;

        return (
            <Container
                {...{modal, rawModal}}
            >
                <div
                    className={`plugin-host plugin-host-${pluginName}`}
                    ref={ (c) => this.container = c }
                >
                </div>
            </Container>
        );
    }
}

function mapStateToProps(state) {
    const { windowHandler } = state;

    const {
        modal,
        rawModal
    } = windowHandler || {
        modal: {},
        rawModal: {}
    }

    return {
        modal, rawModal
    }
}

PluginHost = connect(mapStateToProps)(PluginHost);

export default PluginHost;
