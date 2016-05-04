/**
 * access_control_list : 权限列表
 */
import { test_acl } from 'config/app.config';

//测试数据
// var PERMISSIONS = [
// ];

/**
 * 有无该权限
 * @param  {String} role 权限名
 */
export default function validate ( role ){
  var { user } = window.xfxb;
  //特殊情况
  if( !test_acl && user && user.is_admin ){
    return true;
  }
  var permissions = test_acl ? PERMISSIONS : (user.permissions || []);
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