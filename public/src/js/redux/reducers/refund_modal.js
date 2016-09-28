import { combineReducers } from 'redux';
import clone from 'clone';
import { map } from 'utils/index';
import { SELECT_DEFAULT_VALUE} from 'config/app.config';

import * as ACTIONS from 'actions/refund_modal';
import {getGlobalStore} from 'stores/getter';

var initial_state = {
	refund_apply_data: {},
	save_ing: false,
	save_success: true,
  	all_refund_reasons: [],
	
	submit_ing: false,
}

function _t(data){
  return map(data, (text, id) => ({id, text}))
}

export function refund_data(state = initial_state, action){
    var store = getGlobalStore();
	switch(action.type){
		case ACTIONS.GET_REFUND_REASONS:
			return {...state, all_refund_reasons: _t(action.data)}
		case ACTIONS.GET_REFUND_APPLY_DATA:
			var data = clone(action.data);
			data.type = 'PART';
			data.amount = 0;
			data.linkman = 1;
			data.way = 'THIRD_PARTY';
			data.account_type = 'ALIPAY';
			data.order_id = action.order_id;
			data.reason_type = SELECT_DEFAULT_VALUE;
			data.is_urgent = 0;
			data.account = '';
			data.account_name = '';
			return {...state, refund_apply_data: data }
		case ACTIONS.GET_REFUND_APPLY_DETAIL:
			var data = clone(action.data);
			data.amount = data.amount / 100;
			var {option } = data;
			data.id = action.refundId;
      if(data.linkman == 1){
        data.recipient_name = data.linkman_name;
        data.recipient_mobile = data.linkman_mobile;
      }else{
        data.owner_name = data.linkman_name;
        data.owner_mobile = data.linkman_mobile;
      }
			return {...state, refund_apply_data: {...option, ...data} }
		case ACTIONS.REFUND_APPLY_ING:
			return {...state, save_ing: true}
		case ACTIONS.REFUND_APPLY_SUCCESS:
  			var list = store.getState().orderManage.orders.list;
  			list.map( m => {
  				if(m.order_id == action.order_id){
  					m.refund_status = 'TREATED';
  				}
  				return m;
  			})
			return {...state, save_ing: false, save_success: true}
		case ACTIONS.REFUND_APPLY_FAIL:
			return {...state, save_ing: false, save_success: false}
		case ACTIONS.REFUND_EDIT_SUCCESS:
			var list = store.getState().refundManage.RefundManage.list;
			var {refundId } = action.data;
			var { user } = window.xfxb;
			list.map( m => {
				if(m.id == refundId){
					m.amount = action.data.amount;
					m.way = action.data.way;
					m.status = 'TREATED';
					m.is_urgent = action.data.is_urgent;
					m.account_name = action.data.account_name;
					m.account = action.data.account;
					m.account_type = action.data.account_type;
					m.reason = action.data.reason;
					m.reason_type = action.data.reason_type;
					m.merchant_id = action.data.merchant_id;
					m.linkman = action.data.linkman;
					m.linkman_name = action.data.linkman_name;
					m.linkman_mobile = action.data.linkman_mobile;
					m.updated_by = user.name;
				}
				return m;
			})
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