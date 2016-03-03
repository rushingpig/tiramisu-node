import { combineReducers } from 'redux';
import { LOGIN_START, LOGIN_SUCCESS, LOGIN_FAIL,
 USERNAME_CHANGE, PASSWORD_CHANGE, RESET_ERROR_MSG }
  from 'actions/login';

var initial_state = {
  login_ing: false,
  validate: false, //好像已经没用了
  error_msg: '',

  username: '',
  password: '',
}

function login(state = initial_state, action){
  switch (action.type) {
    case LOGIN_START:
      return {...state, login_ing: true};
    case LOGIN_SUCCESS:
      return {...state, validate: true, login_ing: false};
    case LOGIN_FAIL:
      return {...state, error_msg: action.msg, login_ing: false};
    case USERNAME_CHANGE:
      return {...state, username: action.username};
    case PASSWORD_CHANGE:
      return {...state, password: action.password};
    case RESET_ERROR_MSG:
      return {...state, error_msg: ''};
    default:
      return state
  }
}

export default login;