import { combineReducers } from 'redux';
import { area } from './area_select';
import { DISTRIBUTE_TYPE_CHANGE } from '../actions/order_manage_add';
import { map } from '../utils/index';
import { 
  DISTRIBUTE_TO_HOME,
  pay_status
} from '../config/app.config';

var initial_state = {
  distribute_type: DISTRIBUTE_TO_HOME,
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
}

function addForm(state = initial_state, action) {
  switch(action.type) {
    case DISTRIBUTE_TYPE_CHANGE:
      return {...state, ...{ distribute_type: action.method }};
    default:
      return state;
  }
}

const orderAddReducer = combineReducers({
  area,
  addForm,
})

export default orderAddReducer