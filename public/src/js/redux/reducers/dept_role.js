import { combineReducers } from 'redux';
import {dept_role as DEPT_ROLE} from 'actions/dept_role';
import { UPDATE_PATH } from 'redux-simple-router';
import { map } from 'utils/index';
import { DeptRoleActionTypes } from 'actions/action_types';

var  initail_state={
	depts:[],
	roles:[],
	active_org_id:-1,
	dataaccess:[],
	stations:[],
}

function _t(data){
  return map(data, (text, id) => ({id, text}))
}

function _c(arr){
  var ret = [];
  arr.forEach((n) => {
    ret.push({id: n.id, text: n.name});
  });
  return ret;
}

export function dept_role(Actions=DeptRoleActionTypes){
	return function dept_role(state=initail_state,action){
		switch(action.type){
			case Actions.GOT_DEPTS:
				return {...state, depts:_c(action.data.list) };
			case Actions.GOT_DEPTS_SIGNAL:
				return {...state, depts:_c(action.data.list || []) };
			case Actions.RESET_ROLES:
				return {...state,roles:[]};
			case Actions.GOT_ROLES:
				return {...state,roles:_c(action.data.list)};
			case Actions.GOT_ROLES_SIGNAL:
				return {...state,roles:_c(action.data.list)};
			case Actions.GOT_ALL_ROLES:
				return {...state,roles:_c(action.data.list)};
			case Actions.GOT_ALL_ROLES_SIGNAL:
				return {...state,roles:_c(action.data.list)};
			case Actions.GOT_DATA_ACCESS:
				return {...state,dataaccess:_c(action.data)};
			case Actions.GOT_STATIONS_BY_CITYIDS:
				return {...state,stations:_t(action.data)};
			case Actions.GOT_STATIONS_BY_CITYIDS_SIGNAL:
				return {...state,stations:_t(action.data)};
			case Actions.RESET_STATIONS:
				return {...state,stations:[]};
			default:
				return state;
		}
	}
}


