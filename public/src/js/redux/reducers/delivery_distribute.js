import { dateFormat } from 'utils/index';
import { combineReducers } from 'redux';
import * as OrderManageActions from 'actions/orders';

var filter_state = {
  search_ing: false,
}

function filter(state = filter_state, action){
  switch (action.type) {
    default:
      return state
  }
}

var orders_state = {
  page_no: 0,
  total: 0,
  list: [],
  active_order_id: undefined,
  check_order_info: null,
}
function orders(state = orders_state, action){
  switch (action.type) {
    case OrderManageActions.GET_ORDER_LIST:
      return {...state, ...action.data}

    case OrderManageActions.ACTIVE_ORDER:
      return {...state, active_order_id: action.active_order_id}
    case OrderManageActions.GET_ORDER_DETAIL_PRODUCTS:
      return {...state, check_order_info: action.data}
    default:
      return state;
  }
}

export default combineReducers({
  filter,
  orders,
})