import {post, get, put, del,GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { Noty, formCompile, Utils, clone } from 'utils/index';
import { getValues } from 'redux-form';

export const GET_COMPANY_LIST  =  'GET_COMPANY_LIST';
export function getCompanyList(filterdata){
	return TEST({
		list: [
			{
				id: 1,
				name: '腾讯',
				tel: '075519887',
				code: '678956789000',
				add: '',
				status: 'REVIEWED',
				img_1: 'o_1aq9fsnp4sof1qf51a7g1lqjimc.jpg',
				img_2: 'o_1aq9fsnp4sof1qf51a7g1lqjimc.jpg',
				img_3: 'o_1aq9fsnp4sof1qf51a7g1lqjimc.jpg',
				img_4: 'o_1aq9fsnp4sof1qf51a7g1lqjimc.jpg',
				created_by: '员工A',
				created_time: "2016-08-17 11:29:17",
				updated_by: '超级管理员',
				updated_time: '2016-08-17 11:29:17',
			},
			{
				id: 2,
				name: '阿里',
				tel: '075519887',
				code: '678956789000',
				add: '',
				status: 'UNREVIEWED',
				img_2: 'o_1aq9i6roi5081drb1pri1o7715huc.png',
				order_id: '123456789',
			},
		],
		total: 4,
	}, GET_COMPANY_LIST)
}

export const CREATE_COMPANY_ING = 'CREATE_COMPANY_ING';
export const CREATE_COMPANY_SUCCESS = 'CREATE_COMPANY_SUCCESS';
export const CREATE_COMPANY_FAIL = 'CREATE_COMPANY_FAIL';

export function createCompany(form_data){
	return (dispatch, getState) => {
		var data = _getFormdata(getState);
		dispatch({
			type: CREATE_COMPANY_ING,
		})

		return TEST({
			type: CREATE_COMPANY_SUCCESS
		})
	}
}

export const EDIT_COMPANY_ING = 'EDIT_COMPANY_ING';
export const EDIT_COMPANY_SUCCESS = 'EDIT_COMPANY_SUCCESS';

export function editCompany(id, form_data){
	return (dispatch, getState) => {
		var data = _getFormdata(getState);
		dispatch({
			type: EDIT_COMPANY_ING,
		})

		return TEST({
			type: EDIT_COMPANY_SUCCESS
		})
	}	
}

function _getFormdata(getState){
	var company_data = getValues(getState().form.company_info);
	if(company_data){
		return company_data;
	}
}

export const VIEW_IMG = 'VIEW_IMG';
export function viewImg(img){
	return {
		type: VIEW_IMG,
		data: img
	}
}

export const GET_COMPANY_OPT_RECORD = 'GET_COMPANY_OPT_RECORD';
export function getCompanyOptRecord(id, data){
/*  return dispatch => {
    return get(Url.order_opt_record.toString(order_id), data)
      .done(function(jsonobj){
        dispatch({
          type: GET_COMPANY_OPT_RECORD,
          data: jsonobj,
        })
      })
  }*/
  return {
    type: GET_COMPANY_OPT_RECORD,
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
  }
}

export const GET_COMPANY_INVOICE_RECORD = 'GET_COMPANY_INVOICE_RECORD';
export function getCompanyInvoiceRecord(id, data){
	  return {
	    type: GET_COMPANY_INVOICE_RECORD,
	    data: {
	      "total": 12,
	 	  'list': [
	 	  	{
	 	  		'created_by': 'admin',
	 	  		'created_time': '2016-01-15 13:06:28',
	 	  		'amount': '2500',
	 	  		'status': 'DELIVERY',
	 	  	},
	 	  	{
	 	  		'created_by': 'admin',
	 	  		'created_time': '2016-01-15 13:06:28',
	 	  		'amount': '2500',
	 	  		'status': 'DELIVERY',
	 	  	},
	 	  	{
	 	  		'created_by': 'admin',
	 	  		'created_time': '2016-01-15 13:06:28',
	 	  		'amount': '2500',
	 	  		'status': 'DELIVERY',
	 	  	},
	 	  	{
	 	  		'created_by': 'admin',
	 	  		'created_time': '2016-01-15 13:06:28',
	 	  		'amount': '2500',
	 	  		'status': 'DELIVERY',
	 	  	},
	 	  	{
	 	  		'created_by': 'admin',
	 	  		'created_time': '2016-01-15 13:06:28',
	 	  		'amount': '2500',
	 	  		'status': 'DELIVERY',
	 	  	},
	 	  	{
	 	  		'created_by': 'admin',
	 	  		'created_time': '2016-01-15 13:06:28',
	 	  		'amount': '2500',
	 	  		'status': 'DELIVERY',
	 	  	},
	 	  	{
	 	  		'created_by': 'admin',
	 	  		'created_time': '2016-01-15 13:06:28',
	 	  		'amount': '2500',
	 	  		'status': 'DELIVERY',
	 	  	},
	 	  ],
	      "page_no": "0",
	      "page_size": "8"
	    }
	}	
}

export const RESET_COMPANY_OPT_RECORD = 'RESET_COMPANY_OPT_RECORD'; //先重置历史数据
export function resetCompanyOptRecord(){
  return {
    type: RESET_COMPANY_OPT_RECORD,
  }
}

export const RESET_COMPANY_INVOICE_RECORD = 'RESET_COMPANY_INVOICE_RECORD';
export function resetCompanyInvoiceRecord(){
	return {
		type: RESET_COMPANY_INVOICE_RECORD,
	}
}

export const ACTIVE_COMPANY = 'ACTIVE_COMPANY';
export function activeCompany(id){
	return {
		id: id,
		type: ACTIVE_COMPANY,
	}
}

export const REVIEW_COMPANY_INFO = 'REVIEW_COMPANY_INFO';
export function reviewCompanyInfo(id){
	return dispatch => {
		return put(Url.company_review.toString(id), null)
			.done(() => {
				dispatch({
					type: REVIEW_COMPANY_INFO,
					id: id,
				})
			})
	}	
}

export const COMPANY_DEL = 'COMPANY_DEL';
export function companyDel(id) {
	return dispatch => {
		return del(Url.company_del.toString(id), null)
			.done(() => {
				dispatch({
					type: COMPANY_DEL,
					id: id,
				})
			})
	}
}