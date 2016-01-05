import {post, put, GET, POST, TEST} from 'utils/request'; //Promise
import Url from 'config/url';
import { getValues } from 'redux-form';
import { GOT_PROVINCES, GOT_CITIES, GOT_DISTRICTS } from 'actions/area';

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

export const GOT_DELIVERY_STATIONS = 'GOT_DELIVERY_CENTER';
export function getDeliveryStations() {
  return GET(Url.delivery_stations.toString(), null, GOT_DELIVERY_STATIONS);
}

export const GOT_PAY_MODES = 'GOT_PAY_MODES';
export function getPayModes(){
  return GET(Url.pay_modes.toString(), null, GOT_PAY_MODES);
}

//
export const CONFIRM_PRODUCT_ATTR_CHANGE = 'CONFIRM_PRODUCT_ATTR_CHANGE';
export function productAttrChange(data){
  return {
    type: CONFIRM_PRODUCT_ATTR_CHANGE,
    data
  }
}


function _getFormData(form_data, getState){
  var products = getState().orderManageForm.products.confirm_list;
  var total_amount = products.reduce((p, n) => p + n.discount_price*100, 0);
  return {
    ...form_data,
    total_amount: total_amount / 100,
    products,
  };
}

export const SAVE_ORDER_INFO_ING = 'SAVE_ORDER_INFO_ING';
export const SAVE_ORDER_INFO_SUCCESS = 'SAVE_ORDER_INFO_SUCCESS';
export const SAVE_ORDER_INFO_FAIL = 'SAVE_ORDER_INFO_FAIL';

export function createOrder(form_data){
  //若是异步的话，那么该函数必须也返回一个函数
  return (dispatch, getState) => {
    var data = _getFormData(form_data, getState);
    dispatch({
      type: SAVE_ORDER_INFO_ING,
    });
    return post(Url.order_add.toString(), data)
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

//保存和创建的逻辑大体一致，就是url不同
export function saveOrder(form_data){
  //若是异步的话，那么该函数必须也返回一个函数
  return (dispatch, getState) => {
    var data = _getFormData(form_data, getState);
    dispatch({
      type: SAVE_ORDER_INFO_ING,
    });
    if(!form_data.order_id){
      throw Error('order_id should not be undefined');
    }
    return put(Url.save_order.toString(form_data.order_id), data)
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


export const GOT_ORDER_BY_ID = 'GOT_ORDER_BY_ID';
export function getOrderById(id){
  return GET(Url.order_detail.toString(id), null, GOT_ORDER_BY_ID)
  // return dispatch => {
  //   dispatch({
  //     type: GOT_ORDER_BY_ID,
  //     data: {
  //       "pay_status": "PAYED",
  //       "owner_mobile": "13399998888",
  //       "recipient_mobile": "13399998888",
  //       "invoice": 0,
  //       "delivery_id": 1,
  //       "owner_name": "www",
  //       "delivery_type": "DELIVERY",
  //       "recipient_address": "xxxx街",
  //       "remarks": "ceec",
  //       "amount": 180,
  //       "src_id": "2",
  //       "regionalism_id": "110101",
  //       //todo{
  //       "province_id": "110000",
  //       "province_name": "北京市",
  //       "city_id": "110100",
  //       "city_name": "北京市",
  //       "regionalism_name": "东城区",
  //       //}

  //       "recipient_landmark": "xxxx建筑物",
  //       "delivery_time": "2015-12-24 13:00～14:00",
  //       "recipient_name": "www",
  //       "pay_modes_id": "2",
  //       "products": [{
  //         "website": "website2",
  //         "name": "zhang",
  //         "size": "zhang1",
  //         "sku_id": 22,
  //         "discount_price": 180,
  //         "product_id": 1,
  //         "num": 1,
  //         "original_price": 20000,
  //         "is_local_site": "0",
  //         "is_delivery": "1",
  //         "category_name": "类型1",
  //         "choco_board": "巧克力牌xxx",
  //         "greeting_card": "祝福语xxx",
  //         "atlas": true,
  //         "custom_name": "自定义名称xxx",
  //         "custom_desc": "自定义描述xxx",
  //         "amount": 180
  //       }]
  //     }
  //   });
  // }
}

export const SUBMIT_ING = 'SUBMIT_ING';
export const SUBMIT_COMPLETE = 'SUBMIT_COMPLETE';

export function submitOrder(form_data){
  //若是异步的话，那么该函数必须也返回一个函数
  return (dispatch, getState) => {
    var data = _getFormData(form_data, getState);
    dispatch({
      type: SUBMIT_ING,
    });
    if(!form_data.order_id){
      throw Error('order_id should not be undefined');
    }
    return put(Url.submit_order.toString(form_data.order_id), data)
      .always(function(){
        dispatch({
          type: SUBMIT_COMPLETE,
        })
      })
  }
}