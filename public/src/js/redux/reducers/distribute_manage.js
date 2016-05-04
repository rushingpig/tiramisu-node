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
  deliverymanAtSameStation : [],
  spareparts: [],
  orderSpareparts: [],
  current_id: -1,
}

function D_(state = D_state, action) {
  switch (action.type) {
    case Actions.GET_SPARE_PARTS:
      return {...state, spareparts:action.data.list}
    case Actions.GET_ORDER_SPARE_PARTS:
      return { ...state, orderSpareparts: action.data || [] }
    case Actions.GET_DELIVERYMAN_AT_SAME_STATION:
      var {list} = action.data;
      var {current_id} = action.data;
      var  deliverymanAtSameStation = list.map( m => ({id: m.deliveryman_id, text: m.deliveryman_name + ':' + m.deliveryman_mobile}));
      return {...state,deliverymanAtSameStation: deliverymanAtSameStation ,current_id: current_id }
    case Actions.GET_ORDER_DETAIL:
      var orderSpareparts = action.data.products;
      orderSpareparts = orderSpareparts.filter( m => m.category_id == ACCESSORY_CATE_ID);
      return { ...state, orderSpareparts: orderSpareparts || [] }
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
  area: area(),
  deliveryman,
  ...OrderSupportReducers
})