import {post, del, get, GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { Noty, formCompile, Utils, clone } from 'utils/index';
import { getValues } from 'redux-form';
import * as OrderSupport from 'actions/order_support';

export const GOT_ORDER_SRCS = OrderSupport.GOT_ORDER_SRCS;
export const getOrderSrcs = OrderSupport.getOrderSrcs;

export const GET_COUPON_ORDER_LIST = 'GET_COUPON_ORDER_LIST';
export function getCouponOrderList(data){
	 return (dispatch, getState) => {
    var filter_data = getValues(getState().form.groupbuys_coupon_filter);
    filter_data = formCompile(filter_data);
    return GET(Url.orders.toString() + '?v=' + new Date().getTime(), {...data, ...filter_data}, GET_COUPON_ORDER_LIST)(dispatch)
  }
}



