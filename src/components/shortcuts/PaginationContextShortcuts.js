import React, { Component } from 'react';
import { Shortcuts } from 'react-shortcuts';

class PaginationContextShortcuts extends Component {
    constructor(props) {
        super(props);
    }

    handleShortcuts = (action, event) => {
        const {
            handleFirstPage,
            handleLastPage,
            handlePrevPage,
            handleNextPage,
            pages
        } = this.props;

        switch (action) {
            case 'FIRST_PAGE':
                event.preventDefault();
                return handleFirstPage();
            case 'LAST_PAGE':
                event.preventDefault();
                return handleLastPage();
            case 'NEXT_PAGE':
                event.preventDefault();
                if (pages > 1) return handleNextPage();
                return;
            case 'PREV_PAGE':
                event.preventDefault();
                if (pages > 1) return handlePrevPage();
                return;
        }
    };

    render() {
        return (
            <Shortcuts
                name="PAGINATION_CONTEXT"
                handler={this.handleShortcuts}
                targetNodeSelector="body"
                isolate={true}
                preventDefault={true}
                stopPropagation={true}
            />
        );
    }
}

export default PaginationContextShortcuts;
