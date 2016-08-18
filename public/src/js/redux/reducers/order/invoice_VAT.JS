import { dateFormat, map } from 'utils/index';
import { combineReducers } from 'redux';

import * as Actions from 'actions/order/invoice_VAT';
import { core } from 'utils/index';
import {getGlobalStore} from 'stores/getter';
import { invoice_status } from 'config/app.config';

var main_state = {
	list: [],
	total: 0,
	page_no: 0,
	refresh: false,
	loading: true,
	domain: 'http://qn.blissmall.net/',
	view_img: null,
	all_invoice_status: map(invoice_status, ({value}, id) => ({id, text: value})),
	active_company_info: {},
}

function main(state = main_state, action){
	switch(action.type){
		case Actions.GET_COMPANY_LIST:
			return {...state, ...action.data, loading: false, fresh: false}
		case Actions.VIEW_IMG:
			return {...state, view_img: action.data}
		case Actions.ACTIVE_COMPANY:
			var {id } = action;
			var companys = state.list.filter( m => m.id == id);
			var active_company_info = {};
			if(companys.length){
				active_company_info = companys[0];
			}
			return {...state, active_company_info: {...active_company_info}}
		case Actions.REVIEW_COMPANY_INFO:
			var {id} = action;
			var {list} = state;
			list.map( m => {
				if( m.id == id){
					m.status = 'REVIEWED';
				}
				return m;
			})
			return {...state, list: list}
		case Actions.COMPANY_DEL:
			var {id} = action;
			var {list, total} = state;
			list = list.filter ( m => m.id != id);
			return {...state, list: list, total: total -1}
		case Actions.EDIT_COMPANY_SUCCESS:
			var {id, data} = action;
			var {list} = state;
			list.map( m => {
				if( m.id == id){
					m.name = data.name;
					m.code = data.code;
					m.bank_name = data.bank_name;
					m.bank_account = data.bank_account;
					m.add = data.add;
					m.tel = data.tel;
					m.img_1 = data.img_1;
					m.img_2 = data.img_2;
					m.img_3 = data.img_3;
					m.img_4 = data.img_4;
					m.updated_by = window.xfxb.user.name;
				}
			})
			return {...state, list: list}
		default:
			return state;
	}
}

var operation_record = {
  page_no: 0,
  total: 0,
  list: [],
  loading: true,
}

function operationRecord(state = operation_record, action){
  switch(action.type){
    case Actions.RESET_COMPANY_OPT_RECORD:
      return {...operation_record};
    case Actions.GET_COMPANY_OPT_RECORD:
      return {...state, ...action.data, loading: false}
    default:
      return state;
  }
}

var invoice_record = {
	page_no: 0,
	total: 0,
	list: [],
	loading: true,
}

function invoiceRecord(state = invoice_record, action){
  switch(action.type){
    case Actions.RESET_COMPANY_OPT_RECORD:
      return {...invoice_record};
    case Actions.GET_COMPANY_INVOICE_RECORD:
      return {...state, ...action.data, loading: false}
    default:
      return state;
  }
}

export default combineReducers({
	main,
	operationRecord,
	invoiceRecord,
})

