import {post, put, GET, POST, test, TEST} from 'utils/request'; //Promise
import Url from 'config/url';
import { getValues } from 'redux-form';
import { initForm } from 'actions/form';
import clone from 'clone';

export const  GOT_USER_BY_ID = 'GOT_USER_BY_ID';
export function getUserById(id){
	return GET(Url.user_detail.toString(id),null,GOT_USER_BY_ID);
/*	return TEST({
			
		'mobile':'15814063438',
		'name':'张娜',		
		'username':'zhangna',
    
    'cities':[{'city_id':1,'city_name':'xxx'}],
		'stations':[{'station_id':1,'station_name':'xxx'}],
    'roles':[{'role_id':1,'role_name':'xxx'}],
	},GOT_USER_BY_ID)*/
}

function _getFormData(form_data,getState){
  var username = form_data.username;
  var password = form_data.pwd;
  var mobile = form_data.mobile;
  var name = form_data.name;
  var city_ids = [];
  var city_names=[];
  var station_ids = [];
  var role_ids = [];
  var cities = form_data.cities_in;
  var roles = form_data.roles_in;
  var stations = form_data.stations_in;
  var is_headquarters = 0;
  var is_national = form_data.is_national ? 1:0;
  var en_delivery = form_data.en_delivery;
  var only_admin_roles = [];
  cities.forEach((n)=>{
    city_ids.push(n.id);
    city_names.push(n.text);
    if(n.id == 999){
      is_headquarters=1;
    }
  });
  roles.forEach((n)=>{
    if( n.text == '配送员' && !en_delivery)
      only_admin_roles.push(n.id);
    role_ids.push(n.id);
  });
  stations.forEach((n)=>{
    station_ids.push(n.id);
/*    if(n.id==999){
      is_national=1;
    }*/
  })
  return !password 
  ? {
    username,
    mobile,
    name,
    city_ids,
    station_ids,
    role_ids,
    is_national,
    is_headquarters,
    city_names,
    only_admin_roles,
  }
  :
   {
    username,
    password,
    mobile,
    name,
    city_ids,
    station_ids,
    role_ids,
    is_national,
    is_headquarters,
    city_names,
    only_admin_roles,
  }

}

export const SAVE_USER_INFO_ING = 'SAVE_USER_INFO_ING';
export const SAVE_USER_INFO_SUCCESS = 'SAVE_USER_INFO_SUCCESS';
export const SAVE_USER_INFO_FAIL = 'SAVE_USER_INFO_FAIL';

export const CREATE_USER = 'CREATE_USER';
export function createUser(form_data){
  return (dispatch, getState) => {
    var data = _getFormData(form_data, getState);
    dispatch({
      type: SAVE_USER_INFO_ING,
    });
    return post(Url.user_add.toString(), data)
      .done(function(){
        dispatch({
          type: SAVE_USER_INFO_SUCCESS,
        })
      })
      .fail(function(){
        dispatch({
          type: SAVE_USER_INFO_FAIL,
        })
      })
  }
  
/*  return TEST(null, [
    {type: SAVE_USER_INFO_ING},  //立即派发
    {type: SAVE_USER_INFO_SUCCESS}   //2000毫秒后派发
  ], 2000);*/
}

export const SUBMIT_ING = 'SUBMIT_ING';
export const SUBMIT_COMPLETE = 'SUBMIT_COMPLETE';

export const SUBMIT_USER='SUBMIT_USER';
export function submitUser(form_data){
  //若是异步的话，那么该函数必须也返回一个函数
  return (dispatch, getState) => {
    var data = _getFormData(form_data, getState);
    var userId = form_data.user_id;
    dispatch({
      type: SUBMIT_ING,
    });
    if(!userId){
      throw Error('user_id should not be undefined');
    }
    return put(Url.submit_user.toString(userId), data)
      .always(function(){
        dispatch({
          type: SUBMIT_COMPLETE,
        })
      })
  }
  // return TEST(null, [
  //   {type: SUBMIT_ING},  //立即派发
  //   {type: SUBMIT_COMPLETE}   //2000毫秒后派发
  // ], 2000);
}

export const GET_CITIES_SIGNAL_STANDARD = 'GET_CITIES_SIGNAL_STANDARD';
export function getCitiesSignalStandard({ province_id, is_standard_area, signal = 'authority' }){
      return GET(Url.cities.toString(province_id), {is_standard_area, signal}, GET_CITIES_SIGNAL_STANDARD);  
}

export const RESET_CITIES_SIGNAL_STANDARD = 'RESET_CITIES_SIGNAL_STANDARD';
export function resetCitiesSignalStandard(){
  return {type: RESET_CITIES_SIGNAL_STANDARD};
}

/*export const GOT_DELIVERY_STATIONS_BY_CITYIDS =  'GOT_DELIVERY_STATIONS_BY_CITY_ID'
export function getDeliveryStationsByCityId(city_ids){
	return TEST({
		
	})
}*/

/*export const GET_STATIONS_BY_CITYIDS = 'GET_STATIONS_BY_CITYIDS';
export function getStationsByCityIds(city_ids){
  return GET(Url.station_merge_list.toString(),{city_ids:city_ids},GET_STATIONS_BY_CITYIDS);  
}*/
