import {post, GET, POST, PUT, TEST } from 'utils/request'; //Promise

export const GET_DEPARTMENTS = 'GET_DEPARTMENTS';
export  function getDepartments(data){
  return TEST({
    departmentid:1,
    departmentname:'客服部',
    rolelist:[{
      'roleid':11,
      'rolename':'客服组专员',
      'active':false,
    },{
      'roleid':12,
      'rolename':'客服部主管',
      'active':false,
    },{
      'roleid':13,
      'rolename':'客服部经理',
      'active':false
    }]
  },{
    departmentid:2,
    departmentname:'物流部',
    rolelist:[{
      'roleid':21,
      'rolename':'配送员',
      'active':false,
    }]
  },GET_DEPARTMENTS);
  
}