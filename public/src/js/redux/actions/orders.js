import { get, GET, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { getValues } from 'redux-form';
import { NO_MORE_CODE } from 'config/app.config';
import { Noty, formCompile } from 'utils/index';
import { searchByScan as searchByScanInDeliveryManage } from 'actions/delivery_manage';
import { searchByScan as searchByScanInDistributeManage } from 'actions/delivery_distribute';

/**
 * GET_ORDER_LIST 这里共用了这个信号，代表获取列表数据（订单管理，订单转送单，送货单管理，配送单管理）
 * @type {String}
 */
export const GET_ORDER_LIST = 'GET_ORDER_LIST';
export const GET_ORDER_LIST_ING = 'GET_ORDER_LIST_ING';

export function refreshDataList(){
  return {
    type: GET_ORDER_LIST_ING
  }
}
export function getOrderList(data){
  return (dispatch, getState) => {
    var filter_data = getValues(getState().form.order_manage_filter);
    filter_data = formCompile(filter_data);
    return GET(Url.orders.toString() + '?v=' + new Date().getTime(), {...data, ...filter_data}, GET_ORDER_LIST)(dispatch)
      // .fail(function(msg, code){
      //   if(code == NO_MORE_CODE){
      //     Noty('alert', '没有查询到任何结果');
      //   }
      // });
  }
/*
  return TEST({
    total: 1,
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
  }, GET_ORDER_LIST);
*/
}

export function getOrderExchangeList(data){
  return (dispatch, getState) => {
    var filter_data = getValues(getState().form.order_exchange_filter);
    filter_data = formCompile(filter_data);
/*    delete filter_data.province_id;
    delete filter_data.city_id;*/
    // dispatch({ type: GET_ORDER_LIST_ING });
    return GET(Url.order_exchange.toString(), {...data, ...filter_data}, GET_ORDER_LIST)(dispatch);
  }
}

export function getOrderDeliveryList(data){
  return (dispatch, getState) => {
    var filter_data = getValues(getState().form.order_delivery_filter);
    filter_data = formCompile(filter_data);
    // dispatch({ type: GET_ORDER_LIST_ING });
/*    delete filter_data.province_id;
    delete filter_data.city_id;*/
    if( filter_data.order_ids ){
      return searchByScanInDeliveryManage( filter_data.order_ids )(dispatch); //按扫描结果搜索
    }else{
      return GET(Url.order_delivery.toString(), {...data, ...filter_data}, GET_ORDER_LIST)(dispatch);
    }
  }
}

export function getOrderDistributeList(data){
  return (dispatch, getState) => {
    var filter_data = getValues(getState().form.order_distribute_filter);
    filter_data = formCompile(filter_data);
    // dispatch({ type: GET_ORDER_LIST_ING });
/*    delete filter_data.province_id;
    delete filter_data.city_id;*/
    if(filter_data.deliveryman_id == 0){
      delete filter_data.deliveryman_id;
    }
    if( filter_data.order_ids ){
      return searchByScanInDistributeManage( filter_data.order_ids )(dispatch); //按扫描结果搜索
    }else{
      return GET(Url.order_distribute.toString(), {...data, ...filter_data}, GET_ORDER_LIST)(dispatch);
    }
  }
}

export const CHECK_ALL_ORDERS = 'CHECK_ALL_ORDERS';
export function checkAllOrders(checked){
  return {
    type: CHECK_ALL_ORDERS,
    checked,
  }
}

export const CHECK_ORDER = 'CHECK_ORDER';  // 用于某些情况下选中订单 做批量操作
export function checkOrder(order_id, checked){
  return {
    type: CHECK_ORDER,
    order_id,
    checked,
  }
}


export const ACTIVE_ORDER = 'ACTIVE_ORDER';  // 激活订单，用于查阅该订单详情
export const GET_ORDER_DETAIL_PRODUCTS = 'GET_ORDER_DETAIL_PRODUCTS';
export function activeOrder(id){
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

export const RESET_ORDER_STORE = 'RESET_ORDER_STORE';
export function resetOrderStore(){
  return {
    type: RESET_ORDER_STORE
  }
}

export const SHOW_PRODUCTS_DETAIL = 'SHOW_PRODUCTS_DETAIL';  //允许订单对应的产品详情显示出来
export function showProductsDetail(){
  return {
    type: SHOW_PRODUCTS_DETAIL
  }
}

export const GET_ORDER_OPT_RECORD = 'GET_ORDER_OPT_RECORD';
export function getOrderOptRecord(order_id, data){
  return dispatch => {
    return get(Url.order_opt_record.toString(order_id), data)
      .done(function(jsonobj){
        dispatch({
          type: GET_ORDER_OPT_RECORD,
          data: jsonobj,
        })
      })
  }
  // return GET(Url.order_opt_record.toString(order_id), data, GET_ORDER_OPT_RECORD);
  /*return {
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