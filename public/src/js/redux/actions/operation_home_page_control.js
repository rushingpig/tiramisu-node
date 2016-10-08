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
    Area().getAllCities()(dispatch),
  ).done( (provinces, cities) => {
    dispatch({
      type: GET_CONFIGURE_DATA,
      provinces: provinces[0],
      all_cities: cities[0]
    })
  })
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
export const GET_CITY_INFO = 'HPC_GET_CITY_INFO';
export function selectCity(city_id){
  return (dispatch, getState) => {
    var { cached } = getState().operationHomePageControl.main;
    var cityInfo = cached.find(n => n.city_id == city_id);
    if(cityInfo){
      dispatch({
        type: SELECT_CITY,
        city_id,
        data: cityInfo
      })
    }else{
      return R.get(Url.homepage_by_city.toString(city_id)).done(
        data => dispatch({
          type: SELECT_CITY,
          city_id,
          data
        })
      )
    }
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

export const SUBMIT_INFO = 'HPC_SUBMIT_INFO';
export function submitEdit(data){
  return R.PUT(Url.homepage_control.toString(), data, SUBMIT_INFO);
  // return R.TEST(null, [
  //   {type: SUBMIT_INFO, key: REQUEST.ING},
  //   {type: SUBMIT_INFO, key: REQUEST.SUCCESS},
  // ], 2000)
}