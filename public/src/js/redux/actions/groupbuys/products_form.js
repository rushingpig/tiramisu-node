import {post, GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { Noty, formCompile, Utils, clone } from 'utils/index';
import { getValues } from 'redux-form';

import * as OrderSupport from 'actions/order_support';
import * as OrderProducts from 'actions/order_products';

export const GOT_ORDER_SRCS = OrderSupport.GOT_ORDER_SRCS;
export const getOrderSrcs = OrderSupport.getOrderSrcs;

export const SERACH_PRODUCTS = 'SERACH_PRODUCTS';
export function searchProducts(query_data){
	return TEST({
		list:[
			{spu_id: 23423},
			{
				spu_id: 23456,
			}
		],
		total: 2,
		page_no: 0,
	}, SERACH_PRODUCTS)
}

export const GOT_CATEGORIES = OrderProducts.GOT_CATEGORIES;
export const getCategories = OrderProducts.getCategories;

export const GOT_SEC_CATEGORIES = 'GOT_SEC_CATEGORIES';
export function getSecCategories(id){
	return {
		type: GOT_SEC_CATEGORIES,
		id: id,
	}
}

export const SELECT_PRODUCT = 'SELECT_PRODUCT';
export function selectProduct(spu_info){
  return {
    type: SELECT_PRODUCT,
    data: spu_info
  }
}