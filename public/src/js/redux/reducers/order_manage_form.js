import { combineReducers } from 'redux';
import { area } from './area_select';
import * as FormActions from 'actions/order_manage_form';
import * as OrderProductsActions from 'actions/order_products';
import { UPDATE_PATH } from 'redux-simple-router';
import AreaActions from 'actions/area';
import { ProductsModalActionTypes } from 'actions/action_types';
import { updateAddOrderForm, updateAddOrderFormPayStatus, triggerFormUpdate, initForm } from 'actions/form';
import { map, delay, core } from 'utils/index';
import { getValues } from 'redux-form';
import { pay_status as PAY_STATUS, MODES } from 'config/app.config';

import delivery_stations from 'reducers/delivery_stations';

import { 
  DELIVERY_TO_HOME,
  DELIVERY_TO_STORE,
  DELIVERY_TIME_MAP,
  pay_status,
  INVOICE,
  REQUEST,
} from 'config/app.config';
import clone from 'clone';
import {getGlobalStore} from 'stores/getter';

var initial_state = {
  all_pay_status: map(pay_status, (text, id) => ({id, text})),
  all_delivery_time: DELIVERY_TIME_MAP.map(n => ({id: n, text: n})),
  all_order_srcs: [],
  all_pay_modes: [],

  save_ing: false,
  save_success: false,
  submit_ing: false,

  //edit data from server
  data: {
    
  },

  districts_and_cities: {}, //二级市下面所有已开通的三级城市
}

function mainForm(state = initial_state, action) {
  var store = getGlobalStore();
  switch(action.type) {
    case UPDATE_PATH:
      return {...initial_state}
    case FormActions.GOT_ORDER_SRCS:
      let l1 = [], l2 = [];
      var order_src_data = core.isArray(action.data) ? action.data : [];
      //level最多为2级
      order_src_data.forEach(n => {
        n.text = n.name;  //转换
        if(n.level == 1){
          l1.push(n);
        }else{
          l2.push(n);
        }
      })
      return {...state, all_order_srcs: !l2.length ? [l1] : [l1, l2] }
    
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
      return {...state, submit_ing: false}

    case FormActions.GOT_ORDER_BY_ID:
      return (function(){
        var {data} = action;
        var tmp = data.delivery_time && data.delivery_time.split(' '); //天猫没有delivery_time
        data.delivery_date = data.delivery_time && tmp[0];
        data.delivery_hours = data.delivery_time && tmp[1];
        data.operatorType = 'EDIT';    //区分数据是来源于 复制订单、关联订单还是编辑订单
        //门店自提
        if(data.delivery_type == DELIVERY_TO_STORE){
          data.recipient_shop_address = data.recipient_address;
          data.recipient_address = null;
        }

        //这些东西应该放到action里面的
        delay(function(){
          var {getStandardCities, getStandardDistricts, getDeliveryShops} = AreaActions();
          store.dispatch(getStandardCities(data.province_id));
          store.dispatch(getStandardDistricts(data.city_id));
          store.dispatch(getDeliveryShops(data.regionalism_id));
          // store.dispatch(FormActions.getDeliveryStations({city_id: data.city_id}));
          store.dispatch(FormActions.getAllDistrictsAndCity(data.city_id)).done(function(districts_and_cities){
            if(data.regionalism_id in districts_and_cities){
              store.dispatch(FormActions.getDeliveryStations({city_id: data.regionalism_id}))
            }else{
              store.dispatch(FormActions.getDeliveryStations({city_id: data.city_id}))
            }
          });
        })

        return {...state, data}
      })();
    case FormActions.GOT_COPY_ORDER_BY_ID:
      return (function(){
        var {data} = action;
        var tmp = data.delivery_time && data.delivery_time.split(' '); //天猫没有delivery_time
        data.delivery_date = data.delivery_time && tmp[0];
        data.delivery_hours = data.delivery_time && tmp[1];
        data.operatorType = 'COPY';    //区分数据是来源于 复制订单、关联订单还是编辑订单
        //门店自提
        if(data.delivery_type == DELIVERY_TO_STORE){
          data.recipient_shop_address = data.recipient_address;
          data.recipient_address = null;
        }

        //
        var {getCities, getDistricts, getDeliveryShops} = AreaActions();
        store.dispatch(getCities(data.province_id));
        store.dispatch(getDistricts(data.city_id));
        store.dispatch(getDeliveryShops(data.regionalism_id));
        store.dispatch(FormActions.getDeliveryStations({city_id: data.city_id}));
        
        return {...state, data}
      })();
    case FormActions.GET_BIND_ORDER_BY_ID:
      return (function(){
        var {data} = action;
        var tmp = data.delivery_time && data.delivery_time.split(' '); //天猫没有delivery_time
        data.delivery_date = data.delivery_time && tmp[0];
        data.delivery_hours = data.delivery_time && tmp[1];
        //门店自提
        if(data.delivery_type == DELIVERY_TO_STORE){
          data.recipient_shop_address = data.recipient_address;
          data.recipient_address = null;
        }
        data.operatorType = 'RELATE';    //区分数据是来源于 复制订单、关联订单还是编辑订单
        data.bind_order_id = action.bind_order_id;
        //
        var {getCities, getDistricts, getDeliveryShops} = AreaActions();
        store.dispatch(getCities(data.province_id));
        store.dispatch(getDistricts(data.city_id));
        store.dispatch(getDeliveryShops(data.regionalism_id));
        store.dispatch(FormActions.getDeliveryStations({city_id: data.city_id}));
        
        return {...state, data}
      })();

    case FormActions.GOT_DISTRICTS_AND_CITY:
      return {...state, districts_and_cities: action.data}
    default:
      return state;
  }
}

//正在选择的商品
var products_choosing_state = {
  all_categories: [],
  search_results: {
    total: 0,
    list: [],
    page_no: 0,
  },
  selected_list: [],  //modal 里面的 选择列表
  selected_list_deleted: [], //删除的产品回收站，（对于先删除了，后又取消掉了的情况，可以用此来还原）
  confirm_list: [],   //modal 里面确认后，主面板的已选产品列表
};
function products_choosing(state = products_choosing_state, action){
  var sku_id, new_selected_list;
  var store = getGlobalStore();

  switch(action.type){
    case UPDATE_PATH:
      return products_choosing_state;
    case OrderProductsActions.GOT_CATEGORIES:
      return {...state, all_categories: action.data};
    case OrderProductsActions.GOT_CITIES_TO_FILTER_PRODUCTS:
      return {...state, cities: action.data};
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
      /*****  这个地方已突变 *****/
      state.search_results.list.forEach(function(n){
        n.skus.forEach(function(m){
          if(m.sku_id == sku_id){
            m.checked = !m.checked;
          }
        })
      });
      action.data.num = 1;  //默认1
      action.data.is_new = true; //表示该项是新添加的，便于取消时撤销该产品
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
      return {...state, selected_list: new_selected_list, selected_list_deleted: [...state.selected_list_deleted, action.data]};
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
          choco_board: '', //巧克力牌
          greeting_card: '', //祝福语
          atlas: true, //产品图册
          custom_name: '',  //自定义名称
          custom_desc: '',  //自定义描述
        }
        var new_added_products = [];
        var confirm_list = state.selected_list.map(function(n){
          var confirm_pro = state.confirm_list.filter( m => m.sku_id == n.sku_id )[0];
          var new_item;
          if( confirm_pro ){
            confirm_pro.num != n.num && new_added_products.push(confirm_pro.sku_id);
            //如果该产品存在
            new_item = {
              ...n,
              discount_price: confirm_pro.num != n.num ? (confirm_pro.discount_price / confirm_pro.num * n.num).toFixed(2) : confirm_pro.discount_price,
              amount: confirm_pro.num != n.num ? (confirm_pro.amount / confirm_pro.num * n.num).toFixed(2) : confirm_pro.amount,
              choco_board: confirm_pro.choco_board || '',
              greeting_card: confirm_pro.greeting_card || '',
              atlas: confirm_pro.atlas,
              custom_name: confirm_pro.custom_name || '',
              custom_desc: confirm_pro.custom_desc || '',
            }
          }else{
            //如果不存在
            new_added_products.push(n.sku_id);
            new_item = {...n, ...base};
            new_item.discount_price = n.discount_price * n.num / 100 || 0;
            new_item.amount = new_item.discount_price;
          }
          new_item.old_discount_price = new_item.discount_price; //old_discount_price实际上是discount_price的一个缓存
          //最后将is_new属性删除
          delete n.is_new;
          delete new_item.is_new;
          return new_item;
        })
        delay(() => store.dispatch(updateAddOrderFormPayStatus())); //商品数变化，通知add_order表单更新，支付方式、支付状态的默认值与所选商品数是紧密相关的
        delay(() => store.dispatch(OrderProductsActions.updateConfirmProductDiscountPrice(new_added_products))); //更新商品应收金额
        return {...state, confirm_list: confirm_list, selected_list_deleted: [] };
      })();

    case OrderProductsActions.CANCEL_ALL_SELECTED_PRODUCTS:
      state.search_results.list.forEach(function(n){
        n.skus.forEach(function(m){
          m.checked = state.confirm_list.some(j => m.sku_id == j.sku_id);
        })
      });
      //去除具有is_new属性的选项
      new_selected_list = state.selected_list.concat(state.selected_list_deleted).filter( n => !n.is_new );
      //产品数量需还原
      new_selected_list.forEach( n => {
        state.confirm_list.forEach( m => {
          if( m.sku_id == n.sku_id ){
            n.num = m.num;
          }
        })
      })
      //如果有删除了的，这时也应该还原
      return {...state, selected_list: new_selected_list, selected_list_deleted: []};

    case OrderProductsActions.CONFIRM_PRODUCT_ATTR_CHANGE:
      sku_id = action.data.sku_id;
      //突变
      state.confirm_list.forEach(function(n){
        if(n.sku_id == sku_id){
          n[action.data.attr.name] = action.data.attr.value;
        }
      });
      //将修改映射到selected_list上，防止再次添加商品时，之前的修改被覆盖
      state.selected_list.forEach(function(n){
        if(n.sku_id == sku_id){
          if(action.data.attr.name == 'discount_price'){
            n.discount_price = action.data.attr.value * 100;
            n.old_discount_price = n.discount_price;
          }else if(action.data.attr.name == 'amount'){
            n.amount = action.data.attr.value;
          }
        }
      });
      return {...state, confirm_list: clone(state.confirm_list), selected_list: clone(state.selected_list)};

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
      let delete_product_index = new_confirm_list.findIndex( n => n.sku_id == sku_id);
      new_confirm_list.splice(delete_product_index, 1);
      new_selected_list = clone(state.selected_list);
      new_selected_list.splice(new_selected_list.findIndex( n => n.sku_id == sku_id), 1);
      if(new_confirm_list.length == 1 && store.getState().form.add_order.pay_status.value == 'PARTPAYED'){
        delay(() => store.dispatch(triggerFormUpdate('add_order', 'pay_status', 'PAYED'))); //商品数变化(可能的更改，部分付款变为已付款)
      }
      if(delete_product_index == 0 && store.getState().form.add_order.pay_status.value == 'PARTPAYED'){ //删除的为第一个商品，且为部分付款
        delay(() => store.dispatch(OrderProductsActions.updateConfirmProductDiscountPrice())); //更新商品应收金额
      }
      return {...state, confirm_list: new_confirm_list, selected_list: new_selected_list }

    //其实这个应该主要是更新应收金额
    case OrderProductsActions.UPDATE_CONFIRM_PRODUCT_DISCOUNT_PRICE:
      return (function(){
        var order = getValues(store.getState().form.add_order);
        var pay_status = PAY_STATUS[order.pay_status];
        var {confirm_list, selected_list} = state;
        var added_sku_ids = action.sku_ids;
        //更新指定的sku，而不是全部
        if(!action.sku_ids || action.sku_ids.length == 0){
          added_sku_ids = confirm_list.map( n => n.sku_id );
        }
        //支付状态：已付款，或者，支付方式：免费（此时，商品的实际售价和应收金额为0）
        if(pay_status == '已付款' || order.pay_modes_id == MODES.free){
          confirm_list.forEach( n => {
            if(added_sku_ids.some(sku_id => sku_id == n.sku_id)){
              //保留可能已修改的amount值（手动修改级别最高）
              var pro = selected_list.filter( m => m.sku_id == n.sku_id )[0];
              n.amount = core.isUndefined(pro.amount) ? 0 : pro.amount;
              if(order.pay_modes_id == MODES.free){
                n.discount_price = 0;
              }
            }
          })
        }else if(pay_status == '部分付款'){
          confirm_list.forEach(function(n, i){
            if(added_sku_ids.some(sku_id => sku_id == n.sku_id)){
              //保留可能已修改的amount值
              var pro = selected_list.filter( m => m.sku_id == n.sku_id )[0];
              if( i == 0 ){
                if( n.num > 1 ){
                  n.amount = core.isUndefined(pro.amount) ? n.old_discount_price * (n.num - 1) : pro.amount;
                }else{
                  n.amount = core.isUndefined(pro.amount) ? 0 : pro.amount;
                }
              }else{
                n.amount = core.isUndefined(pro.amount) ? n.old_discount_price : pro.amount;
              }
            }
          })
        }else{
          confirm_list.forEach(function(n){
            if(added_sku_ids.some(sku_id => sku_id == n.sku_id)){
              n.discount_price = n.old_discount_price;
              //保留可能已修改的amount值
              var pro = selected_list.filter( m => m.sku_id == n.sku_id )[0];
              n.amount = core.isUndefined(pro.amount) ? n.old_discount_price : pro.amount;
            }
          })
        }
        return {...state, confirm_list: clone(confirm_list)};
      })()

    case FormActions.GOT_ORDER_BY_ID:
    case FormActions.GOT_COPY_ORDER_BY_ID:
    case FormActions.GET_BIND_ORDER_BY_ID:
      return (function(){
        var confirm_list = clone(action.data.products);
        confirm_list.forEach( n => {
          n.discount_price /= 100; //暂没有除以num，表示总价
          n.old_discount_price = n.discount_price;
          n.amount /= 100;
        });
        var selected_list = clone(action.data.products);
        selected_list.forEach( n => {
          delete n.amount; //selected_list 中的 amount有特殊意义，（代表有没有修改应收金额）
        })
        return {...state, confirm_list, selected_list };
      })()
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
  area: area(),
  mainForm,

  products: products_choosing,
  products_area_filter: area(ProductsModalActionTypes),

  history_orders,
  delivery_stations,
})

export default orderAddReducer
