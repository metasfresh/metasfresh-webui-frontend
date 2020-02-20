import React, { Component } from 'react';
import PropTypes from 'prop-types';

class MultiSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.options,
      filter: '',
      checkedItems: {},
    };
  }

  componentDidMount() {
    this.props.onFocus();
  }

  selectItem = (key, caption) => {
    let newCheckedItems = JSON.parse(JSON.stringify(this.state.checkedItems));
    if (typeof this.state.checkedItems[key] === 'undefined') {
      newCheckedItems[key] = { key: key, caption: caption, value: true };
    } else {
      newCheckedItems[key].value = !this.state.checkedItems[key].value;
    }
    this.setState({ checkedItems: newCheckedItems });
  };

  haveChecked = () => {
    let resultCheck = false;
    Object.keys(this.state.checkedItems).map((item) => {
      if (this.state.checkedItems[item].value) resultCheck = true;
      return item;
    });
    return resultCheck;
  };

  render() {
    const { data } = this.state;
    const dataSource = data.size > 0 ? data : this.props.options;

    return (
      <div className="filter-multiselect">
        <div>
          {dataSource.map((item) => (
            <div className="form-group" key={item.key}>
              <div key={item.key} className="row">
                <div className=" col-sm-6 float-left">
                  <label className="form-control-label" title={item.caption}>
                    {item.caption}
                  </label>
                </div>

                <div className="col-sm-6 float-right">
                  <label className="input-checkbox">
                    <input
                      type="checkbox"
                      onChange={() => this.selectItem(item.key, item.caption)}
                    />
                    <span className="input-checkbox-tick" />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

MultiSelect.propTypes = {
  options: PropTypes.object,
  onFocus: PropTypes.func,
};

export default MultiSelect;
