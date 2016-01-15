import { PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';

export const APPLY_DELIVERYMAN = 'APPLY_DELIVERYMAN'; //key: 0->正在处理，1->成功，2->失败
export function applyDeliveryman(data) {
  //若是异步的话，那么该函数必须也返回一个函数
  // return PUT(Url.deliveryman_apply.toString(), data, APPLY_DELIVERYMAN);
  return TEST(null, [
    {type: APPLY_DELIVERYMAN, key: 0},  //立即派发
    {type: APPLY_DELIVERYMAN, key: 1}   //2000毫秒后派发
  ], 2000, true);
}

export const APPLY_PRINT = 'APPLY_PRINT'; //key: 0->正在处理，1->成功，2->失败
export function applyPrint(data) {
  //若是异步的话，那么该函数必须也返回一个函数
  // return (dispatch, getState) => {
  //   dispatch({
  //     type: APPLY_PRINT,
  //     key: 0,
  //   });
  //   return put(Url.apply_print.toString(), data)
  //     .done(function(){
  //       dispatch({
  //         type: APPLY_PRINT,
  //         key: 1
  //       })
  //     })
  //     .fail(function(){
  //       dispatch({
  //         type: APPLY_PRINT,
  //         key: 2
  //       })
  //     })
  // }
  return TEST(null, [
    {type: APPLY_PRINT, key: 0},  //立即派发
    {type: APPLY_PRINT, key: 1}   //2000毫秒后派发
  ], 2000, true);
}

export const RE_PRINT = 'RE_PRINT'; //key: 0->正在处理，1->成功，2->失败
export function rePrint(data) {
  //若是异步的话，那么该函数必须也返回一个函数
  // return PUT(Url.re_print.toString(), data, RE_PRINT);
  return TEST(null, [
    {type: RE_PRINT, key: 0},  //立即派发
    {type: RE_PRINT, key: 1}   //2000毫秒后派发
  ], 2000, true);
}