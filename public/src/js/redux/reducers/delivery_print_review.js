import { combineReducers } from 'redux';
import { REQUEST, YES_OR_NO, PRINT_REVIEW_STATUS } from 'config/app.config';
import * as Actions from 'actions/delivery_print_review';
import { map } from 'utils/index';

var filter_state = {
  yes_or_no: YES_OR_NO,
  all_review_status: map(PRINT_REVIEW_STATUS, (text, id) => ({id, text})),
}

function filter(state = filter_state, action){
  switch (action.type) {
    default:
      return state
  }
}

var main_state = {
  loading: true,
  refresh: false,
  page_no: 0,
  total: 0,
  list: [],
  submitting: false,
}
function main( state = main_state, action){
  switch (action.type) {

    case Actions.GET_PRINT_REVIEW_LIST_ING:
      return {...state, ...action.data, refresh: true}
    case Actions.GET_PRINT_REVIEW_LIST:
      return {...state, ...action.data, loading: false, refresh: false}

    case Actions.REVIEW_PRINT_APPLY:
      if(action.key == REQUEST.ING){
        return {...state, submitting: true }
      }else if(action.key == REQUEST.SUCCESS || action.key == REQUEST.FAIL){
        return {...state, submitting: false }
      }else{
        console.error('nali?')
      }
    default:
      return state
  }
}

export default combineReducers({
  filter,
  main,
})