import {post, get, GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import Utils from 'utils/index';

export const GOT_DEPARTMENT_LIST = 'GOT_DEPARTMENT_LIST';
export function gotDepartmentList(){
  return GET(Url.dept_list_info.toString(), null, GOT_DEPARTMENT_LIST);
}

export const GOT_DEPARTMENT_LIST_SIGNAL = 'GOT_DEPARTMENT_LIST_SIGNAL';
export function gotDepartmentListSignal(signal){
  return GET(Url.dept_list_info.toString(), {signal: signal}, GOT_DEPARTMENT_LIST_SIGNAL);
}

export const GOT_ROLE_LIST = 'GOT_ROLE_LIST';
export function gotRoletList(org_id){
  return (dispatch) => {
    return get(Url.role_list.toString(), {org_id: org_id})
      .done((data) => {
        dispatch({
          type: GOT_ROLE_LIST,
          data: data,
          id: org_id
        })
      })
  } 
}

export const GOT_ROLE_LIST_BY_MODULENAME = 'GOT_ROLE_LIST_BY_MODULENAME';
export function gotRoleListByModuleName(module_name){
  return{
    type:GOT_ROLE_LIST_BY_MODULENAME,
    module_name:module_name,
  }
}

export const GOT_AUTHORITY_LIST = 'GOT_AUTHORITY_LIST';
export function gotAuthorityList(){
  /*return GET(Url.authority_list.toString(), null, GOT_AUTHORITY_LIST);*/
  return (dispatch) => {
     return get(Url.authority_list.toString(),null)
       .done((data) => {
         dispatch({
           type: GOT_AUTHORITY_LIST,
           data:data,
           module_name:'',        
         })
       })   
     }
}

export const GOT_AUTHORITY_LIST_BY_MODULENAME = 'GOT_AUTHORITY_LIST_BY_MODULENAME';
export function gotAuthorityListByModuleName(module_name){
  return {
    type: GOT_AUTHORITY_LIST_BY_MODULENAME,
    module_name:module_name,
  }
}

export const GOT_ROLE_AUTHORITIES = 'GOT_ROLE_AUTHORITIES';
export function gotRoleAuthorities(role_id){
  return (dispatch) => {
    return get(Url.authority_list.toString(), {role_id: role_id})
      .done((data) => {
        dispatch({
          type: GOT_ROLE_AUTHORITIES,
          data: data,
          id: role_id
        })
      })
  } 
}

/*export const GOT_MODULE_LIST = 'GOT_MODULE_LIST';
export function gotModuleList(){
  return GET(Url.module_list.toString(), null, GOT_MODULE_LIST);
}*/

export const GOT_MODULE_SRCS = 'GOT_MODULE_SRCS';
export function gotModuleSrcs(){
   return GET(Url.module_list.toString(),null, GOT_MODULE_SRCS);
/*   return TEST([
     {module_id: 1, module_name: '订单管理', module_lv: 1, parent_id:0},
     {module_id: 2, module_name: '送货管理', module_lv: 1, parent_id:0},
     {module_id: 3, module_name: '配送管理', module_lv: 1, parent_id: 0},
     {module_id: 28, module_name: '订单管理', module_lv: 2, parent_id: 1},
     {module_id: 5, module_name: '订单转送货单', module_lv: 2, parent_id: 2}
   ], GOT_MODULE_SRCS);*/
}

export const RESET_ROLR_AUTHORITY = 'RESET_ROLR_AUTHORITY';
export function resetRoleAuthority(editable){
  return {
    type: RESET_ROLR_AUTHORITY,
  }
}

export const TOGGLE_EDIT = 'TOGGLE_EDIT';
export function toggleEdit(editable){
  return {
    type: TOGGLE_EDIT,
    data: !editable
  }
}

export const PUT_ROLE_AUTHORITY = 'PUT_ROLE_AUTHORITY';
export function putRoleAuthority(role_id,privilege_ids){
  return PUT(Url.authority_role_distribute.toString(role_id), {privilege_ids: privilege_ids}, PUT_ROLE_AUTHORITY);
}

export const AUTHORITY_YES_NO = 'AUTHORITY_YES_NO';
export function authorityYesNo(id, checked){
  return {
    type: AUTHORITY_YES_NO,
    id: id,
    checked: checked
  }
}

export const TOGGLE_DEPARTMENT = 'TOGGLE_DEPARTMENT';
export function toggleDept( dept_id ){
  return {
    type: TOGGLE_DEPARTMENT,
    id: dept_id
  }
}

export const AUTHORIZE = 'AUTHORIZE';
export function authorize(command){
  return {type:AUTHORIZE,command};
}
