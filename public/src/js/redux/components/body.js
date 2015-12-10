import React, {Component} from 'react';
import {render} from 'react-dom';
import config from '../config/app.config';
import Nav from './nav';
import Header from './header';

export class App extends Component {
  render(){
    return (
      <div id="app-container" className="sticky-header">
        <div className="left-side">
          <div className="logo">
            <a href="#"><img src={config.root + "images/logo.png"} alt="" /></a>
          </div>
          <div className="logo-icon text-center">
            <a href="index.html"><img src={config.root + "images/logo_icon.png"} alt=""/></a>
          </div>
          <Nav />
        </div>
        <div className="main-content">
          <Header />
          {this.props.children}
        </div>
      </div>
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
export class Om1 extends Component {
  render(){
    return (
      <h1><center>订单管理</center></h1>
    )
  }
}
export class Om2 extends Component {
  render(){
    return (
      <h1><center>退款管理</center></h1>
    )
  }
}
export class Om3 extends Component {
  render(){
    return (
      <h1><center>发票管理</center></h1>
    )
  }
}
export class Om4 extends Component {
  render(){
    return (
      <h1><center>中奖管理</center></h1>
    )
  }
}
