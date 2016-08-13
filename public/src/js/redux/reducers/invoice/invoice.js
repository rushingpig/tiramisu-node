import { dateFormat, map } from 'utils/index';
import { combineReducers } from 'redux';
import { REQUEST, order_status, ACCESSORY_CATE_ID } from 'config/app.config';
import { GOT_ORDER_SRCS } from 'actions/order_manage_form';
import { area } from 'reducers/area_select';
import * as OrderSupportReducers from 'reducers/order_support';
import stations from 'reducers/stations';

import { core } from 'utils/index';


var main_state = {

}


var filter_state = {
	search_ing : false,
	all_order_srcs: [],
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
/*function main(state = main_state, action){
	switch(action.type){

		default:
			return state;
	}
}*/

export default combineReducers({
	area: area(), 
	filter,
	stations,
})