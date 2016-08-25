import {post, GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { Noty, formCompile, Utils, clone } from 'utils/index';
import { getValues } from 'redux-form';

export const SEARCH_GROUPBUYS_PRODUCTS = 'SEARCH_GROUPBUYS_PRODUCTS';
export function searchGroupbuysProducts(query_data){

  return TEST({
    list: [
    	{
    		product_id: 1,
    		name: '卡通巧克力牌',
    		size: '约2磅',
    		src_name: '美团网',
    		category_name: '蛋糕配件',
    		price: 500,
    	},
    	{
    		product_id: 2,
    		name: '卡通巧克力牌',
    		size: '约2磅',
    		src_name: '美团网',
    		category_name: '蛋糕配件',
    		price: 500,
    	},    	
    ],
    total: 2
  }, SEARCH_GROUPBUYS_PRODUCTS);
}

export const SELECT_PRODUCT = 'SELECT_PRODUCT';
export function selectProduct(sku_info){
  return {
    type: SELECT_PRODUCT,
    data: sku_info
  }
}