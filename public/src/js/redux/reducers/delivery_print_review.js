import { combineReducers } from 'redux';
import { REQUEST } from 'config/app.config';
import * as Actions from 'actions/delivery_print_review';

var filter_state = {
  search_ing: false,
}

function filter(state = filter_state, action){
  switch (action.type) {
    default:
      return state
  }
}

var main_state = {
  loading: true,
  page_no: 0,
  total: 0,
  list: [],
  submitting: false,
}
function main( state = main_state, action){
  switch (action.type) {
    case Actions.GET_PRINT_REVIEW_LIST:
      return {...state, ...action.data, loading: false}

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