import R from 'utils/request';
import Url from 'config/url';
import { clone, dateFormat, map } from 'utils/index';
import Area from 'actions/area';
import { SELECT_DEFAULT_VALUE, REQUEST } from 'config/app.config';
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
  return dispatch => $.when(
    Area().getProvincesSignal()(dispatch),
    R.get(Url.product_cities.toString(), {product_id})
  ).done( (provinces, cities) => {
    dispatch({
      type: GET_ALL_AVAILABLE_CITIES,
      provinces: map(provinces[0], (text, id) => ({id: +id, text})).filter(n => cities[0].can_add_cities.some(m => m.province_id == n.id)),
      ...cities[0]
    })
  })
}

export const GET_PRODUCT_INFO_ING = 'PW_GET_PRODUCT_INFO_ING';
export const GET_PRODUCT_INFO = 'PW_GET_PRODUCT_INFO';
export function getProductInfo(data){
  return dispatch => {
    dispatch({ type: GET_PRODUCT_INFO_ING });
    return R.GET(Url.product_info.toString(), data, GET_PRODUCT_INFO)(dispatch);
  };
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
  return {
    type: SELECT_CITY,
    city_id
  }
}

export const CACHE_INFO = 'PW_CACHE_INFO';
export function cacheInfo(data){
  return {
    type: CACHE_INFO,
    data
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

//添加产品设置
export const SUBMIT_INFO = 'PW_SUBMIT_INFO';
export function submitCreate(data){
  return R.POST(Url.product_info.toString(), data, SUBMIT_INFO);
  // return R.TEST(null, [
  //   {type: SUBMIT_INFO, key: 0},
  //   {type: SUBMIT_INFO, key: 1},
  // ], 2000)
}
//编辑产品设置
export function submitEdit(data){
  return R.PUT(Url.product_info.toString(), data, SUBMIT_INFO);
  // return R.TEST(null, [
  //   {type: SUBMIT_INFO, key: REQUEST.ING},
  //   {type: SUBMIT_INFO, key: REQUEST.SUCCESS},
  // ], 2000)
}