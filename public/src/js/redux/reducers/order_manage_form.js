import { combineReducers } from 'redux';
import { area } from './area_select';
import * as FormActions from 'actions/order_manage_form';
import * as OrderProductsActions from 'actions/order_products';
import { UPDATE_PATH } from 'redux-simple-router';
import * as AreaActions from 'actions/area';
import { map } from 'utils/index';
import { 
  DELIVERY_TO_HOME,
  DELIVERY_TIME_MAP,
  pay_status,
  INVOICE,
} from 'config/app.config';
import clone from 'clone';
import store from 'stores/configureStore';

var initial_state = {
  all_pay_status: map(pay_status, (text, id) => ({id, text})),
  all_delivery_time: DELIVERY_TIME_MAP.map(n => ({id: n, text: n})),
  all_order_srcs: [],
  delivery_stations: [],
  all_pay_modes: [],

  save_ing: false,
  save_success: true,
  submit_ing: false,

  //edit data from server
  data: {
    delivery_type: DELIVERY_TO_HOME,
    invoice: INVOICE.NO
  },
}

function mainForm(state = initial_state, action) {
  switch(action.type) {
    case UPDATE_PATH:
      return initial_state;
    case FormActions.GOT_ORDER_SRCS:
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
    case FormActions.GOT_DELIVERY_STATIONS:
      return {...state, delivery_stations: map(action.data, (text, id) => ({id, text})) }
    case FormActions.GOT_PAY_MODES:
      return {...state, all_pay_modes: map(action.data, (text, id) => ({id, text})) }

    case FormActions.SAVE_ORDER_INFO_ING:
      return {...state, save_ing: true }
    case FormActions.SAVE_ORDER_INFO_SUCCESS:
      return {...state, save_success: true, save_ing: false }
    case FormActions.SAVE_ORDER_INFO_FAIL:
      return {...state, save_success: false, save_ing: false }

    case FormActions.SUBMIT_ORDER_ING:
      return {...state, submit_ing: true}
    case FormActions.SUBMIT_ORDER_COMPLETE:
      return {...state, submit_ing: true}

    case FormActions.GOT_ORDER_BY_ID:
      return (function(){
        var {data} = action;
        var tmp = data.delivery_time.split(' ');
        data.delivery_date = tmp[0];
        data.delivery_hours = tmp[1];

        //
        store.dispatch(AreaActions.getCities(data.province_id));
        store.dispatch(AreaActions.getDistricts(data.city_id));
        
        return {...state, data}
      })();

    default:
      return state;
  }
}

//正在选择的商品
var products_choosing_state = {
  all_categories: [],
  search_results: {
    total: 0,
    list: []
  },
  selected_list: [],  //modal 里面的 选择列表
  confirm_list: [],   //modal 里面确认后，主面板的已选产品列表
};
function products_choosing(state = products_choosing_state, action){
  var sku_id, new_selected_list;
  switch(action.type){
    case UPDATE_PATH:
      return products_choosing_state;
    case OrderProductsActions.GOT_CATEGORIES:
      return {...state, all_categories: map(action.data, (text, id) => ({id, text}))};
    case OrderProductsActions.SEARCH_PRODUCTS:
      //如果检索到已被选商品，那么则要标明已被勾选
      state.selected_list.forEach(function(n){
        for(var i=0,len=action.data.list.length; i<len; i++){
          for(var j=0,jlen=action.data.list[i].skus.length; j<jlen; j++){
            if(action.data.list[i].skus[j].sku_id == n.sku_id){
              action.data.list[i].skus[j].checked = true;
            }
          }
        }
      });
      return {...state, search_results: action.data};
    case OrderProductsActions.SELECT_PRODUCT:
      sku_id = action.data.sku_id;
      if(state.selected_list.some(n => n.sku_id == sku_id)){
        return state;
      }
      /*****  这个地方已突变，应该使用 immutablejs *****/
      state.search_results.list.forEach(function(n){
        n.skus.forEach(function(m){
          if(m.sku_id == sku_id){
            m.checked = !m.checked;
          }
        })
      });
      action.data.num = 1;  //默认1
      return {...state, selected_list: [...state.selected_list, action.data] };
    case OrderProductsActions.DELETE_SELECTED_PRODUCT:
      sku_id = action.data.sku_id;
      state.search_results.list.forEach(function(n){
        n.skus.forEach(function(m){
          if(m.sku_id == sku_id){
            m.checked = false;
          }
        })
      });
      new_selected_list = [...state.selected_list].filter(n => n.sku_id != sku_id);
      return {...state, selected_list: new_selected_list};
    case OrderProductsActions.CHANGE_PRODUCT_NUM:
      let { num } = action;
      sku_id = action.sku_id;
      new_selected_list = clone(state.selected_list);
      new_selected_list.forEach(function(n){
        if(n.sku_id == sku_id){
          n.num = num;
        }
      });
      return {...state, selected_list: new_selected_list};

    case OrderProductsActions.CONFIRM_ALL_SELECTED_PRODUCTS:
      return (function(){
        var base = {
          discount_price: 0,
          choco_board: '巧克力牌xxx', //巧克力牌
          greeting_card: '祝福语xxx', //祝福语
          atlas: true, //产品图册
          custom_name: '自定义名称xxx',  //自定义名称
          custom_desc: '自定义描述xxx',  //自定义描述
        }
        var confirm_list = state.selected_list.map(function(n){
          var new_item = {...n, ...base};
          new_item.discount_price = n.discount_price / 100 || 0;
          new_item.amount = n.discount_price * n.num / 100;
          return new_item;
        })
        return {...state, confirm_list: confirm_list };
      })();

    case OrderProductsActions.CANCEL_ALL_SELECTED_PRODUCTS:
      return {...state, selected_list: [...clone(state.confirm_list)] };

    case OrderProductsActions.CONFIRM_PRODUCT_ATTR_CHANGE:
      sku_id = action.data.sku_id;
      //突变
      state.confirm_list.forEach(function(n){
        if(n.sku_id == sku_id){
          n[action.data.attr.name] = action.data.attr.value;
        }
      });
      return {...state};

    case OrderProductsActions.DELETE_CONFIRM_PRODUCT:
      sku_id = action.data.sku_id;
      // 突变
      state.search_results.list.forEach(function(n){
        n.skus.forEach(function(m){
          if(m.sku_id == sku_id){
            m.checked = false;
          }
        })
      });
      let new_confirm_list = clone(state.confirm_list);
      new_confirm_list.splice(new_confirm_list.findIndex( n => n.sku_id == sku_id), 1);
      new_selected_list = clone(state.selected_list);
      new_selected_list.splice(new_selected_list.findIndex( n => n.sku_id == sku_id), 1);
      return {...state, confirm_list: new_confirm_list, selected_list: new_selected_list }

    case OrderProductsActions.GOT_ORDER_BY_ID:
      return {...state, confirm_list: action.data.products, selected_list: action.data.products };
    default:
      return state;
  }
}

var history_orders_state = {
  page_no: 0,
  total: 0,
  list: [],
  active_order_id: undefined,
  check_order_info: null,
}
function history_orders(state = history_orders_state, action){
  switch (action.type) {
    case FormActions.GET_HISTORY_ORDERS:
      return {...state, ...action.data, active_order_id: undefined, check_order_info: null}

    case FormActions.CHECK_HISTORY_ORDER:
      return {...state, active_order_id: action.active_order_id}
    case FormActions.GET_HISTORY_ORDER_DETAIL_PRODUCTS:
      return {...state, check_order_info: action.data}
    default:
      return state;
  }
}

const orderAddReducer = combineReducers({
  area: area(true),
  mainForm,
  products: products_choosing,
  history_orders,
})

export default orderAddReducer