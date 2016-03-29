/*
 * 获取订单辅助信息
 * （考虑到重用，所以写在这里）
 */
import {post, put, GET, POST, test, TEST} from 'utils/request'; //Promise
import Url from 'config/url';

export const GOT_ORDER_SRCS = 'GOT_ORDER_SRCS';
export function getOrderSrcs(){
  return GET(Url.order_srcs.toString(), null, GOT_ORDER_SRCS);
  // return TEST([
  //   {id: 1, name: 'A1', level: 1},
  //   {id: 2, name: 'B1', level: 1},
  //   {id: 3, name: 'C1', level: 1},
  //   {id: 4, name: 'A1.1', level: 2, parent_id: 1},
  //   {id: 5, name: 'B1.2', level: 2, parent_id: 2}
  // ], GOT_ORDER_SRCS);
}

export const GOT_PAY_MODES = 'GOT_PAY_MODES';
export function getPayModes(){
  return GET(Url.pay_modes.toString(), null, GOT_PAY_MODES);
}