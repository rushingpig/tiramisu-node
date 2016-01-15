import { map } from 'utils/index';
import { combineReducers } from 'redux';
import { GOT_ORDER_SRCS } from 'actions/order_manage_form';
import { pay_status } from 'config/app.config';

import { area } from './area_select';
import { orders } from './orders';

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

export default combineReducers({
  filter,
  area: area(false),
  orders,
})