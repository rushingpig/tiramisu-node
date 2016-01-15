import { dateFormat } from 'utils/index';
import { combineReducers } from 'redux';
import { orders } from 'reducers/orders';

var filter_state = {
  search_ing: false,
}

function filter(state = filter_state, action){
  switch (action.type) {
    default:
      return state
  }
}

export default combineReducers({
  filter,
  orders,
})