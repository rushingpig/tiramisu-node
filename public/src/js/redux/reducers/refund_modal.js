import { combineReducers } from 'redux';
import clone from 'clone';
import { map } from 'utils/index';

import * as ACTIONS from 'actions/refund_modal';

var initial_state = {
	refund_apply_data: {},
	save_ing: false,
	save_success: true,

	submit_ing: false,
  	all_refund_reasons: [],
}

function _t(data){
  return map(data, (text, id) => ({id, text}))
}

export function refund_data(state = initial_state, action){
	switch(action.type){
		case ACTIONS.GET_REFUND_REASONS:
			return {...state, all_refund_reasons: _t(action.data)}
		case ACTIONS.GET_REFUND_APPLY_DATA:
			var data = clone(action.data);
			data.type = 'PART';
			data.amount = 0;
			data.reason_id = 1;
			data.linkman = 0;
			data.way = 'THIRD_PARTY';
			data.account_type = 'ALIPAY';
			return {...state, refund_apply_data: data }
		case ACTIONS.GET_REFUND_APPLY_DETAIL:
			var data = clone(action.data);
			data.amount = data.amount / 100;
			return {...state, refund_apply_data: data}
		case ACTIONS.REFUND_APPLY_ING:
			return {...state, save_ing: true}
		case ACTIONS.REFUND_APPLY_SUCCESS:
			return {...state, save_ing: false, save_success: true}
		case ACTIONS.REFUND_APPLY_FAIL:
			return {...state, save_ing: false, save_success: false}
		case ACTIONS.REFUND_EDIT_SUCCESS:			
			return {...state, submit_ing: false}
		case ACTIONS.REFUND_EDIT_ING:
			return {...state, submit_ing: true}
		default:
			return state;
	}
}

var bindOrder_record = {
  page_no: 0,
  total: 0,
  list: [],
  loading: true,
}

export function bindOrderRecord(state = bindOrder_record, action){
  switch(action.type){
    case ACTIONS.RESET_BIND_ORDERS:
      return {...bindOrder_record};
    case ACTIONS.GET_BIND_ORDERS:
      return {...state, ...action.data, loading: false}
    default:
      return state;
  }
}