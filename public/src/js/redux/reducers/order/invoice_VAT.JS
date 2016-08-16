import { dateFormat, map } from 'utils/index';
import { combineReducers } from 'redux';

import * as Actions from 'actions/order/invoice_VAT';
import { core } from 'utils/index';
import {getGlobalStore} from 'stores/getter';

var main_state = {
	list: [],
	total: 0,
	page_no: 0,
}

export default function main(state = main_state, action){
	switch(action.type){
		case Actions.GET_COMPANY_LIST:
			return {...state, ...action.data}
		default:
			return state;
	}
}

