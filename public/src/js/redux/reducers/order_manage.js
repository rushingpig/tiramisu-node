import { map } from 'utils/index';
import { combineReducers } from 'redux';
import * as Actions from 'actions/order_manage';
import { GOT_ORDER_SRCS, GOT_DELIVERY_STATIONS } from 'actions/order_manage_form';
import { AreaActionTypes2 } from 'actions/action_types';
import { pay_status } from 'config/app.config';

import { area } from 'reducers/area_select';
import { orders, operationRecord } from './orders';
import { REQUEST } from 'config/app.config';

var filter_state = {
  search_ing: false,
  all_order_srcs: [],
  all_order_status: map(pay_status, (text, id) => ({id, text})),
}

function filter(state = filter_state, action){
  switch (action.type) {
    case GOT_ORDER_SRCS:
      let l1 = [], l2 = [];
      //level最多为2级
      action.data.forEach(n => {
        n.text = n.name;  //转换
        if(n.level == 1){
          l1.push(n);
        }else{
          l2.push(n);
        }
      })
      return {...state, all_order_srcs: !l2.length ? [l1] : [l1, l2] }
    default:
      return state
  }
}


var main_state = {
  submitting: false,

  delivery_stations: [],  //这个用于AlterDeliveryModal和AlterStationModal中
}
function main(state = main_state, action){
  switch(action.type){
    case Actions.CANCEL_ORDER:
    case Actions.ORDER_EXCEPTION:
      if(action.key == REQUEST.ING){
        return {...state, submitting: true }
      }else if(action.key == REQUEST.SUCCESS || action.key == REQUEST.FAIL){
        return {...state, submitting: false }
      }else{
        console.error('nali?')
      }

    case GOT_DELIVERY_STATIONS:
      return {...state, delivery_stations: map(action.data, (text, id) => ({id, text})) }
    default:
      return state;
  }
}

export default combineReducers({
  filter,
  area: area(),
  orders,
  operationRecord,
  main,
  alter_delivery_area: area(AreaActionTypes2)
})