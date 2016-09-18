import { combineReducers } from 'redux';
import * as Actions from 'actions/groupbuys/products_form';
import { getGlobalStore, getGlobalState } from 'stores/getter';
import { map, getDate } from 'utils/index';
import { area } from '../area_select';
import { GOT_ORDER_SRCS } from 'actions/order_support';
import { SRC, SELECT_DEFAULT_VALUE } from 'config/app.config';
import { getProductList } from 'actions/groupbuys/products_manage';
var main_state = {
	list: [],
	total: 2,
	page_no: 0,
	order_srcs: [],
	pd_cates: [],
	pri_pd_cates: [],
	sec_pd_cates: [],
	current_pri_cate_id: SELECT_DEFAULT_VALUE,

	selected_spu_info: {},
	spu_sku_list: [],
	sku_size_list: [],
	sku_size_load_success: false,

	save_ing: false,
	save_success: false,

}

function main(state = main_state, action){
	switch(action.type){
		case Actions.RESET_SPU_INFO:
			return {...state, selected_spu_info: [], spu_sku_list: [], save_success: false, save_ing: false}
		case Actions.SERACH_PRODUCTS:
			var {list} = action.data
			list.forEach( m => {m.checked == false})
			return {...state, ...action.data, list: list}
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
		case Actions.SELECT_PRODUCT_SPU:
			var {list} = state;
			list .forEach( m => {
				if(m.spu_id === action.data.spu_id){
					m.checked = true;
				}else{
					m.checked = false;
				}
			})
			var {sku_list} = action.data;
			(sku_list || []).forEach( m => {
				m.product_name = action.data.product_name;
				m.is_new = false;
			})
			return {...state, selected_spu_info: action.data, list:list, spu_sku_list: sku_list}
		case Actions.DEL_SELECT_PRODUCT:
			var {list, selected_spu_info} = state;
			list .forEach( m => {
				if(m.spu_id === selected_spu_info.spu_id){
					m.checked = false;
				}
			})
			return {...state, selected_spu_info: {}, list:list, spu_sku_list: []}
		case Actions.GET_ALL_SIZE:
			var {data} = action;
			data = data.map( (n, i) => {return {id: i, text: n.size}})
			return {...state, sku_size_list: data, sku_size_load_success: true}
		case Actions.ADD_SIZE:
			var {size, price, display_name} = action;
			var {spu_sku_list } = state;
			var sku = {size: size, price: price, is_new: true, display_name: display_name}
			spu_sku_list.push(sku);
			return {...state, spu_sku_list: spu_sku_list}
		case Actions.DEL_SIZE:
			var {index} = action;
			var {spu_sku_list } = state;
			spu_sku_list.splice(index, 1);
			return {...state, spu_sku_list: spu_sku_list}
		case Actions.CREATE_GROUPBUY_SKU_ING:
			return {...state, save_ing: true, save_success: false}
		case Actions.CREATE_GROUPBUY_SKU_SUCCESS:
			var store = getGlobalStore();
			store.dispatch(getProductList());
			return {...state, save_ing: false, save_success: true}
		case Actions.CREATE_GROUPBUY_SKU_FAIL:
			return {...state, save_ing: false, save_success: false}
		default:
			return state;
	}
}

export default combineReducers({
	area: area(),
	main,
})