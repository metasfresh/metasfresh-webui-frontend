import React, { Component } from 'react';
import SockJs from 'sockjs-client';
import Stomp from 'stompjs/lib/stomp.min.js';

class Device extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: null,
            valueChangeStopper: false
        }
    }

    componentDidMount() {
        const {device} = this.props;
        this.mounted = true;
        this.sock = new SockJs(config.WS_URL);
        this.sockClient = Stomp.Stomp.over(this.sock);

        this.sockClient.debug = null;
        this.sockClient.connect({}, () => {
            this.sockClient.subscribe(device.websocketEndpoint, msg => {
                if(!this.state.valueChangeStopper){
                    const body = JSON.parse(msg.body);

                    this.mounted &&
                    this.setState(
                        () => ({
                            value: body.value
                        })
                    )
                }
            });
        });
    }

    componentWillUnmount() {
        this.mounted = false;
        (this.sockClient && this.sockClient.connected) &&
            this.sockClient.disconnect();
    }

    handleClick = () => {
        this.props.handleChange(this.state.value);
    }

    handleToggleChangeStopperTrue = () => {
        this.setState(
            () => ({
                valueChangeStopper: true
            })
        )
    }

    handleToggleChangeStopperFalse = () => {
        this.setState(
            () => ({
                valueChangeStopper: false
            })
        )
    }

    handleKey = e => {
        switch(e.key){
            case 'Enter':
                this.props.handleChange(this.state.value)

                break
        }
    }

    onKeyDown = e => {
        this.handleKey(e)
    }

    render() {
        if(this.state.value){
            return (
                <div
                    className={
                        'btn btn-device btn-meta-outline-secondary btn-sm ' +
                        'btn-inline pointer btn-distance-rev ' +
                        (this.state.isMore ? 'btn-flagged ': '')
                    }
                    onClick={this.handleClick}
                    tabIndex={this.props.tabIndex ? this.props.tabIndex : ''}
                    onMouseEnter={this.handleToggleChangeStopperTrue}
                    onFocus={this.handleToggleChangeStopperTrue}
                    onMouseLeave={this.handleToggleChangeStopperFalse}
                    onBlur={this.handleToggleChangeStopperFalse}
                    onKeyDown={this.onKeyDown}
                >
                    {
                        this.state.isMore &&
                        <span className="btn-flag">{this.state.index + 1}</span>
                    }
                    {this.state.value}
                </div>
            )
        }else{
            return false;
        }
    }
}

export default Device;
