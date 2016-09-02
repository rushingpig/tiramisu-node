import {post, get, put, del,GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { Noty, formCompile, Utils, clone } from 'utils/index';
import { getValues } from 'redux-form';
import * as OrderSupport from 'actions/order_support';
import * as OrderProducts from 'actions/order_products';
import * as ProductsManageFormActions from './program_form';

export const GOT_CATEGORIES = OrderProducts.GOT_CATEGORIES;
export const getCategories = OrderProducts.getCategories;

export const GOT_SEC_CATEGORIES = ProductsManageFormActions.GOT_SEC_CATEGORIES;
export const getSecCategories =  ProductsManageFormActions.getSecCategories;

export const GOT_ORDER_SRCS = OrderSupport.GOT_ORDER_SRCS;
export const getOrderSrcs = OrderSupport.getOrderSrcs;


export const GET_PRODUCT_LIST = 'GET_PRODUCT_LIST';
export function getProductList(query_data){
	return (dispatch, getState) => {
		var filter_data = getValues(getState().form.groupbuys_products_filter);
		filter_data = formCompile(filter_data);
		return get(Url.get_groupbuy_sku_list.toString(), {...query_data, ...filter_data })
			.done( (data) => {
				dispatch({
					data: data,
					type: GET_PRODUCT_LIST,
				})
			})
		
		/*return TEST({
			list: [
				{
					sku_id: 234545,
					spu_id: 234555,
					name: '芒果茫茫',
					size: '2磅',
					price: '15000',
					src_name: '美团网',
					project_name: '幸福盒子二号',
					category_name: '大蛋糕',
					city: '深圳',
					province: '广东省',
					is_online: 1
				},
				{
					sku_id: 234546,
					spu_id: 234555,
					name: '芒果茫茫',
					size: '2磅',
					price: '15000',
					src_name: '美团网',
					category_name: '大蛋糕',
					city: '深圳',
					province: '广东省',
					is_online: 1
				}
			],
			total: 9,
			page_no: 0,
		}, GET_PRODUCT_LIST)(dispatch)*/
	}
}

export const EDIT_SKU_PRICE = 'EDIT_SKU_PRICE';
export function editSkuPrice(sku_id, price){
	return dispatch => {
		return put(Url.edit_groupbuy_pd.toString(sku_id), {price: price})
				.done( () => {
					dispatch({
						type: 'EDIT_SKU_PRICE',
						price: price,
						sku_id: sku_id,
					})
				})
	}
}

export const OFF_SHELF = 'OFF_SHELF';
export function offShelf(sku_id){
	return dispatch => {
		return del(Url.groupbuy_sku_off_shelf.toString(sku_id), null)
			.done( () => {
				dispatch({
					type: OFF_SHELF,
				})
			})
	}
}