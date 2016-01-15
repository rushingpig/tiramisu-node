import { dateFormat } from 'utils/index';
import { combineReducers } from 'redux';
import * as ChangeActions from 'actions/delivery_change';
import { orders } from 'reducers/orders';
import { REQUEST } from 'config/app.config';

var filter_state = {
  search_ing: false,
  change_submitting: false,
}

function filter(state = filter_state, action){
  switch (action.type) {
    case ChangeActions.ORDERS_EXCHANGE:
      if(action.key == REQUEST.ING){
        return {...state, change_submitting: true }
      }else if(action.key == REQUEST.SUCCESS || action.key == REQUEST.FAIL){
        return {...state, change_submitting: false }
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
})