import { combineReducers } from 'redux';
import * as Actions from 'actions/groupbuys/program_form';
import { getGlobalStore, getGlobalState } from 'stores/getter';
import { map, getDate } from 'utils/index';

var main_state = {
	list: [],
	total: 0,
	page_no: 0,
}

function main(state = main_state, action){
	switch(action.type){
		case Actions.SEARCH_GROUPBUYS_PRODUCTS:
			return {...state, ...action.data}
		default:
			return state;
	}
}

export default main;