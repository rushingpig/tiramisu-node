import { combineReducers } from 'redux';
import { LOGIN_START, LOGIN_SUCCESS, LOGIN_FAIL,
 USERNAME_CHANGE, PASSWORD_CHANGE }
  from '../actions/login';

var initial_state = {
  login_ing: false,
  validate: false,
  error_msg: ''
}

function login(state = initial_state, action){
  switch (action.type) {
    case LOGIN_START:
      return {...state, ...{login_ing: true}};
    case LOGIN_SUCCESS:
      return {...state, ...{validate: true, login_ing: false}};
    case LOGIN_FAIL:
      return {...state, ...{error_msg: action.msg, login_ing: false}};
    default:
      return state
  }
}

function form(state = {}, action){
  switch (action.type) {
    case USERNAME_CHANGE:
      return {...state, ...{username: action.username}};
    case PASSWORD_CHANGE:
      return {...state, ...{password: action.password}};
    default:
      return state
  }
}

const loginReducer = combineReducers({
  login,
  form
})

export default loginReducer