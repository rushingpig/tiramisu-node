import {get, post, put, PUT, POST, GET, TEST} from 'utils/request'; //Promise
import Url from 'config/url';

export const GET_STATION_BY_ID = 'GET_STATION_BY_ID';
export const ADD_STATION = 'ADD_STATION';
export const UPDATE_STATION = 'UPDATE_STATION';
export const SAVE_STATION_INFO_ING = 'SAVE_STATION_INFO_ING';
export const SAVE_STATION_INFO_SUCCESS = 'SAVE_STATION_INFO_SUCCESS';
export const SAVE_STATION_INFO_FAIL = 'SAVE_STATION_INFO_FAIL';

export function getStationById (station_id){
  return GET(Url.station_get.toString(), {id: station_id}, GET_STATION_BY_ID);
}

export function addStation(form_data){
  //若是异步的话，那么该函数必须也返回一个函数
  delete form_data.province_id;
  delete form_data.city_id;
  return (dispatch) => {
    dispatch({
      type: SAVE_STATION_INFO_ING,
    })
    return post(Url.station_add.toString(), form_data)
      .done(function(){ 
        dispatch({
          type: SAVE_STATION_INFO_SUCCESS,
        })
      })
      .fail(function(){
        dispatch({
          type: SAVE_STATION_INFO_FAIL,
        })
      })
  }
  // return TEST(null, [
  //   {type: SAVE_STATION_INFO_ING},  //立即派发
  //   {type: SAVE_STATION_INFO_SUCCESS}   //2000毫秒后派发
  // ], 2000);
}

export function updateStation(form_data,station_id){
  //若是异步的话，那么该函数必须也返回一个函数
  delete form_data.province_id;
  delete form_data.city_id;
  return (dispatch) => {
    dispatch({
      type: SAVE_STATION_INFO_ING,
    });
    if(!station_id){
      throw Error('station_id should not be undefined');
    }
    return put(Url.station_change.toString(station_id), form_data)
      .done(function(){
        dispatch({
          type: SAVE_STATION_INFO_SUCCESS,
        })
      })
      .fail(function(){
        dispatch({
          type: SAVE_STATION_INFO_FAIL,
        })
      })
  }
}

