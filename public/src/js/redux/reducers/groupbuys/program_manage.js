import { combineReducers } from 'redux';
import * as Actions from 'actions/groupbuys/program_manage';
import { getGlobalStore, getGlobalState } from 'stores/getter';
import { map, getDate } from 'utils/index';
import { SRC, SELECT_DEFAULT_VALUE } from 'config/app.config';

import { area } from '../area_select';

import clone from 'clone';


var main_state = {
	list: [],
	total: 0,
	page_no: 0,
	loading: true,
	refresh: false,
	order_srcs: [],

	program_info: {},
}

function main(state = main_state, action){
	switch(action.type){
		case Actions.GET_GROUPBUY_PROGRAM_LIST:
			return {...state, ...action.data, loading: false, refresh: false}
		case Actions.GOT_ORDER_SRCS:
			var {data} = action;
			var group_site_id = SRC.group_site;
			var group_sites = data.filter( m => m.parent_id == group_site_id);
			return {...state, order_srcs: group_sites.map(({id, name}) => ({id, text: name}))};
		case Actions.GET_GROUPBUY_PROGRAM_DETAIL:
			return {...state, program_info: action.data}
		default:
			return state;
	}
}

export default combineReducers({
	area: area(),
	main,
})