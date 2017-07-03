import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    dropdownRequest
} from '../../actions/GenericActions';

import DocumentStatusContextShortcuts
    from '../shortcuts/DocumentStatusContextShortcuts';

class ActionButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: {
                values: []
            },
            selected: 0
        }
    }

    componentDidMount(){
        this.fetchStatusList();
    }

    handleKeyDown = (e) => {
        const {list, selected} = this.state;
        switch(e.key){
            case 'ArrowDown':
                e.preventDefault();
                this.navigate(true);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigate();
                break;
            case 'Enter':
                e.preventDefault();
                if(selected != null){
                    this.handleChangeStatus(list.values[selected]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.handleDropdownBlur();
                break;
        }
    }

    navigate = up => {
        const next = up
            ? this.state.selected + 1
            : this.state.selected - 1

        this.setState(
            state => ({
                selected: (next >= 0 && next <= state.list.values.length)
                    ? next
                    : state.selected
            })
        )
    }

    handleDropdownBlur = () => {
        if(this.statusDropdown) {
            this.statusDropdown.classList.remove('dropdown-status-open');
        }

    }

    handleDropdownFocus = () => {
        this.fetchStatusList()

        this.props.dropdownOpenCallback()

        this.statusDropdown.classList.add('dropdown-status-open')
    }

    fetchStatusList(){
        if(!this.props.dataId){
            return;
        }

        dropdownRequest(
            this.props.windowType,
            this.props.fields[1].field,
            this.props.dataId,
            null,
            null,
            'window'
        ).then(res => {
            this.setState(
                () => ({
                    list: res.data
                })
            )
        });
    }

    handleChangeStatus = status => {
        const changePromise = this.props.onChange(status)

        this.statusDropdown.blur()

        if (changePromise instanceof Promise){
            changePromise
            .then(this.fetchStatusList)
        }
    }

    getStatusClassName = abrev => {
        const {data} = this.props;

        if((data.action.value !== undefined) &&
            Object.keys(data.action.value)[0] !== abrev){
            return '';
        }

        if(abrev === 'DR'){
            return 'dropdown-status-item-def';
        }else if (abrev === 'CO'){
            return 'dropdown-status-item-def-1';
        }else{
            return '';
        }
    }

    getStatusContext = abrev => {
        if(abrev === 'DR'){
            return 'primary'
        }else if (abrev === 'CO'){
            return 'success'
        }else {
            return 'default'
        }
    }

    renderStatusList = list => {
        return list.values
            .map((item, index) => {
                const key = Object.keys(item)[0]

                return <li
                    key={index}
                    className={
                        'dropdown-status-item ' +
                        (
                            this.state.selected === index
                            ? 'dropdown-status-item-on-key '
                            : ''
                        ) +
                        this.getStatusClassName(key)
                    }
                    onClick={() => this.handleChangeStatus(item)}
                >
                    {item[key]}
                </li>
            })
    }

    render() {
        const {data} = this.props;
        const abrev = (data.status.value !== undefined) ?
            Object.keys(data.status.value)[0] : null;
        const value = (abrev !== null || undefined) ?
            data.status.value[abrev] : null;
        const { list } = this.state;

        return (
            <div
                onKeyDown={this.handleKeyDown}
                className="meta-dropdown-toggle dropdown-status-toggler js-dropdown-toggler"
                tabIndex="0"
                ref={(c) => this.statusDropdown = c}
                onBlur={this.handleDropdownBlur}
                onFocus={this.handleDropdownFocus}
            >
                <div className={'tag tag-' + this.getStatusContext(abrev)}>
                    {value}
                </div>
                <i
                    className={
                        'meta-icon-chevron-1 meta-icon-' +
                        this.getStatusContext(abrev)}
                />
                <ul className="dropdown-status-list">
                    {this.renderStatusList(list)}
                </ul>
                <DocumentStatusContextShortcuts
                    handleDocumentCompleteStatus={() => {
                        this.handleChangeStatus(
                            list.values.filter(elem => !!elem.CO)[0]
                        )
                    }}
                />
            </div>
        )
    }
}

ActionButton.propTypes = {
    dispatch: PropTypes.func.isRequired
};

ActionButton = connect()(ActionButton)

export default ActionButton
