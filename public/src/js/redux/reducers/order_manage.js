import { dateFormat } from '../utils/index';
import { combineReducers } from 'redux';
import { START_DATE_CHANGE, DISTRIBUTE_DATE_CHANGE } from '../actions/order_manage';

var _now = dateFormat(new Date(), 'yyyy-MM-dd');
var initial_state = {
  filter: {
    start_date: _now,
    distribute_date: _now,
  }
}

function filter(state = initial_state.filter, action){
  switch (action.type) {
    case START_DATE_CHANGE:
      return {...state, ...{start_date: action.date}};
    case DISTRIBUTE_DATE_CHANGE:
      return {...state, ...{distribute_date: action.date}};
    default:
      return state
  }
}

export default combineReducers({
  filter
})