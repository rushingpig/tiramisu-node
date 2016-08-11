import { combineReducers } from 'redux';
import { AreaActionTypes1 as AreaActions } from 'actions/action_types';
import * as Actions from 'actions/product_sku_website_manage';
import { UPDATE_PATH } from 'redux-simple-router';

import { main as imgList } from 'reducers/central_image_manage';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import { map } from 'utils/index';

var initial_state = {
  all: false, //是否全部一致,
  all_available_city_ids: [],
  provinces: [],
  cities: [],
  province_id: undefined,
  city_id: undefined,
  saved: false,
}

function _t(data){
  return map(data, (text, id) => ({id: +id, text}))
}
function applicationRange(state = initial_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return initial_state;
    case Actions.PW_SET_APPLICATION_RANGE:
      return { ...state, all: action.all }
    case Actions.PW_GET_ALL_AVAILABLE_CITIES:
      return { ...state, all_available_city_ids: action.data }
    case AreaActions.GOT_PROVINCES_SIGNAL:
      return { ...state, provinces: _t(action.data) }
    case AreaActions.GOT_CITIES:
      return { ...state, cities: _t(action.data).filter( n => state.all_available_city_ids.some(m => m == n.id) ) }
    case Actions.PW_SELECT_PROVINCE:
      return { ...state, province_id: action.province_id, city_id: undefined }
    case Actions.PW_SELECT_CITY:
      return { ...state, city_id: action.city_id }
    default :
      return state;
  }
}

var prolistDetail_state = {
  ok: false,
  list_img: '',
  list_copy: '',
}
function prolistDetail(state = prolistDetail_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return prolistDetail_state;
    case Actions.PW_SELECT_IMG:
      if(action.which == 'prolist_img'){
        return {...state, list_img: action.img_key}
      }
    default:
      return state;
  }
}

var imageModal_state = {
  submitting: false,
}
function imgModal(state = imageModal_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return initial_state;
    default :
      return state;
  }
}

export default combineReducers({
  applicationRange,
  imgModal,
  imgList,
})