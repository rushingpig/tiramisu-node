import { map } from 'utils/index';
import { combineReducers } from 'redux';
import * as Actions from 'actions/order_manage';
import { GOT_ORDER_SRCS, GOT_DELIVERY_STATIONS } from 'actions/order_manage_form';
import { GET_ORDER_DETAIL_PRODUCTS } from 'actions/orders';
import { AreaActionTypes2 } from 'actions/action_types';
import { order_status, REQUEST } from 'config/app.config';

import { area } from 'reducers/area_select';
import delivery_stations from 'reducers/delivery_stations';
import { orders, operationRecord } from 'reducers/orders';

var filter_state = {
  search_ing: false,
  all_order_srcs: [],
  all_order_status: map(order_status, ({value}, id) => ({id, text: value})),
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

  prepare_delivery_data_ok: false, //AlterDeliveryModal和AlterStationModal辅助数据是否已经获取完毕
  // delivery_stations: [],  //这个用于AlterDeliveryModal和AlterStationModal中
}
function main(state = main_state, action){
  switch(action.type){
    case Actions.CANCEL_ORDER:
    case Actions.ORDER_EXCEPTION:
    case Actions.ALTER_DELIVERY:
      if(action.key == REQUEST.ING){
        return {...state, submitting: true }
      }else if(action.key == REQUEST.SUCCESS || action.key == REQUEST.FAIL){
        return {...state, submitting: false }
      }else{
        console.error('nali?')
      }

    case Actions.PREPARE_DELIVERY_DATA_OK:
      return {...state, prepare_delivery_data_ok: true}
    case GET_ORDER_DETAIL_PRODUCTS:
      return {...state, prepare_delivery_data_ok: false} //重新拉取订单详情时，先置否，等待拉取 prepare_delivery_data

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
  alter_delivery_area: area(AreaActionTypes2),
  delivery_stations,
})