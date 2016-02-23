import {post, GET, POST, TEST } from 'utils/request'; //Promise
import Url from 'config/url';

export const GOT_CATEGORIES = 'GOT_CATEGORIES';
export function getCategories(){
  return GET(Url.categories.toString(), null, GOT_CATEGORIES);
  // return TEST({1: '11111', 2: '2222'}, GOT_CATEGORIES);
}

export const SEARCH_PRODUCTS = 'SEARCH_PRODUCTS';
export function searchProducts(query_data){
  return GET(Url.products.toString(), query_data, SEARCH_PRODUCTS);
/*
  return TEST({
    list: [
      {
        product_id: 1,
        name: "zhang",
        size: "zhang1",
        category_name: "类型1",
        original_price: 20000,

        skus: [{
          sku_id: 22,
          website: "website2",
          discount_price: 18000,
          is_local_site: "0",
          is_delivery: "1",
        }, {
          sku_id: 23,
          website: "website2",
          discount_price: 19000,
          is_local_site: "1",
          is_delivery: "0",
        }]
      },
      {
        product_id: 2,
        name: "li",
        size: "li3",
        category_name: "类型3",
        original_price: 20000,
        
        skus: [{
          sku_id: 24,
          website: "website3",
          discount_price: 30000,
          is_local_site: "1",
          is_delivery: "1",
        }]
      }
    ],
    total: 2
  }, SEARCH_PRODUCTS);
*/
}

export const SELECT_PRODUCT = 'SELECT_PRODUCT';
export function selectProduct(sku_info){
  return {
    type: SELECT_PRODUCT,
    data: sku_info
  }
}

export const CHANGE_PRODUCT_NUM = 'CHANGE_PRODUCT_NUM';
export function changeProductNum(sku_id, num){
  return {
    type: CHANGE_PRODUCT_NUM,
    sku_id,
    num
  }
}

export const DELETE_SELECTED_PRODUCT = 'DELETE_SELECTED_PRODUCT';
export function deleteProduct(sku_info){
  return {
    type: DELETE_SELECTED_PRODUCT,
    data: sku_info
  }
}

export const CONFIRM_ALL_SELECTED_PRODUCTS = 'CONFIRM_ALL_SELECTED_PRODUCTS';
export function confirmAllSelectedProducts(){
  return {
    type: CONFIRM_ALL_SELECTED_PRODUCTS,
  }
}

export const CANCEL_ALL_SELECTED_PRODUCTS = 'CANCEL_ALL_SELECTED_PRODUCTS';
export function cancelAllSelectedProducts(){
  return {
    type: CANCEL_ALL_SELECTED_PRODUCTS
  }
}

export const DELETE_CONFIRM_PRODUCT = 'DELETE_CONFIRM_PRODUCT';
export function deleteConfirmProduct(sku_info){
  return {
    type: DELETE_CONFIRM_PRODUCT,
    data: sku_info
  }
}

//
export const CONFIRM_PRODUCT_ATTR_CHANGE = 'CONFIRM_PRODUCT_ATTR_CHANGE';
export function productAttrChange(data){
  return {
    type: CONFIRM_PRODUCT_ATTR_CHANGE,
    data
  }
}

export const UPDATE_CONFIRM_PRODUCT_DISCOUNT_PRICE = 'UPDATE_CONFIRM_PRODUCT_DISCOUNT_PRICE';
export function updateConfirmProductDiscountPrice(){
  return {
    type: UPDATE_CONFIRM_PRODUCT_DISCOUNT_PRICE
  }
}