import R from 'utils/request';
import Url from 'config/url';
import { clone, dateFormat } from 'utils/index';
import Area from 'actions/area';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import { onFormChange } from 'actions/common';

//PW 为 命名空间
export const SET_APPLICATION_RANGE = 'PW_SET_APPLICATION_RANGE';
export function setApplicationRange(all){
  return {
    type: SET_APPLICATION_RANGE,
    all
  }
}

export const GET_ALL_AVAILABLE_CITIES = 'PW_GET_ALLCITIES';
export function getAllAvailableCities(product_id){
  return R.GET(Url.product_cities.toString(), {product_id}, GET_ALL_AVAILABLE_CITIES);
  // return R.TEST({has_detailc_cities: [
  //   440100,
  //   440114,
  //   440300
  // ]}, GET_ALL_AVAILABLE_CITIES);
}

export const SELECT_PROVINCE = 'PW_SELECT_PROVINCE';
export function selectProvince(province_id){
  return dispatch => {
    dispatch({
      type: SELECT_PROVINCE,
      province_id
    })
    if(province_id){
      return Area().getCities(province_id)(dispatch);
    }
  }
}

export const SELECT_CITY = 'PW_SELECT_CITY';
export function selectCity(city_id){
  return dispatch => {
    dispatch({
      type: SELECT_CITY,
      city_id
    })
  }
}

export const SELECT_IMG = 'PW_SELECT_IMG';
export function selectImg(img_key, which){
  return {
    type: SELECT_IMG,
    img_key,
    which
  }
}

export const DELETE_IMG = 'PW_DELETE_IMG';
export function deleteImg(which){
  return {
    type: DELETE_IMG,
    which
  }
}

export const IS_OK = '_PW_IS_OK';
export function confirmThisPart(which_part){
  return {
    type: which_part + IS_OK,
  }
}

export const SPEC_ITEM = '_SPEC_ITEM';
export function excSpecItem(act){
  return {
    type: act + SPEC_ITEM
  }
}

export const SPEC_ITEM_CHANGE = 'SPEC_ITEM_CHANGE';
export function onSpecItemChange( name, e){
  return {
    type: SPEC_ITEM_CHANGE,
    name,
    value: e.target.value
  }
}