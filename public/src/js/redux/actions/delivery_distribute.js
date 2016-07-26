import { put, PUT, TEST, POST, GET} from 'utils/request'; //Promise
import Url from 'config/url';
import { getDeliveryStations as _getDeliveryStations } from 'actions/order_manage_form';
import { getValues } from 'redux-form';
import Utils from 'utils/index';
import { ACCESSORY_CATE_ID } from 'config/app.config';
import { triggerFormUpdate } from 'actions/form';

export const SIGN_ORDER = 'SIGN_ORDER'; //key: 0->正在处理，1->成功，2->失败
export function signOrder(order_id, data) {
  //若是异步的话，那么该函数必须也返回一个函数
  return PUT(Url.order_sign.toString(order_id), data, SIGN_ORDER);
  // return TEST(null, [
  //   {type: SIGN_ORDER, key: 0},  //立即派发
  //   {type: SIGN_ORDER, key: 1}   //2000毫秒后派发
  // ], 2000, true);
}

export const UNSIGN_ORDER = 'UNSIGN_ORDER'; //key: 0->正在处理，1->成功，2->失败
export function unsignOrder(order_id, data) {
  //若是异步的话，那么该函数必须也返回一个函数
  return PUT(Url.order_unsign.toString(order_id), data, UNSIGN_ORDER);
  // return TEST(null, [
  //   {type: UNSIGN_ORDER, key: 0},  //立即派发
  //   {type: UNSIGN_ORDER, key: 1}   //2000毫秒后派发
  // ], 2000, true);
}

export const GET_DISTRIBUTE_SCAN_LIST = 'GET_DISTRIBUTE_SCAN_LIST';
export function searchByScan(order_ids){
  return dispatch => {
    dispatch( triggerFormUpdate('order_distribute_filter', 'order_ids', order_ids) );
    return POST(Url.order_distribute.toString(), {order_ids}, GET_DISTRIBUTE_SCAN_LIST)(dispatch);
  }
}

export const getDeliveryStations = _getDeliveryStations;

export function exportExcel(){
  return (dispatch, getState) => {
    var data = getValues( getState().form.order_distribute_filter ) || {};
    if(!data.begin_time && !data.end_time){
      Utils.Noty('warning', '请选定时间');return;
    }
    window.open(Url.orders_export + '?' + Utils.url.toParams({...data, entrance: 'RECEIVE_LIST'}));
  }
}

export const GET_SPARE_PARTS = 'GET_SPARE_PARTS';  //获取蛋糕配件
export function getSpareparts(orderId){
    return GET( Url.accessory_list.toString(orderId), null , GET_SPARE_PARTS );   
    /*return GET( Url.products.toString(), {category_id: ACCESSORY_CATE_ID}, GET_SPARE_PARTS);*/
/*    return TEST([
    {id: 1, name: '餐具套餐', icon: '', children:[],price:'4' },
    {id: 2, name: '蛋糕帽', icon: '', children:[],price:'5' },
    {id: 3, name: '数字牌', icon: '', children:[],price:'3' },
    {id: 4, name: '卡通巧克力牌', icon: '', price:'6',children:[
      {id:5,name: 'HelloKitty', icon:'',price:'6'},
      {id:6, name: 'Snake', icon:'',price:'5'}
    ]},
  ], GET_SPARE_PARTS);*/
}

export const GET_ORDER_SPARE_PARTS = 'GET_ORDER_SPARE_PARTS';
export function getOrderSpareparts(orderId){
  /*return GET( Url.order_accessory_list.toString(orderId), null, GET_ORDER_SPARE_PARTS );*/
  return TEST([{
    id: 1,
    name: '餐具套餐',
    price: '4',
    sub: '',
    num: 3,
    remark: '',
  }, {
    id: 2,
    name: '蛋糕帽',
    price: '5',
    sub:'',
    num: 2,
    remark:'',
  }], GET_ORDER_SPARE_PARTS);
}

export const GET_DELIVERYMAN_AT_SAME_STATION = 'GET_DELIVERYMAN_AT_SAME_STATION';
export function getDeliverymanAtSameStation(orderId){
  return GET(Url.order_deliverymans.toString(orderId),null,GET_DELIVERYMAN_AT_SAME_STATION);
/*  return TEST({
    current_id:2,
    list:[
      {
        deliveryman_id:1, 
        deliveryman_name:'张三', 
        deliveryman_mobile:'18118776535',
      },
      {
        deliveryman_id:2,
        deliveryman_name:'郭林',
        deliveryman_mobile:'13600177900',
      }],
  },GET_DELIVERYMAN_AT_SAME_STATION);*/
}

export const GET_ORDER_DETAIL = 'GET_ORDER_DETAIL';
export function getOrderDetail(orderId) {
  return GET( Url.order_detail.toString(orderId), null ,GET_ORDER_DETAIL );
}

export const EDIT_SIGNED_ORDER = 'EDIT_SIGNED_ORDER';
export function editSignedOrder(orderId, form_data){
  return POST( Url.order_sign_edit.toString(orderId), {...form_data} , EDIT_SIGNED_ORDER)
}













