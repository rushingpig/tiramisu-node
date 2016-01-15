import { post, put, GET, POST, TEST } from 'utils/request'; //Promise
import Url from 'config/url';

export const ORDERS_EXCHANGE = 'ORDERS_EXCHANGE'; //key: 0->正在处理，1->成功，2->失败
export function exchangeOrders(order_ids) {
  //若是异步的话，那么该函数必须也返回一个函数
  return (dispatch, getState) => {
    dispatch({
      type: ORDERS_EXCHANGE,
      key: 0,
    });
    return put(Url.order_exchange.toString(), { order_ids })
      .done(function(){
        dispatch({
          type: ORDERS_EXCHANGE,
          key: 1
        })
      })
      .fail(function(){
        dispatch({
          type: ORDERS_EXCHANGE,
          key: 2
        })
      })
  }
  // return TEST(null, [
  //   {type: ORDERS_EXCHANGE, key: 0},  //立即派发
  //   {type: ORDERS_EXCHANGE, key: 2}   //2000毫秒后派发
  // ], 2000, false);
}