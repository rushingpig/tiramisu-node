import { dateFormat, map } from 'utils/index';
import { combineReducers } from 'redux';
import { REQUEST, invoice_status, ACCESSORY_CATE_ID } from 'config/app.config';
import { GOT_ORDER_SRCS } from 'actions/order_manage_form';
import { area } from 'reducers/area_select';
import * as OrderSupportReducers from 'reducers/order_support';
import stations from 'reducers/stations';

import * as Actions from 'actions/order/invoice';
import { core } from 'utils/index';


var main_state = {
	list: [],
	total: 0,
	page_no: 0 ,
	refresh: false,
	loading: true,
	active_order_id:-1,
    check_order_info: null,
}


var filter_state = {
	search_ing : false,
	all_order_srcs: [],
  	all_invoice_status: map(invoice_status, ({value}, id) => ({id, text: value})),
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
	switch(action.type){
		case Actions.ACTIVE_ORDER:
			return {...state,active_order_id: action.active_order_id}
		case Actions.GET_INVOICE_LIST:
			return {...state, ...action.data, refresh: false, loading: false};
		case Actions.GET_ORDER_DETAIL_PRODUCTS:
			return {...state, check_order_info:action.data }
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