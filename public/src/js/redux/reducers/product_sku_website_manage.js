import { combineReducers } from 'redux';
import { AreaActionTypes1 as AreaActions } from 'actions/action_types';
import * as Actions from 'actions/product_sku_website_manage';
import { FORM_CHANGE } from 'actions/common';
import { UPDATE_PATH } from 'redux-simple-router';
import clone from 'clone';

import { main as imgList } from 'reducers/central_image_manage';
import { SELECT_DEFAULT_VALUE, REQUEST } from 'config/app.config';
import { Noty, map, some } from 'utils/index';

var initial_state = {
  all: true, //是否全部一致,
  all_available_cities: [],
  all_edited_cities: [], //[{city_id, detail_id, consistency: 是否全部一致（0：是，1：独立}]
  provinces: [],
  cities: [],
  province_id: undefined,
  city_id: undefined,
  // saved: false,

  product_info_ing: false,
  product_info: null, //每次都根据product_id, city_id拉取商品配置信息，如果为空，则代表应添加
  cached: [], //缓存数据
}

function _t(data){
  return map(data, (text, id) => ({id: +id, text}))
}
export function applicationRange(state = initial_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return initial_state;
    case Actions.SET_APPLICATION_RANGE:
      return { ...state, all: action.all }
    case Actions.GET_ALL_AVAILABLE_CITIES:
      return { ...state,
        all: !( action.has_detailc_cities && action.has_detailc_cities.some( n => n.consistency != 0) ),
        provinces: action.provinces,
        all_available_cities: action.can_add_cities ? action.can_add_cities : [],
        all_edited_cities: action.has_detailc_cities
          ? action.has_detailc_cities.map(({regionalism_id, id, consistency}) => ({city_id: regionalism_id, detail_id: id, consistency}))
          : []
      }
    case AreaActions.GOT_PROVINCES_SIGNAL:
      return { ...state, provinces: _t(action.data) }
    case AreaActions.GOT_CITIES:
      return { ...state,
        cities: _t(action.data).filter( n => {
          if(state.all_available_cities.some(m => m.city_id == n.id)){
            n.checked = state.all_edited_cities.some( m => m.city_id == n.id );
            return true;
          }
        })
      }
    case Actions.SELECT_PROVINCE:
      return { ...state, province_id: action.province_id, city_id: undefined }
    case Actions.SELECT_CITY:
      return { ...state, city_id: action.city_id }
    case Actions.GET_PRODUCT_INFO_ING:
      return { ...state, product_info_ing: true }
    case Actions.GET_PRODUCT_INFO:
      return { ...state, product_info_ing: false, product_info: action.data }
    case Actions.CACHE_INFO:
      return { ...state, cached: [...state.cached, action.data] }
    case Actions.SUBMIT_INFO:
      return { ...state, cached: [] }
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
    case Actions.GET_PRODUCT_INFO:
      return { ...state, ok: false, list_img: action.data.list_img, list_copy: action.data.list_copy }
    case Actions.SUBMIT_INFO:
      return { ...state, ok: false }
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
    {key: '保鲜条件',  value: ''},
    {key: '原材料',    value: ''},
  ]
}
function proProperties(state = proProperties_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return proProperties_state;
    case Actions.GET_PRODUCT_INFO:
      return { ...state,
        ok: false,
        briefIntro_1: action.data.detail_top_copy,
        briefIntro_2: action.data.detail_template_copy,
        briefIntro_3: action.data.detail_template_copy_end,
        spec: action.data.spec,
      }
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
      return {...state, spec: [...state.spec.filter(n => !n.editable)], ok: true}
    case Actions.SPEC_ITEM_CHANGE:
      let new_spec = clone(state.spec);
      new_spec.forEach(n => {
        if(n.key === action.name){
          n.value = action.value
        }
      })
      return {...state, spec: [...new_spec], ok: false}
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
    case Actions.SUBMIT_INFO:
      return { ...state, ok: false }
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
      return proIntro_state;
    case Actions.GET_PRODUCT_INFO:
      return {...state,
        ok: false,
        intro_img_1: action.data.detail_img_1,
        intro_img_2: action.data.detail_img_2,
        intro_img_3: action.data.detail_img_3,
        intro_img_4: action.data.detail_img_4,
      }
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
    case Actions.SUBMIT_INFO:
      return { ...state, ok: false }
    default :
      return state;
  }
}

var proDetailImgs_state = {
  ok: false,
  template_id: 100000,
  template_data: {
    100001: '',
    100002: '',
    100003: '',
    100004: '',
  }
}
function proDetailImgs(state = proDetailImgs_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return proDetailImgs_state;
    case Actions.GET_PRODUCT_INFO:
      var template_data = {};
      action.data.template_data.forEach( n => template_data[n.position_id] = n.value );
      return {...state, template_data}
    case Actions.SELECT_IMG:
      if(action.which.startsWith('prodetail_img_')){
        return {...state,
          template_data: {...state.template_data, [action.which.replace('prodetail_img_', '')]: action.img_key},
          ok: false
        }
      }
      return state;
    case Actions.DELETE_IMG:
      if(action.which.startsWith('prodetail_img_')){
        return {...state,
          template_data: {...state.template_data},
          [action.which.replace('prodetail_img_', '')]: '',
          ok: false
        }
      }
      return state;
    case 'ProDetailImgs' + Actions.IS_OK:
      if(some(state.template_data, n => !n)){
        Noty('warning', '某些选项您可能没有进行设置')
      }
      return {...state, ok: true}
    case Actions.SUBMIT_INFO:
      return { ...state, ok: false }
    default :
      return state;
  }
}

var main_state = {
  submitting: false,
}
function main(state = main_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return main_state;
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

var imageModal_state = {
  submitting: false,
}
function imgModal(state = imageModal_state, action){
  switch (action.type) {
    case UPDATE_PATH:
      return imageModal_state;
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
  main,
  imgModal,
  imgList,
})