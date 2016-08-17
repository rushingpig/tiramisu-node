import { dateFormat, map } from 'utils/index';
import { combineReducers } from 'redux';

import * as Actions from 'actions/order/invoice_VAT';
import { core } from 'utils/index';
import {getGlobalStore} from 'stores/getter';

var main_state = {
	list: [],
	total: 0,
	page_no: 0,
	refresh: false,
	loading: true,
	domain: 'http://qn.blissmall.net/',
	view_img: null,
}

function main(state = main_state, action){
	switch(action.type){
		case Actions.GET_COMPANY_LIST:
			return {...state, ...action.data, loading: false, fresh: false}
		case Actions.VIEW_IMG:
			return {...state, view_img: action.data}
		default:
			return state;
	}
}


export default combineReducers({
	main,
})

