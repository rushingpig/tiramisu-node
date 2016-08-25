import { combineReducers } from 'redux';
import { clone, dateFormat, getDate } from 'utils/index';
import { area } from 'reducers/area_select'; 
import * as Actions from 'actions/customer_manage';

const initial_state = {
  loading: true,
  list: [],
  page_no: 0,
  total: 0,
  customer_info: null,
  selected_uuid: undefined, //选中用户的uuid
  uuid_black: undefined, //成功加入黑名单的用户
}

function main(state = initial_state, action){
  switch(action.type){
    case Actions.GET_CUSTOMER_LIST:
      return { ...state, loading: false, list: action.data.list || initial_state.list, page_no: action.data.page_no || initial_state.page_no }
    case Actions.GET_CUSTOMER_INFO:
      return { ...state, customer_info: {...state.customer_info, ...action.data} }
    case Actions.GET_CUSTOMER_LOGS:
      return { ...state, customer_info: 
        state.customer_info
          ? {...state.customer_info, ...action.data, list: (state.customer_info.list || []).concat(action.data.list)}
          : {...state.customer_info, ...action.data}
      }
    case Actions.SELECT_CUSTOMER:
      return { ...state, selected_uuid: action.uuid }
    case Actions.ADD_TO_BLACK_LIST:
      return { ...state, customer_info: {...state.customer_info, uuid_black: action.uuid} }
    case Actions.HIDE_DETAIL_MODAL:
      return { ...state, customer_info: null, uuid_black: undefined }
    default:
      return state;
  }
}

export default combineReducers({
  area: area(),
  main
})