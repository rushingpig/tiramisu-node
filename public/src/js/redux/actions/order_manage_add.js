import {post, GET, POST} from '../utils/request'; //Promise
import Url from '../config/url';

export const GOT_ORDER_SRCS = 'GOT_ORDER_SRCS';
export function getOrderSrcs(){
  return GET(Url.order_srcs.toString(), null, GOT_ORDER_SRCS);
  // return TEST({
  //   type: GOT_ORDER_SRCS,
  //   data: [
  //     {id: 1, name: 'A1', level: 1},
  //     {id: 2, name: 'A2', level: 1},
  //     {id: 3, name: 'A3', level: 1},
  //     {id: 4, name: 'B1', level: 2, parent_id: 1},
  //     {id: 5, name: 'B2', level: 2, parent_id: 2}
  //   ]
  // });
}

export function foo() {
  return {
    TYPE: 'XXXXXXXXXX'
  }
}

export const GOT_DELIVERY_STATIONS = 'GOT_DELIVERY_CENTER';
export function getDeliveryStations() {
  return GET(Url.delivery_stations.toString(), null, GOT_DELIVERY_STATIONS);
}

export const GOT_PAY_MODES = 'GOT_PAY_MODES';
export function getPayModes(){
  return GET(Url.pay_modes.toString(), null, GOT_PAY_MODES);
}

export const SAVE_ORDER_INFO_ING = 'SAVE_ORDER_INFO_ING';
export const SAVE_ORDER_INFO_SUCCESS = 'SAVE_ORDER_INFO_SUCCESS';
export const SAVE_ORDER_INFO_FAIL = 'SAVE_ORDER_INFO_FAIL';
export function saveOrderInfo(data){
  return (dispatch) => {
    dispatch({
      type: SAVE_ORDER_INFO_ING,
    })
    post(Url.order_add.toString(), data)
      .done(function(){
        dispatch({
          type: SAVE_ORDER_INFO_SUCCESS,
        })
      })
      .fail(function(){
        dispatch({
          type: SAVE_ORDER_INFO_FAIL,
        })
      })
  }
}