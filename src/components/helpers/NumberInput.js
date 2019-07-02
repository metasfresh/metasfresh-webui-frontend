import React, { Component } from 'react';
import PropTypes from 'prop-types';

const FLOAT_NUMBER_REGEX_FORMAT = /^[0-9]+[.,]*[0-9]*$/;

// Helper component to be used for widget with type 'CostPrice' where input needs to be text.
// Because we want that text to contain only numbers, comma and dot, we use regex for checking that
// Using input with type='number' will not work because of:
// https://stackoverflow.com/questions/35315157/html5-input-box-with-type-number-does-not-accept-comma-in-chrome-browser
export class NumberInput extends Component {
  state = {
    inputValue: '',
  };

  static getDerivedStateFromProps(props, state) {
    if (props.inputProps.value && !state.inputValue) {
      return {
        inputValue: props.inputProps.value,
      };
    }
    return null;
  }

  handleChange = e => {
    const newValue = e.target.value;
    if (FLOAT_NUMBER_REGEX_FORMAT.test(newValue) || !newValue) {
      this.setState({
        inputValue: e.target.value,
      });
    }
  };

  render() {
    const { inputProps } = this.props;
    const { inputValue } = this.state;
    return (
      <input
        type="text"
        {...inputProps}
        value={inputValue}
        onChange={this.handleChange}
      />
    );
  }
}

NumberInput.propTypes = {
  inputProps: PropTypes.shape({
    value: PropTypes.string,
  }),
};
