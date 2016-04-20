import { combineReducers } from 'redux';
import * as Actions from 'actions/role_authority_manage';
import { GET_DEPARTMENTS } from 'actions/department_fetchdata';
import clone from 'clone';

// var initial_state = {
//   department: [],
//   role: [],
// }

// function _t(data){
//   return map(data, (text, id) => ({id, text}))
// }

// function authorize(state=[],action){
//   switch (action.type) {
//     case Actions.AUTHORIZE:
//       return action.command;
//     default:
//       return state;
//   }
// }

// function getData(state=initial_state,action){
//   switch(action.type){
//     case GET_DEPARTMENTS:
//       return {...state, provinces: _t(action.data) };
//     default:
//       return initial_state;
//   }
// }
// export default combineReducers({
//   authorize,
//   getData,
// });
// 
var initial_state = {
  data: [{
    id: 100,
    name: '客服部',
    children: [{
      id: 101,
      name: '客服组专员',
      active: false
    },{
      id:102,
      name:'客服部主管',
      active:false
    }]
  }, {
    id: 200,
    name: '物流部',
    children: [{
      id: 201,
      name: '配送员',
      active: false
    }]
  }]
}

export default function accessManage( state = initial_state, action){
  switch( action.type ){
    case Actions.TOGGLE_DEPT:
      state.data.forEach( n => {
        if( n.id == action.id ){
          n.active = !n.active;
        }
      });
      return {...state, data: clone(state.data)};
    default:
      return state;
  }
}