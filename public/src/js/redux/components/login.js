import React from 'react';
import {render, findDOMNode} from 'react-dom';
import config from '../config/app.config';

var Login = React.createClass({
  render() {
    return (
    <div ref="me" className="login-container">
      <div className="container">
        <div className="form-signin">
          <div className="form-signin-heading text-center">
            <h1 className="sign-title">SIGN IN</h1>
            <img src={config.root + "images/login-logo.png"} alt="" />
          </div>
          <div className="login-wrap">
            <input type="text" className="form-control" placeholder="User ID" autofocus=""/>
            <input type="password" className="form-control" placeholder="Password"/>

            <button onClick={this.login} className="btn btn-lg btn-login btn-block">
                <i className="fa fa-check"></i>
            </button>

            <div className="registration">
              Not a member yet?
              <a className="" href="registration.html">
                Signup
              </a>
            </div>
            <label className="checkbox">
              <input type="checkbox" value="remember-me" /> Remember me
              <span className="pull-right">
                <a data-toggle="modal" href="#myModal"> Forgot Password?</a>
              </span>
            </label>
          </div>

          <div aria-hidden="true" aria-labelledby="myModalLabel" role="dialog" tabIndex="-1" id="myModal" className="modal fade">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
                  <h4 className="modal-title">Forgot Password ?</h4>
                </div>
                <div className="modal-body">
                  <p>Enter your e-mail address below to reset your password.</p>
                  <input type="text" name="email" placeholder="Email" autoComplete="off" className="form-control placeholder-no-fix"/>
                </div>
                <div className="modal-footer">
                  <button data-dismiss="modal" className="btn btn-default" type="button">Cancel</button>
                  <button className="btn btn-primary" type="button">Submit</button>
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
    // render(AppRouter, document.getElementById('app'));
    // this.refs.me.style.display = 'none';
    $('body').addClass('login-hide'); //使app可滚动, 顺带动画
  }
});

export default Login;