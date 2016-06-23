import { combineReducers } from 'redux';
import * as Actions from 'actions/city_manage';
import { map, getDate } from 'utils/index';

import { area } from './area_select';

import clone from 'clone';

var initail_state = {
	loading: true,
	refresh: false,
	accessible_cities: [],
	accessible_city_info: {},
	provinces: [],

	save_ing: false,
	save_success: true,
	submit_ing: false,
	total_count: 0,
	provinces_letter: [],
	cities_letter: [],
	districts_letter: [],

};

function _t(data){
  return map(data, (text, id) => ({id, text}))
}

function main(state = initail_state, action){
	switch(action.type){
		case Actions.GET_ACCESSIBLE_CITIES_LIST:
			return {...state, accessible_cities: action.data.list, total_count:action.data.total_count,loading: false, refresh: false}
		case Actions.GOT_PROVINCES_SIGNAL:
			return {...state, provinces: _t(action.data)}
		case Actions.GET_ACCESSIBLE_CITY_DETAIL:
			var data = clone(action.data);
			data.order_time = data.order_time / 60;
			var {online_time} = data;
			var time1 = online_time.split(' ');
			var time2 = time1[1].split(':');
			var online_time_date = getDate(online_time)
			data.online_time_date = time1[0];
			data.online_time_hour = time2[0];
			data.online_time_min = time2[1];
			var regionalisms =[];
			if(!data.is_county){
				    regionalisms = data.regionalisms.map( m => {
					var p ={};
					p.id = m.regionalism_id;
					p.text = m.regionalism_name;
					p.is_open = m.is_open
					return p;
				})
				data.first_open_regions = regionalisms.filter( m => m.is_open);
				if(data.second_order_time){
					data.sec_order_time = data.second_order_time /60;
					data.sec_order = 1;
					var sec_regionalisms = data.second_order_regionalisms;
					data.sec_open_regions = regionalisms.filter( m => 
						sec_regionalisms.some( n => n.regionalism_id == m.id))
				}else{
					data.sec_order = 0;
				}				
			}

			return {...state, accessible_city_info: data, districts_letter: regionalisms}
		case Actions.GOT_REGIONALISM_LETTER:
			var type = action.dataType;
			var regionalisms = action.data.list;
			regionalisms = regionalisms.map( m => {
				var p = {};
				if(type == 'province')
					p.ascii_value = m.first_letter.charCodeAt();
				p.id = m.regionalism_id;
				p.text = m.regionalism_name;
				p.is_open = m.is_open;
				return p;});
			switch(type){
				case 'province':					
					return {...state, provinces_letter: regionalisms}
					break;
				case 'city':
					return {...state, cities_letter: regionalisms}
					break;
				case 'district':
					return {...state, districts_letter: regionalisms}
				default:;
			}
			
		case Actions.SUBMIT_ING:
			return {...state, submit_ing: true}
		case Actions.SUBMIT_COMPLETE:
			return {...state, submit_ing: false, districts_letter: []}
		case Actions.SAVE_USER_INFO_ING:
		  return {...state, save_ing: true }
		case Actions.SAVE_USER_INFO_SUCCESS:
		  return {...state, save_success: true, save_ing: false, districts_letter:[] }
		case Actions.SAVE_USER_INFO_FAIL:
		  return {...state, save_success: false, save_ing: false }
		case Actions.DELETE_ACCESSIBLE_CITY:
			var {city_id} = action.data;
			var list = state.accessible_cities.filter( m => m.city_id != city_id)
			var total_count = state.total_count -1;
			return {...state, accessible_cities: list, total_count: total_count}
		default:
			return state;
	}
}

/*const cityManageReducers = combineReducers({
	area:area(),
	main,
})*/

export default main;

