import R from 'utils/request';
import Url from 'config/url';
import { clone, dateFormat, map } from 'utils/index';
import { SELECT_DEFAULT_VALUE, REQUEST } from 'config/app.config';

export const GET_ALL_SIZE_DATA = 'GET_ALL_SIZE_DATA';
export function getAllSizeData(){
  return R.TEST([
    {id: 102, name: '约2磅', enable: 1, data: [
      {key: '尺寸', value: 'xxx'},
      {key: '人数', value: 'xxxxx'},
      {key: '餐具', value: 'xx'}
    ]},
    {id: 104, name: '约1磅', enable: 1, data: [
      {key: '尺寸', value: 'aaa'},
      {key: '人数', value: 'aaaaaa'}
    ]},
    {id: 105, name: '约3磅', enable: 0, data: [
      {key: '尺寸', value: 'ccccc'},
      {key: '人数', value: 'ccc'},
      {key: '餐具', value: 'cccccccc'},
      {key: '甜度', value: 'c'},
    ]}
  ], GET_ALL_SIZE_DATA)
}

export const ACTIVE_ROW = 'PSM_ACTIVE_ROW';
export function activeRow(id){
  return {
    type: ACTIVE_ROW,
    id,
  }
}

export const EDIT_ROW = 'PSM_EDIT_ROW';
export function editRow(id){
  return {
    type: EDIT_ROW,
    id,
  }
}

export const MOVE_UP = 'PSM_MOVE_UP';
export function moveUp(){
  return {
    type: MOVE_UP,
  }
}

export const MOVE_DOWN = 'PSM_MOVE_DOWN';
export function moveDown(){
  return {
    type: MOVE_DOWN,
  }
}

export const ENABLE_SIZE = 'ENABLE_SIZE';
export function enableSize(id){
  return {
    type: ENABLE_SIZE,
    id
  }
}

export const DISABLE_SIZE = 'DISABLE_SIZE';
export function disableSize(id){
  return {
    type: DISABLE_SIZE,
    id
  }
}

export const ADD_PROPERTY = 'PSM_ADD_PROPERTY';
export function addProperty(){
  return {
    type: ADD_PROPERTY
  }
}

export const DEL_PROPERTY = 'PSM_DEL_PROPERTY';
export function delProperty(index){
  return {
    type: DEL_PROPERTY,
    index
  }
}

export const PROPERTY_OK = 'PSM_PROPERTY_OK';
export function propertyOk(){
  return {
    type: PROPERTY_OK
  }
}

export const PROPERTY_CHANGE = 'PSM_PROPERTY_CHANGE';
export function propertyChange(index, e){
  return {
    type: PROPERTY_CHANGE,
    index,
    value: e.target.value
  }
}

export const ADD_PRODUCT_SIZE = 'PSM_ADD_PRODUCT_SIZE';
export function addProductSize(){
  return {
    type: ADD_PRODUCT_SIZE
  }
}
