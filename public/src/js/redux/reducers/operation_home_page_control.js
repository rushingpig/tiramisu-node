import { combineReducers } from 'redux';
import { FORM_CHANGE } from 'actions/common';
import { UPDATE_PATH } from 'redux-simple-router';
import clone from 'clone';

import * as Actions from 'actions/operation_home_page_control';
import { AreaActionTypes1 as AreaActions} from 'actions/action_types';

import { main as imgList } from 'reducers/central_image_manage';
import { SELECT_DEFAULT_VALUE, REQUEST } from 'config/app.config';
import { Noty, map, some, del } from 'utils/index';

var initial_state = {
  all_init: false, //应用范围初始状态是否全部一致
  all: true, //是否全部一致,
  provinces: [],
  cities: [],
  province_id: undefined,
  city_id: undefined,

  configure_data: [], //[{city_id, detail_id, consistency: 是否全部一致（0：是，1：独立}]
  cached: [], //缓存数据

  selected_index: -1,
  banners: [{img_key: '', link: ''},{img_key: '', link: ''}],

  has_cached: false,
  submitable: false,
  submitting: false,
}

function _t(data){
  return map(data, (text, id) => ({id: +id, text}))
}
function checkSubmitable(banners){
  banners = banners.filter(n => n.img_key && n.link);
  return banners.length >=2 && banners.length <=5;
}
function main(state = initial_state, action){
  var new_banners = undefined;
  switch (action.type) {
    case UPDATE_PATH:
      return initial_state;
    case Actions.SET_APPLICATION_RANGE:
      return { ...state, all: action.all }
    case Actions.GET_CONFIGURE_DATA:
      let all = !( action.data && action.data.length && action.data.some( n => n.consistency == 1) );
      return {
        ...state,
        all_init: all,
        all,
        configure_data: action.data,
        provinces: _t(action.provinces),
        banners: all && action.data.length ? action.data[0].data : state.banners
      }
    case AreaActions.GOT_CITIES:
      return { ...state,
        cities: _t(action.data).map( n => {
          if(state.configure_data.some(m => m.city_id == n.id)){
            n.checked = true;
          }
          return n;
        })
      }
    case Actions.SELECT_PROVINCE:
      return { ...state,
        province_id: action.province_id,
        city_id: undefined,
        banners: initial_state.banners,
        submitable: false,
      }
    case Actions.SELECT_CITY:
      let city_data = state.configure_data.concat(state.cached).filter(n => n.city_id == action.city_id)[0];
      new_banners = state.all_init && state.cached.every(n => n.city_id != action.city_id)
          ? initial_state.banners
          : (city_data ? city_data.data : initial_state.banners)
      return { ...state,
        city_id: action.city_id,
        selected_index: initial_state.selected_index,
        banners: new_banners,
        submitable: checkSubmitable(new_banners),
        has_cached: state.cached.some(n => n.city_id == action.city_id),
      }
    case Actions.CACHE_INFO:
      if(checkSubmitable(state.banners)){
        return { ...state,
          cached: [...state.cached, {city_id: state.city_id, consistency: 1, data: clone(state.banners)}],
          has_cached: true,
          selected_index: initial_state.selected_index
        }
      }else{
        return state;
      }

    case Actions.SELECT_IMG:
      new_banners = clone(state.banners);
      new_banners[action.which] && (new_banners[action.which].img_key = action.img_key);
      return { ...state,
        banners: new_banners,
        selected_index: action.which,
        has_cached: false,
        submitable: checkSubmitable(new_banners)
      }
    case Actions.DELETE_IMG:
      new_banners = clone(state.banners);
      if(new_banners[action.which]){
        new_banners[action.which].img_key = '';
        new_banners[action.which].link = '';
      }
      return { ...state,
        banners: new_banners,
        has_cached: false,
        selected_index: action.which == state.selected_index ? -1 : state.selected_index,
        submitable: checkSubmitable(new_banners)
      }
    case Actions.ADD_BANNER:
      return { ...state, banners: [...state.banners, {img_key: '', link: ''}] }
    case Actions.SELECT_BANNER:
      return { ...state, selected_index: action.which }
    case FORM_CHANGE + 'banner_link':
      new_banners = clone(state.banners);
      new_banners[state.selected_index].link = action.value;
      return { ...state,
        banners: new_banners,
        has_cached: false,
        submitable: checkSubmitable(new_banners)
      }

    case Actions.SUBMIT_INFO:
      if(action.key == REQUEST.ING){
        return { ...state, submitting: true }
      }else if(action.key == REQUEST.SUCCESS){
        return { ...state, submitting: false, cached: [], has_cached: false, }
      }else if(action.key == REQUEST.FAIL){
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