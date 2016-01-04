import React, {Component} from 'react';
import {render} from 'react-dom';
import {Entry, Om1, Om2, Om3, Om4, NoPage} from '../components/body';
import OrderPannel from '../components/order/manage';
import OrderDetailPannel from '../components/order/manage_order_detail_pannel';
import history from 'history_instance';
import {Router, Route, IndexRoute} from 'react-router';

export default class App extends Component {
  render(){
    return (
      <Router history={history}>
        <Route path="/" component={Entry}>
          <Route path="om/index" component={OrderPannel} />
          <Route path="om/index/add" component={OrderDetailPannel} />
          <Route path="om/index/:id" component={OrderDetailPannel} />
          <Route path="om/refund" component={Om2} />
          <Route path="om/winning" component={Om4} />
          <Route path="*" component={NoPage}/>
        </Route>
      </Router>
    )
  }
}
