import { dateFormat, map } from 'utils/index';
import { combineReducers } from 'redux';
import { REQUEST, invoice_status, ACCESSORY_CATE_ID } from 'config/app.config';
import { GOT_ORDER_SRCS } from 'actions/order_manage_form';
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
	refresh: false,
	loading: true,
	active_order_id:-1,
    check_order_info: null,
    form_provinces: [],
    form_cities: [],
    form_districts: [],
    express_companies: [],

    save_ing: false,
    save_success: true,

    submit_ing: false,

    handle_invoice_status: '',
}

function _t(data){
  return map(data, (text, id) => ({id, text}))
}

var filter_state = {
	search_ing : false,
	all_order_srcs: [],
  	all_invoice_status: map(invoice_status, ({value}, id) => ({id, text: value})),
  	order_invoice_info: null,
  	company_data: [],
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
			var {getFormCities, getFormDistricts} = Actions;
			var {data} = action;
			data.recipient = 1;
			data._recipient_name = data.recipient_name;
			data._recipient_mobile = data.recipient_mobile;
			data.enable_recipient_address = 1;
			data.amount = data.amount / 100;
			data.type = 0;

			store.dispatch(getFormCities(data.province_id));
			store.dispatch(getFormDistricts(data.city_id));
			
			return {...state, order_invoice_info: data}
		case Actions.GET_INVOICE_INFO:
			var {getFormCities, getFormDistricts} = Actions;
			var {data} = action;
			data._recipient_name = data.recipient_name;
			data._recipient_mobile = data.recipient_mobile;
			data.enable_recipient_address = 1;
			data.amount = data.amount / 100;

			store.dispatch(getFormCities(data.province_id));
			store.dispatch(getFormDistricts(data.city_id));
			
			return {...state, order_invoice_info: data}
		case Actions.INVOICE_APPLY_ING:
			return {...state, save_ing: true}
		case Actions.INVOICE_APPLY_FAIL:
			return {...state, save_ing: false, save_success: false}
		case Actions.INVOICE_APPLY_SUCCESS:
			return {...state, save_ing: false, save_success: true}
		case Actions.HANDLE_INVOICE_SUCCESS:
			var {handleActionName, invoiceId} = action.data;
			var {list } = state;
			list = list.map( m => {
				if(m.invoice_id ==  invoiceId){
					m.invoice_status = handleActionName
				}
				return m;
			})
			return {...state, handle_invoice_status: 'success', list: list}
		case Actions.GET_EXPRESS_COMPANY:
			return {...state, express_companies: _t(action.data)}
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
		default:
			return state;
	}
}

export default combineReducers({
	area: area(), 
	filter,
	stations,
	main,
})