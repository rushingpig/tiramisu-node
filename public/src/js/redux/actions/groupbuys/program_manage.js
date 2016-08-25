import {post, GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { Noty, formCompile, Utils, clone } from 'utils/index';
import { getValues } from 'redux-form';

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
					online_time: 'xxx',
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