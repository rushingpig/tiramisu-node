import {post, GET, POST, TEST } from '../utils/request'; //Promise
import Url from '../config/url';

export const GOT_CATEGORIES = 'GOT_CATEGORIES';
export function getCategories(){
  // return GET(Url.categories.toString(), null, GOT_CATEGORIES);
  return TEST({1: '11111', 2: '2222'}, GOT_CATEGORIES);
}

export const SEARCH_PRODUCTS = 'SEARCH_PRODUCTS';
export function searchProducts(query_data){
  return GET(Url.products.toString(), query_data, SEARCH_PRODUCTS);
}