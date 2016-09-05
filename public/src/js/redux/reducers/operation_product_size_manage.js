import { UPDATE_PATH } from 'redux-simple-router';
import clone from 'clone';

import * as Actions from 'actions/operation_product_size_manage';
import { FORM_CHANGE } from 'actions/common';

import { map, some, del } from 'utils/index';
import createReducer from 'utils/create_reducer';

export default createReducer({
  loading: true,
  list: [],
  selected_id: undefined, //选中的规格id
  edit_size: undefined, //正在编辑的规格信息
  is_add: false, //新添加?
}, {

  [ UPDATE_PATH ] : (state, action, initial_state) => initial_state,

  [ Actions.GET_ALL_SIZE_DATA] : (state, action) => ({...state, loading: false, list: action.data}),

  [ Actions.ACTIVE_ROW ] : (state, action) => ({...state, selected_id: action.id }),

  [ Actions.MOVE_UP ] : (state, action) => {
    if(state.selected_id){
      let index = state.list.findIndex( n => n.id == state.selected_id );
      if(index != 0){
        state.list.splice(index - 1, 2, state.list[index], state.list[index - 1]);
        return {...state, list: [...state.list]}
      }
    }
    return state;
  },

  [ Actions.MOVE_DOWN ] : (state, action) => {
    if(state.selected_id){
      let index = state.list.findIndex( n => n.id == state.selected_id );
      if(index != state.list.length - 1){
        state.list.splice(index, 2, state.list[index + 1], state.list[index]);
        return {...state, list: [...state.list]}
      }
    }
    return state;
  },

  [ Actions.ENABLE_SIZE ] : (state, action) => {
    state.list.forEach( n => {
      if(n.id == action.id){
        n.enable = 1;
      }
    })
    return {...state, list: [...state.list]}
  },

  [ Actions.DISABLE_SIZE ] : (state, action) => {
    state.list.forEach( n => {
      if(n.id == action.id){
        n.enable = 0;
      }
    })
    return {...state, list: [...state.list]}
  },

  [ Actions.EDIT_ROW ] : (state, action) => ({...state, edit_size: clone( state.list.find(n => n.id == action.id) )}),

  [ Actions.ADD_PROPERTY ] : (state, action) => ({
    ...state,
    edit_size: { ...state.edit_size, data: [...state.edit_size.data, {key: '', value: '', editable: true}] }
  }),

  [ Actions.DEL_PROPERTY ] : (state, action) => {
    state.edit_size.data.splice(action.index, 1);
    return {...state, list: [...state.list]}
  },

  [ Actions.PROPERTY_OK ] : (state, action) => {
    var d = state.edit_size.data;
    delete d[d.length - 1].editable;
    return {...state, list: [...state.list]}
  },

  [ Actions.PROPERTY_CHANGE ] : (state, action) => {
    var d = state.edit_size.data;
    if(action.index == -1){ //-1表示新添加项的key值变化了
      d[d.length - 1].key = action.value;
    }else{
      d[action.index].value = action.value;
    }
    return {...state, list: [...state.list]}
  },

  [ FORM_CHANGE + 'size_name' ] : (state, action) => {
    state.edit_size.name = action.value;
    return {...state, list: [...state.list]}
  },
  
  [ Actions.ADD_PRODUCT_SIZE ] : (state, action) => ({
    ...state,
    is_add: true,
    edit_size: {
      id: -1,
      name: '',
      data: [
        {key: '尺寸', value: ''},
        {key: '人数', value: ''},
        {key: '餐具', value: ''}
      ]
    }
  })
})
