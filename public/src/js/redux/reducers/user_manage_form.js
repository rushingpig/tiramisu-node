import { combineReducers } from 'redux';
import { getGlobalStore, getGlobalState } from 'stores/getter';
import * as FormActions from 'actions/user_manage_form';
import { map } from 'utils/index';

import { area } from './area_select';
import {dept_role} from './dept_role';

import clone from 'clone';



var initial_state={
	save_ing:false,
	save_success:true,
	submit_ing:false,
	data:{

	},
	stations:{

	},
	cities_standard: [],
};

function _t(data){
  return map(data, (text, id) => ({id, text}))
}

function mainForm(state=initial_state,action){
	switch(action.type){
		case FormActions.GOT_USER_BY_ID:
			return (function(){
				var data = action.data;
				var role_ids=[];
				var station_ids=[];
				var city_ids=[];
				var roles_in=[];
				var cities_in=[];
				var stations_in=[];
				var tmp_roles=[];
				var tmp_cities=[];
				var tmp_stations=[];
				var is_headquarters = data.is_headquarters;
				var is_national = data.is_national;
				var en_delivery = 1;

				if(is_headquarters)
					cities_in.push({id:'999',text:'总部'});
				if(is_national)
					stations_in.push({id:'999',text:'所属城市全部配送站'});
				data.stations.forEach(n=>{
					station_ids.push(n.station_id);
					stations_in.push({id:n.station_id,text:n.station_name});
				});
				data.roles.forEach(n=>{
					role_ids.push(n.role_id);
					roles_in.push({id:n.role_id,text:n.role_name});
					if(n.role_name == '配送员' && !n.only_admin)
						en_delivery = 1;
					else if(n.role_name == '配送员' && n.only_admin)
						en_delivery = 0;
				});
				data.cities.forEach(n=>{
					city_ids.push(n.city_id);
					cities_in.push({id:n.city_id,text:n.city_name});
				});
				//data.cities.push({id:'999',text:'总部'})


				return {...state,data:{...clone(data),pwd:"",city_ids:city_ids,station_ids:station_ids,
					role_ids:role_ids,roles_in:roles_in,stations_in:stations_in,cities_in:cities_in,
					tmp_roles:tmp_roles,tmp_cities:tmp_cities,tmp_stations:tmp_stations, is_national,en_delivery}};
			})();
		case FormActions.GET_CITIES_SIGNAL_STANDARD:
		  return {...state, cities_standard: _t(action.data)}
		case FormActions.RESET_CITIES_SIGNAL_STANDARD:
		  return {...state, cities_standard: []}
		case FormActions.SAVE_USER_INFO_ING:
		  return {...state, save_ing: true }
		case FormActions.SAVE_USER_INFO_SUCCESS:
		  return {...state, save_success: true, save_ing: false }
		case FormActions.SAVE_USER_INFO_FAIL:
		  return {...state, save_success: false, save_ing: false }
/*		case FormActions.GET_STATIONS_BY_CITYIDS:
			return {...state,stations:clone(action.data)}*/
		default:
			return state;
	}
}




const userAddReducers = combineReducers({
	area:area(),
	mainForm,
	dept_role:dept_role(),
})
export default userAddReducers