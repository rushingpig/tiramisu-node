import { combineReducers } from 'redux';
import { area } from './area_select';
import { GOT_ORDER_SRCS, GOT_DELIVERY_STATIONS} from '../actions/order_manage_add';
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
    default:
      return state;
  }
}

const orderAddReducer = combineReducers({
  area,
  addForm,
})

export default orderAddReducer