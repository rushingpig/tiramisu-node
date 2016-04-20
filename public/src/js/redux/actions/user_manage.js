
import {post, GET, POST, PUT, TEST,del,get,put} from 'utils/request'; //Promise
import Url from 'config/url';
import { getValues } from 'redux-form';
import Utils from 'utils/index';
import {Noty} from 'utils/index';


/*export const TOGGLE_DEPT = 'TOGGLE_DEPT';
export function toggleDept( org_id ,uname_or_name,page_no,page_size){
  var data = {page_size:page_size,page_no:page_no};
  if(org_id != 0){
    data={...data,org_id:org_id};
  }else if(uname_or_name != ""){
    data = {...data,uname_or_name:uname_or_name};
  }
  return GET(Url.user_list_info.toString(),data,TOGGLE_DEPT);
}*/

export const GET_ROLE_LIST = 'GET_ROLE_LIST';
export function getRoleList(dept_id){
  // return {
  //   type:GET_ROLE_LIST,
  //   id:dept_id
  // }



}

/*export const GET_DEPT_LIST = 'GET_DEPT_LIST';
export function getDeptList(){
=======
  return {
    type:GET_ROLE_LIST,
    id:dept_id
  }
}

export const GET_DEPT_LIST = 'GET_DEPT_LIST';
export function getDeptList(){
/*  return {
    type:GET_DEPT_LIST
  }*/
/*  return (dispatch,getState) =>{
    return GET(Url.dept_list_info.toString(),GET_DEPT_LIST);  
  }*/

export const GET_USER_LIST = 'GET_USER_LIST';
export function getUserList(org_id,uname_or_name,page_no,page_size){
  var data = {page_size:page_size,page_no:page_no};
  if(org_id != 0){
    data={...data,org_id:org_id};
  }else if(uname_or_name != ""){
    data = {...data,uname_or_name:uname_or_name};
  }
  return (dispatch) => {
    return get(Url.user_list_info.toString(), data,GET_USER_LIST)
      .done((data)=>{
        dispatch({
          dept_id:org_id,
          uname_or_name:uname_or_name,
          page_no:page_no,
          data:data,
          type: 'GET_USER_LIST',
        });        
      });
/*    dispatch({
      dept_id:org_id,
      uname_or_name:uname_or_name,
      type: 'GET_USER_LIST',
    })
    return GET(Url.user_list_info.toString(), data,GET_USER_LIST))(dispatch);*/
  }
  /*return GET(Url.user_list_info.toString(),data,GET_USER_LIST),org_id,uname_or_name;*/
/*  return (dispatch,getState) =>{
    
  }*/
/*  return TEST({
    total:25,
    page_no:1,
    list:[{
      'id':301,
      'city_name':'深圳',
      'is_usable':true,
      'mobile':'15814063438',
      'name':'张娜',
      'rolename':'物控部文员',   //role_id:101
      'username':'zhangna',
    },{
      'id':302,
      'city_name':'深圳',
      'is_usable':false,
      'mobile':'13424384363',
      'name':'胡蝶',
      'rolename':'物控部主管',   //role_id:102
      'username':'hudie',
    },{
      'id':303,
      'city_name':'深圳',
      'is_usable':false,
      'mobile':'13000560078',
      'name':'河马',
      'rolename':'物控部经理',  //role_id:103
      'username':'hema',
    },{
      'id':304,
      'city_name':'深圳',
      'is_usable':true,
      'mobile':'15814063438',
      'name':'张娜',
      'rolename':'物控部文员',   //role_id:101
      'username':'zhangna',
    },{
      'id':305,
      'city_name':'深圳',
      'is_usable':false,
      'mobile':'13424384363',
      'name':'胡蝶',
      'rolename':'物控部主管',   //role_id:102
      'username':'hudie',
    },{
      'id':306,
      'city_name':'深圳',
      'is_usable':false,
      'mobile':'13000560078',
      'name':'河马',
      'rolename':'物控部经理',  //role_id:103
      'username':'hema',
    },{
      'id':307,
      'city_name':'深圳',
      'is_usable':true,
      'mobile':'15814063438',
      'name':'张娜',
      'rolename':'物控部文员',   //role_id:101
      'username':'zhangna',
    },{
      'id':308,
      'city_name':'深圳',
      'is_usable':false,
      'mobile':'13424384363',
      'name':'胡蝶',
      'rolename':'物控部主管',   //role_id:102
      'username':'hudie',
    },{
      'id':309,
      'city_name':'深圳',
      'is_usable':false,
      'mobile':'13000560078',
      'name':'河马',
      'rolename':'物控部经理',  //role_id:103
      'username':'hema',
    },{
      'id':310,
      'city_name':'深圳',
      'is_usable':true,
      'mobile':'15814063438',
      'name':'张娜',
      'rolename':'物控部文员',   //role_id:101
      'username':'zhangna',
    },{
      'id':311,
      'city_name':'深圳',
      'is_usable':false,
      'mobile':'13424384363',
      'name':'胡蝶x',
      'rolename':'物控部主管',   //role_id:102
      'username':'hudie',
    }]

  },GET_USER_LIST);*/
}

/*export const GET_USER_LIST_SEARCH = 'GET_USER_LIST_SEARCH';
export function getUserListSearch(page_no,page_size,uname_or_name){
  return GET(Url.user_list_info.toString(),{uname_or_name:uname_or_name,page_no:page_no,page_size:page_size},GET_USER_LIST_SEARCH);
}*/



export const USABLE_ALTER = 'USABLE_ALTER';
export function usableAlter(userId,is_usable){
  return (dispatch) => {
    return put(Url.user_usable_alter.toString(userId),{is_usable:is_usable})
            .done(()=> {
              dispatch({
                id:userId,
                is_usable:is_usable,
                type:USABLE_ALTER,
              })
            })
  }
  /*return PUT(Url.user_usable_alter.toString(userId),{is_usable:is_usable},USABLE_ALTER);*/
}

export const  USER_DELETE = 'USER_DELETE';
export function userDelete(userId){
  /*return DEL(Url.user_delete.toString(userId),USER_DELETE);*/
  return (dispatch) => {
    return del(Url.user_delete.toString(userId), null)
      .done(() => {
        dispatch({
          id: userId,
          type: USER_DELETE
        })
        Noty('success', '删除成功');
      })
      .fail(function(msg, code){
        Noty('error', msg || '删除异常');
      });
  }
/*  return TEST(null,[
    {type:USER_DELETE,key:0},
    {type:USER_DELETE,key:1}
    ],2000);*/
}

/*export const DELETE_USER = 'DELETE_USER';
export function deleteUser(form_data){
  return {
    type:DELETE_USER
  }
}*/





/*export const GET_USER_INFO ='GET_USER_INFO';
export function getUserInfo(userId){
  return TEST({
    'city_id':100,
    'city_name':'深圳',
    'mobile':'15814063438',
    'name':'张娜',
    'role_name':'物控部文员',
    'username':'zhangna',
    'role_id':101,
    'station_id':201,
    'station_name':'xxxxxx',
  },GET_USER_INFO);
}*/



