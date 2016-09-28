import {post, put, GET, get, POST, test, TEST} from 'utils/request'; //Promise
import Url from 'config/url';
import { getValues } from 'redux-form';
import { initForm } from 'actions/form';
import clone from 'clone';
import {Noty} from 'utils/index';
import * as OrderSupport from 'actions/order_support';
import { CLEAR_DELIVERY_STATIONS } from 'actions/order_manage';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';

export const GOT_ORDER_SRCS = OrderSupport.GOT_ORDER_SRCS;
export const getOrderSrcs = OrderSupport.getOrderSrcs;

//该方法也在其他业务模块中被调用
export const GOT_DELIVERY_STATIONS = 'GOT_DELIVERY_STATIONS';
export function getDeliveryStations(data) {
  if(data && data.city_id == SELECT_DEFAULT_VALUE){
    return { type: CLEAR_DELIVERY_STATIONS };
  }else{
    return GET(Url.stations.toString(), data, GOT_DELIVERY_STATIONS);
  }
}

export const AUTO_GOT_DELIVERY_STATIONS = 'AUTO_GOT_DELIVERY_STATIONS';
export function autoGetDeliveryStations(data) {
  return POST(Url.auto_loc.toString(), data, AUTO_GOT_DELIVERY_STATIONS);
}

export const GOT_PAY_MODES = OrderSupport.GOT_PAY_MODES;
export const getPayModes = OrderSupport.getPayModes;

export const GET_HISTORY_ORDERS = 'GET_HISTORY_ORDERS';
export function getHistoryOrders(data){
  return GET(Url.orders.toString(), data, GET_HISTORY_ORDERS);
/*
  return TEST({
    total: 1,
    page_no: 0,
    list: [{
      'cancel_reason':  '取消理由xxxx',    
      'city':  '城市xxx',    
      'created_by':  '创建人xx',   
      'created_time':  '下单时间xx',  
      'delivery_name': '配送站名称xx',   
      'delivery_time': '配送时间xx',    
      'delivery_type': '配送方式xx',    
      'discount_price':  '实际售价xx',    
      'is_deal': '0',    
      'is_submit': '1',    
      'merchant_id': '22222',   
      'order_id':  '11111',   
      'original_price':  '4444',    
      'owner_mobile':  '下单人手机xx',   
      'owner_name':  '下单人姓名xx',   
      'pay_status':  'PAYED',    
      'recipient_address': '收货人地址xxxx',   
      'recipient_mobile':  '收货人手机xxx',   
      'recipient_name':  '收货人姓名xxx',   
      'remarks': '备注xxxx',    
      'src_name':  '订单来源xxx',    
      'status':  '订单状态xxx',    
      'updated_by':  '最后操作人xxx',   
      'updated_date':  '最后操作时间eeee',
    }]
  }, GET_HISTORY_ORDERS);
*/
}
export const CHECK_HISTORY_ORDER = 'CHECK_HISTORY_ORDER';
export const GET_HISTORY_ORDER_DETAIL_PRODUCTS = 'GET_HISTORY_ORDER_DETAIL_PRODUCTS';
export function checkHistoryOrder(id){
  return dispatch => {
    dispatch({
      type: CHECK_HISTORY_ORDER,
      active_order_id: id
    })
    return GET(Url.order_detail.toString(id), null, GET_HISTORY_ORDER_DETAIL_PRODUCTS)(dispatch);
  }
}

export function checkGroupbuyPsd(data){
  return dispatch => {
    return post(Url.check_groupbuy_psd.toString(), data);
  }
  // return test(true); //模拟成功
}

function _getFormData(form_data, getState){
  var products = getState().orderManageForm.products.confirm_list;
  var total_amount = 0, total_original_price = 0, total_discount_price = 0;
  var greeting_card = [];
  products = clone( products );
  try{
    products.forEach(n => {
      n.discount_price *= 100;
      n.amount *= 100;
      n.discount_price = Number(n.discount_price.toFixed(0)); //防止浮点误差
      n.amount = Number(n.amount.toFixed(0));

      if(n.amount > n.discount_price){
        Noty('warning', '商品应收金额不能大于实际售价');
        throw new Error('overlimit');
      }

      total_amount += n.amount;
      total_original_price += n.original_price * n.num;
      total_discount_price += n.discount_price;
      greeting_card.push(n.greeting_card);
    })
  }catch(e){
    if(e.msg != 'overlimit'){
      Noty('error', '请填写正确的商品金额数据');
    }
    console.error(e);
    throw e;
  }
  return {
    ...form_data,
    total_amount,
    total_original_price,
    total_discount_price,
    products,
    greeting_card: greeting_card.join('|')
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
    // return TEST(null, [
    //   {type: SAVE_ORDER_INFO_ING},  //立即派发
    //   {type: SAVE_ORDER_INFO_SUCCESS}   //2000毫秒后派发
    // ], 2000)(dispatch);
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
  // return TEST({
  //   type: GOT_ORDER_BY_ID,
  //   data: {
  //     "pay_status": "PAYED",
  //     "owner_mobile": "13399998888",
  //     "recipient_mobile": "13399998888",
  //     "invoice": 0,
  //     "delivery_id": 1,
  //     "owner_name": "www",
  //     "delivery_type": "DELIVERY",
  //     "recipient_address": "xxxx街",
  //     "remarks": "ceec",
  //     "amount": 180,
  //     "src_id": "2",
  //     "regionalism_id": "110101",
  //     //todo{
  //     "province_id": "110000",
  //     "province_name": "北京市",
  //     "city_id": "110100",
  //     "city_name": "北京市",
  //     "regionalism_name": "东城区",
  //     //}

  //     "recipient_landmark": "xxxx建筑物",
  //     "delivery_time": "2015-12-24 13:00～14:00",
  //     "recipient_name": "www",
  //     "pay_modes_id": "2",
  //     "products": [{
  //       "website": "website2",
  //       "name": "zhang",
  //       "size": "zhang1",
  //       "sku_id": 22,
  //       "discount_price": 180,
  //       "product_id": 1,
  //       "num": 1,
  //       "original_price": 20000,
  //       "is_local_site": "0",
  //       "is_delivery": "1",
  //       "category_name": "类型1",
  //       "choco_board": "巧克力牌xxx",
  //       "greeting_card": "祝福语xxx",
  //       "atlas": true,
  //       "custom_name": "自定义名称xxx",
  //       "custom_desc": "自定义描述xxx",
  //       "amount": 180
  //     }]
  //   }
  // });
}

export function copyOrder(){
  return ( dispatch, getState ) => {
    var new_order = getState().orderManageForm.mainForm.data;
    // new_order.products = [];
    return initForm('add_order', new_order)(dispatch); //注意这种action间的相互引用
  }
}
export const GOT_COPY_ORDER_BY_ID = 'GOT_COPY_ORDER_BY_ID';
export function getCopyOrderById(id){
  return GET(Url.order_detail.toString(id), null, GOT_COPY_ORDER_BY_ID)
}

export const GET_BIND_ORDER_BY_ID = 'GET_BIND_ORDER_BY_ID';
export function getBindOrderById(id){
  return dispatch => {
    return get(Url.order_detail.toString(id), null)
        .done((data) => {
          dispatch({
            data:data,
            bind_order_id: id,
            type: GET_BIND_ORDER_BY_ID
          })
        })
  }
}

export const SUBMIT_ORDER_ING = 'SUBMIT_ORDER_ING';
export const SUBMIT_ORDER_COMPLETE = 'SUBMIT_ORDER_COMPLETE';

export function submitOrder(form_data){
  //若是异步的话，那么该函数必须也返回一个函数
  return (dispatch, getState) => {
    var data = _getFormData(form_data, getState);
    dispatch({
      type: SUBMIT_ORDER_ING,
    });
    if(!form_data.order_id){
      throw Error('order_id should not be undefined');
    }
    return put(Url.submit_order.toString(form_data.order_id), data)
      .always(function(){
        dispatch({
          type: SUBMIT_ORDER_COMPLETE,
        })
      })
  }
  // return TEST(null, [
  //   {type: SUBMIT_ORDER_ING},  //立即派发
  //   {type: SUBMIT_ORDER_COMPLETE}   //2000毫秒后派发
  // ], 2000);
}