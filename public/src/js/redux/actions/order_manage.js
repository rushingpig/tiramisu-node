import {post, GET, POST, TEST } from 'utils/request'; //Promise
import Url from 'config/url';

export const CANCEL_ORDER = 'CANCEL_ORDER';
export function cancelOrder(order_id, data){
  debugger;
  return TEST(null, [
    {type: CANCEL_ORDER, key: 0},  //立即派发
    {type: CANCEL_ORDER, key: 1}   //2000毫秒后派发
  ], 2000);
}

export const ORDER_EXCEPTION = 'ORDER_EXCEPTION';
export function orderException(order_id, data){
  debugger;
  return TEST(null, [
    {type: ORDER_EXCEPTION, key: 0},  //立即派发
    {type: ORDER_EXCEPTION, key: 1}   //2000毫秒后派发
  ], 2000);
}