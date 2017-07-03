import React, { Component } from 'react';

import Datetime from 'react-datetime';

class DatePicker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            cache: null
        }
    }

    componentDidMount() {
        this.props.handleBackdropLock &&
        this.props.handleBackdropLock(true);
    }

    handleBlur = date => {
        if (
            JSON.stringify(this.state.cache) !== (
              date !== ''
              ? JSON.stringify(date && date.toDate())
              : ''
            )
        ) {
            this.props.patch(date)
        }

        this.handleClose()

        this.props.handleBackdropLock &&
        this.props.handleBackdropLock(false)
    }

    handleFocus = () => {
        this.setState(
            () => ({
                cache: this.props.value,
                open: true
            })
        )
    }

    handleClose = () => {
        this.setState(
            () => ({
                open: false
            })
        )
    }

    renderDay = (props, currentDate) => {
        return (
            <td
                {...props}
                onDoubleClick={this.handleClose}
            >
                {currentDate.date()}
            </td>
        );
    }

    render() {
        return (<Datetime
            closeOnTab={true}
            renderDay={this.renderDay}
            onBlur={this.handleBlur}
            onFocus={this.handleFocus}
            {...this.props}
        />)
    }
}

export default DatePicker
