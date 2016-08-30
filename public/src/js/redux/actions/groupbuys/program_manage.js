import {post, GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { Noty, formCompile, Utils, clone } from 'utils/index';
import { getValues } from 'redux-form';
import * as OrderSupport from 'actions/order_support';

export const GOT_ORDER_SRCS = OrderSupport.GOT_ORDER_SRCS;
export const getOrderSrcs = OrderSupport.getOrderSrcs;

export const GET_GROUPBUY_PROGRAM_LIST = 'GET_GROUPBUY_PROGRAM_LIST';
export function getGroupbuyProgramList(form_data){
	return (dispatch, getState) => {
		var filter_data = getValues(getState().form.groupbuys_program_filter);
		filter_data = formCompile(filter_data);

		return TEST({
			list: [
				{
					id: 1,
					name: '芒果茫茫',
					src_name: '美团网',
					start_time: '2016-08-29 14:57:07',
					end_time: '2016-08-29 14:57:07',
					province: '广东省',
					city: '深圳市',
					url: 'http://baidu.com',

				},
			],
			total: 1,
			page_no: 0,
		}, GET_GROUPBUY_PROGRAM_LIST)(dispatch);
	}	
}

export const GET_GROUPBUY_PROGRAM_DETAIL = 'GET_GROUPBUY_PROGRAM_DETAIL';
export function getGroupbuyProgramDetail(id){
	return TEST({
		name: '幸福盒子一号',
		src_id: 39,
		src_name: '美团网',
		city_name: '深圳市',
		province_name: '广东省',
		province_id: '440000',
		start_time: '2016-08-29 14:57:07',
		end_time: '2016-08-29 14:57:07',
		products: [
			{id: 1, name: '芒果茫茫', size: '约2磅', is_online: 1, product_name: '慕斯蛋糕', price: 16800,},
			{id: 2, name: '榴莲香雪', size: '约2磅', is_online: 0, product_name: '下午茶', price: 16800},
		],
		url: 'http: //baidu.com',
	}, GET_GROUPBUY_PROGRAM_DETAIL)	
}



