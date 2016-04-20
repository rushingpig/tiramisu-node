import {post, GET, POST, PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import Utils from 'utils/index';

export const AUTHORIZE = 'AUTHORIZE';
export function authorize(command){
  return {type:AUTHORIZE,command};
}

export const TOGGLE_DEPT = 'TOGGLE_DEPT';
export function toggleDept( dept_id ){
  return {
    type: TOGGLE_DEPT,
    id: dept_id
  }
}