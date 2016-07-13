import {post, GET, POST, PUT, TEST,del,get,put} from 'utils/request'; //Promise
import Url from 'config/url';
import { getValues } from 'redux-form';
import Utils from 'utils/index';
import {Noty} from 'utils/index';

export const ACTIVE_ORDER = 'ACTIVE_ORDER';  // 激活订单，用于查阅该订单详情
export const GET_ORDER_DETAIL_PRODUCTS = 'GET_ORDER_DETAIL_PRODUCTS';
export function activeOrder(id){
	/*return GET(Url.order_detail.toString(id), null, GET_ORDER_DETAIL_PRODUCTS);*/
  return dispatch => {
    dispatch({
      type: ACTIVE_ORDER,
      active_order_id: id
    })
    return GET(Url.order_detail.toString(id), null, GET_ORDER_DETAIL_PRODUCTS)(dispatch);
  }
  /*return TEST({
    'city_id': '市IDXX',
    'city_name': '市名称XX',
    'delivery_id': '配送站IDXX',
    'delivery_name': '配送站名称XX',
    'delivery_time': '配送时间XX',
    'delivery_type': '配送方式XX',
    'district_id': '行政区IDXX',
    'district_name': '行政区名称XX',
    'owner_mobile':  '下单人手机XX',
    'owner_name':  '下单人姓名XX',
    'pay_modes_id':  '支付方式IDXX',
    'pay_name':  '支付方式名称XX',
    'products': [{
      'choco_board':  '巧克力牌xx',    
      'custom_desc': '自定义描述xx',   
      'custom_name': '自定义名称xx',   
      'discount_price':  '实际售价xx',    
      'greeting_card': '祝福卡xx',   
      'num': '产品数量xx',    
      'original_price':  '产品原价xx',    
      'product_name':  '产品名称xx',
    }]
    //...
  }, GET_ORDER_DETAIL_PRODUCTS);*/
}

export const GET_REFUND_LIST = 'GET_REFUND_LIST';
export function getRefundList(filter_data){
	return TEST({
		list:[
			{status: 'UNAUDIT', updated_time: "2016-07-11 15:59:21", order_id: "2016071111224370"},
			{status: 'AUDITED', updated_time: "2016-07-11 15:59:21", order_id: "2016071111224369"},
			{status: 'REFUNDED',updated_time: "2016-07-11 15:59:21", order_id: "2016071111224368"},
			{status: 'REFUNDCANCEL', updated_time: "2016-07-11 15:59:21", order_id: "2016071111224367"}
		],
		total:4,
	},
	GET_REFUND_LIST)
}