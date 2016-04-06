
import {post, GET, POST, PUT, TEST,DEL } from 'utils/request'; //Promise
import Url from 'config/url';
import { getValues } from 'redux-form';
import Utils from 'utils/index';


export const TOGGLE_DEPT = 'TOGGLE_DEPT';
export function toggleDept( dept_id ){
/*  return {
    type: TOGGLE_DEPT,
    id: dept_id
  }*/

  return TEST({
    total:2,
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
    }]

  },TOGGLE_DEPT);
  return {
    type: TOGGLE_DEPT,
    id: dept_id
  }
}

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
export function getUserList(org_id,page_no,page_size){
  return GET(Url.user_list_info.toString(),{org_id:org_id,page_no:page_no,page_size:page_size},GET_USER_LIST);
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

export const GET_USER_LIST_SEARCH = 'GET_USER_LIST_SEARCH';
export function getUserListSearch(org_id,page_no,page_size,uname_or_name){
  return GET(Url.user_list_info.toString(),{uname_or_name:uname_or_name,page_no:page_no,page_size:page_size},GET_USER_LIST_SEARCH);
 /*
   return (dispatch,getState) =>{
    
 }*/

/*   return TEST({
    total:1,
    page_no:1,
    list:[{
      'id':301,
      'city_name':'深圳',
      'is_usable':true,
      'mobile':'15814063438',
      'name':'张娜',
      'rolename':'物控部文员',   //role_id:101
      'username':'zhangna',
    }]
  },
  GET_USER_LIST_SEARCH);*/
}



export const USABLE_ALTER = 'USABLE_ALTER';
export function usableAlter(userId,is_usable){
/*  return PUT(Url.user_usable_alter.toString(userId,is_usable),USABLE_ALTER);
*/
  return TEST(null,[
    {type:USABLE_ALTER,key:0},
    {type:USABLE_ALTER,key:1}
    ],2000);

  // return TEST(null, [
  //   {type: ALTER_STATION, key: 0},  //立即派发
  //   {type: ALTER_STATION, key: 1}   //2000毫秒后派发
  // ], 2000);
}

export const  USER_DELETE = 'USER_DELETE';
export function userDelete(userId){
  /*return DEL(Url.user_delete.toString(userId),USER_DELETE);*/

  return TEST(null,[
    {type:USER_DELETE,key:0},
    {type:USER_DELETE,key:1}
    ],2000);
}

export const DELETE_USER = 'DELETE_USER';
export function deleteUser(form_data){
  return {
    type:DELETE_USER
  }
}



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



