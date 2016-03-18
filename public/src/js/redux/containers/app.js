import React, {Component} from 'react';
import {Router, Route, IndexRoute, Redirect} from 'react-router';

import {Entry, ComingSoon, NoPermission, NoPage} from '../components/body';
import OrderPannel from '../components/order/manage';
import OrderDetailPannel from '../components/order/manage_order_detail_pannel';
import DeliveryChangePannel from '../components/delivery/change';
import DeliveryManagePannel from '../components/delivery/delivery_manage';
import DistributeManagePannel from '../components/delivery/distribute_manage';
import DeliverPrintReviewPannel from '../components/delivery/print_review';

import history from 'history_instance';
import V, { onEnter } from 'utils/acl';

let components = {};

const getComponents = (routePath, accessControl) => (nextState, replace, callback) => {

    accessControl && accessControl(nextState, replace);

    switch(routePath) {
        case 'om/index':
            require.ensure([], require => {
                components = Object.assign(components, {
                    OrderPannel:       require('../components/order/manage'),
                    OrderDetailPannel: require('../components/order/manage_order_detail_pannel')
                });
                callback();
            });
            break;
        case 'dm':
            require.ensure([], require => {
                components = Object.assign(components, {
                    DeliveryChangePannel:     require('../components/delivery/change'),
                    DeliveryManagePannel:     require('../components/delivery/delivery_manage'),
                    DistributeManagePannel:   require('../components/delivery/distribute_manage'),
                    DeliverPrintReviewPannel: require('../components/delivery/print_review')
                });
                callback();
            });
            break;
        case 'sm':
            require.ensure([], require => {
                components = Object.assign(components, {
                    StationManagePannel:      require('../components/station/station_manage'),
                    StationScopeManagePannel: require('../components/station/station_scope_manage')
                });
                callback();
            });
            break;
        default:
            replace({}, '/403', null);
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
                <Route path="change"     onEnter={onEnter('DeliveryChangeAccess')}   getComponent={get('DeliveryChangePannel')}     />
                <Route path="delivery"   onEnter={onEnter('DeliveryManageAccess')}   getComponent={get('DeliveryManagePannel')}     />
                <Route path="distribute" onEnter={onEnter('DistributeManageAccess')} getComponent={get('DistributeManagePannel')}   />
                <Route path="review"     onEnter={onEnter('PrintReviewAccess')}      getComponent={get('DeliverPrintReviewPannel')} />
            </Route>
            <Route path="sm" onEnter={getComponents('sm')}>
                <Route path="station"     getComponent={get('StationManagePannel')}      />
                <Route path="station/:id" getComponent={get('StationManagePannel')}      />
                <Route path="scope"       getComponent={get('StationScopeManagePannel')} />
            </Route>
            <Redirect from="logout" to="/" />
            <Route path="403" component={NoPermission} />
            <Route path="*" component={NoPage}/>
        </Route>
    </Router>
)

export default App