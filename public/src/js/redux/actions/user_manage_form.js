import {post, put, GET, POST, test, TEST} from 'utils/request'; //Promise
import Url from 'config/url';
import { getValues } from 'redux-form';
import { initForm } from 'actions/form';
import clone from 'clone';

export const  GOT_USER_BY_ID = 'GOT_USER_BY_ID';
export function getUserById(id){
	/*return GET(Url.user_info.toString(id),null,GOT_USER_BY_ID);*/
	return TEST({
			
		'mobile':'15814063438',
		'name':'张娜',		
		'username':'zhangna',
    
    'cities':[{'city_id':1,'city_name':'xxx'}],
		'stations':[{'station_id':1,'station_name':'xxx'}],
    'roles':[{'role_id':1,'role_name':'xxx'}],
	},GOT_USER_BY_ID)
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
    return post(Url.user_add.toString(), form_data)
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
    dispatch({
      type: SUBMIT_ING,
    });
    if(!form_data.user_id){
      throw Error('user_id should not be undefined');
    }
    return put(Url.submit_user.toString(form_data.user_id), form_data)
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
/*export const GOT_DELIVERY_STATIONS_BY_CITYIDS =  'GOT_DELIVERY_STATIONS_BY_CITY_ID'
export function getDeliveryStationsByCityId(city_ids){
	return TEST({
		
	})
}*/