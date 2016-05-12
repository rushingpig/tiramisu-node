import { combineReducers } from 'redux';
import * as Actions from 'actions/station_salary';

import { area } from './area_select';
import { deliveryman } from 'reducers/deliveryman';

import clone from 'clone';


var main_state = {
	deliveryRecord:[],
	check_order_info: null,
	active_order_id:-1,
	proof: {},
	operationRecord:{
		page_no: 0,
		total: 0,
		list: [],
	}
}
function main(state = main_state, action){
	switch (action.type){
		case Actions.ACTIVE_ORDER:
			return {...state,active_order_id: action.active_order_id}
		case Actions.GET_DELIVERY_RECORD:
			return {...state,deliveryRecord:action.data}
		case Actions.GET_ORDER_DETAIL_PRODUCTS:
			return {...state, check_order_info:action.data }
		case Actions.GET_DELIVERY_PROOF:
			return {...state, proof: action.data}
		case Actions.RESET_ORDER_OPT_RECORD:
		  	return {...main_state};
		case Actions.GET_ORDER_OPT_RECORD:
		  	return {...state, operationRecord:action.data }
		default:
			return state;
	}
}
/*var operationRecord = {
  page_no: 0,
  total: 0,
  list: [],
}

function operationRecord(state = operationRecord, action){
  switch(action.type){
    case Actions.RESET_ORDER_OPT_RECORD:
      return {...operationRecord};
    case Actions.GET_ORDER_OPT_RECORD:
      return {...state, ...action.data }
    default:
      return state;
  }
}*/
const stationSalaryReducers = combineReducers({
	area:area(),
	deliveryman,
	main,
})
export default stationSalaryReducers;