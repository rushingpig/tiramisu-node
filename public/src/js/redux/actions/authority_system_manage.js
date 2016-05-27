import {post, get, GET, POST, PUT, TEST, del } from 'utils/request'; //Promise
import Url from 'config/url';
import Utils from 'utils/index';
import { Noty } from 'utils/index';

export const ACTIVE_AUTHORITY = 'ACTIVE_AUTHORITY';
export function activeAtuthority(authorize_id){
  return {
    type: ACTIVE_AUTHORITY,
    data: authorize_id
  }
}

export const GET_AUTHORITY_DETAIL = 'GET_AUTHORITY_DETAIL';
export function getAuthorityDetail(authorize_id){
  return (dispatch) => {
    return get(Url.authority_detail.toString(authorize_id), null)
      .done((data) => {
        dispatch({
          type: GET_AUTHORITY_DETAIL,
          data: data,
          id: authorize_id
        })
      })
  } 
}

export const RESET_AUTHORITY_FORM = 'RESET_AUTHORITY_FORM';
export function resetAuthorityForm(){
  return {
    type: RESET_AUTHORITY_FORM,
  }
}

export const ADD_AUTHORITY = 'ADD_AUTHORITY';
export function addAuthority(form_data){
  return POST(Url.authority_add.toString(), form_data, ADD_AUTHORITY);
}

export const CHANGE_AUTHORITY = 'CHANGE_AUTHORITY';
export function changeAuthority(form_data, authority_id){
  return PUT(Url.authority_change.toString(authority_id), form_data, CHANGE_AUTHORITY);
}

export const DELETE_AUTHORITY = 'DELETE_AUTHORITY';
export function deleteAuthority(authority_id){
  return (dispatch) => {
    return del(Url.authority_delete.toString(authority_id), null)
      .done(() => {
        dispatch({
          id: authority_id,
          type: DELETE_AUTHORITY
        })
        Noty('success', '删除成功');
      })
      .fail(function(msg, code){
        Noty('error', msg || '删除异常');
      });
  }
}

export const ADD_MODULE = 'ADD_MODULE';
export function addModule(data){
  return POST(Url.module_add.toString(), data, ADD_MODULE);
}

export const CHANGE_MODULE = 'CHANGE_MODULE';
export function changeModule(form_data, module_id){
  return PUT(Url.module_edit.toString(module_id),form_data, CHANGE_MODULE);
}