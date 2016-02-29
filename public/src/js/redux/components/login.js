import React from 'react';
import {render, findDOMNode} from 'react-dom';
import config from 'config/app.config';
import {connect} from 'react-redux';
import {login, usernameChange, passwordChange, resetErrorMsg} from 'actions/login';
import history from '../history';

var Login = React.createClass({
  render() {
    const {login_ing, validate, error_msg, username, password} = this.props;

    validate && $('body').addClass('login-hide'); //通过

    return (
    <div ref="me" className="login-container">
      <div className="container">
        <div className="form-signin">
          <div className="form-signin-heading text-center">
            <h1 className="sign-title">登录</h1>
            <img src={config.root + "images/login-logo.png"} alt="" />
          </div>
          <div className="login-wrap">
            <input value={username} ref="username"
                onChange={this.onUsernameChange} type="text" className="form-control" placeholder="用户名" autofocus=""/>
            <input value={password} ref="password"
                onChange={this.onPasswordChange} onKeyDown={this.onEnterHandler} type="password" className="form-control" placeholder="密码"/>
            <div className="error-msg">{error_msg}</div>
            <button disabled={login_ing} onClick={this.login} className="btn btn-lg btn-login btn-block">
                <i className="fa fa-check"></i>
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

          <div aria-hidden="true" aria-labelledby="myModalLabel" role="dialog" tabIndex="-1" id="myModal" className="modal fade">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
                  <h4 className="modal-title">忘记密码 ?</h4>
                </div>
                <div className="modal-body">
                  <p>在下面输入你的邮箱地址以重置密码.</p>
                  <input type="text" name="邮箱" placeholder="Email" autoComplete="off" className="form-control placeholder-no-fix"/>
                </div>
                <div className="modal-footer">
                  <button data-dismiss="modal" className="btn btn-default" type="button">取消</button>
                  <button className="btn btn-primary" type="button">确定</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
  },
  login(){
    var {username, password, dispatch} = this.props;
    if(!username){
      this.tipNoInput('username'); return ;
    }else if(!password){
      this.tipNoInput('password'); return ;
    }
    dispatch(login(username, password)).done(function(){
      window.xfxb.login = true;
      //登录后，直接定位到所在url
      history.push(location.pathname + location.search);
    });
    // render(AppRouter, document.getElementById('app'));
    // this.refs.me.style.display = 'none';
    // $('body').addClass('login-hide'); //使app可滚动, 顺带动画
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
    console.log($([this.refs.username, this.refs.password]));
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