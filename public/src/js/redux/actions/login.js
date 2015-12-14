import {get, post} from '../utils/request'; //Promise
import Url from '../config/url';


export const LOGIN_START = 'LOGIN_START';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const USERNAME_CHANGE = 'USERNAME_CHANGE';
export const PASSWORD_CHANGE = 'PASSWORD_CHANGE';

export function login(username, password){
  return (dispatch) => {
    dispatch({
      type: LOGIN_START
    });
    return post(Url.login, {username, password})
      .done(function(json){
        dispatch({
          type: LOGIN_SUCCESS
        })
      })
      .fail(function(msg){
        dispatch({
          type: LOGIN_FAIL,
          msg
        })
      })
  }
}

export function usernameChange(username){
  return {
    type: USERNAME_CHANGE,
    username
  }
}

export function passwordChange(password){
  return {
    type: PASSWORD_CHANGE,
    password
  }
}