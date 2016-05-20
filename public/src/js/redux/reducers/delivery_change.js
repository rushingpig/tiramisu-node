import { dateFormat, map } from 'utils/index';
import { combineReducers } from 'redux';
import * as ChangeActions from 'actions/delivery_change';
import { GOT_DELIVERY_STATIONS } from 'actions/order_manage_form';
import { orders, operationRecord } from 'reducers/orders';
import * as OrderSupportReducers from 'reducers/order_support';
import { area } from 'reducers/area_select';
import stations from 'reducers/stations';
import { REQUEST } from 'config/app.config';

var filter_state = {
  search_ing: false,
  change_submitting: false,
  delivery_stations: [],
}

function filter(state = filter_state, action){
  switch (action.type) {
    case ChangeActions.ORDERS_EXCHANGE:
      if(action.key == REQUEST.ING){
        return {...state, change_submitting: true }
      }else if(action.key == REQUEST.SUCCESS || action.key == REQUEST.FAIL){
        return {...state, change_submitting: false }
      }else{
        console.error('nali?')
      }
    case GOT_DELIVERY_STATIONS:
      return {...state, delivery_stations: map(action.data, (text, id) => ({id, text}))}
    default:
      return state
  }
}

var main_state = {
  all_order_srcs: [],
  all_pay_modes: [],
}
function main( state = main_state, action ){
  switch (action.type) {
    case ChangeActions.ORDERS_EXCHANGE:

    default:
      return state
  }
}

export default combineReducers({
  filter,
  area: area(),
  stations,
  orders: orders(),
  operationRecord,
  ...OrderSupportReducers
})