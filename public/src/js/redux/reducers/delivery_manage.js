import { combineReducers } from 'redux';
import { orders, operationRecord } from 'reducers/orders';
import { area } from 'reducers/area_select';
import { deliveryman } from 'reducers/deliveryman';
import * as Actions from 'actions/delivery_manage';
import { GET_ORDER_LIST } from 'actions/orders';
import { REQUEST } from 'config/app.config';
import { UPDATE_PATH } from 'redux-simple-router';

var filter_state = {
  search_ing: false,
}

function filter(state = filter_state, action){
  switch (action.type) {
    default:
      return state
  }
}

var main_state = {
  submitting: false, //多处提交状态共享, 因为不可能多出同时提交

  scan: false, //为true时显示scan_list（不分页）
  scan_list: [], //扫描搜索列表
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
      }

    case Actions.GET_DELIVERY_SCAN_LIST:
      if(action.key == REQUEST.ING){
        return {...state, submitting: true}
      }else if(action.key == REQUEST.SUCCESS || action.key == REQUEST.FAIL){
        return {...state, submitting: false, scan: true, scan_list: action.data.list}
      }else{
        console.error('nali');
        return state;
      }

    case GET_ORDER_LIST:
      return {...state, scan: false, scan_list: []}

    default:
      return state
  }
}

export default combineReducers({
  filter,
  orders,
  operationRecord,
  deliveryman,
  main,
  area: area()
})