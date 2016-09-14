import { combineReducers } from 'redux';
import * as Actions from 'actions/groupbuys/program_manage';
import { getGlobalStore, getGlobalState } from 'stores/getter';
import { map, getDate } from 'utils/index';
import { SRC, SELECT_DEFAULT_VALUE } from 'config/app.config';
import { getValues } from 'redux-form';

import { area } from '../area_select';

import clone from 'clone';

const iNow = new Date();


var main_state = {
	list: [],
	total: 0,
	page_no: 0,
	page_size: 10,
	loading: true,
	refresh: false,
	order_srcs: [],

	program_info: {},
}

function main(state = main_state, action){
	switch(action.type){
		case Actions.GET_GROUPBUY_PROGRAM_LIST:
			var {list } = action.data;
			var is_online = 0;
			list.map( m => {
				var start_time = new Date(m.start_time);
				if(!m.end_time){
					if(iNow >= start_time){
						m.is_online = 1;
					}else{
						m.is_online = 0;
					}
					m.end_time = '∞'
				}else{
					var end_time = new Date (m.end_time);
					if( iNow <= end_time && iNow >= start_time){
						m.is_online = 1;
					}else{
						m.is_online =0;
					}					
				}
				return m;
			})		
			return {...state, ...action.data, loading: false, refresh: false}
		case Actions.GOT_ORDER_SRCS:
			var {data} = action;
			var group_site_id = SRC.group_site;
			var group_sites = data.filter( m => m.parent_id == group_site_id);
			return {...state, order_srcs: group_sites.map(({id, name}) => ({id, text: name}))};
		case Actions.GET_GROUPBUY_PROGRAM_DETAIL:
			var data = clone(action.data);
			var start_time = new Date(data.start_time);
			var is_online = 0;
			if(!data.end_time ){
				if(iNow >= start_time) is_online = 1;
				data.end_time = '∞'
			}else{
				var end_time = new Date(data.end_time);
				if( iNow <= end_time && iNow >= start_time){
					is_online = 1;
				}
			}			
			data.products = data.products.map ( m => {
				m.is_online = is_online;
				return m;
			})
			return {...state, program_info: data}
		case Actions.RESET_GROUPBUY_PROGRAM:
			return {...state, program_info: {}}
		case Actions.PROGRAM_OFF_SHELF:
			var store = getGlobalStore();
			store.dispatch(Actions.getGroupbuyProgramList({page_no: state.page_no, page_size: state.page_size}));
			return state;
		default:
			return state;
	}
}

export default combineReducers({
	area: area(),
	main,
})