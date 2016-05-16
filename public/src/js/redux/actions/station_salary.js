import {post, GET, POST, PUT, TEST,del,get,put} from 'utils/request'; //Promise
import Url from 'config/url';
import { getValues } from 'redux-form';
import Utils from 'utils/index';
import {Noty} from 'utils/index';

export const ACTIVE_ORDER = 'ACTIVE_ORDER';  // 激活订单，用于查阅该订单详情
export const GET_ORDER_DETAIL_PRODUCTS = 'GET_ORDER_DETAIL_PRODUCTS';
export function activeOrder(id){
	/*return GET(Url.order_detail.toString(id), null, GET_ORDER_DETAIL_PRODUCTS);*/
  return dispatch => {
    dispatch({
      type: ACTIVE_ORDER,
      active_order_id: id
    })
    return GET(Url.order_detail.toString(id), null, GET_ORDER_DETAIL_PRODUCTS)(dispatch);
  }
  /*return TEST({
    'city_id': '市IDXX',
    'city_name': '市名称XX',
    'delivery_id': '配送站IDXX',
    'delivery_name': '配送站名称XX',
    'delivery_time': '配送时间XX',
    'delivery_type': '配送方式XX',
    'district_id': '行政区IDXX',
    'district_name': '行政区名称XX',
    'owner_mobile':  '下单人手机XX',
    'owner_name':  '下单人姓名XX',
    'pay_modes_id':  '支付方式IDXX',
    'pay_name':  '支付方式名称XX',
    'products': [{
      'choco_board':  '巧克力牌xx',    
      'custom_desc': '自定义描述xx',   
      'custom_name': '自定义名称xx',   
      'discount_price':  '实际售价xx',    
      'greeting_card': '祝福卡xx',   
      'num': '产品数量xx',    
      'original_price':  '产品原价xx',    
      'product_name':  '产品名称xx',
    }]
    //...
  }, GET_ORDER_DETAIL_PRODUCTS);*/
}

export const GET_DELIVERY_RECORD = 'GET_DELIVERY_RECORD';
export function getDeliveryRecord(data){
  return GET(Url.delivery_record.toString(),data, GET_DELIVERY_RECORD);
/*  return TEST([{
    'delivery_pay':20,
    'delivery_time':'2015-05-03 15:30~16:30',
    'delivery_type':'DELIVERY',
    'late_minutes':10,
    'order_id':'2016051110006286',
    'pay_status':'COD',
    'payfor_amount':10,
    'COD_amount':10,
    'recipient_address':'xx',
    'recipient_landmark':'xx',
    'recipient_mobile':'xxxxx',
    'recipient_name':'xxx',
    'signin_time':'xxxx',
    'status':'DELIVERY',
    'total_amount':23,
    'total_discount_price':23,
    'total_original_price':23,
    'remark': 'xxxx',
    'update_time':'2015-05-03 15:30~16:30',
    'delivery_count':3,
    'is_review':true,
    'pay_modes_id':18,
    'pay_modes_name':'现金',
  },{
    'delivery_pay':20,
    'delivery_time':'2015-05-03 15:30~16:30',
    'delivery_type':'COLLECT',
    'late_minutes':10,
    'order_id':'2016051011002361',
    'pay_status':'PARTPAYED',
    'payfor_amount':10,
    'COD_amount':10,
    'recipient_address':'xx',
    'recipient_landmark':'xx',
    'recipient_mobile':'xxxxx',
    'recipient_name':'xxx',
    'signin_time':'xxxx',
    'status':'xxx',
    'total_amount':23,
    'total_discount_price':23,
    'total_original_price':23,
    'remark':'',
    'delivery_count':1,
    'is_review':false,
    'pay_modes_id':19,
    'pay_modes_name':'POS',
  }], GET_DELIVERY_RECORD)*/
}

export const UPDATE_DELIVERY_RECORD = 'UPDATE_DELIVERY_RECORD';
export function UpdateDeliverymanSalary(order_id, data){
  return (dispatch) => {
    return put(Url.update_delivery_record.toString(order_id),data)
      .done((_data) => {
        dispatch({
          type:UPDATE_DELIVERY_RECORD,
          data: data,
          order_id:order_id,
        })
      })
  }
  /*return PUT(Url.update_delivery_record.toString(order_id),data,UPDATE_DELIVERY_RECORD);*/
  /*return {type:UPDATE_DELIVERY_RECORD}*/
}

export function exportExcel(data){
  return (dispatch, getState) => {
/*    var data = getValues( getState().form.order_manage_filter ) || {};
    if(!data.begin_time && !data.end_time){
      Utils.Noty('warning', '请选定时间');return;
    }*/
    window.open(Url.delivery_export + '?' + Utils.url.toParams({...data, entrance: 'LIST'}));
  }

}

export const GET_DELIVERY_PROOF = 'GET_DELIVERY_PROOF';
export function getDeliveryProof(orderId){
  return GET(Url.delivery_proof.toString(orderId), null ,GET_DELIVERY_PROOF);
/*  return TEST({
    'call_picture_url':'',
    'door_picture_url':'',
    'receipt_picture_url':'',
    'sms_picture_url':'',
  },GET_DELIVERY_PROOF);*/
}

export const GET_ORDER_OPT_RECORD = 'GET_ORDER_OPT_RECORD';
export function getOrderOptRecord(order_id, data){
/*  return dispatch => {
    return get(Url.order_opt_record.toString(order_id), data)
      .done(function(jsonobj){
        dispatch({
          type: GET_ORDER_OPT_RECORD,
          data: jsonobj,
        })
      })
  }*/
  var sort_type = data.sort_type
   return GET(Url.delivery_opt_record.toString(order_id), {sort_type}, GET_ORDER_OPT_RECORD);
/*  return {
    type: GET_ORDER_OPT_RECORD,
    data: {
      "total": 12,
      "list": [{
        "order_id": 10000035,
        "option": "编辑订单：分配{配送站}为{龙华配送站}\n修改{收货地址}\n提交订单",
        "created_time": "2016-01-15 13:09:47",
        "created_by": "系统管理员"
      }, {
        "order_id": 10000035,
        "option": "{取消订单}",
        "created_time": "2016-01-15 13:08:08",
        "created_by": "系统管理员"
      }, {
        "order_id": 10000035,
        "option": "添加订单",
        "created_time": "2016-01-15 13:06:28",
        "created_by": "系统管理员"
      }, {
        "order_id": 10000035,
        "option": "修改 {配送站} 为 {龙华配送站} \n 修改 {配送时间} 为 {20151220 10:00~11:00} \n 删除 {榴莲双拼}",
        "created_time": "2016-01-15 11:45:26",
        "created_by": "系统管理员"
      }, {
        "order_id": 10000035,
        "option": "打印订单",
        "created_time": "2016-01-15 11:43:47",
        "created_by": "系统管理员"
      }, {
        "order_id": 10000035,
        "option": "打印订单",
        "created_time": "2016-01-15 11:16:31",
        "created_by": "系统管理员"
      }, {
        "order_id": 10000035,
        "option": "打印订单",
        "created_time": "2016-01-15 10:39:22",
        "created_by": "系统管理员"
      }, {
        "order_id": 10000035,
        "option": "打印订单",
        "created_time": "2016-01-15 10:27:46",
        "created_by": "系统管理员"
      }],
      "page_no": "0",
      "page_size": "8"
    }
  }*/
}

export const RESET_ORDER_OPT_RECORD = 'RESET_ORDER_OPT_RECORD'; //先重置历史数据
export function resetOrderOptRecord(){
  return {
    type: RESET_ORDER_OPT_RECORD,
  }
}




