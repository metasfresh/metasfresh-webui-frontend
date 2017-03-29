import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';

import logo from '../../assets/images/metasfresh_logo_green_thumb.png';

import Subheader from './SubHeader';
import Breadcrumb from './Breadcrumb';
import MasterWidget from '../widget/MasterWidget';
import SideList from './SideList';
import Indicator from '../app/Indicator';
import Inbox from '../inbox/Inbox';
import Tooltips from '../tooltips/Tooltips';
import Prompt from '../app/Prompt';

import {
    openModal
} from '../../actions/WindowActions';

import {
    getRootBreadcrumb
} from '../../actions/MenuActions';

import {
    deleteRequest,
    openFile
} from '../../actions/GenericActions';

import keymap from '../../keymap.js';
import GlobalContextShortcuts from '../shortcuts/GlobalContextShortcuts';
import { ShortcutManager } from 'react-shortcuts';
const shortcutManager = new ShortcutManager(keymap);

class Header extends Component {
    constructor(props){
        super(props);

        this.state = {
            isSubheaderShow: false,
            isSideListShow: false,
            isMenuOverlayShow: false,
            menuOverlay: null,
            scrolled: false,
            isInboxOpen: false,
            tooltipOpen: '',
            prompt: {
                open: false
            }
        }
    }

    componentDidMount() {
        const {dispatch} = this.props;
        dispatch(getRootBreadcrumb());
        document.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.handleScroll);
    }

    getChildContext = () => {
        return { shortcuts: shortcutManager }
    }

    handleInboxOpen = (state) => {
        this.setState({
            isInboxOpen: !!state
        });
    }

    handleCloseSideList = (callback) => {
        this.setState({
                isSideListShow: false
            }, callback);
        this.toggleScrollScope(false);
    }

    handleMenuOverlay = (e, nodeId) => {
        const {isSubheaderShow, isSideListShow} = this.state;
        e && e.preventDefault();

        let toggleBreadcrumb = () => {
            this.setState({
                menuOverlay: nodeId
            }, () => {
                if(nodeId !== '') {
                    this.setState({
                        isMenuOverlayShow: true
                    });
                } else {
                    this.setState({
                        isMenuOverlayShow: false
                    });
                }
            });
        }

        if(!isSubheaderShow && !isSideListShow){
            toggleBreadcrumb();
        }
    }

    handleScroll = (event) => {
        let scrollTop = event.srcElement.body.scrollTop;

        if(scrollTop > 0) {
            this.setState({
                scrolled: true
            })
        } else {
            this.setState({
                scrolled: false
            })
        }
    }

    handleDashboardLink = () => {
        const {dispatch} = this.props;
        dispatch(push('/'));
    }

    toggleScrollScope = (open) => {
        if(!open){
            document.body.style.overflow = 'auto';
        }else{
            document.body.style.overflow = 'hidden';
        }
    }

    toggleTooltip = (tooltip) => {
        this.setState({
            tooltipOpen: tooltip
        });
    }

    openModal = (windowType, type, caption, isAdvanced) => {
        const {dispatch, query} = this.props;
        dispatch(openModal(
            caption, windowType, type, null, null, isAdvanced,
            query && query.viewId
        ));
    }

    handlePrint = (windowType, docId, docNo) => {
        const {dispatch} = this.props;

        dispatch(openFile(
            'window', windowType, docId, 'print',
            windowType + '_' + (docNo ? docNo : docId) + '.pdf'
        ));
    }

    handleDelete = () => {
        this.setState({
            prompt: Object.assign({}, this.state.prompt, {
                open: true
            })
        });
    }

    handleClone = () => {
        //TODO when API ready
    }

    handlePromptCancelClick = () => {
        this.setState({
            prompt: Object.assign({}, this.state.prompt, {
                open: false
            })
        });
    }

    handlePromptSubmitClick = (windowType, docId) => {
        const {dispatch} = this.props;

        this.setState({
            prompt: Object.assign({}, this.state.prompt, {
                open: false
            })
        }, () => {
            dispatch(deleteRequest('window', windowType, null, null, [docId]))
                .then(() => {
                    dispatch(push('/window/' + windowType));
                });
            }
        );
    }

    handleDocStatusToggle = (close) => {
        const elem = document.getElementsByClassName('js-dropdown-toggler')[0];

        if(close) {
            elem.blur();
        } else {
            if(document.activeElement === elem) {
                elem.blur();
            } else {
                elem.focus();
            }
        }
    }

    closeOverlays = (clickedItem, callback) => {
        const {isSideListShow, isSubheaderShow} = this.state;

        this.setState({
            menuOverlay: null,
            isMenuOverlayShow: false,
            isInboxOpen: false,
            isSideListShow:
                (clickedItem == 'isSideListShow' ? !isSideListShow : false),
            isSubheaderShow:
                (clickedItem == 'isSubheaderShow' ? !isSubheaderShow : false),
            tooltipOpen: ''
        }, callback);

        if(clickedItem == 'isSideListShow') {
            this.toggleScrollScope(!isSideListShow);
        }
        if(
            document.getElementsByClassName('js-dropdown-toggler')[0] &&
            (clickedItem != 'dropdown')
        ){
            this.handleDocStatusToggle(true);
        }
    }

    redirect = (where) => {
        const {dispatch} = this.props;
        dispatch(push(where));
    }

    render() {
        const {
            docSummaryData, siteName, docNoData, docNo, docStatus,
            docStatusData, windowType, dataId, breadcrumb, showSidelist,
            references, actions, viewId, inbox, homemenu, selected, entity,
            query, attachments, showIndicator, isDocumentNotSaved,
            selectedWindowType
        } = this.props;

        const {
            isSubheaderShow, isSideListShow, menuOverlay, isInboxOpen, scrolled,
            isMenuOverlayShow, tooltipOpen, prompt
        } = this.state;

        return (
            <div>
            {
                prompt.open &&
                <Prompt
                    title="Delete"
                    text="Are you sure?"
                    buttons={{submit: 'Delete', cancel: 'Cancel'}}
                    onCancelClick={this.handlePromptCancelClick}
                    onSubmitClick={() =>
                        this.handlePromptSubmitClick(windowType, dataId)
                    }
                />
            }

                <nav
                    className={
                        'header header-super-faded js-not-unselect ' +
                        (scrolled ? 'header-shadow': '')
                    }
                >
                    <div className="container-fluid">
                        <div className="header-container">
                            <div className="header-left-side">
                                <div
                                    onClick={() =>
                                        this.closeOverlays('isSubheaderShow')
                                    }
                                    onMouseEnter={() =>
                                        this.toggleTooltip(
                                            keymap
                                                .GLOBAL_CONTEXT
                                                .OPEN_ACTIONS_MENU
                                        )
                                    }
                                    onMouseLeave={() => this.toggleTooltip('')}
                                    className={
                                        'btn-square btn-header ' +
                                        'tooltip-parent ' +
                                        (isSubheaderShow ?
                                            'btn-meta-default-dark ' +
                                            'btn-subheader-open btn-header-open'
                                            : 'btn-meta-primary')
                                        }
                                >
                                    <i className="meta-icon-more" />

                                    {tooltipOpen ===
                                        keymap.GLOBAL_CONTEXT.OPEN_ACTIONS_MENU
                                        && <Tooltips
                                            name={
                                                keymap
                                                    .GLOBAL_CONTEXT
                                                    .OPEN_ACTIONS_MENU
                                            }
                                            action={'Action menu'}
                                            type={''}
                                        /> }
                                </div>

                                <Breadcrumb
                                    homemenu={homemenu}
                                    breadcrumb={breadcrumb}
                                    windowType={windowType}
                                    docNo={docNo}
                                    docNoData={docNoData}
                                    docSummaryData={docSummaryData}
                                    dataId={dataId}
                                    siteName={siteName}
                                    menuOverlay={menuOverlay}
                                    handleMenuOverlay={this.handleMenuOverlay}
                                    openModal={this.openModal}
                                    isDocumentNotSaved={isDocumentNotSaved}
                                />

                            </div>
                            <div className="header-center">
                                <img
                                    src={logo}
                                    className="header-logo pointer"
                                    onClick={() => this.handleDashboardLink()}
                                />
                            </div>
                            <div className="header-right-side">
                                {docStatus &&
                                    <div
                                        className="hidden-sm-down tooltip-parent"
                                        onClick={() => this.toggleTooltip('')}
                                        onMouseEnter={() =>
                                            this.toggleTooltip(
                                                keymap
                                                    .GLOBAL_CONTEXT
                                                    .DOC_STATUS
                                            )
                                        }
                                        onMouseLeave={() =>
                                            this.toggleTooltip('')
                                        }
                                    >
                                        <MasterWidget
                                            entity="window"
                                            windowType={windowType}
                                            dataId={dataId}
                                            widgetData={[docStatusData]}
                                            noLabel={true}
                                            type="primary"
                                            dropdownOpenCallback={()=>{
                                                this.closeOverlays('dropdown')
                                            }}
                                            {...docStatus}
                                        />
                                        { tooltipOpen ===
                                            keymap
                                                .GLOBAL_CONTEXT
                                                .DOC_STATUS
                                            && <Tooltips
                                                name={
                                                    keymap
                                                        .GLOBAL_CONTEXT
                                                        .DOC_STATUS
                                                }
                                                action={'Doc status'}
                                                type={''}
                                            />
                                        }
                                    </div>
                                }

                                <div
                                    className={
                                        'header-item-container ' +
                                        'header-item-container-static ' +
                                        'pointer tooltip-parent ' +
                                        (isInboxOpen ? 'header-item-open ' : '')
                                    }
                                    onClick={() =>
                                        this.closeOverlays('', () =>
                                            this.handleInboxOpen(true)
                                    )}
                                    onMouseEnter={() =>
                                        this.toggleTooltip(
                                            keymap
                                                .GLOBAL_CONTEXT
                                                .OPEN_INBOX_MENU
                                        )
                                    }
                                    onMouseLeave={() => this.toggleTooltip('')}
                                >
                                    <span
                                        className="header-item header-item-badge icon-lg"
                                    >
                                        <i
                                            className="meta-icon-notifications"
                                        />
                                        {inbox.unreadCount > 0 &&
                                            <span
                                                className="notification-number"
                                            >
                                                {inbox.unreadCount}
                                            </span>
                                        }
                                    </span>
                                    { tooltipOpen ===
                                        keymap
                                            .GLOBAL_CONTEXT
                                            .OPEN_INBOX_MENU &&
                                        <Tooltips
                                            name={
                                                keymap
                                                    .GLOBAL_CONTEXT
                                                    .OPEN_INBOX_MENU
                                            }
                                            action={'Inbox'}
                                            type={''}
                                        />
                                    }
                                </div>

                                <Inbox
                                    open={isInboxOpen}
                                    close={this.handleInboxOpen}
                                    disableOnClickOutside={!isInboxOpen}
                                    inbox={inbox}
                                />

                                {showSidelist &&
                                    <div
                                        className={
                                            'tooltip-parent btn-header ' +
                                            'side-panel-toggle btn-square ' +
                                            (isSideListShow ?
                                                'btn-meta-default-bright ' +
                                                'btn-header-open'
                                                : 'btn-meta-primary')
                                        }
                                        onClick={() =>
                                            this.closeOverlays('isSideListShow')
                                        }
                                        onMouseEnter={() =>
                                            this.toggleTooltip(
                                                keymap
                                                    .GLOBAL_CONTEXT
                                                    .OPEN_SIDEBAR_MENU
                                            )
                                        }
                                        onMouseLeave={() =>
                                            this.toggleTooltip('')
                                        }
                                    >
                                        <i className="meta-icon-list" />
                                        { tooltipOpen ===
                                            keymap
                                                .GLOBAL_CONTEXT
                                                .OPEN_SIDEBAR_MENU &&
                                            <Tooltips
                                                name={
                                                    keymap
                                                        .GLOBAL_CONTEXT
                                                        .OPEN_SIDEBAR_MENU
                                                }
                                                action={'Side list'}
                                                type={''}
                                            />
                                        }

                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    {showIndicator && <Indicator {...{isDocumentNotSaved}}/>}
                </nav>

                {isSubheaderShow && <Subheader
                    dataId={dataId}
                    references={references}
                    attachments={attachments}
                    actions={actions}
                    windowType={windowType}
                    viewId={viewId}
                    closeSubheader={() => this.closeOverlays('isSubheaderShow')}
                    docNo={docNoData && docNoData.value}
                    openModal={this.openModal}
                    handlePrint={this.handlePrint}
                    handleDelete={this.handleDelete}
                    handleClone={this.handleClone}
                    redirect={this.redirect}
                    selected={selected}
                    selectedWindowType={selectedWindowType}
                    entity={entity}
                    disableOnClickOutside={!isSubheaderShow}
                    query={query}
                />}

                {showSidelist && isSideListShow && <SideList
                    windowType={windowType ? parseInt(windowType) : ''}
                    closeOverlays={this.closeOverlays}
                    closeSideList={this.handleCloseSideList}
                    isSideListShow={isSideListShow}
                    disableOnClickOutside={!showSidelist}
                />}

                <GlobalContextShortcuts
                    handleMenuOverlay={isMenuOverlayShow ?
                        () => this.handleMenuOverlay('', '') :
                        () => this.closeOverlays('',
                            ()=> this.handleMenuOverlay('', homemenu.nodeId)
                        )
                    }
                    handleSideList = {showSidelist  ? showSidelist : ''}
                    handleInboxOpen = {isInboxOpen ?
                        () => this.handleInboxOpen(false) :
                        () => this.handleInboxOpen(true)
                    }
                    openModal = {dataId ?
                        () => this.openModal(
                            windowType, 'window', 'Advanced edit', true
                        ) : ''
                    }
                    handlePrint={dataId ?
                        () => this.handlePrint(
                            windowType, dataId, docNoData.value
                        ) : ''
                    }
                    handleDelete={dataId ? this.handleDelete: ''}
                    redirect={windowType ?
                        () => this.redirect('/window/'+ windowType +'/new') : ''
                    }
                    handleDocStatusToggle={
                        document
                            .getElementsByClassName('js-dropdown-toggler')[0] ?
                            this.handleDocStatusToggle : ''
                    }
                    closeOverlays={this.closeOverlays}
                />
            </div>
        )
    }
}

Header.propTypes = {
    dispatch: PropTypes.func.isRequired,
    selected: PropTypes.array.isRequired,
    viewId: PropTypes.string,
    homemenu: PropTypes.object.isRequired,
    inbox: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    const {windowHandler, listHandler, appHandler, menuHandler} = state;

    const {
        viewId
    } = listHandler || {
        viewId: ''
    }

    const {
        inbox
    } = appHandler || {
        inbox: {}
    }

    const {
        homemenu
    } = menuHandler || {
        homemenu: []
    }

    const {
        selected,
        selectedWindowType
    } = windowHandler || {
        selected: [],
        selectedWindowType: null
    }

    return {
        selected,
        viewId,
        inbox,
        homemenu,
        selectedWindowType
    }
}

Header.childContextTypes = {
    shortcuts: PropTypes.object.isRequired
}

Header = connect(mapStateToProps)(Header)

export default Header
