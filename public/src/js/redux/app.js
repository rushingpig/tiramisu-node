import React, {Component} from 'react';
import {render} from 'react-dom';
import config from './config/app.config';
import {App, Om1, Om2, Om3, Om4, NoPage} from './components/body';
import Login from './components/login';
import history from './history';
import {Router, Route, IndexRoute, Link} from 'react-router';

render((
  <Router history={history}>
    <Route path="/" component={App}>
      <IndexRoute component={Login} />
      <Route path="om/index" component={Om1} />
      <Route path="om/refund" component={Om2} />
      <Route path="om/invoice" component={Om3} />
      <Route path="om/winning" component={Om4} />
      <Route path="*" component={NoPage}/>
    </Route>
  </Router>
), document.getElementById('app'));