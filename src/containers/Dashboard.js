import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Container from '../components/Container';
import DraggableWrapper from '../components/dashboard/DraggableWrapper';

import { Hints } from 'intro.js-react';
import { introHints } from '../components/intro/intro';

export class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editmode: false,
            hintsEnabled: null,
            introHints: null
        };
    }

    componentDidUpdate() {
        // TODO: Resolve this hotfix
        /* eslint-disable no-unreachable */
        return;

        const { me } = this.props;

        if (me) {
            let docIntroHints;

            if (Array.isArray(introHints['default'])) {
                docIntroHints = introHints['default'];
            }

            this.setState({
                hintsEnabled: docIntroHints && docIntroHints.length > 0,
                introHints: docIntroHints
            });
        }
        /* eslint-enable no-unreachable */
    }

    toggleEditMode = () =>
        this.setState(prev => ({ editmode: !prev.editmode }));

    render() {
        const {
            location,
            modal,
            selected,
            rawModal,
            indicator,
            processStatus,
            includedView,
            enableTutorial
        } = this.props;

        const { editmode, hintsEnabled, introHints } = this.state;

        return (
            <Container
                siteName="Dashboard"
                noMargin={true}
                handleEditModeToggle={this.toggleEditMode}
                {...{
                    modal,
                    rawModal,
                    selected,
                    indicator,
                    processStatus,
                    includedView,
                    editmode
                }}
            >
                <div className="container-fluid dashboard-wrapper">
                    <DraggableWrapper
                        {...{ editmode }}
                        toggleEditMode={this.toggleEditMode}
                        dashboard={location.pathname}
                    />
                </div>

                {enableTutorial &&
                    introHints &&
                    introHints.length > 0 && (
                        <Hints enabled={hintsEnabled} hints={introHints} />
                    )}
            </Container>
        );
    }
}

Dashboard.propTypes = {
    dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    const { windowHandler, listHandler, appHandler } = state;

    const { modal, rawModal, selected, indicator } = windowHandler || {
        modal: false,
        rawModal: false,
        selected: [],
        indicator: ''
    };

    const { includedView } = listHandler || {
        includedView: {}
    };

    const { enableTutorial, processStatus, me } = appHandler || {
        enableTutorial: false,
        processStatus: '',
        me: {}
    };

    return {
        modal,
        selected,
        indicator,
        rawModal,
        processStatus,
        includedView,
        enableTutorial,
        me
    };
}

export default connect(mapStateToProps)(Dashboard);
