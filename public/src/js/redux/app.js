import React, {Component} from 'react';
import {render} from 'react-dom';
import Nav from './components/nav';

class Container extends Component {
  render(){
    return (
      <div>
        <div className="left-side">
          <div className="logo">
            <a href="#"><img src="images/logo.png" alt="" /></a>
          </div>
          <Nav />
        </div>
        <div className="main-content"></div>
      </div>
    )
  }
}

render(
  <Container />,
  document.getElementById('app')
);