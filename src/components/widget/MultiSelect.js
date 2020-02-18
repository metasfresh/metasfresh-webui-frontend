import React, { Component } from 'react';
import PropTypes from 'prop-types';

class MultiSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mainBoxStyle: {
        border: '1px solid #cccccc',
        width: '100%',
        minHeight: '30px',
        borderRadius: '3px',
      },
      placeholderBox: {
        color: 'lightgray',
        display: 'inline',
      },
      headerBox: {
        display: 'box',
        width: '100%',
        minHeight: '30px',
        marginTop: '5px',
      },
      selectBox: {
        display: 'box',
        width: '100%',
        minHeight: '30px',
        border: '0px',
        marginTop: '5px',
        padding: '5px',
      },
      horizontalRule: {
        marginTop: '1px',
        marginBottom: '1px',
        border: 0,
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
      },
      customArrow: {
        paddingRight: '10px',
      },
      isSelectBoxVisible: false,
    };
  }

  headerboxClick = () => {
    this.setState({ isSelectBoxVisible: !this.state.isSelectBoxVisible });
  };

  render() {
    const placeholder = this.props.placeholder ? this.props.placeholder : '';
    return (
      <div style={this.state.mainBoxStyle}>
        <div style={this.state.headerBox} onClick={this.headerboxClick}>
          <div style={this.state.placeholderBox}>{placeholder}</div>
          {!this.state.isSelectBoxVisible && (<div
            className="input-icon input-readonly float-right"
            style={this.state.customArrow}
          >
            <i className="meta-icon-down-1" />
          </div>)}
          {this.state.isSelectBoxVisible && (<div
            className="input-icon input-readonly float-right"
            style={this.state.customArrow}
          >
            <i className="meta-icon-close-1" />
          </div>)}
        </div>
        {this.state.isSelectBoxVisible && <div style={this.state.horizontalRule} />}
        {this.state.isSelectBoxVisible && <div style={this.state.selectBox} />}
      </div>
    );
  }
}

MultiSelect.propTypes = {
  placeholder: PropTypes.string,
};

export default MultiSelect;
