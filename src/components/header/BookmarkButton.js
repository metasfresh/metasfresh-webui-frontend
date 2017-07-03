import React, { Component } from 'react';
import {connect} from 'react-redux';

import {patchRequest} from '../../actions/GenericActions';

class BookmarkButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isBookmarkButtonShowed: false,
            isBookmark: props.isBookmark
        }
    }

    componentWillReceiveProps = next => {
        if(next.isBookmark !== this.props.isBookmark){
            this.setState(
                () => ({
                    isBookmark: next.isBookmark
                })
            )
        }
    }

    toggleBookmarkButton = () => {
        this.setState(
            state => ({
                isBookmarkButtonShowed: !state.isBookmarkButtonShowed
            })
        )
    }

    handleClick = () => {
        patchRequest(
            'menu',
            null,
            null,
            null,
            null,
            'favorite',
            !this.state.isBookmark,
            'node',
            this.props.nodeId
        )
        .then(response => {
            this.setState(
                state => ({
                    isBookmark: !state.isBookmark
                })
            )

            this.props.updateData &&
            this.props.updateData(response.data)
        });
    }

    render() {
        const {children, alwaysShowed, transparentBookmarks} = this.props;
        const {isBookmarkButtonShowed, isBookmark} = this.state;

        if(transparentBookmarks){
            return children;
        }

        return (
            <span
                onMouseEnter={this.toggleBookmarkButton}
                onMouseLeave={this.toggleBookmarkButton}
                className="btn-bookmark"
            >
                {children}
                {alwaysShowed || (isBookmarkButtonShowed || isBookmark) &&
                    <i
                        onClick={this.handleClick}
                        className={
                            'btn-bookmark-icon meta-icon-star icon-spaced ' +
                            (isBookmark ? 'active ' : '')
                        }
                    />
                }
            </span>
        );
    }
}

BookmarkButton = connect()(BookmarkButton)

export default BookmarkButton;
