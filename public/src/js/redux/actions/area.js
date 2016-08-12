import {get, post, GET} from 'utils/request'; //Promise
import Url from 'config/url';
import { AreaActionTypes1 } from 'actions/action_types';

export default function Area(ActionTypes = AreaActionTypes1){
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
            type: ActionTypes.GOT_AREA_FAIL,
            msg
          })
        })
    }
  };
  return {
    getProvinces: function (){
      return GET(Url.provinces.toString(), null, ActionTypes.GOT_PROVINCES);
      // return {
      //   type: ActionTypes.GOT_PROVINCES,
      //   data: {1: '广东省', 2: '湖北省', 3: '湖南省'}
      // }
    },
    // 根据来源索取省份
    getProvincesSignal:function(signal){
      return GET(Url.provinces.toString(),{signal:signal}, ActionTypes.GOT_PROVINCES_SIGNAL);
    },

    resetCities: function (){
      return {
        type: ActionTypes.RESET_CITIES,
      }
    },

    getAllCities:function(signal){
      return GET(Url.all_cities.toString(),{signal:signal}, ActionTypes.GOT_ALL_CITIES);
/*      return {
        type:ActionTypes.GOT_ALL_CITIES,
        data:{1:'xxxx',2:'xxx'}
      }*/
    },
    getCities: function (province_id){
      return _resolve(Url.cities.toString(province_id), ActionTypes.GOT_CITIES);
      // return {
      //   type: ActionTypes.GOT_CITIES,
      //   data: {1: '深圳市', 2: '武汉市', 3: '长沙市'}
      // }
    },

    //添加标志获取城市
    //旧版， 根据省份id获取城市，避免与qa的三级城市冲突
    getCitiesSignal_Old:function(province_id,signal){
      return GET(Url.cities.toString(province_id),{signal:signal},ActionTypes.GOT_CITIES_SIGNAL);
    },

    resetDistricts: function (){
      return {
        type: ActionTypes.RESET_DISTRICTS,
      }
    },

    getDistricts: function (city_id){
      return _resolve(Url.districts.toString(city_id), ActionTypes.GOT_DISTRICTS);
      // return {
      //   type: ActionTypes.GOT_DISTRICTS,
      //   data: {1: '南山区', 2: '宝安区', 3: '福田区'}
      // }
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

