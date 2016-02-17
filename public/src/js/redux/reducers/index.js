import { combineReducers } from 'redux';
import login from './login';
import orderManage from './order_manage';
import orderManageForm from './order_manage_form';
import deliveryChange from './delivery_change';
import deliveryManage from './delivery_manage';
import distributeManage from './distribute_manage';
import deliveryPrintReview from './delivery_print_review';
import form from './form';
import { routeReducer } from 'redux-simple-router';

const rootReducer = combineReducers({
  login,
  orderManage,
  orderManageForm,
  deliveryChange,
  deliveryManage,
  distributeManage,
  deliveryPrintReview,
  form,
  routing: routeReducer
})

export default rootReducer