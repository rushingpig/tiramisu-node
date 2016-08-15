import {post, get, put, del,GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { Noty, formCompile, Utils, clone } from 'utils/index';
import { getValues } from 'redux-form';

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
}

export const GET_ORDER_INVOICE_INFO = 'GET_ORDER_INVOICE_INFO';
export function getOrderInvoiceInfo(id){
	return TEST({
		amount: 10000,
		owner_mobile: '18588420689',
		owner_name: 'gaozheng81503',
		recipient_name: 'xxxxx',
		recipient_mobile: 'xxx',
		recipient_address: 'xxx',
		province_id: '',
		city_id: '440300',
		regionalism_id: '',
		recipient_address: '',
	}, GET_ORDER_INVOICE_INFO);
}

export const GET_INVOICE_LIST = 'GET_INVOICE_LIST';
export function getInvoiceList(data){
/*	return (dispatch, getState) => {
		var filter_data = getValues(getState().form.invoice_manage_filter);
		filter_data = formCompile(filter_data);


	}*/
	return TEST({
		total: 5,
		list: [
			{
				invoice_id: 1,
				invoice_status: 'INVOICING',
				status: 'CANCEL',
				order_id: '2016081215435718',
			},
			{
				invoice_id: 2,
				invoice_status: 'UNINVOICE',
				status: 'UNTREATED',
				order_id: '2016081415444153'
			},
			{
				invoice_id: 3,
				invoice_status: 'INVOICED',
				status: 'TREATED',
				order_id: '2016081215435947',
			},
			{
				invoice_id: 4,
				invoice_status: 'DELIVERY',
				status: 'COMPLETED',
				order_id: '2016081115426072',
			},
			{
				invoice_id: 5,
				invoice_status: 'CANCEL',
				status: 'EXCEPTION',
				order_id: 'EXCEPTION',
			},
		]
	}, GET_INVOICE_LIST)
}