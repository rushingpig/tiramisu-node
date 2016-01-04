import { dateFormat } from 'utils/index';
import { combineReducers } from 'redux';
import { GET_ORDER_LIST, START_DATE_CHANGE, DISTRIBUTE_DATE_CHANGE,
  CHECK_ORDER, GET_ORDER_DETAIL_PRODUCTS } from 'actions/order_manage';

var _now = dateFormat(new Date(), 'yyyy-MM-dd');
var initial_state = {
  filter: {
    start_date: _now,
    delivery_date: _now,
  },
}

function filter(state = initial_state.filter, action){
  switch (action.type) {
    case START_DATE_CHANGE:
      return {...state, ...{start_date: action.date}}
    case DISTRIBUTE_DATE_CHANGE:
      return {...state, ...{delivery_date: action.date}}
    default:
      return state
  }
}

var orders_state = {
  total: 0,
  list: [],
  selected_order_id: undefined,
  check_order_info: null,
}
function orders(state = orders_state, action){
  switch (action.type) {
    case GET_ORDER_LIST:
      return {...state, ...action.data}

    case CHECK_ORDER:
      return {...state, selected_order_id: action.selected_order_id}
    case GET_ORDER_DETAIL_PRODUCTS:
      return {...state, check_order_info: action.data}
    default:
      return state;
  }
}

export default combineReducers({
  filter,
  orders,
})