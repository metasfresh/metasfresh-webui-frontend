import React, { Component } from 'react';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class RawList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: props.selected || 0,
            isOpen: false,
            dropdownList: []
        }
    }
    
    componentDidMount = () => {
        const {autofocus} = this.props;
        
        (this.dropdown && autofocus) && this.dropdown.focus();
    }

    componentDidUpdate = prevProps => {
        const { list, mandatory } = this.props;

        if(prevProps.list !== list){
            let dropdown = [];

            if(!mandatory){
                dropdown.push(0);
            }

            if(list.length > 0) {
                this.setState({
                    dropdownList: dropdown.concat(list)
                });
            }
        }

        const { isOpen } = this.state;

        // no need for updating scroll
        if (!isOpen || !list.length) {
            return;
        }

        const {listScrollWrap, items} = this.refs;

        const listElementHeight = this.optionElement.offsetHeight;
        const listVisibleElements = Math.floor(listScrollWrap.offsetHeight / listElementHeight);
        const shouldListScrollUpdate = listVisibleElements <= items.childNodes.length;

        if (!shouldListScrollUpdate){
            return;
        }

        const selectedIndex = this.getSelectedIndex();
        const visibleMin = listScrollWrap.scrollTop;
        const visibleMax = visibleMin + listVisibleElements * listElementHeight;

        //not visible from down
        const scrollFromUp = listElementHeight * (selectedIndex - listVisibleElements);
        if (
            (selectedIndex + 1) * listElementHeight > visibleMax &&
            listScrollWrap.scrollTop !== scrollFromUp
        ){
            return listScrollWrap.scrollTop = scrollFromUp;
        }

        //not visible from above
        const scrollFromDown = selectedIndex * listElementHeight;
        if (
            selectedIndex * listElementHeight < visibleMin &&
            listScrollWrap.scrollTop !== scrollFromDown
        ){
            listScrollWrap.scrollTop = scrollFromDown;
        }
    }

    getSelectedIndex(){
        const { list, mandatory } = this.props;
        const { selected } = this.state;

        if (selected === 0){
            return 0;
        }

        const baseIndex = list.findIndex(item => Object.keys(item)[0] === Object.keys(selected)[0]);

        if (!mandatory){
            return baseIndex + 1;
        }

        return baseIndex;
    }

    handleBlur = () => {
        const { selected } = this.props;

        this.dropdown.blur();
        this.setState({
            isOpen: false,
            selected: selected || 0
        })
    }

    handleFocus = (e) => {
        e.preventDefault();
        const {onFocus, doNotOpenOnFocus} = this.props;

        onFocus && onFocus();

        !doNotOpenOnFocus && this.setState({
            isOpen: true
        })
    }

    handleChange = (e) => {
        e.preventDefault();

        this.handleBlur();
    }

    handleSelect = (option) => {
        const {onSelect} = this.props;

        if(option){
            onSelect(option);
        }else{
            onSelect(null);
        }

        this.setState({
            selected: (option || 0)
        }, () => this.handleBlur())
    }

    handleSwitch = (option) => {
        this.setState({
            selected: (option || 0)
        })
    }

    navigate = (up) => {
        const {selected, dropdownList, isOpen} = this.state;        

        if(!isOpen){
            this.setState({
                isOpen: true
            })
        }

        let selectedIndex = null;

        dropdownList.map((item, index) => {
            if(JSON.stringify(item) === JSON.stringify(selected)){
                selectedIndex = index;
            }
        });

        const next = up ? selectedIndex + 1 : selectedIndex - 1;

        this.setState({
            selected: (next >= 0 && next <= dropdownList.length-1) ? dropdownList[next] : selected
        },()=>{
            //TODO: ITEMS ARE NOT CHANGED
            console.log(selected)
        })

    }

    handleKeyDown = (e) => {
        const {selected} = this.state;

        switch(e.key){
            case 'ArrowDown':
                e.preventDefault();
                this.navigate(true);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigate(false);
                break;
            case 'Enter':
                e.preventDefault();
                this.handleSelect(selected);
                break;
            case 'Escape':
                e.preventDefault();
                this.handleBlur();
                break;
        }
    }

    areOptionsEqual(selected, option){
        // different types - not equal for sure
        if (typeof option !== typeof selected){
            return false;
        }

        // option and selected are not objects
        if(
            typeof option !== 'object' &&
            typeof selected !== 'object' &&
            selected === option
        ){
            return true;
        }

        const optionKeys = Object.keys(option);
        const selectedKeys = Object.keys(selected);
        const firstOption = option[optionKeys[0]];
        const firstSelected = selected[selectedKeys[0]];

        // objects, and first elements are not
        if (
            typeof option === 'object' &&
            typeof selected === 'object' &&
            typeof firstOption !== 'object' &&
            typeof firstSelected !== 'object'
        )
        {
            return optionKeys[0] === selectedKeys[0] &&
                    firstOption === firstSelected;
        }

        // first elements are nested objects, repeat checking
        return this.areOptionsEqual(firstOption, firstSelected);
    }

    getRow = (index, option, label) => {
        const {selected} = this.state;

        return (
            <div
                key={index}
                className={'input-dropdown-list-option'  +
                    (
                        this.areOptionsEqual(selected, option) ?
                        ' input-dropdown-list-option-key-on' :
                        ''
                    )
                }
                onMouseEnter={() => this.handleSwitch(option)}
                onClick={() => this.handleSelect(option)}
                ref={option => this.optionElement = option}
            >
                <p className="input-dropdown-item-title">{label ? label : option[Object.keys(option)[0]]}</p>
            </div>
        )
    }

    renderOptions = () => {
        const {list, mandatory, emptyText} = this.props;

        return <div ref="items">{[
            // if field is not mandatory add extra empty row
            ...(!mandatory && emptyText ? [this.getRow(0, 0, emptyText)] : []),
            // fill with options
            ...list.map((option, index) => this.getRow(index + 1, option))
        ]}</div>;
    }

    render() {
        const {
            list, rank, readonly, defaultValue, selected, align, updated,
            loading, rowId, isModal, tabIndex, disabled, mandatory, validStatus
        } = this.props;

        const {
            isOpen
        } = this.state;

        return (
            <div
                tabIndex={tabIndex ? tabIndex : 0}
                onFocus={!readonly && this.handleFocus}
                ref={(c) => this.dropdown = c}
                onBlur={this.handleBlur}
                onKeyDown={this.handleKeyDown}
                className={
                    'input-dropdown-container ' +
                    (readonly ? 'input-disabled ' : '') +
                    (rowId ? 'input-dropdown-container-static ' : '') +
                    ((rowId && !isModal) ? 'input-table ' : '')
                }
            >
                <div className={
                    'input-dropdown input-block input-readonly input-' +
                    (rank ? rank : 'secondary') +
                    (updated ? ' pulse ' : ' ') +
                    ((mandatory && !selected) ? 'input-mandatory ' : '') +
                    (validStatus &&
                        (
                            !validStatus.valid &&
                            !validStatus.initialValue

                        ) &&
                        !isOpen ? 'input-error ' : '')
                }>
                    <div className={
                        'input-editable input-dropdown-focused ' +
                        (align ? 'text-xs-' + align + ' ' : '')
                    }>
                        <input
                            type="text"
                            className={
                                'input-field js-input-field font-weight-semibold ' +
                                (disabled ? 'input-disabled ' : '')
                            }
                            readOnly
                            tabIndex={-1}
                            placeholder={defaultValue}
                            value={selected ? selected[Object.keys(selected)[0]] : ''}
                            onChange={this.handleChange}
                            ref={(c) => this.inputSearch = c}
                            disabled={readonly || disabled}
                        />
                    </div>
                    <div className="input-icon">
                        <i className="meta-icon-down-1 input-icon-sm"/>
                    </div>
                </div>
                {isOpen && <div className="input-dropdown-list" ref="listScrollWrap">
                    {(list.length === 0 && loading === false) && (
                        <div className="input-dropdown-list-header">
                            There is no choice available
                        </div>
                    )}
                    {(loading && list.length === 0) && (
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
                    )}
                    {this.renderOptions()}
                </div>}
            </div>
        )
    }
}

export default RawList;
