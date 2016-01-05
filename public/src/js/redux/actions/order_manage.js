import { GET, TEST } from 'utils/request'; //Promise
import Url from 'config/url';


export const START_DATE_CHANGE = 'START_DATE_CHANGE';
export const DISTRIBUTE_DATE_CHANGE = 'DISTRIBUTE_DATE_CHANGE';

export function startDateChange(date){
  return {
    type: START_DATE_CHANGE,
    date
  }
}

export function deliveryDateChange(date){
  return {
    type: DISTRIBUTE_DATE_CHANGE,
    date
  }
}

export const GET_ORDER_LIST = 'GET_ORDER_LIST';
export function getOrderList(data){
  return GET(Url.orders.toString(), data, GET_ORDER_LIST);
  // return TEST({
  //   total: 1,
  //   list: [{
  //     'cancel_reason':  '取消理由xxxx',    
  //     'city':  '城市xxx',    
  //     'created_by':  '创建人xx',   
  //     'created_time':  '下单时间xx',  
  //     'delivery_name': '配送站名称xx',   
  //     'delivery_time': '配送时间xx',    
  //     'delivery_type': '配送方式xx',    
  //     'discount_price':  '实际售价xx',    
  //     'is_deal': '0',    
  //     'is_submit': '1',    
  //     'merchant_id': '22222',   
  //     'order_id':  '11111',   
  //     'original_price':  '4444',    
  //     'owner_mobile':  '下单人手机xx',   
  //     'owner_name':  '下单人姓名xx',   
  //     'pay_status':  'PAYED',    
  //     'recipient_address': '收货人地址xxxx',   
  //     'recipient_mobile':  '收货人手机xxx',   
  //     'recipient_name':  '收货人姓名xxx',   
  //     'remarks': '备注xxxx',    
  //     'src_name':  '订单来源xxx',    
  //     'status':  '订单状态xxx',    
  //     'updated_by':  '最后操作人xxx',   
  //     'updated_date':  '最后操作时间eeee',
  //   }]
  // }, GET_ORDER_LIST);
}

export const CHECK_ORDER = 'CHECK_ORDER';
export const GET_ORDER_DETAIL_PRODUCTS = 'GET_ORDER_DETAIL_PRODUCTS';
export function checkOrder(id){
  return dispatch => {
    dispatch({
      type: CHECK_ORDER,
      selected_order_id: id
    })
    return GET(Url.order_detail.toString(id), null, GET_ORDER_DETAIL_PRODUCTS)(dispatch);
  }
  // return TEST({
  //   'city_id': '市IDXX',
  //   'city_name': '市名称XX',
  //   'delivery_id': '配送站IDXX',
  //   'delivery_name': '配送站名称XX',
  //   'delivery_time': '配送时间XX',
  //   'delivery_type': '配送方式XX',
  //   'district_id': '行政区IDXX',
  //   'district_name': '行政区名称XX',
  //   'owner_mobile':  '下单人手机XX',
  //   'owner_name':  '下单人姓名XX',
  //   'pay_modes_id':  '支付方式IDXX',
  //   'pay_name':  '支付方式名称XX',
  //   'products': [{
  //     'choco_board':  '巧克力牌xx',    
  //     'custom_desc': '自定义描述xx',   
  //     'custom_name': '自定义名称xx',   
  //     'discount_price':  '实际售价xx',    
  //     'greeting_card': '祝福卡xx',   
  //     'num': '产品数量xx',    
  //     'original_price':  '产品原价xx',    
  //     'product_name':  '产品名称xx',
  //   }]
  //   //...
  // }, GET_ORDER_DETAIL_PRODUCTS);
}