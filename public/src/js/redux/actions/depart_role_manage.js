import {post ,GET,POST,PUT,TEST,del,get} from 'utils/request';
import Url from 'config/url';
import Utils from 'utils/index';

import {Noty} from 'utils/index';

import * as OrderSupport from 'actions/order_support';


export const GOT_ORDER_SRCS = OrderSupport.GOT_ORDER_SRCS;
export const getOrderSrcs = OrderSupport.getOrderSrcs;

export const TOGGLE_DEPT = 'TOGGLE_DEPT';
export function toggleDept( org_id ){
  return (dispatch) => {
      return get(Url.role_list_info.toString(), {org_id:org_id})
        .done((data) => {
          dispatch({
            type: TOGGLE_DEPT,
            active_org_id  : org_id,
            data: data,
          })
        })
  }
  /*return GET(Url.role_list_info.toString(),{org_id:org_id},TOGGLE_DEPT);*/
/*  return {
    type: TOGGLE_DEPT,
    id: dept_id
  }*/
}

export const GET_ROLEINFO_LIST = 'GET_ROLEINFO_LIST';
export function getRoleInfoList(org_id){
	return GET(Url.role_list_info.toString(),{org_id:org_id},GET_ROLEINFO_LIST);
/*  return{
    type:GET_ROLEINFO_LIST,
    id:dept_id
  }*/

/*  return TEST({
  	total:2,
  	list:[{
  		'id':1,
  		'name':'物控部文员',
  		'description':'xxxx',
  	},{
  		'id':2,
  		'name':'物控部主管',
  		'description':'xxxx',
  	}]
  },GET_ROLEINFO_LIST);*/
}

export const GET_ROLE_DETAIL = 'GET_ROLE_DETAIL';
export function getRoleDetail(roleId){
  return (dispatch) => {
      return get(Url.role_detail.toString(roleId), null)
        .done((data) => {
          dispatch({
            type: GET_ROLE_DETAIL,
            id  : roleId,
            data: data,
          })
        })
  }


/*  return {
    type:GET_ROLE_DETAIL,
    data:{description:'xxx',id:1,name:'文员',org_id:1,data_scope_id:2},
<<<<<<< Updated upstream
  }
=======
  }*/
}

export const RESET_ROLE = 'RESET_ROLE';
export function resetRole(){
  return{
    type:RESET_ROLE
  }
} 

export const ADD_DEPT='ADD_DEPT';
export function addDept(name,description){
  description = (!description)?name:description;
  return POST(Url.dept_add.toString(),{name:name,description:description},ADD_DEPT);
/*  return {
    type:ADD_DEPT
  }*/
}

export const ADD_ROLE='ADD_ROLE';
export function addRole(form_data){
  var description = form_data.description;
  var name = form_data.name;
  description = (!description)?name:description;
  var data;
  if(!form_data.src_id){
    data = {description:description,name:name,org_id:form_data.org_id,
            data_scope_id:form_data.data_scope_id}
  }else{
    data = {description:description,name:name,org_id:form_data.org_id,
            data_scope_id:form_data.data_scope_id,src_id:form_data.src_id}
  }  
  return POST(Url.role_add.toString(),data,ADD_ROLE);
/*  return {
    type:ADD_ROLE
  }*/
}

export const CHANGE_ROLE = 'CHANGE_ROLE';
export function changeRole(form_data,roleId){
 var description = form_data.description;
 var name = form_data.name;
 description = (!description)?name:description;
 var data;
 if(!form_data.src_id){
   data = {description:description,name:name,org_id:form_data.org_id,
           data_scope_id:form_data.data_scope_id}
 }else{
   data = {description:description,name:name,org_id:form_data.org_id,
           data_scope_id:form_data.data_scope_id,src_id:form_data.src_id}
 }
  return PUT(Url.role_edit.toString(roleId),data,CHANGE_ROLE)
/*  return {
    type:CHANGE_ROLE
  }*/
}

export const DELETE_ROLE = 'DELETE_ROLE';
export function deleteRole(roleId){
  return (dispatch) => {
    return del(Url.role_del.toString(roleId),null)
      .done(() => {
        dispatch({
          type: DELETE_ROLE,
          roleId:roleId,
        })
        Noty('success', '删除成功');
      })
      .fail(function(msg, code){
        Noty('error', msg || '删除异常');
      });
  }
/*  return {
    type:DELETE_ROLE
  }*/
}



