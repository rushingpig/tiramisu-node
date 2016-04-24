import { combineReducers } from 'redux';
import * as Actions from 'actions/authority_role_manage';
import { DELETE_AUTHORITY, ADD_MODULE } from 'actions/authority_system_manage';
import clone from 'clone';


function unique(arr) {
 var res = [];
 var obj = {};
 for(var i = 0; i < arr.length; i++){
  if(!obj[arr[i].module_id]){
   res.push(arr[i]);
   obj[arr[i].module_id] = 1;
  }
 }
 return res;
}

function _f(obj){
  var ret = [];
  for(var key in obj){
    ret.push({id: key, text: obj[key]})
  }
  return ret;
}

var initial_state = {
  department_list: [],
  list: [],
  checked_authority_ids: [],
  module_list: [],
  editable: false,
  on_role_id: undefined,
}

export function roleAccessManage( state = initial_state, action){
  switch( action.type ){
    case Actions.GOT_DEPARTMENT_LIST:
      action.data.list.map(n => {
        if(!n.children){
          n.children = [];
        }
      })
      return {...state, department_list: clone(action.data.list)};
    case Actions.GOT_ROLE_LIST:
      state.department_list.map(n => {
        if(n.id === action.id) {
          n.children = action.data.list.map(obj => ({
            id: obj.id,
            description: obj.description,
            text: obj.name
          }));
        }
      });
      return {...state, department_list: clone(state.department_list)};
    case Actions.GOT_ROLE_LIST_BY_MODULENAME:
      return {...state, module_name : action.module_name }
    case Actions.TOGGLE_DEPARTMENT:
      state.department_list.forEach( n => {
        if( n.id == action.id ){
          n.active = !n.active;
        }
      });
      return {...state, department_list: clone(state.department_list)};
    case Actions.GOT_AUTHORITY_LIST:
        return {...state, list: action.data.list,module_name:action.module_name};
    case Actions.GOT_AUTHORITY_LIST_BY_MODULENAME:
        return {...state, module_name:action.module_name};
    case Actions.GOT_ROLE_AUTHORITIES:
      return (function(){
        var list = action.data.list;
        var ret = [];
        list.forEach(n => {
          ret.push(n.id);
        })
        return {...state, checked_authority_ids: ret,on_role_id: action.id };
      })();
    case Actions.GOT_MODULE_LIST:
      return {...state, module_list: _f(action.data)};
    case Actions.RESET_ROLR_AUTHORITY:
      return {...state, checked_authority_ids: []};
    case Actions.AUTHORITY_YES_NO:
      return (function(){
        let index = state.checked_authority_ids.indexOf(action.id);
          if(index !== -1){
            state.checked_authority_ids.splice(index, 1);
          }else{
            state.checked_authority_ids.push(action.id);
          }
        return {...state, checked_authority_ids: clone(state.checked_authority_ids)};
      })();
    case Actions.TOGGLE_EDIT:
      return {...state, editable: action.data};

    case DELETE_AUTHORITY:
      var list = state.list.filter((n) => {
        return n.id !== action.id;
      })
      return {...state, list: clone(list)};
    default:
      return state;
  }
}

export default combineReducers({
  roleAccessManage,
})
