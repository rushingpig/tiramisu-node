import { getValues } from 'redux-form';
import { clone } from 'clone';
import {get, put, del, post, GET, POST} from 'utils/request';
import Url from 'config/url';
import { Noty, formCompile } from 'utils/index';

export const GET_ALL_STATIONS_NAME = 'GET_ALL_STATIONS_NAME';
export const GET_STATION_LIST = 'GET_STATION_LIST';
export const GET_STATION_LIST_BY_ID = 'GET_STATION_LIST_BY_ID';
export const GET_STATIONS_BY_NAME = 'GET_STATIONS_BY_NAME';
export const DELETE_STATION = 'DELETE_STATION';
export const DELETE_MULTI_STATION = 'DELETE_MULTI_STATION';
export const CHECK_STATION = 'CHECK_STATION';
export const CHECK_ALL_STATIONS = 'CHECK_ALL_STATIONS';

export const PUT_MULTIPLE_SCOPE = 'PUT_MULTIPLE_SCOPE';
export const PUT_MULTIPLE_SCOPE_ING = 'PUT_MULTIPLE_SCOPE_ING';
export const PUT_MULTIPLE_SCOPE_SUCCESS = 'PUT_MULTIPLE_SCOPE_SUCCESS';
export const PUT_MULTIPLE_SCOPE_FAILURE = 'PUT_MULTIPLE_SCOPE_FAILURE';

export function getStationList(data){
  return (dispatch, getState) => {
    if(!data.province_id || !data.city_id){
      //TODO
      data.province_id = 440000;
      data.city_id = 440300;
    }
    var filter_data = getValues(getState().form.station_manage_filter);
    filter_data = formCompile(filter_data);
    return GET(Url.station_list.toString(), {...data, ...filter_data}, GET_STATION_LIST)(dispatch)
  }
}

export function getStationListById(station_id){
  return GET(Url.station_get.toString(), {id: station_id}, GET_STATION_LIST_BY_ID);
}

export function getAllStationsName(){
  return GET(Url.stations.toString(), null, GET_ALL_STATIONS_NAME);
}

export function getStationByName(station_name){
  return GET(Url.station_single.toString(), station_name, GET_STATIONS_BY_NAME);
}

export function deleteStation(station_id){
  return (dispatch, getState) => {
    return del(Url.station_delete.toString(station_id))
      .done(function(){ 
        dispatch({
          type: DELETE_STATION,
          data: station_id
        })
        console.log('success');
        Noty('success','删除成功')
      })
  }
  return POST(Url.station_delete.toString(station_id), null, DELETE_STATION);
}

export function putMultipleStationScope(data){
  return (dispatch) => {
    dispatch({
      type: PUT_MULTIPLE_SCOPE_ING
    });
    return put(Url.station_multiple_scope_change.toString(), {data: data})
      .done(function(){
        dispatch({
          type: PUT_MULTIPLE_SCOPE_SUCCESS
        });
      })
      .fail(function(){
        dispatch({
          type: PUT_MULTIPLE_SCOPE_FAILURE
        });
      })
  }
}

export function checkStation(station_id, checked){
  return {
    type: CHECK_STATION,
    station_id,
    checked,
  }
}

export function checkAllStations(checked){
  return {
    type: CHECK_ALL_STATIONS,
    checked,
  }
}

export const OPEN_EDIT = 'OPEN_EDIT';
export function openEdit(){
  return {
    type: OPEN_EDIT,
  }
}

export const CLOSE_EDIT = 'CLOSE_EDIT';
export function closeEdit(){
  return {
    type: CLOSE_EDIT,
  }
}