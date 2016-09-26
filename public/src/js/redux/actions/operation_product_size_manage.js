import R from 'utils/request';
import Url from 'config/url';
import { clone, dateFormat, map } from 'utils/index';
import { SELECT_DEFAULT_VALUE, REQUEST } from 'config/app.config';
import { getValues } from 'redux-form';

export const GET_ALL_SIZE_DATA = 'GET_ALL_SIZE_DATA';
export function getAllSizeData(name){
/*  return R.TEST([
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
  ], GET_ALL_SIZE_DATA)*/
  if(!name || name.trim == '')
    return R.GET(Url.manage_product_sizes.toString(), null, GET_ALL_SIZE_DATA);
  else
    return R.GET(Url.manage_product_sizes_by_name.toString(), {name: name}, GET_ALL_SIZE_DATA);
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

export const VIEW_ROW = 'PSM_VIEW_ROW';
export function viewRow(id){
  return {
    type: VIEW_ROW,
    id,
  }
}

export const MOVE_UP = 'PSM_MOVE_UP';
export function moveUp(selected_id){
/*  return {
    type: MOVE_UP,
  }*/
  return (dispatch, getState) => {
    var sizeManage = getState().operationProductSizeManage
    var {selected_id, list} = sizeManage;
    let index = list.findIndex( n => n.id == selected_id );
    var id_a = selected_id;
    if(index != 0){
      var id_b = list[index-1].id
      return R.put(Url.manage_size_move.toString(), {id_a, id_b})
              .done(() => {
                dispatch({
                  type: MOVE_UP
                })
              })   
    }    
  }
}

export const MOVE_DOWN = 'PSM_MOVE_DOWN';
export function moveDown(){
/*  return {
    type: MOVE_DOWN,
  }*/
  return (dispatch, getState) => {
    var sizeManage = getState().operationProductSizeManage
    var {selected_id, list} = sizeManage;
    let index = list.findIndex( n => n.id == selected_id );
    var id_a = selected_id;
    if(index != list.length - 1 ){
      var id_b = list[index+1].id
      return R.put(Url.manage_size_move.toString(), {id_a, id_b})
              .done( () => {
                dispatch({
                  type: MOVE_DOWN,
                })
              })    
    }     
  }
 
}

export const ENABLE_SIZE = 'ENABLE_SIZE';
export function enableSize(id){
/*  return {
    type: ENABLE_SIZE,
    id
  }*/

  return dispatch => {
    return R.put(Url.manage_size_online.toString(), {isOnline: 1, id: id}, ENABLE_SIZE)
            .done( () => {
              dispatch({
                type: ENABLE_SIZE,
                id,
              })
            })
  }
}

export const DISABLE_SIZE = 'DISABLE_SIZE';
export function disableSize(id){
/*  return {
    type: DISABLE_SIZE,
    id
  }*/
  return dispatch => {
    return R.put(Url.manage_size_online.toString(), {isOnline: 0, id: id}, DISABLE_SIZE)
            .done( () => {
              dispatch({
                type: DISABLE_SIZE,
                id,
              })
            })
  }
}

export const ADD_PROPERTY = 'PSM_ADD_PROPERTY';
export function addProperty(data){
  
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
export function propertyChange(index, name,  e){
  return {
    type: PROPERTY_CHANGE,
    index,
    name,
    value: e.target.value
  }
}

export const ADD_PRODUCT_SIZE = 'PSM_ADD_PRODUCT_SIZE';
export function addProductSize(){
  return {
    type: ADD_PRODUCT_SIZE
  }
}

export const POST_ADD_PRODUCT_SIZE_ING = 'POST_ADD_PRODUCT_SIZE_ING';
export const POST_ADD_PRODUCT_SIZE_SUCCESS = 'POST_ADD_PRODUCT_SIZE_SUCCESS';
export const POST_ADD_PRODUCT_SIZE_FAIL = 'POST_ADD_PRODUCT_SIZE_FAIL';
export const UPDATE_EDIT_SIZE = 'UPDATE_EDIT_SIZE';
export function postAddProductSize(){
  return (dispatch, getState) => {
    /*var edit_size = _check(getState);
    var flag = true;
    if(edit_size.name_error){
      flag = false;
    }else{
      edit_size.specs.forEach( m => {
        if(m.error) flag = false;
      })
    }
    dispatch({
      type: UPDATE_EDIT_SIZE,
      edit_size: edit_size,
    })*/
      dispatch({
        type: POST_ADD_PRODUCT_SIZE_ING
      })
      var edit_size = getState().operationProductSizeManage.edit_size;
      edit_size.specs = edit_size.specs.filter( m => m.spec_value.trim() != '' && m.spec_key.trim() != '')
                        .map( m => ({spec_key: m.spec_key, spec_value: m.spec_value})) 
      return R.post(Url.manage_size_add.toString(), edit_size)
              .done(() => {
                  dispatch({
                    type: POST_ADD_PRODUCT_SIZE_SUCCESS,
                  })
              })
              .fail(() => {
                dispatch({
                  type: POST_ADD_PRODUCT_SIZE_FAIL
                })
              })
    }      

}

export const UPDATE_PRODUCT_SIZE_ING = 'UPDATE_PRODUCT_SIZE_ING';
export const UPDATE_PRODUCT_SIZE_SUCCESS = 'UPDATE_PRODUCT_SIZE_SUCCESS';
export function updateProuctSize(id){
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_PRODUCT_SIZE_ING,
    })
    var edit_size = getState().operationProductSizeManage.edit_size;
    edit_size.specs = edit_size.specs.filter( m => m.spec_value.trim() != '' && m.spec_key.trim() != '')
                        .map( m => ({spec_key: m.spec_key, spec_value: m.spec_value}))
    return R.put(Url.manage_size_edit.toString(), {id, specs:edit_size.specs})
      .done(() => {
        dispatch({
          type: UPDATE_PRODUCT_SIZE_SUCCESS
        })
      })
  }
}

function _check(getState){
    var edit_size = getState().operationProductSizeManage.edit_size;
    var errors = [];
    if(!!edit_size){
      if(edit_size.name.trim() == ''){
        edit_size.name_error = 'error';
      }else{
        delete edit_size.name_error;
      }
      edit_size.specs.map( m => {
        if(m.spec_value.trim() == ''){
          m.error = 'error';
        }else{
          delete m.error;
        }
        return m;
      })
    }
    return edit_size;
}
