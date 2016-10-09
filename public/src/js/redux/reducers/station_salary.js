import { UPDATE_PATH } from 'redux-simple-router';
import { combineReducers } from 'redux';
import * as Actions from 'actions/station_salary';

import { area } from './area_select';
import { deliveryman } from 'reducers/deliveryman';
import stations from 'reducers/stations';

import clone from 'clone';

function _f(obj){
  var ret = [];
  for(var key in obj){
    ret.push({id: key, text: obj[key]})
  }
  return ret;
}

var main_state = {
	deliveryRecord:[],
	COD_amount:0,
	POS_amount:0,
	cash_amount:0,
	delivery_pay:0,
	total: 0,
	filter_data:{},
	total_amount:0,
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
		case UPDATE_PATH:
			return main_state;
		case Actions.ACTIVE_ORDER:
			return {...state,active_order_id: action.active_order_id}
		case Actions.GET_DELIVERY_RECORD:
			return {...state,deliveryRecord:action.data.list, 
				COD_amount:action.data.COD_amount, 
				POS_amount:action.data.POS_amount,
				delivery_pay:action.data.delivery_pay,
				cash_amount: action.data.cash_amount,
				total_amount: action.data.total_amount,
				total: action.data.total,
				filter_data: action.filter_data,
			}
		case Actions.RESET_DELIVERY_RECORD:
			return {...state,deliveryRecord:[], active_order_id: -1,
					 check_order_info: null, COD_amount: 0, POS_amount: 0,
					 cash_amount : 0, delivery_pay: 0, total: 0, filter_data: {},
					 total_amount: 0
					}
		case Actions.GET_ORDER_DETAIL_PRODUCTS:
			return {...state, check_order_info:action.data }
		case Actions.GET_DELIVERY_PROOF:
			return {...state, proof: action.data}
		case Actions.RESET_ORDER_OPT_RECORD:
		  	return {...state, operationRecord:{}};
		case Actions.GET_ORDER_OPT_RECORD:
			var data = action.data;
			data.page_size = data.total;
		  	return {...state, operationRecord:data }
		case Actions.UPDATE_DELIVERY_RECORD:
			var order_id = action.order_id;
			var  deliveryRecord  = clone(state.deliveryRecord);
			deliveryRecord = deliveryRecord.map( m => {
				if (m.order_id == order_id){
					m.COD_amount = action.data.COD_amount;
					m.delivery_pay = action.data.delivery_pay;
					m.remark = action.data.remark;
				}
				return m;
			})
			return {...state, deliveryRecord: deliveryRecord}
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
	deliveryman: deliveryman(),
	stations,
	main,
})
export default stationSalaryReducers;