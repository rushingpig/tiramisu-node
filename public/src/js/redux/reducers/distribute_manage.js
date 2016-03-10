import { dateFormat, map } from 'utils/index';
import { combineReducers } from 'redux';
import { REQUEST, order_status } from 'config/app.config';
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

export default combineReducers({
  filter,
  orders,
  operationRecord,
  main,
  area: area(),
  deliveryman,
  ...OrderSupportReducers
})