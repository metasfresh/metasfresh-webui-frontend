import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {push, goBack} from 'react-router-redux';

import {connect} from 'react-redux';
import logo from '../../assets/images/metasfresh_logo_green_thumb.png';

import RawList from '../widget/List/RawList';
import Moment from 'moment';

import {
    loginRequest,
    loginSuccess,
    localLoginRequest,
    loginCompletionRequest,
    getUserLang
} from '../../actions/AppActions';

class LoginForm extends Component {
    constructor(props){
        super(props);

        this.state = {
            role: '',
            roleSelect: false,
            err: ''
        }
    }

    componentDidMount(){
        this.login.focus();
    }

    handleKeyPress = (e) => {
        if(e.key === 'Enter'){
            this.handleLogin();
        }
    }

    handleOnChange = (e) => {
        e.preventDefault();

        this.setState({
            err: ''
        })
    }

    handleSuccess = () => {
        const {redirect, dispatch} = this.props;

        dispatch(getUserLang()).then(response => {
            //GET language shall always return a result
            Moment.locale(Object.keys(response.data)[0]);

            if(redirect){
                dispatch(goBack());
            }else{
                dispatch(push('/'));
            }
        })

    }

    checkIfAlreadyLogged(err){
        const {dispatch} = this.props;
        const {router} = this.context;

        return dispatch(localLoginRequest())
            .then(response => {
                if (response.data){
                    return router.push('/')
                }

                return Promise.reject(err);
            });
    }

    handleLogin = () => {
        const {dispatch} = this.props;
        const {roleSelect, role} = this.state;

        this.setState({
            pending: true
        }, () => {
            if(roleSelect){
                return dispatch(loginCompletionRequest(role))
                    .then(() => {
                        dispatch(loginSuccess());
                        this.handleSuccess();
                    })
            }

            dispatch(loginRequest(this.login.value, this.passwd.value))
                .then(response =>{
                    if(response.data.loginComplete){
                        return this.handleSuccess();
                    }
                    this.setState({
                        roleSelect: true,
                        roles: response.data.roles,
                        role: response.data.roles[0]
                    })
                })
                .then(() => {
                    this.setState({
                        pending: false
                    })
                })
                .catch(err => {
                    return this.checkIfAlreadyLogged(err);
                })
                .catch(err => {
                    this.setState({
                        err: (err.response ?
                            err.response.data.message : 'Connection problem'),
                        pending: false
                    });
                })
        });
    }

    handleRoleSelect = (option) => {
        this.setState({
            role: option
        });
    }

    render() {
        const {roleSelect, roles, err, role, pending} = this.state;
        return (
            <div
                className="login-form panel panel-spaced-lg panel-shadowed panel-primary"
                onKeyDown={this.handleKeyPress}
            >
                <div className="text-xs-center">
                    <img src={logo} className="header-logo mt-2 mb-2" />
                </div>
                {roleSelect ? <div>
                        <div className="form-control-label">
                            <small>Select role</small>
                        </div>
                        <RawList
                            rank="primary"
                            list={roles}
                            onSelect={option => this.handleRoleSelect(option)}
                            selected={role}
                            disabled={pending}
                            autofocus={true}
                            doNotOpenOnFocus={true}
                        />
                    </div>:
                    <div>
                        {
                            err && <div className="input-error">
                                {err}
                            </div>
                        }
                        <div>
                            <div className="form-control-label">
                                <small>Login</small>
                            </div>
                            <input
                                type="text"
                                onChange={this.handleOnChange}
                                className={
                                    'input-primary input-block ' +
                                    (err ? 'input-error ' : '') +
                                    (pending ? 'input-disabled ': '')
                                }
                                disabled={pending}
                                ref={c => this.login = c} />
                        </div>
                        <div>
                            <div className="form-control-label">
                                <small>Password</small>
                            </div>
                            <input
                                type="password"
                                onChange={this.handleOnChange}
                                className={
                                    'input-primary input-block ' +
                                    (err ? 'input-error ' : '') +
                                    (pending ? 'input-disabled ' : '')
                                }
                                disabled={pending}
                                ref={c => this.passwd = c}
                            />
                        </div>

                    </div>
                }
                <div className="mt-2">

                    <button
                        className="btn btn-sm btn-block btn-meta-success"
                        onClick={this.handleLogin}
                        disabled={pending}
                    >
                        {roleSelect? 'Send' : 'Login'}
                    </button>
                </div>
            </div>
        )
    }
}

LoginForm.propTypes = {
    dispatch: PropTypes.func.isRequired
};

LoginForm.contextTypes = {
    router: PropTypes.object.isRequired
};

LoginForm = connect()(LoginForm);

export default LoginForm;
