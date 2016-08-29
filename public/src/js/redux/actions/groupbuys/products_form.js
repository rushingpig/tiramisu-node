import {post, GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { Noty, formCompile, Utils, clone } from 'utils/index';
import { getValues } from 'redux-form';

export const SERACH_PRODUCTS = 'SERACH_PRODUCTS';
export function searchProducts(query_data){
	return TEST({
		list:[
			{spu_id: 23423},
			{
				spu_id: 23456,
			}
		],
		total: 0,
		page_no: 0,
	})
}