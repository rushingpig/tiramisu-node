import React, {Component} from 'react';
import {render} from 'react-dom';
import {Entry, ComingSoon, NoPermission, NoPage} from '../components/body';
import OrderPannel from '../components/order/manage';
import OrderDetailPannel from '../components/order/manage_order_detail_pannel';
import DeliveryChangePannel from '../components/delivery/change';
import DeliveryManagePannel from '../components/delivery/delivery_manage';
import DistributeManagePannel from '../components/delivery/distribute_manage';
import DeliverPrintReviewPannel from '../components/delivery/print_review';
import StationManagePannel from '../components/station/station_manage';
import StationScopeManagePannel from '../components/station/station_scope_manage';
import history from 'history_instance';
import {Router, Route, IndexRoute, Redirect} from 'react-router';
import V, { onEnter } from 'utils/acl';

export default class App extends Component {
  render(){
    return (
      <Router history={history}>
        <Route path="/" component={Entry}>

          <Route path="om">
            <Route path="index" onEnter={onEnter('OrderManage')}>
              <IndexRoute component={OrderPannel} />
              <Route path="add" component={OrderDetailPannel} />
              <Route path=":id" component={OrderDetailPannel} />
            </Route>
            <Route path="refund" component={ComingSoon} />
            <Route path="invoice" component={ComingSoon} />
            <Route path="winning" component={ComingSoon} />
          </Route>

          <Route path="dm">
            <Route path="change" component={DeliveryChangePannel} />
            <Route path="delivery" component={DeliveryManagePannel} />
            <Route path="distribute" component={DistributeManagePannel} />
            <Route path="review" component={DeliverPrintReviewPannel} />
          </Route>

          <Route path="sm">
            <Route path="station" component={StationManagePannel} />
            <Route path="station/:id" component={StationManagePannel} />
            <Route path="scope" component={StationScopeManagePannel} />
          </Route>

          <Redirect from="logout" to="/" />
          <Route path="403" component={NoPermission} />
          <Route path="*" component={NoPage}/>
        </Route>
      </Router>
    )
  }
}
