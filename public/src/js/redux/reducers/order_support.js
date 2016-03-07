import * as OrderSupportActions from 'actions/order_support';

function all_order_srcs( state = [], action ){
  switch( action.type ){
    case OrderSupportActions.GOT_ORDER_SRCS:
      // let l1 = [], l2 = [];
      // var order_src_data = core.isArray(action.data) ? action.data : [];
      // //level最多为2级
      // order_src_data.forEach(n => {
      //   n.text = n.name;  //转换
      //   if(n.level == 1){
      //     l1.push(n);
      //   }else{
      //     l2.push(n);
      //   }
      // })
      // return order_src_data;
      return action.data;
    default:
      return state;
  }
}

function all_pay_modes( state = [], action ){
  switch( action.type ){    
    case OrderSupportActions.GOT_PAY_MODES:
      // return map(action.data, (text, id) => ({id, text}));
      return action.data;
    default:
      return state;
  }
}