import { combineReducers } from 'redux';
import { orders, operationRecord } from 'reducers/orders';
import { area } from 'reducers/area_select';
import { deliveryman } from 'reducers/deliveryman';
import * as Actions from 'actions/delivery_manage';
import * as OrderSupportReducers from 'reducers/order_support';
import { GET_ORDER_LIST, CHECK_ALL_ORDERS } from 'actions/orders';
import { GOT_DELIVERY_STATIONS } from 'actions/order_manage_form';
import { REQUEST } from 'config/app.config';
import { UPDATE_PATH } from 'redux-simple-router';
import stations from 'reducers/stations';
import { map } from 'utils/index';

var filter_state = {
  search_ing: false,
  delivery_stations: [],
}

function filter(state = filter_state, action){
  switch (action.type) {
    case GOT_DELIVERY_STATIONS:
      return {...state, delivery_stations: map(action.data, (text, id) => ({id, text}))}
    default:
      return state
  }
}

var main_state = {
  submitting: false, //多处提交状态共享, 因为不可能多出同时提交

  scan: false, //为true时显示scan_list（不分页）
}
function main(state = main_state, action){
  switch(action.type){

    case UPDATE_PATH:
      return {...main_state};

    case Actions.APPLY_DELIVERYMAN:
    case Actions.APPLY_PRINT:
    case Actions.REPRINT_VALIDATE_CODE:
      if(action.key == REQUEST.ING){
        return {...state, submitting: true}
      }else if(action.key == REQUEST.SUCCESS || action.key == REQUEST.FAIL){
        return {...state, submitting: false}
      }else{
        console.error('nali');
        return state;
      }

    case Actions.GET_DELIVERY_SCAN_LIST:
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
  orders: orders(),
  operationRecord,
  deliveryman,
  stations,
  main,
  area: area(),
  ...OrderSupportReducers
})