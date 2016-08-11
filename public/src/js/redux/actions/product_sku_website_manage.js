import R from 'utils/request';
import Url from 'config/url';
import { clone, dateFormat } from 'utils/index';
import Area from 'actions/area';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';

//PW 为 命名空间
export const PW_SET_APPLICATION_RANGE = 'PW_SET_APPLICATION_RANGE';
export function setApplicationRange(all){
  return {
    type: PW_SET_APPLICATION_RANGE,
    all
  }
}

export const PW_GET_ALL_AVAILABLE_CITIES = 'PW_GET_ALLCITIES';
export function getAllAvailableCities(){
  return R.TEST([
    440100,
    440114,
    440300
  ], PW_GET_ALL_AVAILABLE_CITIES);
}

export const PW_SELECT_PROVINCE = 'PW_SELECT_PROVINCE';
export function selectProvince(province_id){
  return dispatch => {
    dispatch({
      type: PW_SELECT_PROVINCE,
      province_id
    })
    if(province_id){
      return Area().getCities(province_id)(dispatch);
    }
  }
}

export const PW_SELECT_CITY = 'PW_SELECT_CITY';
export function selectCity(city_id){
  return dispatch => {
    dispatch({
      type: PW_SELECT_CITY,
      city_id
    })
  }
}

export const PW_SELECT_IMG = 'PW_SELECT_IMG';
export function selectImg(img_key, which){
  return {
    type: PW_SELECT_IMG,
    img_key,
    which
  }
}