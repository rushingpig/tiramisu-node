import {post, GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';

export const CANCEL_ORDER = 'CANCEL_ORDER';
export function cancelOrder(order_id, data){
  return PUT(Url.cancel_order.toString(order_id), data, CANCEL_ORDER);
  // return TEST(null, [
  //   {type: CANCEL_ORDER, key: 0},  //立即派发
  //   {type: CANCEL_ORDER, key: 1}   //2000毫秒后派发
  // ], 2000);
}

//已被弃用
export const ORDER_EXCEPTION = 'ORDER_EXCEPTION';
export function orderException(order_id, data){
  return PUT(Url.order_exception.toString(order_id), data, ORDER_EXCEPTION);
  // return TEST(null, [
  //   {type: ORDER_EXCEPTION, key: 0},  //立即派发
  //   {type: ORDER_EXCEPTION, key: 1}   //2000毫秒后派发
  // ], 2000);
}

export const ALTER_DELIVERY = 'ALTER_DELIVERY';
//修改配送
export function alterDelivery(order_id, data){
  // return PUT(Url.alter_delivery.toString(order_id), data, ALTER_DELIVERY);
  return TEST(null, [
    {type: ALTER_DELIVERY, key: 0},  //立即派发
    {type: ALTER_DELIVERY, key: 1}   //2000毫秒后派发
  ], 2000);
}

export const ALTER_STATION = 'ALTER_STATION';
//分配配送站
export function alterStation(order_id, data){
  return PUT(Url.alter_station.toString(order_id), data, ALTER_STATION);
  // return TEST(null, [
  //   {type: ALTER_STATION, key: 0},  //立即派发
  //   {type: ALTER_STATION, key: 1}   //2000毫秒后派发
  // ], 2000);
}

export const PREPARE_DELIVERY_DATA_OK = 'PREPARE_DELIVERY_DATA_OK';
export function prepareDeliveryDataOK(){
  return {
    type: PREPARE_DELIVERY_DATA_OK
  }
}

export const RESET_DELIVERY_STATIONS = 'RESET_DELIVERY_STATIONS';
export function resetDeliveryStations(){
  return {
    type: RESET_DELIVERY_STATIONS
  }
}