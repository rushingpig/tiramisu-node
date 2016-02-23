import * as OrderActions from 'actions/orders';
import { GET_DELIVERY_SCAN_LIST } from 'actions/delivery_manage';
import { GET_DISTRIBUTE_SCAN_LIST } from 'actions/delivery_distribute';
import { UPDATE_PATH } from 'redux-simple-router';

var orders_state = {
  loading: true,
  page_no: 0,
  total: 0,
  list: [],
  checked_order_ids: [],
  checked_orders: [],
  active_order_id: undefined,
  check_order_info: null,
  show_products_detail: false,
}

export function orders(state = orders_state, action){
  switch (action.type) {

    case UPDATE_PATH:
      return {...orders_state, loading: false }
      
    case OrderActions.GET_ORDER_LIST:
      return {...orders_state, ...action.data, loading: false, }

    case OrderActions.CHECK_ORDER:
      return (function(){
        var checked_order_ids = [], checked_orders = [];
        state.list.forEach(n => {
          if(n.order_id == action.order_id){
            n.checked = action.checked;
          }
          if(n.checked){
            checked_order_ids.push(n.order_id);
            checked_orders.push(n);
          }
        })
        return {...state, checked_order_ids, checked_orders}
      })();

    case OrderActions.CHECK_ALL_ORDERS:
      return (function(){
        var checked_order_ids = [], checked_orders = [];
        state.list.forEach(n => {
          n.checked = action.checked;
          if(action.checked){
            checked_order_ids.push(n.order_id);
            checked_orders.push(n);
          }
        })
        return {...state, checked_order_ids, checked_orders}
      })()

    case OrderActions.ACTIVE_ORDER:
      return {...state, active_order_id: action.active_order_id, show_products_detail: false}

    case OrderActions.SHOW_PRODUCTS_DETAIL:
      return {...state, show_products_detail: true}

    case OrderActions.GET_ORDER_DETAIL_PRODUCTS:
      return {...state, check_order_info: action.data}

    //特殊情况：送货单管理，配送单管理 -> 获取扫描搜索结果列表
    case GET_DELIVERY_SCAN_LIST:
    case GET_DISTRIBUTE_SCAN_LIST:
      return {...orders_state, loading: false} //重置

    default:
      return state;
  }
}

var operation_record = {
  page_no: 0,
  total: 0,
  list: [],
}

export function operationRecord(state = operation_record, action){
  switch(action.type){
    case OrderActions.RESET_ORDER_OPT_RECORD:
      return {...operation_record};
    case OrderActions.GET_ORDER_OPT_RECORD:
      return {...state, ...action.data}
    default:
      return state;
  }
}
