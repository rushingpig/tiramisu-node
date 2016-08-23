import R from 'utils/request';
import Url from 'config/url';
import { clone, dateFormat, map } from 'utils/index';
import Area from 'actions/area';
import { SELECT_DEFAULT_VALUE, REQUEST } from 'config/app.config';
import { onFormChange } from 'actions/common';
import { GET_ALL_AVAILABLE_CITIES } from 'actions/product_sku_website_manage';

export const SET_APPLICATION_RANGE = 'HPC_SET_APPLICATION_RANGE';
export function setApplicationRange(all){
  return {
    type: SET_APPLICATION_RANGE,
    all
  }
}

export const GET_CONFIGURE_DATA = 'HPC_GET_CONFIGURE_DATA';
export function getConfigureData(){
  return dispatch => $.when(
    Area().getProvincesSignal()(dispatch),
    []
  ).done( (provinces, data) => {
    dispatch({
      type: GET_CONFIGURE_DATA,
      provinces: provinces[0]/*.filter(n => cities[0].can_add_cities.some(m => m.province_id == n.id))*/,
      data
    })
  })
  // return R.TEST([
  //   // {city_id: 440100, consistency: 0, data: [
  //   //   {img_key: 'url1', link: 'http://xxxx.com'},
  //   //   {img_key: 'url2', link: 'http://xxxx.com'},
  //   //   {img_key: 'url3', link: 'http://xxxx.com'}
  //   // ]}
  // ], GET_CONFIGURE_DATA)
}

export const SELECT_PROVINCE = 'HPC_SELECT_PROVINCE';
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

export const SELECT_CITY = 'HPC_SELECT_CITY';
export function selectCity(city_id){
  return {
    type: SELECT_CITY,
    city_id
  }
}

export const CACHE_INFO = 'HPC_CACHE_INFO';
export function cacheInfo(){
  return {
    type: CACHE_INFO,
  }
}

export const SELECT_BANNER = 'HPC_SELECT_BANNER';
export function selectBanner(which){
  return {
    type: SELECT_BANNER,
    which
  }
}

export const SELECT_IMG = 'HPC_SELECT_IMG';
export function selectImg(img_key, which){
  return {
    type: SELECT_IMG,
    img_key,
    which
  }
}

export const DELETE_IMG = 'HPC_DELETE_IMG';
export function deleteImg(which){
  return {
    type: DELETE_IMG,
    which
  }
}

export const ADD_BANNER = 'HPC_ADD_BANNER';
export function addBanner(){
  return {
    type: ADD_BANNER
  }
}

//添加产品设置
export const SUBMIT_INFO = 'HPC_SUBMIT_INFO';
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