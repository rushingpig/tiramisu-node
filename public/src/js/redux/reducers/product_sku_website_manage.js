import { combineReducers } from 'redux';
import { AreaActionTypes1 as AreaActions } from 'actions/action_types';
import * as Actions from 'actions/product_sku_website_manage';
import { FORM_CHANGE } from 'actions/common';
import { UPDATE_PATH } from 'redux-simple-router';

import { main as imgList } from 'reducers/central_image_manage';
import { SELECT_DEFAULT_VALUE } from 'config/app.config';
import { Noty, map, some } from 'utils/index';

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
    case Actions.SET_APPLICATION_RANGE:
      return { ...state, all: action.all }
    case Actions.GET_ALL_AVAILABLE_CITIES:
      return { ...state, all_available_city_ids: action.data ? action.data.has_detailc_cities : [] }
    case AreaActions.GOT_PROVINCES_SIGNAL:
      return { ...state, provinces: _t(action.data) }
    case AreaActions.GOT_CITIES:
      return { ...state, cities: _t(action.data).filter( n => state.all_available_city_ids.some(m => m == n.id) ) }
    case Actions.SELECT_PROVINCE:
      return { ...state, province_id: action.province_id, city_id: undefined }
    case Actions.SELECT_CITY:
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
    case Actions.SELECT_IMG:
      return action.which == 'prolist_img' ? {...state, list_img: action.img_key, ok: false} : state;
    case Actions.DELETE_IMG:
      return action.which == 'prolist_img' ? {...state, list_img: '', ok: false} : state;
    case FORM_CHANGE + 'prolist_desc':
      return {...state, list_copy: action.value, ok: false}
    case 'ProlistDetail' + Actions.IS_OK:
      if(!state.list_img || !state.list_copy){
        Noty('warning', '某些选项您可能没有进行设置')
      }
      return {...state, ok: true}
    default:
      return state;
  }
}

var proProperties_state = {
  ok: false,
  briefIntro_1: '',
  briefIntro_2: '',
  briefIntro_3: '',
  spec: [
    {key: '蛋糕类型',  value: ''},
    {key: '口味',     value: ''},
    {key: '适合人群',  value: ''},
    {key: '甜度',      value: ''},
    {key: '保险条件',  value: ''},
    {key: '原材料',    value: ''},
  ]
}
function proProperties(state = proProperties_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return prolistDetail_state;
    case FORM_CHANGE + 'briefIntro_1':
      return {...state, briefIntro_1: action.value, ok: false}
    case FORM_CHANGE + 'briefIntro_2':
      return {...state, briefIntro_2: action.value, ok: false}
    case FORM_CHANGE + 'briefIntro_3':
      return {...state, briefIntro_3: action.value, ok: false}
    case 'ProProperties' + Actions.IS_OK:
      // if(
      //   !state.briefIntro_1 ||
      //   !state.briefIntro_2 ||
      //   !state.briefIntro_3 ||
      // ){
      //   Noty('warning', '某些选项您可能没有进行设置')
      // }
      return {...state, ok: true}
    case Actions.SPEC_ITEM_CHANGE:
      state.spec.forEach(n => {
        if(n.key === action.name){
          n.value = action.value
        }
      })
      return {...state, spec: [...state.spec], ok: false}
    case FORM_CHANGE + 'editable_key':
      var editable_item = state.spec[state.spec.length - 1];
      if(editable_item.editable){
        editable_item.key = action.value;
      }
      return {...state, spec: [...state.spec], ok: false}
    case 'ADD' + Actions.SPEC_ITEM:
      return {...state, spec: [...state.spec, {key: '', value: '', editable: true}]}
    case 'DEL' + Actions.SPEC_ITEM:
      state.spec.pop();
      return {...state, spec: [...state.spec]}
    case 'OK' + Actions.SPEC_ITEM:
      var editable_item = state.spec[state.spec.length - 1];
      if(!editable_item.key.trim()){
        return state;
      }else{
        editable_item.key = editable_item.key.trim();
        delete editable_item.editable;
      }
      return {...state, spec: [...state.spec]}
    default:
      return state;
  }
}

var proIntro_state = {
  ok: false,
  intro_img_1: '',
  intro_img_2: '',
  intro_img_3: '',
  intro_img_4: '',
}
function proIntro(state = proIntro_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return initial_state;
    case Actions.SELECT_IMG:
      if(
        action.which == 'intro_img_1' ||
        action.which == 'intro_img_2' ||
        action.which == 'intro_img_3' ||
        action.which == 'intro_img_4'
      ){
        return {...state, [action.which]: action.img_key, ok: false}
      }
      return state;
    case Actions.DELETE_IMG:
      if(
        action.which == 'intro_img_1' ||
        action.which == 'intro_img_2' ||
        action.which == 'intro_img_3' ||
        action.which == 'intro_img_4'
      ){
        return {...state, [action.which]: '', ok: false}
      }
      return state;
    case 'ProIntro' + Actions.IS_OK:
      if(
        !state.intro_img_1 ||
        !state.intro_img_2 ||
        !state.intro_img_3 ||
        !state.intro_img_4
      ){
        Noty('warning', '某些选项您可能没有进行设置')
      }
      return {...state, ok: true}
    default :
      return state;
  }
}

var proDetailImgs_state = {
  ok: false,
  template_data: {
    prodetail_img_1: '',
    prodetail_img_2: '',
    prodetail_img_3: '',
    prodetail_img_4: '',
  }
}
function proDetailImgs(state = proDetailImgs_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return initial_state;
    case Actions.SELECT_IMG:
      if(action.which.startsWith('prodetail_img')){
        state.template_data[action.which] = action.img_key;
        return {...state, template_data: {...state.template_data}, ok: false}
      }
      return state;
    case Actions.DELETE_IMG:
      if(action.which.startsWith('prodetail_img')){
        state.template_data[action.which] = '';
        return {...state, template_data: {...state.template_data}, ok: false}
      }
      return state;
    case 'ProDetailImgs' + Actions.IS_OK:
      if(some(state.template_data, n => !n)){
        Noty('warning', '某些选项您可能没有进行设置')
      }
      return {...state, ok: true}
    default :
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
  prolistDetail,
  proProperties,
  proIntro,
  proDetailImgs,
  imgModal,
  imgList,
})