import React, {Component} from 'react';
import {render} from 'react-dom';
import {Entry, Om1, Om2, Om3, Om4, NoPage} from '../components/body';
import history from '../history';
import {Router, Route, IndexRoute} from 'react-router';

export default class App extends Component {
  render(){
    return (
      <Router history={history}>
        <Route path="/" component={Entry}>
          <Route path="om/index" component={Om1} />
          <Route path="om/refund" component={Om2} />
          <Route path="om/invoice" component={Om3} />
          <Route path="om/winning" component={Om4} />
          <Route path="*" component={NoPage}/>
        </Route>
      </Router>
    )
  }
}