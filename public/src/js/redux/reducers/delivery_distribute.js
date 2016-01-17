import { dateFormat } from 'utils/index';
import { combineReducers } from 'redux';
import { REQUEST } from 'config/app.config';
import { orders } from 'reducers/orders';
import * as Actions from 'actions/delivery_distribute';

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
  submitting: false,
}
function main(state = main_state, action){
  switch (action.type) {
    case Actions.SIGN_ORDER:
    case Actions.UNSIGN_ORDER:
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
  orders,
  main,
})