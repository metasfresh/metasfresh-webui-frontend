import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import onClickOutside from 'react-onclickoutside';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class LookupList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            listElementHeight: 0,
            listVisibleElements: 0,
            shouldListScrollUpdate: false
        }
    }

    componentDidMount(){
        // needed for calculating scroll position
        const listElementHeight = 30

        const listVisibleElements =
            Math.floor(this.listScrollWrap.clientHeight / listElementHeight)

        const shouldListScrollUpdate =
            listVisibleElements > this.items.childNodes.length

        this.setState(
            () => ({
                listElementHeight,
                listVisibleElements,
                shouldListScrollUpdate
            })
        )
    }

    componentWillReceiveProps = nextProps => {
        const {
            shouldListScrollUpdate, listElementHeight, listVisibleElements
        } = this.state;

        // no need for updating scroll
        if (
            !shouldListScrollUpdate ||
            typeof nextProps.selected !== 'number' ||
            nextProps.selected === this.props.selected
        ){
            return;
        }

        const visibleMin = this.listScrollWrap.scrollTop;
        const visibleMax = this.listScrollWrap.scrollTop +
            listVisibleElements * listElementHeight;

        //not visible from down
        if ((nextProps.selected + 1) * listElementHeight > visibleMax){
            this.listScrollWrap.scrollTop = listElementHeight *
                (nextProps.selected - listVisibleElements)
        }

        //not visible from above
        if (nextProps.selected * listElementHeight < visibleMin){
            this.listScrollWrap.scrollTop =
                nextProps.selected * listElementHeight
        }
    }

    getDropdownComponent = (index, item) => {
        const name = item[Object.keys(item)[0]];
        const key = Object.keys(item)[0];

        return (
            <div
                key={key}
                className={
                    'input-dropdown-list-option ' +
                    (this.props.selected === index ?
                        'input-dropdown-list-option-key-on' : '') }
                onClick={() => {this.props.handleSelect(item)}}
            >
                <p className="input-dropdown-item-title">{name}</p>
            </div>
        )
    }

    handleClickOutside = () => {
        const {onClickOutside} = this.props;
        onClickOutside();
    }

    renderNew = () => {
        return (
            <div className={
                'input-dropdown-list-option input-dropdown-list-option-alt '  +
                (
                    this.props.selected === 'new'
                    ? 'input-dropdown-list-option-key-on'
                    : ''
                )
            }
                onClick={this.props.handleAddNew}
            >
                <p>{this.props.newRecordCaption}</p>
            </div>
        )
    }

    renderEmpty = () => (
        <div className="input-dropdown-list-header">
            <div className="input-dropdown-list-header">
                No results found
            </div>
        </div>
    )

    renderLoader = () => {
        return (
            <div className="input-dropdown-list-header">
                <div className="input-dropdown-list-header">
                    <ReactCSSTransitionGroup
                        transitionName="rotate"
                        transitionEnterTimeout={1000}
                        transitionLeaveTimeout={1000}
                    >
                        <div className="rotate icon-rotate">
                            <i className="meta-icon-settings"/>
                        </div>
                    </ReactCSSTransitionGroup>
                </div>
            </div>
        )
    }

    getListScrollWrapRef = listScrollWrap => {
        this.listScrollWrap = listScrollWrap
    }

    getItemsDivRef = div => {
        this.items = div
    }

    render() {
        const {
            loading, list, creatingNewDisabled, newRecordCaption
        } = this.props;

        return (
            <div
                className="input-dropdown-list"
                ref={this.getListScrollWrapRef}
            >
                {(loading && list.length === 0) && this.renderLoader()}
                {(!loading && list.length === 0) && this.renderEmpty()}
                <div
                    ref={this.getItemsDivRef}
                >
                    {list.map((item, index) =>
                        this.getDropdownComponent(index, item))
                    }
                    {list.length === 0 && newRecordCaption &&
                        !creatingNewDisabled && this.renderNew()
                    }
                </div>
            </div>
        )

    }
}

LookupList.propTypes = {
    dispatch: PropTypes.func.isRequired
}

LookupList = connect()(onClickOutside(LookupList))

export default LookupList
