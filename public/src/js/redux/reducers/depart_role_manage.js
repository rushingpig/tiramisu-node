import { combineReducers } from 'redux';
import {getGlobalState,getGlobalStore} from 'stores/getter';
import * as Actions from 'actions/depart_role_manage';
import clone from 'clone';

import {dept_role} from './dept_role';
import { core } from 'utils/index';

var initial_state = {
  data: [{
    id: 100,
    name: '客服部',
    children: [],
    active:true
  }, {
    id: 200,
    name: '物流部',
    children: [],
    active:true
  },{
    id:300,
    name:'物控部',
    children:[],
    active:true
  },{
    id:400,
    name:'加盟商',
    children:[],
    active:true
  }]
}


var initial_roleinfo_state={
  total:0,
  list:[],
}

var initial_role_state = {
  role_info:{},
  handle_role_id:{}
}

function RoleInfoListManage(state=initial_roleinfo_state,action){
  switch(action.type){
    case Actions.GET_ROLEINFO_LIST:
      return {...state,total:clone(action.data.total),list:clone(action.data.list)};
    case Actions.TOGGLE_DEPT:
      return {...state,total:clone(action.data.total),list:clone(action.data.list)};
    case Actions.DELETE_ROLE:
      var list = state.list.filter((n)=>{
        return n.id !== action.roleId;
      })
      return {...state,list:clone(list)}
    default:
      return state;
  }
}


/*function accessManage( state = initial_state, action){
  switch( action.type ){
    case Actions.TOGGLE_DEPT:
      state.data.forEach( n => {
        if( n.id == action.id ){
          n.active = true;
        }
      });
      return {...state, data: clone(action.data.list)};
    default:
      return state;
  }
}*/

var filter_state = {
  search_ing: false,
  all_order_srcs: [],
}

function filter(state = filter_state, action){
  switch (action.type) {
    case Actions.GOT_ORDER_SRCS:
      let l1 = [], l2 = [];
      var data = core.isArray(action.data) ? action.data : [];
      //level最多为2级
      data.forEach(n => {
        n.text = n.name;  //转换
        if(n.level == 1){
          l1.push(n);
        }else{
          l2.push(n);
        }
      })
      return {...state, all_order_srcs: !l2.length ? [l1] : [l1, l2] }
    default:
      return state
  }
}

function RoleManage(state = initial_role_state,action){
  switch(action.type){
    case Actions.GET_ROLE_DETAIL:
/*      return (function(){
        //var { RoleManage :{ RoleInfoListManage :{ list }}} = getGlobalState();
        let role_info = list.filter((n) => {
          return n.id === state.role_id;
        })[0];
        return {...state,role_info:role_info}
      })();*/
        var data = action.data;
        data.src_id = data.src_id == 0 ? undefined :data.src_id;
        return {...state,role_info:data,handle_role_id:action.id};
    case Actions.RESET_ROLE:
        return {...state,role_info:{data_scope_id:-1,name:'',description:'',org_id:-1,src_id:undefined}};
    default:
        return state;
  }
}

/*function RoleDataAccessManage(state=initial_roleinfo_state,action){
  switch(action.type){
    case Actions.GET_ROLEDATA_ACCESS:
      return {...state,total:clone(action.data.total),list:clone(action.data.list)};
    default:
      return state; 
  }
}*/

export default combineReducers({
  /*accessManage,*/
  filter,
  RoleInfoListManage,
  RoleManage,
  dept_role:dept_role(),
})