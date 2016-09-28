import { map } from 'utils/index';
import { combineReducers } from 'redux';
import { UPDATE_PATH } from 'redux-simple-router';
import { area } from './area_select';
import clone from 'clone';

import * as REFUNDACTIONS from 'actions/refund';
import { refund_data, bindOrderRecord } from 'reducers/refund_modal';
import {REFUND_STATUS, REFUND_WAY} from 'config/app.config'

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
	},
	all_refund_way: map(REFUND_WAY, (text, id) => ({id, text})),
  	all_refund_status: map(REFUND_STATUS, ({value}, id) => ({id, text: value})),
  	handle_refund_status: 'normal',
  	all_refund_reasons: [],
}

function _t(data){
  return map(data, (text, id) => ({id, text}))
}

function RefundManage(state = initial_state, action){
	switch(action.type){
		case UPDATE_PATH:
			return initial_state;
		case REFUNDACTIONS.GET_REFUND_REASONS:
			return {...state, all_refund_reasons: _t(action.data)}
		case REFUNDACTIONS.ACTIVE_ORDER:
			return {...state,active_order_id: action.active_order_id}
		case REFUNDACTIONS.GET_REFUND_LIST:
			return {...state, list: action.data.list, page_no: action.page_no, total: action.data.total};
		case REFUNDACTIONS.HANDLE_REFUND_ING:
			return {...state, handle_refund_status: 'handling'}
		case REFUNDACTIONS.HANDLE_REFUND_SUCCESS:
			var { handleActionName, refundId } = action;
			var {list} = state;
			list = list.map ( m => {
				if( m.id == refundId ){
					switch(handleActionName){
						case 'TREATED':
							m.status = 'TREATED';break;
						case 'REVIEWED':
							m.status = 'REVIEWED';break;
						case 'COMPLETED':
							m.status = 'COMPLETED';break;
						case 'CANCEL':
							m.status = 'CANCEL';break;
						default:;
					}
				}
				return m;
			})
			return {...state, handle_refund_status: 'success', list: list}
		case REFUNDACTIONS.REFUND_EDIT:
			var {list} = state;
			var {refundId } = action;
			list = list.map( m => {
				if(m.id == refundId ){
					m.status = 'TREATED';
				}
				return m;
			})
			return {...state, list: list}
		case REFUNDACTIONS.REFUND_COMPLETE_CS:
			var {list } = state;
			var { refundId, merchant_id } = action;
			list = list.map( m => {
				if(m.id == refundId ){
					m.merchant_id = merchant_id;
					m.status = 'COMPLETED';
				}
				return m;
			})
			return {...state, list: list}
		case REFUNDACTIONS.ADD_REMARK:
			var {list } = state;
			var { refundId, remarks } = action;
			list = list.map( m => {
				if(m.id == refundId ){
					m.remarks = remarks;
				}
				return m;
			})
			return {...state, list: list}			
		case REFUNDACTIONS.HANDLE_REFUND_FAIL:
			return {...state, handle_refund_status: 'fail'}
		case REFUNDACTIONS.RESET_REFUND_STATUS:
			return {...state, handle_refund_status: 'normal'}
		case REFUNDACTIONS.GET_ORDER_DETAIL_PRODUCTS:
			return {...state, check_order_info:action.data }
		case REFUNDACTIONS.RESET_ORDER_OPT_RECORD:
		  	return {...state, operationRecord:{}};
		case REFUNDACTIONS.GET_ORDER_OPT_RECORD:
			var data = action.data;
		  	return {...state, operationRecord:data }
		default:
			return state;
	}
}

export default combineReducers({
	area: area(),
	RefundManage,
	refund_data,
	bindOrderRecord,
});