import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    dropdownRequest,
    autocompleteRequest
} from '../../../actions/GenericActions';
import Label from './Label';
import Suggestion from './Suggestion';

class Labels extends Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
        selected: PropTypes.array.isRequired,
        className: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        tabIndex: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ])
    };

    static defaultProps = {
        selected: [],
        onChange: () => {}
    };

    state = {
        focused: false,
        values: [],
        suggestions: [],
        cursorY: -1
    };

    childClick = false;
    lastTypeAhead = '';

    handleClick = async () => {
        this.input.focus();

        const { windowId, docId, name } = this.props;

        const response = await dropdownRequest({
            docId,
            entity: 'window',
            propertyName: name,
            viewId: windowId
        });

        const { values } = response.data;

        this.setState({ values });
    };

    handleFocus = () => {
        if (document.activeElement !== this.input) {
            return;
        }

        this.setState({
            focused: true
        });
    };

    handleBlur = event => {
        if (this.childClick) {
            this.childClick = false;
            this.input.focus();

            return;
        }

        if (this.wrapper.contains(event.relatedTarget)) {
            return;
        }

        this.setState({
            focused: false,
            cursorY: -1
        });
    };

    handleArrows = event => {
        let suggestions;

        if (this.state.suggestions.length) {
            suggestions = this.state.suggestions;
        } else {
            suggestions = this.state.values;
        }

        suggestions = suggestions.filter(
            this.unusedSuggestions()
        );

        switch (event.key) {
            case 'ArrowUp': {
                this.setState(({ cursorY }) => ({
                    cursorY: Math.max(
                        Math.min(cursorY, suggestions.length - 1) - 1,
                        -1
                    )
                }));

                // Prevent page from scrolling
                event.preventDefault();

                return;
            }

            case 'ArrowDown': {
                this.setState(({ cursorY }) => ({
                    cursorY: Math.min(cursorY + 1, suggestions.length - 1)
                }));

                // Prevent page from scrolling
                event.preventDefault();

                return;
            }
        }
    };

    handleKeyUp = async event => {
        const typeAhead = event.target.innerHTML;

        if (typeAhead !== this.lastTypeAhead) {
            const { windowId, docId, name } = this.props;

            const response = await autocompleteRequest({
                docId,
                entity: 'window',
                propertyName: name,
                query: typeAhead,
                viewId: windowId
            });

            const { values } = response.data;

            this.setState({
                suggestions: values
            });

            this.typeAhead = typeAhead;
        }
    };

    handleKeyDown = event => {
        const typeAhead = event.target.innerHTML;
        const { selected } = this.props;

        if (event.key === 'Enter') {
            if (typeAhead || this.state.cursorY >= 0) {
                let suggestions;

                if (this.state.suggestions.length) {
                    suggestions = this.state.suggestions;
                } else {
                    suggestions = this.state.values;
                }

                suggestions = suggestions.filter(
                    this.unusedSuggestions()
                );

                this.props.onChange([
                    ...this.props.selected,
                    suggestions[
                        Math.max(
                            0,
                            Math.min(
                                this.state.cursorY,
                                suggestions.length - 1
                            )
                        )
                    ]
                ]);

                if (typeAhead) {
                    this.setState({
                        cursorY: -1
                    });
                }

                this.input.innerHTML = '';
            }

            // Don't break contentEditable container with newline
            event.preventDefault();

            return;
        }

        if (event.key === 'Backspace') {
            if (selected.length < 1) {
                return;
            } else if (!typeAhead) {
                this.props.onChange(selected.slice(0, selected.length - 1));
            }

            return;
        }

        if ([
            'ArrowTop',
            'ArrowRight',
            'ArrowBottom',
            'ArrowLeft'
        ].includes(event.key)) {
            return;
        }

        const charAlphaNumeric = /^[\w|\p{L}]$/;

        if (charAlphaNumeric.test(event.key)) {
            return;
        }

        // For any key not checked
        event.preventDefault();
    };

    handleSuggestionAdd = suggestion => {
        this.childClick = true;
        this.input.innerHTML = '';

        this.props.onChange([...this.props.selected, suggestion]);
    };

    handleLabelRemove = label => {
        this.props.onChange(this.props.selected.filter(item => item !== label));
    };

    unusedSuggestions = () => {
        const selected = new Set(
            this.props.selected.map(item => Object.keys(item)[0])
        );

        return suggestion => !selected.has(Object.keys(suggestion)[0]);
    };

    render() {
        let suggestions;

        if (this.state.suggestions.length) {
            suggestions = this.state.suggestions;
        } else {
            suggestions = this.state.values;
        }

        suggestions = suggestions.filter(this.unusedSuggestions());

        return (
            <div
                ref={ref => { this.wrapper = ref; }}
                className={`${this.props.className} labels`}
                onClick={this.handleClick}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                tabIndex={this.props.tabIndex}
                onKeyDown={this.handleArrows}
            >
                <span className="labels-wrap">
                    {this.props.selected.map(item => (
                        <Label
                            className="labels-label"
                            key={Object.keys(item)[0]}
                            label={item}
                            onRemove={this.handleLabelRemove}
                        />
                    ))}
                    <span
                        className="labels-input"
                        ref={ref => { this.input = ref; }}
                        contentEditable
                        onKeyUp={this.handleKeyUp}
                        onKeyDown={this.handleKeyDown}
                    />
                </span>
                {this.state.focused && (
                    <div className="labels-dropdown">
                        {suggestions.map((suggestion, index) => {
                            const active = (
                                index === this.state.cursorY ||
                                index === suggestions.length - 1 &&
                                index <= this.state.cursorY
                            );

                            return (
                                <Suggestion
                                    className="labels-suggestion"
                                    key={Object.keys(suggestion)[0]}
                                    suggestion={suggestion}
                                    onAdd={this.handleSuggestionAdd}
                                    active={active}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }
}

export default connect(state => ({
    docId: state.windowHandler.master.docId,
    windowId: state.windowHandler.master.layout.windowId
}))(Labels);
