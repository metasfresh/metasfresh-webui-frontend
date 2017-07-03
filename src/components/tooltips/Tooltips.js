import React, { Component } from 'react';

class Tooltips extends Component {
    constructor(props) {
        super(props);

        this.state = {
            opacity: 0
        }
    }

    componentDidMount() {
        this.timeout = setTimeout(
            () => {
                this.setState(
                    () => ({
                        opacity: 1
                    })
                )
            },
            this.props.delay
            ? this.props.delay
            : 1000
        )
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    render() {
        const {
            name, action, type, extraClass,
            tooltipOnFirstlevelPositionLeft
        } = this.props

        return (
            <div style={{opacity: this.state.opacity}}>
                <div
                    className={
                        'tooltip-wrapp ' +
                        (type? 'tooltip-' + type:'') +
                        ' ' + (extraClass? extraClass:'')
                    }
                    style={{left:tooltipOnFirstlevelPositionLeft+'px'}}
                >
                    <div className="tooltip-shortcut">{name}</div>
                    <div className="tooltip-name">{action}</div>
                </div>
            </div>

        )
    }
}

export default Tooltips
