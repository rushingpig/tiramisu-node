import { combineReducers } from 'redux';
import { orders } from 'reducers/orders';
import { deliveryman } from 'reducers/deliveryman';
import * as Actions from 'actions/delivery_manage';
import { REQUEST } from 'config/app.config';

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
  submitting: false, //多处提交状态共享, 因为不可能多出同时提交
}
function main(state = main_state, action){
  switch(action.type){
    case Actions.APPLY_DELIVERYMAN:
    case Actions.APPLY_PRINT:
    case Actions.RE_PRINT:
      if(action.key == REQUEST.ING){
        return {...state, submitting: true}
      }else if(action.key == REQUEST.SUCCESS || action.key == REQUEST.FAIL){
        return {...state, submitting: false}
      }else{
        console.error('nali');
      }
    default:
      return state
  }
}

export default combineReducers({
  filter,
  orders,
  deliveryman,
  main,
})