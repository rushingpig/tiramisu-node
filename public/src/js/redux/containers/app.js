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
          OrderPannel:       require('../components/order/manage'),
          OrderDetailPannel: require('../components/order/manage_order_detail_pannel'),
          AbnormalOrder:     require('../components/order/search_abnormal_order')
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
          DeliverPrintReviewPannel: require('../components/delivery/print_review'),
          DeliveryManSalaryManagePannel:   require('../components/delivery/salary_manage'),
        };
        callback();
      });
      break;
    case 'cm':
      require.ensure([], require => {
        components = {...components,
          SrcChannelPannel:        require('../components/central/src_channel_manage'),
          AlterUserPasswordPannel: require('../components/central/alter_user_password_pannel'),
          ImageManagePannel:       require('../components/central/image_manage_pannel')
        };
        callback();
      })
      break;
    case 'pm':
      require.ensure([], require => {
        components = {
          ...components,
          SkuSearch: require('../components/product/sku_search'),
          SkuManage: require('../components/product/sku_management')
        }
        callback();
      });
      break;
    case 'cam':
      require.ensure([], require => {
        const categoryManage = level => require('../components/category/manage')(level);
        components = {
          ...components,
          CategoryManage:        require('../components/category/search'),
          CategoryManagePrimary: categoryManage('primary'),
          CategoryManageSecond:  categoryManage('secondary')
        };
        callback();
      });
      break;
    case 'sm':
      require.ensure([], require => {
        components = {...components,
          StationManagePannel:       require('../components/station/station_manage'),
          StationManageDetailPannel: require('../components/station/station_manage_detail_pannel'),
          StationScopeManagePannel:  require('../components/station/station_scope_manage'),
          StationScopeSharePannel:   require('../components/station/station_scope_share'),
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
        <Route path="ao" onEnter={onEnter('OrderAbnormalManageAccess')} getComponent={get('AbnormalOrder')} />
      </Route>

      <Route path="dm" onEnter={getComponents('dm')}>
        <Route path="change"   onEnter={onEnter('DeliveryChangeAccess')}   getComponent={get('DeliveryChangePannel')}   />
        <Route path="delivery"   onEnter={onEnter('DeliveryManageAccess')}   getComponent={get('DeliveryManagePannel')}   />
        <Route path="distribute" onEnter={onEnter('DistributeManageAccess')} getComponent={get('DistributeManagePannel')}   />
        <Route path="review"   onEnter={onEnter('PrintReviewAccess')}    getComponent={get('DeliverPrintReviewPannel')} />
        <Route path="salary" onEnter={onEnter('DeliveryManSalaryManageAccess')} getComponent={get('DeliveryManSalaryManagePannel')} />
      </Route>

      <Route path="cm" onEnter={getComponents('cm')}>
        <Route path="src" onEnter={onEnter('SrcChannelManageAccess')}  getComponent={get('SrcChannelPannel')}   />
        <Route path="account" getComponent={get('AlterUserPasswordPannel')}   />
        <Route path="img" getComponent={get('ImageManagePannel')}   />
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
        <Route path="station/:id" onEnter={onEnter('StationManageEdit')} getComponent={get('StationManageDetailPannel')} />
        <Route path="scope" onEnter={onEnter('StationScopeManageAccess')} getComponent={get('StationScopeManagePannel')} />
        <Route path="scope/:id" onEnter={onEnter('StationScopeManageAccess')} getComponent={get('StationScopeManagePannel')} />
        <Route path="scope_s/:id" onEnter={onEnter('StationScopeShareAccess')} getComponent={get('StationScopeSharePannel')} />
      </Route>

      <Route path="pm" onEnter={getComponents('pm')}>
        <Route path="sku_manage">
          <IndexRoute onEnter={onEnter('ProductionManageAccess')} getComponent={get('SkuSearch')} />
          <Route path="add" onEnter={onEnter('ProductionManageAdd')} getComponent={get('SkuManage')} />
        </Route>
        <Route path="cam" onEnter={getComponents('cam', onEnter('CategoryManageAccess'))}>
          <IndexRoute getComponent={get('CategoryManage')} />
          <Route path="primary_category">
            <Route path="add" onEnter={onEnter("CategoryManageAddPrimaryCategory")} getComponent={get('CategoryManagePrimary')} />
            <Route path="edit/:id" onEnter={onEnter('CategoryManageEditPrimaryCategory')} getComponent={get('CategoryManagePrimary')} />
          </Route>
          <Route path="second_category">
            <Route path="add" onEnter={onEnter("CategoryManageAddSecondaryCategory")} getComponent={get('CategoryManageSecond')} />
            <Route path="edit/:id" onEnter={onEnter('CategoryManageEditSecondaryCategory')} getComponent={get('CategoryManageSecond')} />
          </Route>
        </Route>
      </Route>


      <Redirect from="logout" to="/" />
      <Route path="403" component={NoPermission} />
      <Route path="*" component={NoPage}/>
    </Route>
  </Router>
)

export default App;
