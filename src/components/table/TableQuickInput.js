import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import RawWidget from '../widget/RawWidget';

import {
    parseToDisplay,
    addNewRow
} from '../../actions/WindowActions';

import {
    initLayout,
    patchRequest,
    createInstance,
    completeRequest
} from '../../actions/GenericActions';

import {
    addNotification
} from '../../actions/AppActions';

class TableQuickInput extends Component {
    // promise with patching for queuing form submission after patch is done
    patchPromise;

    constructor(props) {
        super(props);

        this.state = {
            layout: null,
            data: null,
            id: null,
            editedField: 0
        }
    }

    componentDidMount() {
        this.initQuickInput();
    }

    componentDidUpdate() {
        if(this.state.data && this.state.layout){
            for(let i = 0; i < this.state.layout.length; i++) {
                const item =
                    this.state.layout[i].fields
                        .map(elem =>
                            this.state.data[elem.field] || -1
                        )

                if(!item[0].value){
                    if(this.state.editedField !== i){
                        this.setState(
                            () => ({
                                editedField: i
                            })
                        )
                    }

                    break;
                }
            }
        }
    }

    initQuickInput = () => {
        this.setState(
            () => ({
                data: null
            }),
            () => {
                createInstance(
                    'window',
                    this.props.docType,
                    this.props.docId,
                    this.props.tabId,
                    'quickInput'
                )
                .then(instance => {
                    this.setState(
                        () => ({
                            data: parseToDisplay(instance.data.fieldsByName),
                            id: instance.data.id,
                            editedField: 0
                        })
                    )
                })
                .catch(err => {
                    if(err.response.status === 404){
                        this.props.dispatch(
                            addNotification(
                                'Batch entry error',
                                'Batch entry is not available.', 5000, 'error'
                            )
                        )

                        this.props.closeBatchEntry();
                    }
                })

                !this.state.layout &&
                initLayout(
                    'window',
                    this.props.docType,
                    this.props.tabId,
                    'quickInput',
                    this.props.docId
                )
                .then(layout => {
                    this.setState(
                        () => ({
                            layout: layout.data.elements
                        })
                    )
                })
            }
        )
    }

    handleChange = (field, value) => {
        this.setState(
            state => ({
                data: Object.assign({}, state.data, {
                    [field]: Object.assign({}, state.data[field], {
                        value
                    })
                })
            })
        )
    }

    handlePatch = (prop, value, callback) => {
        this.patchPromise = new Promise(resolve => {
            patchRequest(
                'window',
                this.props.docType,
                this.props.docId,
                this.props.tabId,
                null,
                prop,
                value,
                'quickInput',
                this.state.id
            )
            .then(response => {
                const fields = response.data[0] && response.data[0].fieldsByName

                fields && Object.keys(fields).map(fieldName => {

                    this.setState(
                        prevState => ({
                            data: Object.assign({}, prevState.data, {
                                [fieldName]: Object.assign({},
                                    prevState.data[fieldName],
                                    fields[fieldName]
                                )
                            })
                        }),
                        () => {
                            if(callback){
                                callback();
                            }
                            resolve();
                        }
                    )
                })
            })
        });
    }

    renderFields = (layout, data, dataId, attributeType, quickInputId) => {
        if(data && layout){
            return layout.map((item, id) => {
                const widgetData =
                    item.fields.map(elem => data[elem.field] || -1);
                return (<RawWidget
                    entity={attributeType}
                    subentity="quickInput"
                    subentityId={quickInputId}
                    tabId={this.props.tabId}
                    windowType={this.props.docType}
                    widgetType={item.widgetType}
                    fields={item.fields}
                    dataId={dataId}
                    widgetData={widgetData}
                    gridAlign={item.gridAlign}
                    key={id}
                    caption={item.caption}
                    handlePatch={(prop, value, callback) =>
                        this.handlePatch(prop, value, callback)}
                    handleFocus={() => {}}
                    handleChange={this.handleChange}
                    type="secondary"
                    autoFocus={id === 0}
                />)
            })
        }
    }

    onSubmit = (e) => {
        const {dispatch, docType, docId, tabId} = this.props;
        const {id, data} = this.state;
        e.preventDefault();

        document.activeElement.blur();

        if(!this.validateForm(data)){
            return dispatch(addNotification(
                'Error', 'Mandatory fields are not filled!', 5000, 'error'
            ))
        }

        this.patchPromise
            .then(() => {
                return completeRequest(
                    'window', docType, docId, tabId, null, 'quickInput', id
                )
            })
            .then(response => {
                this.initQuickInput();
                dispatch(addNewRow(
                    response.data, tabId, response.data.rowId, 'master'
                ))
            });
    }

    validateForm = (data) => {
        return !Object.keys(data).filter(key =>
            data[key].mandatory && !data[key].value).length;
    }

    render() {
        const {
            docId
        } = this.props;

        const {
            data, layout, id
        } = this.state;

        return (
            <form
                onSubmit={this.onSubmit}
                className="quick-input-container"
                ref={c => this.form = c}
            >
                {this.renderFields(layout, data, docId, 'window', id)}
                <div className="hint">(Press 'Enter' to add)</div>
                <button type="submit" className="hidden-xs-up"></button>
            </form>
        )
    }
}

TableQuickInput.propTypes = {
    dispatch: PropTypes.func.isRequired
}

TableQuickInput = connect()(TableQuickInput);

export default TableQuickInput;
