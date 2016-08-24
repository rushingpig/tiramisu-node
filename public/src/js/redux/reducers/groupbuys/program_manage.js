import { combineReducers } from 'redux';
import * as Actions from 'actions/groupbuys/program_manage';
import { getGlobalStore, getGlobalState } from 'stores/getter';
import { map, getDate } from 'utils/index';

import { area } from '../area_select';

import clone from 'clone';


var main_state = {
	list: [],
	total: 0,
	page_no: 0,
	loading: true,
	refresh: false,
}

function main(state = main_state, action){
	switch(action.type){
		case Actions.GET_GROUPBUY_PROGRAM_LIST:
			return {...state, ...action.data, loading: false, refresh: false}
		default:
			return state;
	}
}

export default combineReducers({
	area: area(),
	main,
})