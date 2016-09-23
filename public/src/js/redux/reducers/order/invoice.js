import { dateFormat, map } from 'utils/index';
import { combineReducers } from 'redux';
import { REQUEST, invoice_status, order_status, ACCESSORY_CATE_ID } from 'config/app.config';
import { GOT_ORDER_SRCS } from 'actions/order_manage_form';

import { DELIVERY_COMPANIES } from 'config/app.config';


import { area } from 'reducers/area_select';
import * as OrderSupportReducers from 'reducers/order_support';
import stations from 'reducers/stations';

import * as Actions from 'actions/order/invoice';
import { core } from 'utils/index';
import {getGlobalStore} from 'stores/getter';


var main_state = {
	list: [],
	total: 0,
	page_no: 0 ,
	page_size: 0,

	refresh: false,
	loading: true,
	active_order_id:-1,
    check_order_info: null,
    form_provinces: [],
    form_cities: [],
    form_districts: [],

    save_ing: false,
    save_success: true,

    submit_ing: false,

    handle_invoice_status: '',
    order_invoice_info: null,
  	company_data: [],

  express_companies: map(DELIVERY_COMPANIES, (m) => ({id: m.express_type, text: m.exppress_name})), 
}

function _t(data){
  return map(data, (text, id) => ({id, text}))
}

var filter_state = {
	search_ing : false,
	all_order_srcs: [],
  	all_invoice_status: map(invoice_status, ({value}, id) => ({id, text: value})),
  	all_order_status: map(order_status, ({value}, id) => ({id, text: value})),
}

function filter(state = filter_state, action){
	switch (action.type) {
	  case GOT_ORDER_SRCS:
	    let l1 = [], l2 = [];
	    var data = core.isArray(action.data) ? action.data : [];
	    //level最多为2级
	    data.forEach(n => {
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
function main(state = main_state, action){
  	var store = getGlobalStore();
	switch(action.type){
		case Actions.ACTIVE_ORDER:
			return {...state,active_order_id: action.active_order_id}
		case Actions.GET_INVOICE_LIST:
			return {...state, ...action.data, refresh: false, loading: false};
		case Actions.GET_ORDER_DETAIL_PRODUCTS:
			return {...state, check_order_info:action.data }
		case Actions.GET_INVOICE_COMPANY:
			return {...state, company_data: _t(action.data)}
		case Actions.GET_ORDER_INVOICE_INFO:
			var { gotRegionalismLetter} = Actions;
			var {data} = action;
			data.recipient = 1;
			data._recipient_name = data.recipient_name;
			data._recipient_mobile = data.recipient_mobile;
			data.enable_recipient_address = 1;
			data.amount = data.amount / 100;
			data.type = 0;
			data.title = '';
			data.recipient_province_id = data.province_id;
			data.recipient_city_id = data.city_id;
			data.recipient_regionalism_id = data.regionalism_id;
			data.recipient_address = data.address;
			data.order_id = action.order_id;
			store.dispatch(gotRegionalismLetter({type: 'city', parent_id: data.province_id}));
			store.dispatch(gotRegionalismLetter({type: 'district', parent_id: data.city_id}));
			
			return {...state, order_invoice_info: data}
		case Actions.RESET_INVOICE_DATA:
			return {...state, order_invoice_info: null ,company_data: [], form_provinces: [],
					form_cities: [], form_districts: []}
		case Actions.GET_INVOICE_INFO:
			var {gotRegionalismLetter} = Actions;
			var {data} = action;
			data._recipient_name = data.recipient_name;
			data._recipient_mobile = data.recipient_mobile;
			if(data.recipient == 2) {
				data.origin_name = data.recipient_name;
				data.origin_mobile = data.recipient_name;
			}
			data.amount = data.amount / 100;
			var { option } = data;

			data.recipient_province_id = option.province_id;
			data.recipient_city_id = option.city_id;
			data.recipient_regionalism_id = option.regionalism_id;
			data.recipient_address = option.address;
			data.owner_name = option.owner_name;
			data.owner_mobile = option.owner_mobile;

			store.dispatch(gotRegionalismLetter({type: 'city', parent_id: data.province_id}));
			store.dispatch(gotRegionalismLetter({type: 'district', parent_id: data.city_id}));
			
			return {...state, order_invoice_info: data}
		case Actions.INVOICE_DEL:
			var {list, total} = state;
			var {id } = action;
			var {list } = state;
			list = list.map( m => {
				if(m.id ==  id){
					m.status = 'CANCEL'
				}
				return m;
			})
			return {...state, list: list}
		case Actions.INVOICE_APPLY_ING:
			return {...state, save_ing: true}
		case Actions.INVOICE_APPLY_FAIL:
			return {...state, save_ing: false, save_success: false}
		case Actions.INVOICE_EDIT_ING:
			return {...state, submit_ing: true}
		case Actions.INVOICE_APPLY_SUCCESS:
			var { getInvoiceList } = Actions;
			store.dispatch(getInvoiceList({page_no: 0, page_size: state.page_size}))
			return {...state, save_ing: false, save_success: true}
		case Actions.INVOICE_EDIT_SUCCESS:
			var { getInvoiceList } = Actions;
			store.dispatch(getInvoiceList({page_no: 0, page_size: state.page_size}))
			return {...state, submit_ing: false}
		case Actions.HANDLE_INVOICE_SUCCESS:
			var {handleActionName, invoiceId} = action;
			var {list } = state;
			list = list.map( m => {
				if(m.id ==  invoiceId){
					m.status = handleActionName
				}
				return m;
			})
			return {...state, handle_invoice_status: 'success', list: list}
		case Actions.ADD_REMARK:
			var {invoiceId, remarks} = action;
			var {list } = state;
			list = list.map( m => {
				if(m.id ==  invoiceId){
					m.remarks = remarks
				}
				return m;
			})
			return {...state, list: list}
/*		case Actions.GET_EXPRESS_COMPANY:
			return {...state, express_companies: _t(action.data)}*/
		case Actions.GET_FORM_PROVINCES:
			return {...state, form_provinces: _t(action.data)}
		case Actions.RESET_FORM_PROVINCES:
			return {...state, form_provinces: []}
		case Actions.GET_FORM_CITIES:
			return {...state, form_cities: _t(action.data)}
		case Actions.RESET_FORM_CITIES:
			return {...state, form_cities: []}
		case Actions.GET_FORM_DISTRICTS:
			return {...state, form_districts: _t(action.data)}
		case Actions.RESET_FORM_DISTRICTS:
			return {...state, form_districts: []}
		case Actions.GOT_REGIONALISM_LETTER:
			var type = action.dataType;
			var regionalisms = action.data.list;
			regionalisms = regionalisms.map( m => {
				var p = {};
				if(type == 'province')
					p.ascii_value = m.first_letter.charCodeAt();
				p.id = m.regionalism_id;
				p.text = m.regionalism_name;
				p.is_open = m.is_open;
				return p;});
			switch(type){
				case 'province':					
					return {...state, form_provinces: regionalisms}
					break;
				case 'city':
					return {...state, form_cities: regionalisms}
					break;
				case 'district':
					return {...state, form_districts: regionalisms}
				default:;
			}
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
    case Actions.RESET_ORDER_OPT_RECORD:
      return {...operation_record};
    case Actions.GET_ORDER_OPT_RECORD:
      return {...state, ...action.data, loading: false}
    default:
      return state;
  }
}

export default combineReducers({
	area: area(), 
	filter,
	stations,
	main,
	operationRecord,
})