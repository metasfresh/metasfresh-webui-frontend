import React, { Component } from 'react';
import PropTypes from 'prop-types';

class MultiSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: {
        text: '',
        placeholder: this.props.searchPlaceholder,
      },
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
        height: '180px',
        border: '0px',
        padding: '5px',
        overflow: 'auto',
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
      searchBox: {
        width: '100%',
        padding: '5 5 0 5',
      },
      searchInput: {
        width: '100%',
        padding: '5px',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '3px',
      },
      isSelectBoxVisible: false,
      data: this.props.options,
      filter: '',
      checkedItems: [],
      activeSearch: false,
    };
  }

  static getDerivedStateFromProps(nextProps, nextState) {
    if (!nextState.activeSearch) {
      return {
        data: nextProps.options,
      };
    }
    return null;
  }

  applyFilter = (e) => {
    const searchString = e.target.value;
    if (searchString) {
      const filteredData = this.state.data.filter(
        (item) => item.caption.indexOf(e.target.value) !== -1
      );
      this.setState({ activeSearch: true, data: filteredData });
    } else {
      this.setState({ activeSearch: false });
    }
  };

  componentDidMount() {
    this.props.onFocus();
  }

  headerboxClick = () => {
    this.props.onFocus();
    this.setState({ isSelectBoxVisible: !this.state.isSelectBoxVisible });
  };

  selectItem = (key, caption) => {
    const foundInCheckedItems = this.state.checkedItems.find(
      (item) => item.key === key
    );
    if (!foundInCheckedItems) {
      this.setState({
        checkedItems: [
          ...this.state.checkedItems,
          { key: key, caption: caption },
        ],
      });
    } else {
      // otherwise remove it from checked items
      let newCheckedItems = this.state.checkedItems.filter(
        (obj) => obj.key !== key
      );
      this.setState({
        checkedItems: newCheckedItems,
      });
    }
  };

  render() {
    const {
      search,
      searchBox,
      searchInput,
      isSelectBoxVisible,
      data,
    } = this.state;
    const { placeholder } = this.props;
    const dataSource = data.size > 0 ? data : this.props.options;

    const SearchInput = (
      <div style={searchBox}>
        <input
          style={searchInput}
          type="text"
          value={search.value}
          placeholder={search.placeholder}
          onKeyUp={this.applyFilter}
        />
      </div>
    );

    return (
      <div style={this.state.mainBoxStyle}>
        <div style={this.state.headerBox} onClick={this.headerboxClick}>
          <div style={this.state.placeholderBox}>{placeholder}</div>
          {!this.state.isSelectBoxVisible && (
            <div
              className="input-icon input-readonly float-right"
              style={this.state.customArrow}
            >
              <i className="meta-icon-down-1" />
            </div>
          )}
          {this.state.isSelectBoxVisible && (
            <div
              className="input-icon input-readonly float-right"
              style={this.state.customArrow}
            >
              <i className="meta-icon-close-1" />
            </div>
          )}
        </div>
        {isSelectBoxVisible && <div style={this.state.horizontalRule} />}

        {isSelectBoxVisible && SearchInput}

        {dataSource.length === 0 && isSelectBoxVisible && (
          <div className="p-3" style={this.state.selectBox}>
            {this.props.noDataTxt}
          </div>
        )}

        {isSelectBoxVisible && (
          <div style={this.state.selectBox}>
            <div className="btn-meta-default">
              <div className="float-left">Select All</div>
              <div className="float-right">
                <input type="checkbox" />
              </div>
              <div className="clearfix" />
            </div>

            {dataSource.map((item) => (
              <div
                key={item.caption}
                className="btn-meta-default"
                onClick={() => this.selectItem(item.key, item.caption)}
              >
                <div className="float-left">{item.caption}</div>
                <div className="float-right">
                  <input type="checkbox" />
                </div>
                <div className="clearfix" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

MultiSelect.propTypes = {
  options: PropTypes.object,
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  onFocus: PropTypes.func,
  noDataTxt: PropTypes.string,
};

MultiSelect.defaultProps = {
  placeholder: '',
  searchPlaceholder: 'Search ...',
  noDataTxt: 'No data available',
};

export default MultiSelect;
