import {get, post, GET} from 'utils/request'; //Promise
import Url from 'config/url';
import { AreaActionTypes1 } from 'actions/action_types';
import { triggerFormUpdate } from 'actions/form';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';

// signal ==> 已开通

export default function Area(ActionTypes = AreaActionTypes1){
  return {
    getProvinces: function (){
      return GET(Url.provinces.toString(), null, ActionTypes.GOT_PROVINCES);
      // return {
      //   type: ActionTypes.GOT_PROVINCES,
      //   data: {1: '广东省', 2: '湖北省', 3: '湖南省'}
      // }
    },
    // 根据来源索取省份
    getProvincesSignal:function(signal = 'authority'){
      return GET(Url.provinces.toString(), {signal}, ActionTypes.GOT_PROVINCES_SIGNAL);
    },
    setProvince: function(province_id = 'no province id'){
      return {
        type: ActionTypes.SET_PROVINCE,
        province_id
      }
    },


    resetCities: function (form_name){
      return dispatch => {
        if(form_name){
          dispatch( triggerFormUpdate(form_name, 'city_id', SELECT_DEFAULT_VALUE) );
          dispatch( triggerFormUpdate(form_name, 'district_id', SELECT_DEFAULT_VALUE) );
        }
        dispatch({
          type: ActionTypes.RESET_CITIES,
        });
      }
    },
    getAllCities:function(signal = 'authority'){
      return GET(Url.all_cities.toString(),{signal}, ActionTypes.GOT_ALL_CITIES);
    },
    getCities: function (province_id){
      return GET(Url.cities.toString(province_id), null, ActionTypes.GOT_CITIES);
    },
    getStandardCities:function(province_id){
      return GET(Url.cities.toString(province_id), {is_standard_area: 1}, ActionTypes.GOT_CITIES);
    },
    //添加标志获取城市
    getCitiesSignal:function({ province_id, is_standard_area, signal = 'authority' }){
      return GET(Url.cities.toString(province_id), {is_standard_area, signal}, ActionTypes.GOT_CITIES_SIGNAL);
    },
    getStandardCitiesSignal:function({ province_id, signal = 'authority' }){
      return GET(Url.cities.toString(province_id), {is_standard_area: 1, signal}, ActionTypes.GOT_CITIES_SIGNAL);
    },
    setCity: function(city_id = 'no city id'){
      return {
        type: ActionTypes.SET_CITY,
        city_id
      }
    },


    resetDistricts: function (form_name){
      return dispatch => {
        if(form_name){
          //兼容两种命名
          dispatch( triggerFormUpdate(form_name, 'district_id', SELECT_DEFAULT_VALUE) );
          dispatch( triggerFormUpdate(form_name, 'regionalism_id', SELECT_DEFAULT_VALUE) );
        }
        dispatch({
          type: ActionTypes.RESET_DISTRICTS,
        });
      }
    },
    //获取区县(未单独开通)
    getDistricts: function (city_id){
      return GET(Url.districts.toString(city_id), null, ActionTypes.GOT_DISTRICTS);
    },
    //获取开通的三级区县 以及 未开通的区县
    getStandardDistricts: function (city_id){
      return GET(Url.districts.toString(city_id), {is_standard_area: 1}, ActionTypes.GOT_DISTRICTS);
    },
    //获取开通的城市(地级市、开通的区县) 归类到区
    getDistrictsAndCity: function(city_id){
      return GET(Url.districts_and_city.toString(city_id), null, ActionTypes.GOT_DISTRICTS_AND_CITY);
    },
    //获取开通的城市(地级市、开通的区县) 归类到市
    getCityAndDistricts: function(city_id){
      return GET(Url.districts_and_city.toString(city_id), null, ActionTypes.GOT_CITY_AND_DISTRICTS);
    },
    setDestrict: function(district_id = 'no district id'){
      return {
        type: ActionTypes.SET_CITY,
        district_id
      }
    },


    getDeliveryShops: function (district_id) {
      return GET(Url.shops.toString(district_id), null, ActionTypes.GOT_DELIVERY_SHOPS);
    },
    //清空shop
    resetShops: function (){
      return {
        type: ActionTypes.RESET_SHOPS,
      }
    }
  }
}

