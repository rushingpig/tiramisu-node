import {get, post} from '../utils/request'; //Promise
import Url from '../config/url';


export const GOT_PROVINCES = 'GOT_PROVINCES';
export const PROVINCE_RESET = 'PROVINCE_RESET';
export const GOT_CITIES = 'GOT_CITIES';
export const CITY_RESET = 'CITY_RESET';
export const GOT_DISTRICTS = 'GOT_DISTRICTS';
export const GOT_AREA_FAIL = 'GOT_AREA_FAIL';

export function getProvinces(){
  return _resolve(Url.provinces.toString(), GOT_PROVINCES);
  // return {
  //   type: GOT_PROVINCES,
  //   data: {1: '广东省', 2: '湖北省', 3: '湖南省'}
  // }
}
export function provinceReset(){
  return {
    type: PROVINCE_RESET,
  }
}

export function getCities(province_id){
  return _resolve(Url.cities.toString(province_id), GOT_CITIES);
  // return {
  //   type: GOT_CITIES,
  //   data: {1: '深圳市', 2: '武汉市', 3: '长沙市'}
  // }
}
export function cityReset(){
  return {
    type: CITY_RESET,
  }
}

export function getDistricts(city_id){
  return _resolve(Url.districts.toString(city_id), GOT_DISTRICTS);
  // return {
  //   type: GOT_DISTRICTS,
  //   data: {1: '南山区', 2: '宝安区', 3: '福田区'}
  // }
}

function _resolve(url, signal) {
  return (dispatch) => {
    return get(url)
      .done(function(json){
        dispatch({
          type: signal,
          data: json
        })
      })
      .fail(function(msg){
        dispatch({
          type: GOT_AREA_FAIL,
          msg
        })
      })
  }
}