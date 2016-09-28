import { combineReducers } from 'redux';
import * as Actions from 'actions/groupbuys/coupon_manage';
import { getGlobalStore, getGlobalState } from 'stores/getter';
import { map, getDate } from 'utils/index';
import { area } from '../area_select';
import {SRC, SELECT_DEFAULT_VALUE } from 'config/app.config';


var main_state = {
	loading: true, //初始化加载，
    refresh: false, //列表数据更新（用于当某些操作所引发的数据刷新）
    page_no: 0,
    total: 0,
    list: [],
    order_srcs:[],
}
function main(state = main_state, action){
	switch (action.type){
		case Actions.GET_COUPON_ORDER_LIST:
        	return {...state, ...action.data, loading: false, refresh: false }
        case Actions.GOT_ORDER_SRCS:
            var {data} = action;
            var group_site_id = SRC.group_site;
            var group_sites = data.filter( m => m.parent_id == group_site_id);
            return {...state, order_srcs: group_sites.map(({id, name}) => ({id, text: name}))};
        default:
        	return state;
	}
}

export default combineReducers({
    area: area(),
    main,
})

