import {post, get, GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { Noty, formCompile, Utils, clone } from 'utils/index';
import { getValues } from 'redux-form';
import * as OrderSupport from 'actions/order_support';
import * as ProgramManageFormActions from './program_form';

export const GOT_ORDER_SRCS = OrderSupport.GOT_ORDER_SRCS;
export const getOrderSrcs = OrderSupport.getOrderSrcs;

export const GET_GROUPBUY_PROGRAM_LIST = 'GET_GROUPBUY_PROGRAM_LIST';
export function getGroupbuyProgramList(form_data){
	return (dispatch, getState) => {
		var filter_data = getValues(getState().form.groupbuys_program_filter);
		filter_data = formCompile(filter_data);
		return get(Url.get_program_list.toString(), {...filter_data, ...form_data})
			.done( (data) => {
				dispatch({
					type: GET_GROUPBUY_PROGRAM_LIST,
					data: data,
				})
			})
		/*return TEST({
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
		}, GET_GROUPBUY_PROGRAM_LIST)(dispatch);*/
	}	
}

export const GET_GROUPBUY_PROGRAM_DETAIL = ProgramManageFormActions.GET_GROUPBUY_PROGRAM_DETAIL;
export const getGroupbuyProgramDetail = ProgramManageFormActions.getGroupbuyProgramDetail;

export const RESET_GROUPBUY_PROGRAM = ProgramManageFormActions.RESET_GROUPBUY_PROGRAM;
export const resetGroupbuyProgram = ProgramManageFormActions.resetGroupbuyProgram;



