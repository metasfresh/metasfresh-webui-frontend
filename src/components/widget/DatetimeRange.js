import Moment from 'moment';
import React, { Component } from 'react';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import counterpart from 'counterpart';
import classnames from 'classnames';

class DatetimeRange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: undefined,
      endDate: undefined,
    };
  }

  componentDidMount() {
    const { value, valueTo } = this.props;
    if (value && valueTo) {
      this.setState({
        startDate: Moment(value),
        endDate: Moment(valueTo),
      });
    }
  }

  handleApply = (event, picker) => {
    const { onChange } = this.props;

    this.setState(
      {
        startDate: picker.startDate,
        endDate: picker.endDate,
      },
      () => {
        onChange(picker.startDate, picker.endDate);
      }
    );
  };

  render() {
    const today = counterpart.translate('window.daterange.today');
    const yesterday = counterpart.translate('window.daterange.yesterday');
    const last7days = counterpart.translate('window.daterange.last7days');
    const last30days = counterpart.translate('window.daterange.last30days');
    const thisMonth = counterpart.translate('window.daterange.thismonth');
    const lastMonth = counterpart.translate('window.daterange.lastmonth');
    const ranges = {
      [today]: [Moment(), Moment()],
      [yesterday]: [Moment().subtract(1, 'days'), Moment().subtract(1, 'days')],
      [last7days]: [Moment().subtract(6, 'days'), Moment()],
      [last30days]: [Moment().subtract(29, 'days'), Moment()],
      [thisMonth]: [Moment().startOf('month'), Moment().endOf('month')],
      [lastMonth]: [
        Moment()
          .subtract(1, 'month')
          .startOf('month'),
        Moment()
          .subtract(1, 'month')
          .endOf('month'),
      ],
    };
    const { startDate, endDate } = this.state;
    const { onShow, onHide, mandatory, validStatus, timePicker } = this.props;
    const fmt = timePicker ? 'L LT' : 'L';

    const availableDates =
      !!startDate && !!endDate
        ? ` ${Moment(startDate).format(fmt)} - ${Moment(endDate).format(fmt)}`
        : counterpart.translate('window.daterange.filter.hint');

    return (
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        ranges={ranges}
        alwaysShowCalendars={true}
        onApply={this.handleApply}
        onShow={onShow}
        onHide={onHide}
        locale={{
          firstDay: 1,
          monthNames: Moment.months(),
          applyLabel: counterpart.translate('window.daterange.apply'),
          cancelLabel: counterpart.translate('window.daterange.cancel'),
          customRangeLabel: counterpart.translate('window.daterange.custom'),
        }}
        autoApply={false}
        timePicker={timePicker}
        timePicker24Hour={true}
      >
        <button
          className={classnames(
            'btn',
            'btn-block',
            'text-xs-left',
            'btn-meta-outline-secondary',
            'btn-distance',
            'btn-sm input-icon-container',
            'input-primary',
            {
              'input-mandatory': mandatory && !startDate && !endDate,
              'input-error': validStatus && !validStatus.valid,
            }
          )}
        >
          {availableDates}
          <i className="meta-icon-calendar input-icon-right" />
        </button>
      </DateRangePicker>
    );
  }
}

export default DatetimeRange;
