/**
 * access_control_list : 权限列表
 */
import { acl } from 'config/app.config';

var  PERMISSIONS = undefined;
//测试数据
// const PERMISSIONS = [
//   'OrderManage',
//     'OrderManageView',
//     'OrderManageEdit',
//     'OrderManageAddressFilter',
//   'DeliveryChange',
//     'DeliveryManageChangeStationFilter',
//     'DeliveryManageChangeAddressFilter',
//   'DeliveryManage',
//     'DeliveryManageDeliveryAddressFilter',
//   'DistributeManage',
//     'DeliveryManageDistributeStationFilter',
//     'DeliveryManageDistributeAddressFilter',
//   'PrintReview',
// ];

/**
 * 有无该权限
 * @param  {String} role 权限名
 */
export default function validate ( role ){
  //禁用权限控制
  if( !acl ){ return true; }
  //初始化PERMISSIONS：分两种情况
  //1. 第一次登录后；2. 已登陆后刷新；
  if( !PERMISSIONS ){
    var { user } = window.xfxb;
    if( user ){
      if( typeof user === 'string' ){
        try {
          PERMISSIONS = JSON.parse( user ).permissions || [];
        }catch(e){
          console.error(e);
          PERMISSIONS = [];
        }
      }else{
        PERMISSIONS = user.permissions || [];
      }
    }else{
      return false; //未知错误，权限全部为禁止
    }
  }
  return PERMISSIONS.some( n => n === role );
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
      }
    }
  }
}