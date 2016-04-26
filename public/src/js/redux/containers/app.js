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
    case 'om':
      require.ensure([], require => {
        components = {
          ...components,
          OrderPannel:        require('../components/order/manage'),
          OrderDetailPannel:  require('../components/order/manage_order_detail_pannel'),
          AbnormalOrder:      require('../components/order/search_abnormal_order')
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
          SrcChannelPannel:        require('../components/central/src_channel_manage'),
        };
        callback();
      })
      break;
    case 'sm':
      require.ensure([], require => {
        components = {...components,
          StationManagePannel:         require('../components/station/station_manage'),
          StationManageDetailPannel:   require('../components/station/station_manage_detail_pannel'),
          StationScopeManagePannel:    require('../components/station/station_scope_manage'),
        };
        callback();
      });
      break;
    case 'am':
      require.ensure([], require => {
        components = {...components,
          UserManagePannel:            require('../components/authority/user_manage'),
          DepartRoleManagePannel:      require('../components/authority/depart_role_manage'),
          UserDetailPannel:            require('../components/authority/manage_user_detail_pannel'),
          DeptRoleManagePannel:        require('../components/authority/depart_role_manage'),
          RoleAuthorityManagePannel:   require('../components/authority/authority_role_manage'),
          SystemAuthorityManagePannel: require('../components/authority/authority_system_manage'),
        };
        callback();
      });
      break;
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
      <Route path="om" onEnter={getComponents('om')}>
        <Route path="index" onEnter={onEnter('OrderManageAccess')}>
          <IndexRoute getComponent={get('OrderPannel')} />
          <Route path="add" onEnter={onEnter('OrderManageAddOrder')} getComponent={get('OrderDetailPannel')} />
          <Route path=":id" getComponent={get('OrderDetailPannel')} />
        </Route>
        <Route path="refund"  component={ComingSoon} />
        <Route path="invoice" component={ComingSoon} />
        <Route path="winning" component={ComingSoon} />
        <Route path="ao" getComponent={get('AbnormalOrder')} />
      </Route>

      <Route path="dm" onEnter={getComponents('dm')}>
        <Route path="change"   onEnter={onEnter('DeliveryChangeAccess')}   getComponent={get('DeliveryChangePannel')}   />
        <Route path="delivery"   onEnter={onEnter('DeliveryManageAccess')}   getComponent={get('DeliveryManagePannel')}   />
        <Route path="distribute" onEnter={onEnter('DistributeManageAccess')} getComponent={get('DistributeManagePannel')}   />
        <Route path="review"   onEnter={onEnter('PrintReviewAccess')}    getComponent={get('DeliverPrintReviewPannel')} />
      </Route>

      <Route path="cm" onEnter={getComponents('cm')}>
        <Route path="src" onEnter={onEnter('SrcChannelManageAccess')}  getComponent={get('SrcChannelPannel')}   />
      </Route>

      <Route path="am" onEnter={getComponents('am')}>
        <Route path="user">
         <IndexRoute getComponent={get('UserManagePannel')}/>
         <Route path="add" getComponent={get('UserDetailPannel')} />
         <Route path=":id" getComponent={get('UserDetailPannel')} />
        </Route>
        <Route path="deptrole" getComponent={get('DeptRoleManagePannel')} />
        <Route path="roleauthority" getComponent={get('RoleAuthorityManagePannel')} />
        <Route path="systemauthority" getComponent={get('SystemAuthorityManagePannel')} />
      </Route>

      <Route path="sm" onEnter={getComponents('sm')}>
        <Route path="station" onEnter={onEnter('StationManageAccess')} getComponent={get('StationManagePannel')} />
        <Route path="station/add" onEnter={onEnter('StationManageAdd')} getComponent={get('StationManageDetailPannel')} />
        <Route path="station/:id" onEnter={onEnter('StationScopeManageEdit')} getComponent={get('StationManageDetailPannel')} />
        <Route path="scope" onEnter={onEnter('StationScopeManageAccess')} getComponent={get('StationScopeManagePannel')} />
        <Route path="scope/:id" onEnter={onEnter('StationScopeManageEdit')} getComponent={get('StationScopeManagePannel')} />
      </Route>

      <Redirect from="logout" to="/" />
      <Route path="403" component={NoPermission} />
      <Route path="*" component={NoPage}/>
    </Route>
  </Router>
)

export default App;
