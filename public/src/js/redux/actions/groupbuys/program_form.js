import {post, GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { Noty, formCompile, Utils, clone } from 'utils/index';
import { getValues } from 'redux-form';

import * as ProgramManageActions from './program_manage';
import * as OrderSupport from 'actions/order_support';
import * as ProductsManageFormActions from './products_form';

export const GOT_ORDER_SRCS = OrderSupport.GOT_ORDER_SRCS;
export const getOrderSrcs = OrderSupport.getOrderSrcs;



export const SEARCH_GROUPBUYS_PRODUCTS = 'SEARCH_GROUPBUYS_PRODUCTS';
export function searchGroupbuysProducts(query_data){

  return TEST({
    list: [
    	{
    		id: 1,
    		name: '卡通巧克力牌',
    		size: '约2磅',
    		src_name: '美团网',
    		category_name: '蛋糕配件',
    		price: 500,
            is_available: 1,
    	    is_online: 0,
        },
    	{
    		id: 2,
    		name: '卡通巧克力牌',
    		size: '约2磅',
    		src_name: '美团网',
    		category_name: '蛋糕配件',
    		price: 500,
            is_available: 0,
            is_online: 1,
    	},   	
    ],
    total: 8
  }, SEARCH_GROUPBUYS_PRODUCTS);
}

export const SELECT_PRODUCT = 'SELECT_PRODUCT';
export function selectProduct(sku_info){
  return {
    type: SELECT_PRODUCT,
    data: sku_info
  }
}

export const DELETE_SELECT_PRODUCT = 'DELETE_SELECT_PRODUCT';
export function deleteProduct(id){
    return {
        type: DELETE_SELECT_PRODUCT,
        id: id
    }
}

export const CHANGE_ONLINE_TIME = 'CHANGE_ONLINE_TIME';
export function changeOnlineTime(beginTime, endTime){
    return {
        type: CHANGE_ONLINE_TIME,
        beginTime,
        endTime,
    }
}

export const GET_GROUPBUY_PROGRAM_DETAIL = 'GET_GROUPBUY_PROGRAM_DETAIL';
export function getGroupbuyProgramDetail(id){
    return TEST({
        name: '幸福盒子一号',
        src_id: 39,
        src_name: '美团网',
        city_name: '深圳市',
        regionalism_id: '1234',
        province_name: '广东省',
        province_id: '440000',
        start_time: '2016-08-29 14:57:07',
        end_time: '2016-09-29 14:57:07',
        products: [
            {id: 1, name: '芒果茫茫', size: '约2磅', is_online: 1, product_name: '慕斯蛋糕', price: 16800,},
            {id: 2, name: '榴莲香雪', size: '约2磅', is_online: 0, product_name: '下午茶', price: 16800},
        ],
        url: 'http: //baidu.com',
    }, GET_GROUPBUY_PROGRAM_DETAIL) 
}

export const RESET_GROUPBUY_PROGRAM = 'RESET_GROUPBUY_PROGRAM';
export function resetGroupbuyProgram(){
    return {
        type : RESET_GROUPBUY_PROGRAM,
    }
}

export const CANCEL_SELECT_PRODUCT = 'CANCEL_SELECT_PRODUCT';
export function cancelSelectProduct(){
    return {
        type: CANCEL_SELECT_PRODUCT,
    }
}

export const GOT_CATEGORIES = ProductsManageFormActions.GOT_CATEGORIES;
export const getCategories = ProductsManageFormActions.getCategories;

export const GOT_SEC_CATEGORIES = ProductsManageFormActions.GOT_SEC_CATEGORIES;
export const getSecCategories = ProductsManageFormActions.getSecCategories;





