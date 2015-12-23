import { combineReducers } from 'redux';
import { area } from './area_select';
import { GOT_ORDER_SRCS, GOT_DELIVERY_STATIONS, GOT_PAY_MODES,
  SAVE_ORDER_INFO_ING, SAVE_ORDER_INFO_SUCCESS, SAVE_ORDER_INFO_FAIL} from '../actions/order_manage_add';
import { GOT_CATEGORIES, SEARCH_PRODUCTS } from '../actions/order_products';
import { map } from '../utils/index';
import { 
  DELIVERY_TO_HOME,
  DELIVERY_TIME_MAP,
  pay_status
} from '../config/app.config';

var initial_state = {
  // owner_name: '',
  // owner_mobile: '',
  // recipient_name: '', //下单人姓名
  // recipient_mobile: '',
  // recipient_address: '', //收货人详细地址----》送货上门
  // regionalism_id: '',    //分店ID ----》自取
  // recipient_landmark: '', //标志性建筑
  // delivery_id: '',     //配送中心
  // src_id: '',          //订单来源
  // pay_modes_id: '',
  // pay_status: null,
  // delivery_time: '',
  // remarks: '',
  // invoice: '',

  all_pay_status: map(pay_status, (text, id) => ({id, text})),
  all_delivery_time: DELIVERY_TIME_MAP.map(n => ({id: n, text: n})),
  all_order_srcs: [],
  delivery_stations: [],
  all_pay_modes: [],

  save_ing: false,
  save_success: true,
  submitting: false,
}

function addForm(state = initial_state, action) {
  switch(action.type) {
    case GOT_ORDER_SRCS:
      var l1 = [], l2 = [];
      //level最多为2级
      action.data.forEach(n => {
        n.text = n.name;  //转换
        if(n.level == 1){
          l1.push(n);
        }else{
          l2.push(n);
        }
      })
      return {...state, ...{all_order_srcs: !l2.length ? [l1] : [l1, l2]} }
    case GOT_DELIVERY_STATIONS:
      return {...state, ...{delivery_stations: map(action.data, (text, id) => ({id, text}))} }
    case GOT_PAY_MODES:
      return {...state, ...{all_pay_modes: map(action.data, (text, id) => ({id, text}))}}
    case SAVE_ORDER_INFO_ING:
      return {...state, ...{save_ing: true}}
    case SAVE_ORDER_INFO_SUCCESS:
      return {...state, ...{save_success: true, save_ing: false}}
    case SAVE_ORDER_INFO_FAIL:
      return {...state, ...{save_success: false, save_ing: false}}
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
};
function products_choosing(state = products_choosing_state, action){
  switch(action.type){
    case GOT_CATEGORIES:
      return {...state, ...{all_categories: map(action.data, (text, id) => ({id, text}))}};
    case SEARCH_PRODUCTS:
      return {...state, ...{search_results: action.data}};
    default:
      return state;
  }
}

const orderAddReducer = combineReducers({
  area,
  addForm,
  products: combineReducers({
    products_choosing,
  }),
})

export default orderAddReducer