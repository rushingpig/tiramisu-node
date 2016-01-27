import { put, PUT, POST, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import Promise from 'utils/promise';

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
  return new Promise(function(resolve, reject){
    if(!order_ids.length){
      reject('参数错误');
    }else{
      try{
        window.open(Url.print.toString() + '?order_ids=' + order_ids.join(','));
        resolve();
      }catch(e){
        console.error(e);
        reject('打印出错');
      }
    }
  })
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
  return new Promise(function(resolve, reject){
    try{
      window.open(Url.reprint.toString(order_id));
      resolve();
    }catch(e){
      console.error(e);
      reject('打印出错');
    }
  })
}

export const GET_DELIVERY_SCAN_LIST = 'GET_DELIVERY_SCAN_LIST';
export function searchByScan(order_ids){
  return POST(Url.order_delivery.toString(), {order_ids}, GET_DELIVERY_SCAN_LIST);
}