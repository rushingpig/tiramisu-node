import { dateFormat, map } from 'utils/index';
import { combineReducers } from 'redux';
import { GET_ORDER_LIST, START_DATE_CHANGE, DISTRIBUTE_DATE_CHANGE,
  CHECK_ORDER, GET_ORDER_DETAIL_PRODUCTS } from 'actions/order_manage';
import { GOT_ORDER_SRCS } from 'actions/order_manage_form';
import { area } from './area_select';
import { pay_status } from 'config/app.config';

var _now = dateFormat(new Date(), 'yyyy-MM-dd');
var filter_state = {
  search_ing: false,
  all_order_srcs: [],
  all_order_status: map(pay_status, (text, id) => ({id, text})),
}

function filter(state = filter_state, action){
  switch (action.type) {
    case GOT_ORDER_SRCS:
      let l1 = [], l2 = [];
      //level最多为2级
      action.data.forEach(n => {
        n.text = n.name;  //转换
        if(n.level == 1){
          l1.push(n);
        }else{
          l2.push(n);
        }
      })
      return {...state, all_order_srcs: !l2.length ? [l1] : [l1, l2] }
    default:
      return state
  }
}

var orders_state = {
  page_no: 0,
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
  area: area(false),
  orders,
})