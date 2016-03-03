import React, {Component} from 'react';
import {render} from 'react-dom';
import config from 'config/app.config';
import Nav from './nav';
import Header from './header';
import Login from './login';
import cookie from 'utils/cookie';
import { NAV_COLLAPSED_CLASS, NAV_COLLAPSED_COOKIE, 
  NAV_COLLAPSED_COOKIE_NO, NAV_COLLAPSED_COOKIE_YES } from 'config/app.config';
import V from 'utils/acl';

export class Entry extends Component {
  render(){
    return xfxb.login
      ? <Main>{this.props.children}</Main>
      : <Login />
  }
}

export class Main extends Component {
  render(){
    var c = '';
    if(cookie.get(NAV_COLLAPSED_COOKIE) == NAV_COLLAPSED_COOKIE_YES){
      c = NAV_COLLAPSED_CLASS;
    }
    return (
      <div id="app-container" className={`sticky-header ${c}`}>
        <div className="left-side">
          <div className="logo text-center">
            <a href="#"><img src={config.root + "images/logo.png"} alt="" /></a>
          </div>
          <div className="logo-icon text-center">
            <a href="index.html"><img src={config.root + "images/logo_icon.png"} alt=""/></a>
          </div>
          <Nav onRender={V} />
        </div>
        <div className="right-side">
          <Header />
          <div className="main-content">
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
}
export class NoPermission extends Component {
  render(){
    return (
      <h1><center>没有权限</center></h1>
    )
  }
}
export class NoPage extends Component {
  render(){
    return (
      <h1><center>404</center></h1>
    )
  }
}
export class ComingSoon extends Component {
  render(){
    return (
      <h1><center><i>Coming Soon !</i></center></h1>
    )
  }
}