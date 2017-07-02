import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {
    deleteNotification
} from '../../actions/AppActions';

class Notification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isClosing: false,
            isDisplayedMore: false
        }

        this.closing = null;
    }

    componentDidMount() {
        const {item} = this.props;

        if(item.time > 0) {
            this.setClosing();
        }

        const th = this;
        setTimeout(() => {
            th.setState({
                isClosing: true
            })
        }, 10);
    }

    componentWillUpdate(nextProps) {
        const {item} = this.props;

        if(item.count !== nextProps.item.count) {
            this.doesNotClosing()

            const th = this;

            setTimeout(() => {
                th.doesClosing();
            }, 10)
        }
    }

    setClosing = () => {
        const {dispatch, item} = this.props;
        this.closing = setTimeout(() => {
            dispatch(deleteNotification(item.title));
        }, item.time);
    }

    handleCloseButton = () => {
        this.closing &&
        clearInterval(this.closing)

        this.props.dispatch(deleteNotification(this.props.item.title));
    }

    doesClosing = () => {
        this.setClosing()

        this.setState(
            () => ({
                isClosing: true
            })
        )
    }

    doesNotClosing = () => {
        clearInterval(this.closing)

        this.setState(
            () => ({
                isClosing: false
            })
        )
    }

    handleToggleMore = () => {
        this.setState(
            () => ({
                isDisplayedMore: true
            })
        )
    }

    render() {
        return (
            <div
                className={
                    'notification-item ' +
                    (
                        this.props.item.notifType
                        ? this.props.item.notifType + ' '
                        : 'error '
                    )
                }
                onMouseEnter={this.doesNotClosing}
                onMouseLeave={this.doesClosing}
            >
                <div className="notification-header">
                    {this.props.item.title} {this.props.item.count ?
                        <span
                            className={
                                'tag tag-sm tag-default ' +
                                ('tag-' + (
                                    this.props.item.notifType
                                    ? this.props.item.notifType
                                    : 'error '
                                ))
                            }>{this.props.item.count}</span> : ''}
                    <i
                        onClick={this.handleCloseButton}
                        className="meta-icon-close-1"
                    />
                </div>
                <div className="notification-content">
                    {
                        this.props.item.shortMsg
                        ? this.props.item.shortMsg + ' '
                        : this.props.item.msg
                    }
                    {
                        (
                            this.props.item.shortMsg &&
                            this.props.item.msg &&
                            !this.state.isDisplayedMore
                        ) && (
                            <u
                                className="text-xs-right text-small pointer"
                                onClick={this.handleToggleMore}
                            >(read more)</u>
                        )
                    }
                    {
                        this.state.isDisplayedMore
                        ? <p>{this.props.item.msg}</p>
                        : ''
                    }
                </div>
                <div
                    className={
                        'progress-bar ' +
                        this.props.item.notifType
                        ? this.props.item.notifType
                        : 'error '
                    }
                    style={
                        this.state.isClosing
                        ? {
                            width: 0,
                            transition: 'width 5s linear'
                        }
                        : {
                            width: '100%',
                            transition: 'width 0s linear'
                        }
                    }
                />
            </div>
        )
    }
}

Notification.propTypes = {
    dispatch: PropTypes.func.isRequired
};

Notification = connect()(Notification)

export default Notification
