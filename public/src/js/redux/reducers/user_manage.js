import { combineReducers } from 'redux';
import * as UserActions from 'actions/user_manage';


import { GET_DEPARTMENTS } from 'actions/department_fetchdata';
import clone from 'clone';

import { REQUEST } from 'config/app.config';

import {dept_role} from './dept_role';


/*var initial_deptstate = {
  data: [{
    id: '100',
    text: '客服部'
  }, {
    id: '200',
    text: '物流部'
  },{
    id:'300',
    text:'物控部'
  },{
    id:'400',
    text:'加盟商'
  }]
}*/

var initial_state = {
  total:0,
  page_no:0,
  list:[],
}

var initial_userlistState = {
  total:2,
  list:[{
    'roleid':100,
    'role':'物控部文员',
    'accountname':'xxxxxxx',
    'realname':'张娜',
    'tel':'123456',
    'city':'深圳',
    'active':'false'
  },{
    'roleid':200,
    'role':'物控部文员',
    'accountname':'xxxxxxx',
    'realname':'张娜',
    'tel':'123456',
    'city':'深圳',
    'active':'false'
  }]
}

var initial_rolelistState = {
  total:3,
  list:[{
    'roleid':100,
    'role':'话务专员',
    'dept_id':10
  },{
    'roleid':200,
    'role':'订单专员',
    'dept_id':20
  },{
    'roleid':300,
    'role':'售后服务',
    'dept_id':30
  }]
}
/*
 'city_id':100,
    'city_name':'深圳',
    'mobile':'15814063438',
    'name':'张娜',
    'role_name':'物控部文员',
    'username':'zhangna',
    'role_id':101,
    'station_id':201,
    'station_name':'xxxxxx',*/

var user_state = {
  'city_id':0,
  'city_name':'',
  'mobile':'',
  'name':'',
  'role_id':'',
  'role_name':'',
  'station_id':'',
  'station_name':'',
  'username':''
}


function accessManage( state = initial_state, action){
  switch( action.type ){
    case UserActions.TOGGLE_DEPT:
      state.list.forEach( n => {
        if( n.id == action.id ){
          n.active = true;
        }
      });
      return {...state, data: clone(action.data)};
    default:
      return state;
  }
}


function UserListManage(state = initial_state,action){
  switch( action.type ){
    case UserActions.GET_USER_LIST:
      return {...state,total:clone(action.data.total),list:clone(action.data.list)};
    case UserActions.GET_USER_LIST_SEARCH:
      return {...state,total:clone(action.data.total),list:clone(action.data.list)};
    case UserActions.TOGGLE_DEPT:
      return {...state,total:clone(action.data.total),list:clone(action.data.list)};
    default:
      return state;
  }
}

function RoleListManage(state = initial_rolelistState,action){
  switch(action.type){
    case UserActions.GET_ROLE_LIST:
      return {...state,total:clone(state.total),list:clone(state.list)};
    default:
      return state;
  }
}

function UserInfoManage(state = user_state,action){
  switch(action.type){
    case UserActions.GET_USER_INFO:
      return {...state,data:clone(state.total)};
    default:
      return state;
  }
}

var main_state={
  submitting:false,
}

function main(state=main_state,action){
  switch(action.type){
    case UserActions.USER_DELETE:
    case UserActions.USABLE_ALTER:
      if(action.key == REQUEST.ING){
        return {...state, submitting: true }
      }else if(action.key == REQUEST.SUCCESS || action.key == REQUEST.FAIL){
        return {...state, submitting: false }
      }else{
        console.error('error?')
      }
    default:
      return state;
  }
}
export default combineReducers({
  /*area:area(),*/
  accessManage,
  UserListManage,
  RoleListManage,
  UserInfoManage,
  main,
  dept_role:dept_role(),
})



