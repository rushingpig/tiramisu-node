import React from 'react';
import {render, findDOMNode} from 'react-dom';
import config from 'config/app.config';
import {connect} from 'react-redux';
import {login, usernameChange, passwordChange, resetErrorMsg} from 'actions/login';
import history from '../history';

var Login = React.createClass({
  render() {
    const {login_ing, validate, error_msg, username, password} = this.props;

    // validate && $('body').addClass('login-hide'); //通过

    return (
    <div ref="me" className="login-container">
      <div className="container">
        <div className="form-signin">
          <div className="form-signin-heading text-center">
            <img src={config.root + "images/logo.png"} alt="" />
          </div>
          <div className="login-wrap">
            <input id="username" value={username} ref="username"
                onChange={this.onUsernameChange} type="text" className="form-control" placeholder="用户名" autofocus=""/>
            <input id="password" value={password} ref="password"
                onChange={this.onPasswordChange} onKeyDown={this.onEnterHandler} type="password" className="form-control" placeholder="密码"/>
            <div className="error-msg">{error_msg}</div>
            <button disabled={login_ing} onClick={this.login} className="btn-login btn-block">
                登录
            </button>

            <div className="registration hidden">
              没有账号?
              <a className="" href="registration.html">
                注册
              </a>
            </div>
            <label className="checkbox hidden">
              <input type="checkbox" value="remember-me" /> 记住我
              <span className="pull-right">
                <a data-toggle="modal" href="#myModal"> 忘记密码?</a>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
    )
  },
  login(){
    var {username, password, dispatch, login_ing} = this.props;
    if(login_ing){
      return;
    }else if(!username){
      this.tipNoInput('username'); return ;
    }else if(!password){
      this.tipNoInput('password'); return ;
    }
    dispatch(login(username, password)).done(function(data){
      window.xfxb.login = true;
      window.xfxb.user = data.user || {};
      //登录后，直接定位到所在url
      history.push(location.pathname + location.search);
    });
  },
  onUsernameChange(e){
    this.props.dispatch(usernameChange(e.target.value));
  },
  onPasswordChange(e){
    this.props.dispatch(passwordChange(e.target.value));
  },
  resetErrorMsg(){
    this.props.dispatch(resetErrorMsg());
  },
  onEnterHandler(e){
    if(e.which == 13){
      this.login();
    }
  },
  tipNoInput: function(ref){
    var $input = $(this.refs[ref]).addClass('tip').focus();
    setTimeout(function(){
      $input.removeClass('tip');
    }, 400);
  },
  componentDidMount(){
    $([this.refs.username, this.refs.password]).on('click', this.resetErrorMsg);
  },
  componentWillUnmount(){
    $([this.refs.username, this.refs.password]).off('click', this.resetErrorMsg);
  }
});

function mapStateToProps(state){
  return state.login;
}

// function mapDispatchToProps(dispatch) {
//   return bindActionCreators(CounterActions, dispatch)
// }

export default connect(mapStateToProps)(Login);