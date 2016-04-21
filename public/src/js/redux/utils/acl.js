/**
 * access_control_list : 权限列表
 */
import { acl } from 'config/app.config';


var  PERMISSIONS = undefined;
//测试数据
/*const PERMISSIONS = [
 'OrderManageAccess',
   'OrderManageView',
   'OrderManageEdit',
   'OrderManageAddressFilter',
   'OrderManageChannelFilter',
   'DeliveryChange',
   'DeliveryManageChangeStationFilter',
   'DeliveryManageChangeAddressFilter',
   'DeliveryManage',
   'DeliveryManageDeliveryAddressFilter',
   'DistributeManage',
   'DeliveryManageDistributeStationFilter',
   'DeliveryManageDistributeAddressFilter',
   'PrintReview',
  'DeliveryManageAccess',
  'DeliveryManageReprintable',
  'DeliveryManageUnprintable',

  'DistributeManageAccess',
    'DeliveryManageDistributeExportExcel',
  'PrintReviewAccess',
    'DeliveryManagePrintReviewReview',
  'SrcChannelManageAccess',
    'SrcChannelManageEdit',
    'SrcChannelManageRemove',
    'SrcChannelManagePriChannelAdd',
    'SrcChannelManageSecChannelAdd',

  'UserManageAccess',
  'UserManageUnameOrNameFilter',
  'UserManageAddUser',
  'UserManageUserEdit',
  'UserManageUserStatusModify',
  'UserManageUserRemove',
  'DeptRoleManageAccess',
  'DeptRoleManageAddDept',
  'DeptRoleManageAddRole',
  'DeptRoleManageRoleEdit',
  'DeptRoleManageRoleRemove',
  'RoleAuthorityManageAccess',
  'RoleAuthorityManageModuleFilter',
  'RoleAuthorityManageAuthEdit',
  'SystemAuthorityManageAccess',
  'SystemAuthorityManageModuleFilter',
  'SystemAuthorityManageAddDialog',
  'SystemAuthorityManageAuthEdit',
  'SystemAuthorityManageAuthRemove',
  'SystemAuthorityManageAddAuth',
  'SystemAuthorityManageAddModule',
 ];*/

/*const PERMISSIONS = [
 'UserManageAccess',
 'UserManageUnameOrNameFilter',
 'UserManageAddUser',
 'UserManageUserEdit',
 'UserManageUserStatusModify',
 'UserManageUserRemove',
 'DeptRoleManageAccess',
 'DeptRoleManageAddDept',
 'DeptRoleManageAddRole',
 'DeptRoleManageRoleEdit',
 'DeptRoleManageRoleRemove',
 'RoleAuthorityManageAccess',
 'RoleAuthorityManageModuleFilter',
 'RoleAuthorityManageAuthEdit',
 'SystemAuthorityManageAccess',
 'SystemAuthorityManageModuleFilter',
 'SystemAuthorityManageAddDialog',
 'SystemAuthorityManageAuthEdit',
 'SystemAuthorityManageAuthRemove',
 'SystemAuthorityManageAddAuth',
 'SystemAuthorityManageAddModule',
 ]*/


/**
 * 有无该权限
 * @param  {String} role 权限名
 */
export default function validate ( role ){
  var { user } = window.xfxb;
  //特殊情况
  if( !acl || ( user && user.is_admin ) ){
    return true;
  }
  var permissions = user.permissions || [];
  return permissions.some( n => n === role );
}

/**
 * 注意，路由的权限控制存在于两部分，一部分在react-router当中，一部分在nav当中;
 * 该方法用于react-router当中，进行权限控制
 * @param  {String} role 权限名
 */
export function onEnter( role ){
  return function (state, replace) {
    //登录成功之后，才有必要进行validate
    if( window.xfxb.login ){
      if( !validate( role ) ){
        replace({}, '/403', null);
        return false;
      }
    }
    return true;
  }
}