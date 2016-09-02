import { combineReducers } from 'redux';
import * as Actions from 'actions/groupbuys/products_manage';
import { getGlobalStore, getGlobalState } from 'stores/getter';
import { map, getDate } from 'utils/index';
import { SRC, SELECT_DEFAULT_VALUE } from 'config/app.config';

import { area } from '../area_select';

import clone from 'clone';

var main_state = {
	pd_cates: [],
	pri_pd_cates: [],
	sec_pd_cates: [],

	order_srcs: [],

	list: [],
	page_no: 0,
	total: 0,
	query_data: {},
}

function main(state = main_state, action){
	var store = getGlobalStore();
	switch(action.type){
		case Actions.GOT_CATEGORIES:
			var {data} = action;
			var pri_pd_cates = data.filter( m => m.parent_id == 0);
			return {...state, pri_pd_cates: pri_pd_cates.map( m => ({id: m.id, text: m.name})), pd_cates: data}
		case Actions.GOT_SEC_CATEGORIES:
			var {id } = action;
			var sec_pd_cates = state.pd_cates.filter( m => m.parent_id == id);
			return {...state, sec_pd_cates: sec_pd_cates.map( m => ({id: m.id, text: m.name}))}
		case Actions.GOT_ORDER_SRCS:
			var {data} = action;
			var group_site_id = SRC.group_site;
			var group_sites = data.filter( m => m.parent_id == group_site_id);
			return {...state, order_srcs: group_sites.map(({id, name}) => ({id, text: name}))};
		case Actions.GET_PRODUCT_LIST:
			var query_data = action.query_data;
			return {...state, ...action.data};
		case Actions.EDIT_SKU_PRICE:
			var {list } = state;
			var {sku_id, price} = action;
			list.forEach( m => {
				if(m.sku_id == sku_id ){
					m.price = price
				}
			}) 
			return {...state, list: list}
		case Actions.OFF_SHELF:
			var {getProductList} = Actions;
			store.dispatch(getProductList(state.query_data));
			return state;
		default:
			return state;
	}
}

export default combineReducers({
	area: area(),
	main,
})