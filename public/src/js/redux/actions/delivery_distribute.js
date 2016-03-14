import { put, PUT, TEST, POST } from 'utils/request'; //Promise
import Url from 'config/url';
import { getDeliveryStations as _getDeliveryStations } from 'actions/order_manage_form';
import { getValues } from 'redux-form';
import Utils from 'utils/index';
import { triggerFormUpdate } from 'actions/form';

export const SIGN_ORDER = 'SIGN_ORDER'; //key: 0->正在处理，1->成功，2->失败
export function signOrder(order_id, data) {
  //若是异步的话，那么该函数必须也返回一个函数
  return PUT(Url.order_sign.toString(order_id), data, SIGN_ORDER);
  // return TEST(null, [
  //   {type: SIGN_ORDER, key: 0},  //立即派发
  //   {type: SIGN_ORDER, key: 1}   //2000毫秒后派发
  // ], 2000, true);
}

export const UNSIGN_ORDER = 'UNSIGN_ORDER'; //key: 0->正在处理，1->成功，2->失败
export function unsignOrder(order_id, data) {
  //若是异步的话，那么该函数必须也返回一个函数
  return PUT(Url.order_unsign.toString(order_id), data, UNSIGN_ORDER);
  // return TEST(null, [
  //   {type: UNSIGN_ORDER, key: 0},  //立即派发
  //   {type: UNSIGN_ORDER, key: 1}   //2000毫秒后派发
  // ], 2000, true);
}

export const GET_DISTRIBUTE_SCAN_LIST = 'GET_DISTRIBUTE_SCAN_LIST';
export function searchByScan(order_ids){
  return dispatch => {
    dispatch( triggerFormUpdate('order_distribute_filter', 'order_ids', order_ids) );
    return POST(Url.order_distribute.toString(), {order_ids}, GET_DISTRIBUTE_SCAN_LIST)(dispatch);
  }
}

export const getDeliveryStations = _getDeliveryStations;

export function exportExcel(){
  return (dispatch, getState) => {
    var data = getValues( getState().form.order_distribute_filter ) || {};
    if(!data.begin_time && !data.end_time){
      Utils.Noty('warning', '请选定时间');return;
    }
    window.open(Url.orders_export + Utils.url.toParams({...data, entrance: 'RECEIVE_LIST'}));
  }
}