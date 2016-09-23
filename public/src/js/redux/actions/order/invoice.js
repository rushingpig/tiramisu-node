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
	return dispatch => {
		return get(Url.order_invoice_data.toString(id), null)
			.done((data) => {
				dispatch({
					order_id: id,
					data: data,
					type: GET_ORDER_INVOICE_INFO,
				})
			})

	}

	/*return GET(Url.order_invoice_data.toString(id), null, GET_ORDER_INVOICE_INFO);*/
/*	return TEST({
		amount: 10000,
		owner_mobile: '18588420689',
		owner_name: 'gaozheng81503',
		recipient_name: 'xxxxx',
		recipient_mobile: 'xxx',
		recipient_province_id: '130000',
		recipient_city_id: '130100',
		recipient_regionalism_id: '130102',

		recipient_address: '',
	}, GET_ORDER_INVOICE_INFO);*/
}

export const GET_INVOICE_INFO = 'GET_INVOICE_INFO';
export function getInvoiceInfo(id){
	return dispatch => {
		return get(Url.invoice_data.toString(id), null)
			.done((data) => {
				dispatch({
					id: id,
					data: data,
					type: GET_INVOICE_INFO,
				})
			})
	}
/*	return TEST({
		amount: 10000,
		owner_mobile: '18588420689',
		owner_name: 'gaozheng81503',
		recipient_name: 'xxxxx',
		recipient_mobile: 'xxx',
		address: 'xxx',
		province_id: '130000',
		city_id: '130100',
		regionalism_id: '130102',
		recipient_province_id: '130000',
		recipient_city_id: '130100',
		recipient_regionalism_id: '130102',	
		recipient_address: 'xxx',
		order_id: 'xxxxx',
		enable_recipient_address: 1,
		remarks: 'xxxx',
		recipient: 0,
		type: 0,
	}, GET_INVOICE_INFO)*/
}

export const RESET_INVOICE_DATA = 'RESET_INVOICE_DATA';
export function resetInvoiceData(){
	return {
		type: RESET_INVOICE_DATA,
	}
}

export const GET_INVOICE_COMPANY = 'GET_INVOICE_COMPANY';
export function getInvoiceCompany(){
	return GET(Url.invoice_get_company.toString(), null ,GET_INVOICE_COMPANY);
	/*return TEST({
		1: 'xxxxxxx', 2: '222'
	}, GET_INVOICE_COMPANY)*/
}

export const GET_INVOICE_LIST = 'GET_INVOICE_LIST';
export function getInvoiceList(data){
	return (dispatch, getState) => {
		var filter_data = getValues(getState().form.invoice_manage_filter);
		filter_data = formCompile(filter_data);

		return get(Url.get_invoice_list.toString(), {...filter_data, ...data})
				.done((_data) => {
					dispatch({
						page_no: data.page_no,
						data: _data,
						type: GET_INVOICE_LIST,
					})
				})

	}
/*	return TEST({
		total: 5,
		list: [
			{
				invoice_id: 1,
				invoice_status: 'WAITING',
				status: 'CANCEL',
				order_id: '2016081215435718',
				updated_time: 'ssssssssssss',
			},
			{
				invoice_id: 2,
				invoice_status: 'UNTREATED',
				status: 'UNTREATED',
				order_id: '2016081415444153'
			},
			{
				invoice_id: 3,
				invoice_status: 'COMPLETED',
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
	}, GET_INVOICE_LIST)*/
}

function _getFormdata(getState){
	var invoice_data = getValues(getState().form.invoice_apply_pannel);
	if(invoice_data){
		if(invoice_data.enable_recipient_address == 1){
			invoice_data.province_id = invoice_data.recipient_province_id;
			invoice_data.city_id = invoice_data.recipient_city_id;
			invoice_data.regionalism_id = invoice_data.recipient_regionalism_id;
			invoice_data.address = invoice_data.recipient_address;
		}
		if(invoice_data.recipient == 2){
			invoice_data.recipient_name = invoice_data._recipient_name;
			invoice_data.recipient_mobile =invoice_data._recipient_mobile;
		}
		if(invoice_data.type == '0'){
			delete invoice_data.company_id;
		}else{
			delete invoice_data.title;
		}
		invoice_data.amount = invoice_data.amount * 100;
		delete invoice_data.recipient_province_id;
		delete invoice_data.recipient_city_id;
		delete invoice_data.recipient_regionalism_id;
		delete invoice_data.recipient_address;
		return invoice_data;
	}
}

export const INVOICE_APPLY_ING = 'INVOICE_APPLY_ING';
export const INVOICE_APPLY_SUCCESS = 'INVOICE_APPLY_SUCCESS';
export const INVOICE_APPLY_FAIL = 'INVOICE_APPLY_FAIL';

export function invoiceApply(){
	return (dispatch, getState) => {
		var data = _getFormdata(getState);
		dispatch({
			type: INVOICE_APPLY_ING,
		})
		return post(Url.invoice_apply.toString(), data)
				.done(() => {
					dispatch({
						type: INVOICE_APPLY_SUCCESS
					})
				})
				.fail(()=> {
					dispatch({
						type: INVOICE_APPLY_FAIL
					})
				})
		/*return TEST({
			type: INVOICE_APPLY_SUCCESS
		})*/
	}
}

export const INVOICE_DEL = 'INVOICE_DEL';
export function invoiceDel(id){
	return dispatch => {
		return del(Url.invoice_del.toString(id), null)
				.done(() => {
					dispatch({
						type: INVOICE_DEL,
						id: id,
					})
				})
	}
}

export const INVOICE_EDIT_SUCCESS = 'INVOICE_EDIT_SUCCESS';
export const INVOICE_EDIT_ING = 'INVOICE_EDIT_ING';

export function invoiceEdit(invoiceId){
	return (dispatch, getState) => {
		var data = _getFormdata(getState);
		dispatch({
			type: INVOICE_EDIT_ING,
		})
		return put(Url.invoice_edit.toString(invoiceId), data)
				.done(() => {
					dispatch({
						type: INVOICE_EDIT_SUCCESS
					})
				})
	}
}

export const HANDLE_INVOICE_ING = 'HANDLE_INVOICE_ING';
export const HANDLE_INVOICE_SUCCESS = 'HANDLE_INVOICE_SUCCESS';
export const HANDLE_INVOICE_FAIL = 'HANDLE_INVOICE_FAIL';

export function handleInvoice(invoiceId, handleActionName){
	return dispatch => {
		dispatch({
			type: HANDLE_INVOICE_ING
		})
		return put(Url.invoice_edit.toString(invoiceId), {status: handleActionName})
				.done(() => {
					dispatch({
						handleActionName: handleActionName,
						invoiceId: invoiceId,
						type: HANDLE_INVOICE_SUCCESS,
					})
				})
				.fail(function(){
					dispatch({
						type: HANDLE_INVOICE_FAIL,
					})
				})
/*		return TEST({
			handleActionName: handleActionName,
			invoiceId: invoiceId,
		}, HANDLE_INVOICE_SUCCESS)(dispatch)*/
	}
}

export const GET_EXPRESS_COMPANY = 'GET_EXPRESS_COMPANY';
export function getExpressCompany(){
	/*return GET(Url.invoice_get_company.toString(), null ,GET_EXPRESS_COMPANY);*/
	return TEST({1: '中通快递', 2: '申通快递'}, GET_EXPRESS_COMPANY)
}

/*export const EDIT_DELIVERY = 'INVOICE_EDIT_DELIVERY';
export function editDelivery(invoiceId, express_type, express_no){
  return dispatch => {
    return put(Url.invoice_express_edit.toString(invoiceId), {express_type, express_no})
            .done( () => {
              dispatch({
                type: EDIT_DELIVERY,
                invoiceId,
                express_no,
              })
            })
  }
}*/


export const GOT_REGIONALISM_LETTER = 'GOT_REGIONALISM_LETTER';
export function gotRegionalismLetter(form_data){
	return (dispatch) => {
		return get(Url.regionalism_list.toString(),form_data )
				.done((data) => {
					dispatch({
						dataType: form_data.type,
						data: data,
						type: GOT_REGIONALISM_LETTER,
					})
				})
	}
}

export const RESET_FORM_CITIES = 'RESET_FORM_CITIES';
export function resetFormCities(){
	return{
		type: RESET_FORM_CITIES
	}
}

export const RESET_FORM_DISTRICTS = 'RESET_FORM_DISTRICTS';
export function resetFormDistricts(){
	return {
		type: RESET_FORM_DISTRICTS
	}
}

export const SUBMIT_EXPRESS_ING = 'SUBMIT_EXPRESS_ING';
export const SUBMIT_EXPRESS_SUCCESS = 'SUBMIT_EXPRESS_SUCCESS';
export const SUBMIT_EXPRESS_FAIL = 'SUBMIT_EXPRESS_FAIL';

export function submitExpress(invoiceId, express_no, express_type){
  return dispatch => {
    return put(Url.invoice_express_edit.toString(invoiceId), {express_type, express_no})
            .done( () => {
              dispatch({
                type: SUBMIT_EXPRESS_SUCCESS,
                invoiceId,
                express_no,
              })
            })
  }
}

export const ADD_REMARK = 'ADD_REMARK';
export function addRemark(invoiceId, remarks){
	return dispatch => {		
		return put(Url.add_invoice_remarks.toString(invoiceId), {remarks: remarks})
				.done( () => {
					dispatch({
						type: ADD_REMARK,
						remarks: remarks,
						invoiceId: invoiceId,
					})
				})
	}
/*	return {
		type: AddRemark,
	}*/
}

export const GET_ORDER_OPT_RECORD = 'GET_ORDER_OPT_RECORD';
export function getOrderOptRecord(order_id, data){
  return dispatch => {
    return get(Url.invoice_opt_history.toString(order_id), data)
      .done(function(jsonobj){
        dispatch({
          type: GET_ORDER_OPT_RECORD,
          data: jsonobj,
        })
      })
  }
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

/*function _post(url, data) {
  return new Promise(function(resolve, reject) {
    req.post(url)
      .send(data)
      .set('X-Requested-With', 'XMLHttpRequest')
      .end(_end_callback(resolve, reject));
  });
}*/

var m_post = function(url, params){
  return $.ajax({
    url: url,
    type: 'get',
    contentType: "application/json",
    data: JSON.stringify(params),
    dataType: "json",
    success: function(data){
      alert('成功'+data);
    },
    error: function(msg){
      alert('失败'+msg);
    }
  })
}

export const GET_DELIVERY_TRACE = 'GET_DELIVERY_TRACE';
export function getDeliveryTrace(express_no, express_type){
  return GET(Url.invoice_delivery_trace.toString(), {express_no, express_type}, GET_DELIVERY_TRACE);
/*  return TEST([
      {
        'acceptTime': '2016-09-22 13:25:31',
        'acceptStation': '深圳市横岗速递营销部已收件，（揽投员姓名：钟某某;联系电话：18000000000）',
      },
      {
        'acceptTime': '2016-09-22 13:25:31',
        'acceptStation': '深圳市横岗速递营销部已收件，（揽投员姓名：钟某某;联系电话：18000000000）',
      },
    ])*/
}

