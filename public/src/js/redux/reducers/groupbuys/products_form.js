import { combineReducers } from 'redux';
import * as Actions from 'actions/groupbuys/products_form';
import { getGlobalStore, getGlobalState } from 'stores/getter';
import { map, getDate } from 'utils/index';
import { area } from '../area_select';
import { GOT_ORDER_SRCS } from 'actions/order_support';
import { SRC, SELECT_DEFAULT_VALUE } from 'config/app.config';

var main_state = {
	list: [],
	total: 2,
	page_no: 0,
	order_srcs: [],
	pd_cates: [],
	pri_pd_cates: [],
	sec_pd_cates: [],
	current_pri_cate_id: SELECT_DEFAULT_VALUE,

	seleted_list: [],
}

function main(state = main_state, action){
	switch(action.type){
		case Actions.SERACH_PRODUCTS:
			return {...state, ...action.data}
		case Actions.GOT_ORDER_SRCS:
			var {data} = action;
			var group_site_id = SRC.group_site;
			var group_sites = data.filter( m => m.parent_id == group_site_id);
			return {...state, order_srcs: group_sites.map(({id, name}) => ({id, text: name}))};
		case Actions.GOT_CATEGORIES:
			var {data} = action;
			var pri_pd_cates = data.filter( m => m.parent_id == 0);
			return {...state, pri_pd_cates: pri_pd_cates.map( m => ({id: m.id, text: m.name})), pd_cates: data}
		case Actions.GOT_SEC_CATEGORIES:
			var {id } = action;
			var sec_pd_cates = state.pd_cates.filter( m => m.parent_id == id);
			return {...state, sec_pd_cates: sec_pd_cates.map( m => ({id: m.id, text: m.name}))}
		case Actions.SELECT_PRODUCT:
			return {...state, seleted_list: [...state.seleted_list, action.data]}
		default:
			return state;
	}
}

export default combineReducers({
	area: area(),
	main,
})