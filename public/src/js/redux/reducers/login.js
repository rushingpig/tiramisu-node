import { combineReducers } from 'redux';
import { LOGIN_START, LOGIN_SUCCESS, LOGIN_FAIL} from '../actions/login';

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
      return {...state, ...{validate: true}};
    case LOGIN_FAIL:
      return {...state, ...{error_msg: action.msg}};
    default:
      return state
  }
}
const rootReducer = combineReducers({
  login
})

export default rootReducer