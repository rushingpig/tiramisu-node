import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import login from './login';
import orderManage from './order_manage';
import orderManageForm from './order_manage_form';
import deliveryChange from './delivery_change';
import { routeReducer } from 'redux-simple-router';

const rootReducer = combineReducers({
  login,
  orderManage,
  orderManageForm,
  deliveryChange,
  form: formReducer,
  routing: routeReducer
})

export default rootReducer