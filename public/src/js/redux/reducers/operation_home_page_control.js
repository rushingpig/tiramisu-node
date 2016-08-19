import { combineReducers } from 'redux';
import { FORM_CHANGE } from 'actions/common';
import { UPDATE_PATH } from 'redux-simple-router';
import clone from 'clone';

import * as Actions from 'actions/operation_home_page_control';
import * as AreaActions from 'actions/area';

import { main as imgList } from 'reducers/central_image_manage';
import { SELECT_DEFAULT_VALUE, REQUEST } from 'config/app.config';
import { Noty, map, some } from 'utils/index';

var initial_state = {
  all: true, //是否全部一致,
  provinces: [],
  cities: [],
  province_id: undefined,
  city_id: undefined,

  configure_data: [], //[{city_id, detail_id, consistency: 是否全部一致（0：是，1：独立}]
  cached: [], //缓存数据

  selected_index: -1,
  banners: [],
  submitting: false,
}

function _t(data){
  return map(data, (text, id) => ({id: +id, text}))
}
function main(state = initial_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return initial_state;
    case Actions.SET_APPLICATION_RANGE:
      return { ...state, all: action.all }
    case Actions.GET_CONFIGURE_DATA:
      let all = !( action.data && action.data.length && action.data.some( n => n.consistency == 1) );
      return {
        ...state,
        all,
        configure_data: action.data,
        banners: all && action.data.length ? action.data[0] : [{img_key: '', link: ''},{img_key: '', link: ''}]
      }
    case AreaActions.GOT_PROVINCES_SIGNAL:
      return { ...state, provinces: _t(action.data) }
    case AreaActions.GOT_CITIES:
      return { ...state,
        cities: _t(action.data).filter( n => {
          if(state.configure_data.some(m => m.city_id == n.id)){
            n.checked = true;
            return true;
          }
        })
      }
    case Actions.SELECT_PROVINCE:
      return { ...state, province_id: action.province_id, city_id: undefined }
    case Actions.SELECT_CITY:
      return { ...state, city_id: action.city_id }
    case Actions.CACHE_INFO:
      return { ...state, cached: [...state.cached, action.data] }
    case Actions.SUBMIT_INFO:
      return { ...state, cached: [] }

    case Actions.SUBMIT_INFO:
      if(action.key == REQUEST.ING){
        return { ...state, submitting: true }
      }else if(action.key == REQUEST.SUCCESS || action.key == REQUEST.FAIL){
        return { ...state, submitting: false }
      }
    default :
      return state;
  }
}

export default combineReducers({
  main,
  imgList,
})