import * as OrderActions from 'actions/orders';
import { GET_DELIVERY_SCAN_LIST } from 'actions/delivery_manage';
import { GET_DISTRIBUTE_SCAN_LIST } from 'actions/delivery_distribute';
import { UPDATE_PATH } from 'redux-simple-router';

export function orders(ifRetain){
  var orders_state = {
    loading: true, //初始化加载，
    refresh: false, //列表数据更新（用于当某些操作所引发的数据刷新）
    page_no: 0,
    total: 0,
    list: [],
    checkall: false,
    checked_order_ids: [],
    checked_orders: [],
    active_order_id: undefined,
    check_order_info: null,
    get_products_detail_ing: false,
    show_products_detail: false,
  }

  return function(state = orders_state, action){
    switch (action.type) {

      case UPDATE_PATH:
        //是否要保留store里面的数据，不被清除
        return ifRetain && action.payload.path.startsWith('/om/index/') ? state : {...orders_state};
      case OrderActions.RESET_ORDER_STORE:
        return {...orders_state};
      
      case OrderActions.GET_ORDER_LIST_ING:
        return {...state, refresh: true }
      case OrderActions.GET_ORDER_LIST:
      case GET_DELIVERY_SCAN_LIST:
      case GET_DISTRIBUTE_SCAN_LIST:
        return {...orders_state, ...action.data, loading: false, refresh: false }

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
          return {...state, checkall: action.checked, checked_order_ids, checked_orders}
        })()

      case OrderActions.ACTIVE_ORDER:
        return {...state, active_order_id: action.active_order_id, get_products_detail_ing: true, show_products_detail: false}

      case OrderActions.SHOW_PRODUCTS_DETAIL:
        return {...state, show_products_detail: true}

      case OrderActions.GET_ORDER_DETAIL_PRODUCTS:
        return {...state, get_products_detail_ing: false, check_order_info: action.data}

      default:
        return state;
    }
  }
}

var operation_record = {
  page_no: 0,
  total: 0,
  list: [],
  loading: true,
}

export function operationRecord(state = operation_record, action){
  switch(action.type){
    case OrderActions.RESET_ORDER_OPT_RECORD:
      return {...operation_record};
    case OrderActions.GET_ORDER_OPT_RECORD:
      return {...state, ...action.data, loading: false}
    default:
      return state;
  }
}
