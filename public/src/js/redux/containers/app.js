import React, {Component} from 'react';
import {render} from 'react-dom';
import {Entry, ComingSoon, NoPage} from '../components/body';
import OrderPannel from '../components/order/manage';
import OrderDetailPannel from '../components/order/manage_order_detail_pannel';
import DeliveryChangePannel from '../components/delivery/change';
import DeliveryManagePannel from '../components/delivery/delivery_manage';
import DeliveryDistributePannel from '../components/delivery/delivery_distribute';
import DeliverPrintReviewPannel from '../components/delivery/print_review';
import history from 'history_instance';
import {Router, Route, IndexRoute} from 'react-router';

export default class App extends Component {
  render(){
    return (
      <Router history={history}>
        <Route path="/" component={Entry}>

          <Route path="om">
            <Route path="index" component={OrderPannel} />
            <Route path="index/add" component={OrderDetailPannel} />
            <Route path="index/:id" component={OrderDetailPannel} />
            <Route path="refund" component={ComingSoon} />
            <Route path="invoice" component={ComingSoon} />
            <Route path="winning" component={ComingSoon} />
          </Route>

          <Route path="dm">
            <Route path="change" component={DeliveryChangePannel} />
            <Route path="delivery" component={DeliveryManagePannel} />
            <Route path="distribute" component={DeliveryDistributePannel} />
            <Route path="review" component={DeliverPrintReviewPannel} />
          </Route>

          <Route path="*" component={NoPage}/>
        </Route>
      </Router>
    )
  }
}
