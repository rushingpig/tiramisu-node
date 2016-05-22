import { put, PUT, POST, TEST, test } from 'utils/request'; //Promise
import Url from 'config/url';
import Promise from 'utils/promise';
import { triggerFormUpdate } from 'actions/form';
import { getDeliveryStations as _getDeliveryStations } from 'actions/order_manage_form';

export const getDeliveryStations = _getDeliveryStations;

export const APPLY_DELIVERYMAN = 'APPLY_DELIVERYMAN'; //key: 0->正在处理，1->成功，2->失败
export function applyDeliveryman(data) {
  //若是异步的话，那么该函数必须也返回一个函数
  return PUT(Url.deliveryman_apply.toString(), data, APPLY_DELIVERYMAN);
  // return TEST(null, [
  //   {type: APPLY_DELIVERYMAN, key: 0},  //立即派发
  //   {type: APPLY_DELIVERYMAN, key: 1}   //2000毫秒后派发
  // ], 2000, true);
}

export function startPrint(order_ids){
  return dispatch => {
    return new Promise(function(resolve, reject){
      if(!order_ids.length){
        reject('参数错误');
      }else{
        var win = window.open(Url.print.toString() + '?order_ids=' + order_ids.join(','));
        if(win){
          setTimeout(resolve, 500);
        }else{
          reject('打印页面被拦截了');
        }
      }
    })
  }
  // return test();
}

export const APPLY_PRINT = 'APPLY_PRINT'; //key: 0->正在处理，1->成功，2->失败
export function applyPrint(data) {
  //若是异步的话，那么该函数必须也返回一个函数
  return POST(Url.apply_print.toString(), data, APPLY_PRINT);
  // return TEST(null, [
  //   {type: APPLY_PRINT, key: 0},  //立即派发
  //   {type: APPLY_PRINT, key: 1}   //2000毫秒后派发
  // ], 2000, true);
}

export const REPRINT_VALIDATE_CODE = 'REPRINT_VALIDATE_CODE'; //key: 0->正在处理，1->成功，2->失败
export function validatePrintCode(order_id, validate_code) {
  //若是异步的话，那么该函数必须也返回一个函数
  return PUT(Url.reprint_validate.toString(order_id), {validate_code}, REPRINT_VALIDATE_CODE);
  // return TEST(null, [
  //   {type: REPRINT_VALIDATE_CODE, key: 0},  //立即派发
  //   {type: REPRINT_VALIDATE_CODE, key: 1}   //2000毫秒后派发
  // ], 2000, true);
}

export function rePrint(order_id){
  return dispatch => {
    return new Promise(function(resolve, reject){
      var win = window.open(Url.reprint.toString(order_id));
      if(win){
        resolve();
      }else{
        reject('打印页面被拦截了');
      }
    })
  }
}

export const GET_DELIVERY_SCAN_LIST = 'GET_DELIVERY_SCAN_LIST';
export function searchByScan(order_ids){
  return dispatch => {
    dispatch( triggerFormUpdate('order_delivery_filter', 'order_ids', order_ids) );
    return POST(Url.order_delivery.toString(), {order_ids}, GET_DELIVERY_SCAN_LIST)(dispatch);
  }
}