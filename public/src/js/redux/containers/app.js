import React, {Component} from 'react';
import {Router, Route, IndexRoute, Redirect} from 'react-router';
import {Entry, ComingSoon, NoPermission, NoPage} from '../components/body';
import history from 'history_instance';
import { onEnter } from 'utils/acl';
import { connect } from 'react-redux';

let components = {};

const getComponents = (routePath, accessControl) => (nextState, replace, callback) => {

  if(accessControl && !accessControl(nextState, replace)){
    return ;
  }

  switch(routePath) {
    case 'om/index':
      require.ensure([], require => {
        components = {...components,
          OrderPannel:       require('../components/order/manage'),
          OrderDetailPannel: require('../components/order/manage_order_detail_pannel'),
        };
        callback();
      });
      break;
    case 'dm':
      require.ensure([], require => {
        components = {...components,
          DeliveryChangePannel:     require('../components/delivery/change'),
          DeliveryManagePannel:     require('../components/delivery/delivery_manage'),
          DistributeManagePannel:   require('../components/delivery/distribute_manage'),
          DeliverPrintReviewPannel: require('../components/delivery/print_review')
        };
        callback();
      });
      break;
    case 'cm':
      require.ensure([], require => {
        components = {...components,
          SrcChannelPannel: require('../components/central/src_channel_manage'),
        };
        callback();
      })
    default:
      break;
  }
}

const get = componentName => (location, callback) => {
  callback(undefined, components[componentName]);
}

const App = () => (
  <Router history={history}>
    <Route path="/" component={Entry}>
      <Route path="om">
        <Route path="index" onEnter={getComponents('om/index', onEnter('OrderManageAccess'))}>
          <IndexRoute getComponent={get('OrderPannel')} />
          <Route path="add" onEnter={onEnter('OrderManageAddOrder')} getComponent={get('OrderDetailPannel')} />
          <Route path=":id" getComponent={get('OrderDetailPannel')} />
        </Route>
        <Route path="refund"  component={ComingSoon} />
        <Route path="invoice" component={ComingSoon} />
        <Route path="winning" component={ComingSoon} />
      </Route>
      <Route path="dm" onEnter={getComponents('dm')}>
        <Route path="change"   onEnter={onEnter('DeliveryChangeAccess')}   getComponent={get('DeliveryChangePannel')}   />
        <Route path="delivery"   onEnter={onEnter('DeliveryManageAccess')}   getComponent={get('DeliveryManagePannel')}   />
        <Route path="distribute" onEnter={onEnter('DistributeManageAccess')} getComponent={get('DistributeManagePannel')}   />
        <Route path="review"   onEnter={onEnter('PrintReviewAccess')}    getComponent={get('DeliverPrintReviewPannel')} />
      </Route>
      <Route path="cm" onEnter={getComponents('cm')}>
        <Route path="src"   onEnter={onEnter('SrcChannelManage')}   getComponent={get('SrcChannelPannel')}   />
      </Route>
      <Redirect from="logout" to="/" />
      <Route path="403" component={NoPermission} />
      <Route path="*" component={NoPage}/>
    </Route>
  </Router>
)

export default App;