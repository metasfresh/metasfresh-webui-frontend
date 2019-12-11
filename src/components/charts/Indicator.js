import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Loader from '../app/Loader';

export default class Indicator extends PureComponent {
  render() {
    const {
      value,
      caption,
      loader,
      fullWidth,
      editmode,
      framework,
    } = this.props;

    if (loader)
      return (
        <div className="indicator">
          <Loader />
        </div>
      );

    return (
      <div
        className={
          'indicator js-indicator ' +
          (editmode || framework ? 'indicator-draggable ' : '')
        }
        style={fullWidth ? { width: '100%' } : {}}
      >
        <div className="indicator-value">{value}</div>
        <div className="indicator-kpi-caption">{caption}</div>
      </div>
    );
  }
}

Indicator.propTypes = {
  value: PropTypes.any,
  caption: PropTypes.string,
  loader: PropTypes.any,
  fullWidth: PropTypes.bool,
  editmode: PropTypes.bool,
  framework: PropTypes.any,
};
