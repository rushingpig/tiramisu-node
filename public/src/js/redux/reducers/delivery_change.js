import { dateFormat } from 'utils/index';
import { combineReducers } from 'redux';
import * as OrderActions from 'actions/orders';
import * as ChangeActions from 'actions/delivery_change';

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

  change_submitting: false,
}
function orders(state = orders_state, action){
  switch (action.type) {
    case OrderActions.GET_ORDER_LIST:
      return {...state, ...action.data}
    case OrderActions.CHECK_ORDER:
      state.list.forEach(n => {
        if(n.order_id == action.order_id)
          n.checked = action.checked;
      })
      return {...state}
    case OrderActions.CHECK_ALL_ORDERS:
      state.list.forEach(n => {
        n.checked = action.checked;
      })
      return {...state}
    case OrderActions.ACTIVE_ORDER:
      return {...state, active_order_id: action.active_order_id}
    case OrderActions.GET_ORDER_DETAIL_PRODUCTS:
      return {...state, check_order_info: action.data}

    case ChangeActions.ORDERS_EXCHANGE:
      if(action.key == 0){
        return {...state, change_submitting: true }
      }else if(action.key == 1 || action.key == 2){
        return {...state, change_submitting: false }
      }else{
        alert('nali?')
      }
    default:
      return state;
  }
}

export default combineReducers({
  filter,
  orders,
})