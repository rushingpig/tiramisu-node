import React, {Component} from 'react';
import {render} from 'react-dom';
import {Entry, ComingSoon, NoPermission, NoPage} from '../components/body';
import OrderPannel from '../components/order/manage';
import OrderDetailPannel from '../components/order/manage_order_detail_pannel';
import DeliveryChangePannel from '../components/delivery/change';
import DeliveryManagePannel from '../components/delivery/delivery_manage';
import DistributeManagePannel from '../components/delivery/distribute_manage';
import DeliverPrintReviewPannel from '../components/delivery/print_review';
import history from 'history_instance';
import {Router, Route, IndexRoute, Redirect} from 'react-router';
import V, { onEnter } from 'utils/acl';

const App = () => (
  <Router history={history}>
    <Route path="/" component={Entry}>

      <Route path="om">
        <Route path="index" onEnter={onEnter('OrderManageAccess')}>
          <IndexRoute component={OrderPannel} />
          <Route path="add" onEnter={onEnter('OrderManageAddOrder')} component={OrderDetailPannel} />
          <Route path=":id" component={OrderDetailPannel} />
        </Route>
        <Route path="refund" component={ComingSoon} />
        <Route path="invoice" component={ComingSoon} />
        <Route path="winning" component={ComingSoon} />
      </Route>

      <Route path="dm">
        <Route path="change" onEnter={onEnter('DeliveryChangeAccess')} component={DeliveryChangePannel} />
        <Route path="delivery" onEnter={onEnter('DeliveryManageAccess')} component={DeliveryManagePannel} />
        <Route path="distribute" onEnter={onEnter('DistributeManageAccess')} component={DistributeManagePannel} />
        <Route path="review" onEnter={onEnter('PrintReviewAccess')} component={DeliverPrintReviewPannel} />
      </Route>

      <Redirect from="logout" to="/" />
      <Route path="403" component={NoPermission} />
      <Route path="*" component={NoPage}/>
    </Route>
  </Router>
)

export default App