import { put, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';

export const SIGN_ORDER = 'SIGN_ORDER'; //key: 0->正在处理，1->成功，2->失败
export function signOrder(data) {
  //若是异步的话，那么该函数必须也返回一个函数
  // return PUT(Url.order_sign.toString(), data, SIGN_ORDER);
  debugger;
  return TEST(null, [
    {type: SIGN_ORDER, key: 0},  //立即派发
    {type: SIGN_ORDER, key: 1}   //2000毫秒后派发
  ], 2000, true);
}

export const UNSIGN_ORDER = 'UNSIGN_ORDER'; //key: 0->正在处理，1->成功，2->失败
export function unsignOrder(data) {
  //若是异步的话，那么该函数必须也返回一个函数
  // return PUT(Url.order_unsign.toString(), data, UNSIGN_ORDER);
  debugger;
  return TEST(null, [
    {type: UNSIGN_ORDER, key: 0},  //立即派发
    {type: UNSIGN_ORDER, key: 1}   //2000毫秒后派发
  ], 2000, true);
}