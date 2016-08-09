import {get, post, GET,TEST} from 'utils/request'; //Promise
import Url from 'config/url';
import { getValues } from 'redux-form';

export const GET_REFUND_APPLY_DATA = 'GET_REFUND_APPLY_DATA';
export function getRefundApplyData(orderId){
  return (dispatch) => {
    return get(Url.get_refund_apply_data.toString(orderId), null)
            .done((data) => {
              dispatch({
                type: GET_REFUND_APPLY_DATA,
                data: data,
                order_id: orderId
              })
            })  
  }
/*  return TEST({
    'bind_order_id': '2016080415381109',
    'owner_mobile':  '15981838480',
    'owner_name': '艺奕非凡',
    'payment_amount': '19800',
    'recipient_mobile': '何艳敏',
    'recipient_name': '15981838480',
  }, GET_REFUND_APPLY_DATA);*/
}

export const GET_REFUND_REASONS = 'GET_REFUND_REASONS';
export function getRefundReasons(){
    return GET(Url.refund_reasons.toString(), null, GET_REFUND_REASONS);
/*	return TEST({
		1: '用户取消蛋糕配件',
		2: '客户要求取消订单',
		3: '用户地址不配送',
		4: '客户更改产品(款式或磅数)',
		5: '其他',
	}, GET_REFUND_REASONS)*/
}

export const GET_REFUND_APPLY_DETAIL = 'GET_REFUND_APPLY_DETAIL';
export function getRefundApplyDetail(orderId){
	return TEST({
		'type': 'PART',
		'amount': 19800,
		'reason_type': 1,
		'payment_amount': 20000,
		'linkman' : 1,
		'owner_mobile':  '15981838480',
		'owner_name': '艺奕非凡',
		'recipient_mobile': '何艳敏',
		'recipient_name': '15981838480',
		'way': 'CS',
		'account_type': 'ALIPAY',
		'is_urgent': 1,
		'order_id': '2016071111224371',
	}, GET_REFUND_APPLY_DETAIL)	
}

export const REFUND_APPLY_ING = 'REFUND_APPLY_ING';
export const REFUND_APPLY_SUCCESS = 'REFUND_APPLY_SUCCESS';
export const REFUND_APPLY_FAIL = 'REFUND_APPLY_FAIL';

export const REFUND_APPLY = 'REFUND_APPLY';
export function refundApply(form_data){
	return (dispatch, getState) => {
		var data = _getFormData( getState);

		dispatch({
			type: REFUND_APPLY_ING
		})
    return post(Url.refund_apply.toString(), {...data, ...form_data })
            .done(function(){
              dispatch({
                type: REFUND_APPLY_SUCCESS                
              })
            })
            .fail(function(){
              dispatch({
                type: REFUND_APPLY_FAIL
              })
            })
/*		return TEST({
			type: REFUND_APPLY_SUCCESS
		})*/
	}
}

export const REFUND_EDIT_ING = 'REFUND_EDIT_ING';
export const REFUND_EDIT_SUCCESS = 'REFUND_EDIT_SUCCESS';

export function refundEdit(form_data){
	return(dispatch, getState) => {
		var data = _getFormData(getState);
		dispatch({
			type: REFUND_EDIT_ING
		})
		return TEST({
			type: REFUND_EDIT_SUCCESS
		})
	}
}
function _getFormData( getState){
	var refund_data = getValues(getState().form.refund_apply);
	if(refund_data){
		if(refund_data.linkman == 0){
			refund_data.linkman_name = refund_data.owner_name;
			refund_data.linkman_mobile = refund_data.owner_mobile;
		}else{
			refund_data.linkman_name = refund_data.recipient_name;
			refund_data.linkman_mobile = refund_data.recipient_mobile;
		}
    refund_data.amount = refund_data.amount * 100;
		delete refund_data.owner_name;
		delete refund_data.owner_mobile;
		delete refund_data.recipient_name;
		delete refund_data.recipient_mobile;

		refund_data.is_urgent = refund_data.is_urgent ? 1: 0;
		return refund_data;
	}
}

export const GET_BIND_ORDERS = 'GET_BIND_ORDERS';
export function getBindOrders(order_id, data){
  return {
    type: GET_BIND_ORDERS,
    data: {
      "total": 12,
      "list": [{
        "order_id": 10000035,
        "bind_order_id": "xxxxx",
        "created_time": "2016-01-15 13:09:47",
        "created_by": "系统管理员"
      }, {
        "order_id": 10000035,
        "bind_order_id": "xxx",
        "created_time": "2016-01-15 13:08:08",
        "created_by": "系统管理员"
      }, {
        "order_id": 10000035,
        "bind_order_id": "xxx",
        "created_time": "2016-01-15 13:06:28",
        "created_by": "系统管理员"
      }, {
        "order_id": 10000035,
        "bind_order_id": "xxxxxx",
        "created_time": "2016-01-15 11:45:26",
        "created_by": "系统管理员"
      }, {
        "order_id": 10000035,
        "bind_order_id": "xxx",
        "created_time": "2016-01-15 11:43:47",
        "created_by": "系统管理员"
      }, {
        "order_id": 10000035,
        "bind_order_id": "打印订单",
        "created_time": "2016-01-15 11:16:31",
        "created_by": "系统管理员"
      }, {
        "order_id": 10000035,
        "bind_order_id": "打印订单",
        "created_time": "2016-01-15 10:39:22",
        "created_by": "系统管理员"
      }, {
        "order_id": 10000035,
        "bind_order_id": "打印订单",
        "created_time": "2016-01-15 10:27:46",
        "created_by": "系统管理员"
      }],
      "page_no": "0",
      "page_size": "8"
    }
  }
}

export const RESET_BIND_ORDERS = 'RESET_BIND_ORDERS';
export function resetBindOrders(){
  return {
    type: RESET_BIND_ORDERS,
  }
}