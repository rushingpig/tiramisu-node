import {post, get, GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { Noty, formCompile, Utils, clone } from 'utils/index';
import { getValues } from 'redux-form';
import { getGlobalStore, getGlobalState } from 'stores/getter';

import * as OrderSupport from 'actions/order_support';
import * as OrderProducts from 'actions/order_products';

export const GOT_ORDER_SRCS = OrderSupport.GOT_ORDER_SRCS;
export const getOrderSrcs = OrderSupport.getOrderSrcs;

export const SERACH_PRODUCTS = 'SERACH_PRODUCTS';
export function searchProducts(query_data){
	/*return GET(Url.)*/
	return GET(Url.get_product_spu_list.toString(), query_data, SERACH_PRODUCTS);
	/*return TEST({
		list:[
			{spu_id: 23423, name: '卡通巧克力牌', is_online: 1, category_name: '慕斯蛋糕', category_parent_name:'蛋糕', is_available: 1,
				sku_list: [
					{size: '2磅', price: 18000},
					{size: '3磅', price: 16000},
				]
			},
			{spu_id: 23424, name: '卡通巧克力牌', is_online: 1, category_name: '慕斯蛋糕', category_parent_name:'蛋糕', is_available: 0},			
		],
		total: 2,
		page_no: 0,
	}, SERACH_PRODUCTS)*/
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

export const SELECT_PRODUCT_SPU = 'SELECT_PRODUCT';
export function selectProduct(spu_info){
	/*return dispatch => {
		return TEST({

		}, SELECT_PRODUCT);
	}*/
  return {
    type: SELECT_PRODUCT_SPU,
    data: spu_info,
  }
}

export const DEL_SELECT_PRODUCT = 'DEL_SELECT_PRODUCT';
export function delSelectProduct(){
	return {
		type: DEL_SELECT_PRODUCT,
	}
}

export const RESET_SPU_INFO = 'RESET_SPU_INFO';
export function resetProduct(){
	return {
		type: RESET_SPU_INFO,
	}
}

export const GET_ALL_SIZE = 'GET_ALL_SIZE';
export function getAllSize(){
	return GET(Url.sku_size.toString(), null, GET_ALL_SIZE);
}

export const ADD_SIZE = 'ADD_SIZE';
export function addSize(size, price){
	return {
		type: ADD_SIZE,
		size: size,
		price: price * 100,
	}
}

export const DEL_SIZE = 'DEL_SIZE';
export function delSize(index){
	return {
		type: DEL_SIZE,
		index: index,
	}
}

export const CREATE_GROUPBUY_SKU_ING = 'CREATE_GROUPBUY_SKU_ING';
export const CREATE_GROUPBUY_SKU_SUCCESS = 'CREATE_GROUPBUY_SKU_SUCCESS';
export const CREATE_GROUPBUY_SKU_FAIL = 'CREATE_GROUPBUY_SKU_FAIL';

export function createGroupbuySKU(data){
	return (dispatch, getState) => {
		var sku_list = getState().groupbuysProductsFormManage.main.spu_sku_list;
		sku_list = sku_list.filter( m => m.is_new)
		dispatch({
			type: CREATE_GROUPBUY_SKU_ING,
		})
		data.products = sku_list;
		return post(Url.add_groupbuys_sku.toString(), data)
			.done(() => {
				dispatch({
					type: CREATE_GROUPBUY_SKU_SUCCESS,
				})
			})
			.fail(() => {
				dispatch({
					type: CREATE_GROUPBUY_SKU_FAIL,
				})
			})
	}
}
