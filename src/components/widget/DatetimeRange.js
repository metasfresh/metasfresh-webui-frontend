import React, { Component } from 'react';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import Moment from 'moment';

const ranges = {
    'Today': [Moment(), Moment()],
    'Yesterday': [
        Moment().subtract(1, 'days'), Moment().subtract(1, 'days')
    ],
    'Last 7 Days': [Moment().subtract(6, 'days'), Moment()],
    'Last 30 Days': [Moment().subtract(29, 'days'), Moment()],
    'This Month': [Moment().startOf('month'), Moment().endOf('month')],
    'Last Month': [
        Moment().subtract(1, 'month').startOf('month'),
        Moment().subtract(1, 'month').endOf('month')
    ]
}

class DatetimeRange extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: null,
            endDate: null
        };
    }

    componentDidMount() {
        if (this.props.value && this.props.valueTo) {
            this.setState(
                () => ({
                    startDate: Moment(this.props.value),
                    endDate: Moment(this.props.valueTo)
                })
            )
        } else {
            const initDate = new Date();
            this.setState(
                () => ({
                    startDate: initDate,
                    endDate: initDate
                }),
                () => {
                    this.props.onChange(initDate, initDate)
                }
            )
        }
    }

    handleEvent = (event, picker) => {
        this.setState(
            () => ({
                startDate: picker.startDate,
                endDate: picker.endDate
            }),
            () => {
                this.props.onChange(picker.startDate, picker.endDate);
            }
        )
    }

    render() {
        const {startDate, endDate} = this.state;

        const {
            onShow, onHide, mandatory, validStatus, timePicker
        } = this.props;

        const format = timePicker ? 'L LT' : 'L';

        return (
            <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                ranges={ranges}
                alwaysShowCalendars={true}
                onApply={this.handleEvent}
                onShow={onShow}
                onHide={onHide}
                locale={{
                    'firstDay': 1,
                    'monthNames': Moment.months()
                }}
                autoApply={false}
                timePicker={timePicker}
                timePicker24Hour={true}
            >
                <button className={
                    'btn btn-block text-xs-left btn-meta-outline-secondary ' +
                    'btn-distance btn-sm input-icon-container input-primary ' +
                    ((mandatory && !startDate && !endDate) ?
                        'input-mandatory ' : '') +
                    ((validStatus && !validStatus.valid) ?
                        'input-error ' : '')
                }>
                    {!!startDate && !!endDate ?
                        ' ' + Moment(startDate).format(format) +
                        ' - ' + Moment(endDate).format(format) :
                        ' All dates available'
                    }
                    <i className="meta-icon-calendar input-icon-right"/>
                </button>

            </DateRangePicker>
        )
    }
}

export default DatetimeRange
