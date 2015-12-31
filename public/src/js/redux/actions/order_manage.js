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
export function getOrderList(){
  // return GET(Url.orders.toString(), null, GET_ORDER_LIST);
  return TEST({
    total: 1,
    list: [{
      'cancel_reason':  '取消理由xxxx',    
      'city':  '城市xxx',    
      'created_by':  '创建人xx',   
      'created_date':  '下单时间xx',  
      'delivery_name': '配送站名称xx',   
      'delivery_time': '配送时间xx',    
      'delivery_type': '配送方式xx',    
      'discount_price':  '实际售价xx',    
      'is_deal': '0',    
      'is_submit': '1',    
      'merchant_id': '22222',   
      'order_id':  '11111',   
      'original_price':  '4444',    
      'owner_mobile':  '下单人手机xx',   
      'owner_name':  '下单人姓名xx',   
      'pay_status':  'PAYED',    
      'recipient_address': '收货人地址xxxx',   
      'recipient_mobile':  '收货人手机xxx',   
      'recipient_name':  '收货人姓名xxx',   
      'remarks': '备注xxxx',    
      'src_name':  '订单来源xxx',    
      'status':  '订单状态xxx',    
      'updated_by':  '最后操作人xxx',   
      'updated_date':  '最后操作时间eeee',
    }]
  }, GET_ORDER_LIST);
}