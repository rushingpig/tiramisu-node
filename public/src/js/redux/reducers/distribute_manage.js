import { dateFormat, map } from 'utils/index';
import { combineReducers } from 'redux';
import { REQUEST, order_status, ACCESSORY_CATE_ID } from 'config/app.config';
import { orders, operationRecord } from 'reducers/orders';
import { deliveryman } from 'reducers/deliveryman';
import { area } from 'reducers/area_select';
import { GOT_DELIVERY_STATIONS, GOT_PAY_MODES } from 'actions/order_manage_form';
import { GET_ORDER_LIST } from 'actions/orders';
import * as Actions from 'actions/delivery_distribute';
import { UPDATE_PATH } from 'redux-simple-router';
import * as OrderSupportReducers from 'reducers/order_support';
import stations from 'reducers/stations';
import { DeliverymanActionTypes2 } from 'actions/action_types';

var filter_state = {
  search_ing: false,
  delivery_stations: [],
  all_pay_modes: [],
  all_order_status: map(order_status, (v , k) => ({id: k, text: v.value}))
}

function filter(state = filter_state, action){
  switch (action.type) {
    case GOT_DELIVERY_STATIONS:
      return {...state, delivery_stations: map(action.data, (text, id) => ({id, text}))}
    case GOT_PAY_MODES:
      return {...state, all_pay_modes: map(action.data, (text, id) => ({id, text})) }
    default:
      return state
  }
}

var main_state = {
  submitting: false,

  scan: false, //为true时显示scan_list（不分页）
}
function main(state = main_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return main_state;
    case Actions.SIGN_ORDER:
    case Actions.UNSIGN_ORDER:
      if(action.key == REQUEST.ING){
        return {...state, submitting: true }
      }else if(action.key == REQUEST.SUCCESS || action.key == REQUEST.FAIL){
        return {...state, submitting: false }
      }else{
        console.error('nali?')
      }

    case Actions.GET_DISTRIBUTE_SCAN_LIST:
      if(action.key == REQUEST.ING){
        return {...state, submitting: true}
      }else if(action.key == REQUEST.SUCCESS || action.key == REQUEST.FAIL){
        return {...state, submitting: false, scan: true}
      }else{
        console.error('nali');
        return state;
      }

    default:
      return state
  }
}

var D_state = {
  spareparts: [],
  orderSpareparts: [],
  is_POS: 1,
  orderDetail:{},
}

function D_(state = D_state, action) {
  switch (action.type) {
    case Actions.GET_SPARE_PARTS:
      var spareparts_tmp = action.data.list;
      var spareparts;
      spareparts = spareparts_tmp.map( m => {
        if(m.skus){
          var n = {} ;
          n.amount = 0;
          n.atlas = null;
          n.category_id = ACCESSORY_CATE_ID;
          n.choco_board = '';
          n.custom_desc = '';
          n.custom_name = '';
          n.discount_price = m.skus[0].discount_price;
          n.greeting_card = '';
          n.name = m.name;
          n.num = 1;
          n.original_price = m.skus[0].original_price;
          n.size = m.size;
          n.sku_id = m.skus[0].sku_id;
          return n;
/*          m.img_url = m.skus.length > 0 ? m.skus[0].img_url : '';
          m.price = m.skus.length > 0 ? m.skus[0].discount_price : 0;  
          m.id = m.skus.length > 0 ? m.skus[0].sku_id : 0 ; */     
        }        
      });
    
      return {...state, spareparts:spareparts}
    case Actions.GET_ORDER_SPARE_PARTS:
      return { ...state, orderSpareparts: action.data || [] }
    case Actions.GET_ORDER_DETAIL:
      var orderSpareparts = action.data.products;
      orderSpareparts = orderSpareparts.filter( m => m.isAddition == 1);
      var current_id = action.data.deliveryman_id;
      var is_POS = action.data.is_POS;
      return { ...state, orderSpareparts: orderSpareparts || [], orderDetail: action.data, current_id, is_POS };
    default:
      return state;
  }
}

export default combineReducers({
  filter,
  orders: orders(),
  operationRecord,
  main,
  D_,
  stations,
  area: area(),
  deliveryman: deliveryman(),
  order_deliveryman: deliveryman(DeliverymanActionTypes2),
  ...OrderSupportReducers
})