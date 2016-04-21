import { combineReducers } from 'redux';
import { getGlobalStore, getGlobalState } from 'stores/getter';

import * as Actions from 'actions/authority_system_manage';

import { roleAccessManage } from 'reducers/authority_role_manage';

import clone from 'clone';


var initial_state = {
  active_authority_id: undefined,
  active_authority_info: null,
}

export function systemAccessManage(state = initial_state, action){
  switch(action.type){
    case Actions.ACTIVE_AUTHORITY:
      return {...state, active_authority_id: action.data};
    case Actions.GET_AUTHORITY_DETAIL:
      return {...state, active_authority_info: action.data}
    case Actions.RESET_AUTHORITY_FORM:
      return {...state, active_authority_info: {module_id: -1,type: -1,description:'',code:'',name:'' }};
    default:
      return state;
  }
}

export default combineReducers({
  roleAccessManage,
  systemAccessManage,
})
