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

export const Entry = props => xfxb.login ? (<Main>{props.children}</Main>) : <Login />;

export const Main = props => {
  const c = cookie.get(NAV_COLLAPSED_COOKIE) == NAV_COLLAPSED_COOKIE_YES ? NAV_COLLAPSED_CLASS : '';
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
          <div className="app-version">
            <i className="fa fa-shield"></i>
            { window.xfxb.version || 'V 1.0.1'}
          </div>
        </div>
        <div className="right-side">
          <Header />
          <div className="main-content">
            {props.children}
          </div>
        </div>
      </div>
  )
}

export const NoPermission = () => (<h1><center>没有权限</center></h1>);

export const NoPage = () => (<h1><center>404</center></h1>);

export const ComingSoon = () => (<h1><center><i>Coming Soon !</i></center></h1>);