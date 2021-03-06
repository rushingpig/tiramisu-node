import { combineReducers } from 'redux';
import * as Actions from 'actions/groupbuys/program_form';

import { getGlobalStore, getGlobalState } from 'stores/getter';
import { map, getDate } from 'utils/index';
import { SRC, SELECT_DEFAULT_VALUE } from 'config/app.config';
import { area } from '../area_select';
import clone from 'clone';
import AreaActions from 'actions/area';

const iNow = new Date();

var main_state = {
	
	program_info: {
		start_time: iNow,
		end_time: new Date(getDate(iNow, 7)),
		src_id: SELECT_DEFAULT_VALUE,
		regionalism_id: SELECT_DEFAULT_VALUE,
		program_name: '',
		province_id: SELECT_DEFAULT_VALUE,
	},
	order_srcs: [],

	list: [],
	total: 0,
	page_no: 0,
	pd_cates: [],
	pri_pd_cates: [],
	sec_pd_cates: [],
	selected_list: [],

	save_ing: false,
	save_success: false,

	submit_ing: false,
}

function main(state = main_state, action){
	switch(action.type){
		case Actions.SEARCH_GROUPBUYS_PRODUCTS:
			var {list } = action.data;
			list = list.map( m => {
				if(state.selected_list.every( n => n.id !== m.id)){
					m.checked = false;
				}else{
					m.checked = true;
				}
				return m;
			})
			//编辑团购项目时，删除的商品可再被选中
			var { program_info, selected_list } = state;
			var { products } = program_info;
			if(products){
				products.forEach( m => {
					if(selected_list.every( n => n.id !== m.id)){
						list = list.map	( o => {
							if(o.id == m.id )
								o.is_available = 1;
							return o;
						})
					}
				})
			}
			return {...state, ...action.data, list: list}
		case Actions.GET_GROUPBUY_PROGRAM_DETAIL:
			var data = clone(action.data);
			var store = getGlobalStore();
			var { getCitiesSignal } = AreaActions();
			store.dispatch(getCitiesSignal({province_id: data.province_id, is_standard_area: 0}))
			data.start_time = new Date(data.start_time);
			if(!data.end_time){
				data.end_time = 'Infinite';
			}else
				data.end_time = new Date(data.end_time);
				data.program_name = data.name
				data.products.forEach( m => {
					m.src_name = data.src_name;
				})
			return {...state, program_info: data, selected_list: data.products}
		case Actions.RESET_GROUPBUY_PROGRAM:
			/*program_info: {start_time :iNow, end_time: new Date(getDate(iNow, 7))}*/
			return {...state, program_info: main_state.program_info , selected_list: [], save_ing: false, save_success: false}
		case Actions.GOT_ORDER_SRCS:
			var {data} = action;
			var group_site_id = SRC.group_site;
			var group_sites = data.filter( m => m.parent_id == group_site_id);
			return {...state, order_srcs: group_sites.map(({id, name}) => ({id, text: name}))};
		case Actions.CHANGE_ONLINE_TIME:
			var {beginTime, endTime } = action;
			return state;
		case Actions.GOT_CATEGORIES:
			var {data} = action;
			var pri_pd_cates = data.filter( m => m.parent_id == 0);
			return {...state, pri_pd_cates: pri_pd_cates.map( m => ({id: m.id, text: m.name})), pd_cates: data}
		case Actions.GOT_SEC_CATEGORIES:
			var {id } = action;
			var sec_pd_cates = state.pd_cates.filter( m => m.parent_id == id);
			return {...state, sec_pd_cates: sec_pd_cates.map( m => ({id: m.id, text: m.name}))}
		case Actions.SELECT_PRODUCT:
			var {list } = state;
			list.forEach( m => {
				if(m.id == action.data.id){
					m.checked = true;
				}
			})
			return {...state, selected_list: [...state.selected_list, action.data], list: list}
		case Actions.DELETE_SELECT_PRODUCT:
			var {list} = state;
			list.forEach( m => {
				if(m.id === action.id){
					m.checked = false;
				}
			})
			var new_selected_list = state.selected_list.filter( m => m.id !== action.id)
			return {...state, selected_list: new_selected_list}
		case Actions.RESET_SELECTED_LIST:
			return {...state, selected_list: []}
		case Actions.CREATE_GROUPBUY_PROGRAM_ING:
			return {...state, save_ing: true, save_success: false}
		case Actions.CREATE_GROUPBUY_PROGRAM_SUCCESS:
			return {...state, save_ing: false, save_success: true}
		case Actions.CREATE_GROUPBUY_PROGRAM_FAIL:
			return {...state, save_ing: false, save_success: false}
		case Actions.EDIT_GROUPBUY_PROGRAM_ING:
			return {...state, submit_ing: true}
		case Actions.EDIT_GROUPBUY_PROGRAM_SUCCESS:
			return {...state, submit_ing: false}
		case Actions.CANCEL_SELECT_PRODUCT:
			return {...state, selected_list: state.program_info.products}
		default:
			return state;
	}
}

export default combineReducers({
	area: area(),
	main,
})