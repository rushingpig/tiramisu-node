import { combineReducers } from 'redux';
import { area } from './area_select';
import clone from 'clone';

import * as REFUNDACTIONS from 'actions/refund';

var initial_state = {
	list:[],
	total: 0,
	page_no: 0,
	check_order_info: null,
	active_order_id:-1,
	operationRecord:{
		page_no: 0,
		total: 0,
		list: [],
	}
}
function RefundManage(state = initial_state, action){
	switch(action.type){
		case REFUNDACTIONS.ACTIVE_ORDER:
			return {...state,active_order_id: action.active_order_id}
		case REFUNDACTIONS.GET_REFUND_LIST:
			return {...state, list: action.data.list, page_no: action.page_no, total: action.data.total};
		case REFUNDACTIONS.GET_ORDER_DETAIL_PRODUCTS:
			return {...state, check_order_info:action.data }
		default:
			return state;
	}
}

export default combineReducers({
	area: area(),
	RefundManage,
});