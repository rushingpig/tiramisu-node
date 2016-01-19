import * as OrderActions from 'actions/orders';

var orders_state = {
  loading: true,
  page_no: 0,
  total: 0,
  list: [],
  checked_order_ids: [],
  active_order_id: undefined,
  check_order_info: null,
}

export function orders(state = orders_state, action){
  switch (action.type) {

    case OrderActions.GET_ORDER_LIST:
      return {...state, ...action.data, loading: false}

    case OrderActions.CHECK_ORDER:
      return (function(){
        var checked_order_ids = [];
        state.list.forEach(n => {
          if(n.order_id == action.order_id){
            n.checked = action.checked;
          }
          if(n.checked){
            checked_order_ids.push(n.order_id);
          }
        })
        return {...state, checked_order_ids}
      })();

    case OrderActions.CHECK_ALL_ORDERS:
      return (function(){
        var checked_order_ids = [];
        state.list.forEach(n => {
          n.checked = action.checked;
          if(action.checked){
            checked_order_ids.push(n.order_id);
          }
        })
        return {...state, checked_order_ids}
      })()

    case OrderActions.ACTIVE_ORDER:
      return {...state, active_order_id: action.active_order_id}

    case OrderActions.GET_ORDER_DETAIL_PRODUCTS:
      return {...state, check_order_info: action.data}

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
    case OrderActions.GET_ORDER_OPT_RECORD:
      return {...state, ...action.data}
    default:
      return state;
  }
}
