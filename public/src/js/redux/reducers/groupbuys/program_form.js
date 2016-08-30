import { combineReducers } from 'redux';
import * as Actions from 'actions/groupbuys/program_form';
import { getGlobalStore, getGlobalState } from 'stores/getter';
import { map, getDate } from 'utils/index';
import { SRC, SELECT_DEFAULT_VALUE } from 'config/app.config';
import { area } from '../area_select';
import clone from 'clone';

var main_state = {
	list: [],
	total: 0,
	page_no: 0,
	program_info: {},
	order_srcs: [],
}

function main(state = main_state, action){
	switch(action.type){
		case Actions.SEARCH_GROUPBUYS_PRODUCTS:
			return {...state, ...action.data}
		case Actions.GET_GROUPBUY_PROGRAM_DETAIL:
			/*var data = clone(action.data);
			var start_time = data.start_time.replace(/-/g, '/');
			var end_time = data.end_time.replace(/-/g, '/');
			data.start_time = new Date(start_time);
			data.end_time = new Date(end_time);*/
			return {...state, program_info: action.data}
		case Actions.GOT_ORDER_SRCS:
			var {data} = action;
			var group_site_id = SRC.group_site;
			var group_sites = data.filter( m => m.parent_id == group_site_id);
			return {...state, order_srcs: group_sites.map(({id, name}) => ({id, text: name}))};
		case Actions.CHANGE_ONLINE_TIME:
			var {beginTime, endTime } = action;
			return state;
		default:
			return state;
	}
}

export default combineReducers({
	area: area(),
	main,
})