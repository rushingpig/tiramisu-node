import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import login from './login';
import orderManage from './order_manage';
import orderManageForm from './order_manage_form';

const rootReducer = combineReducers({
  login,
  orderManage,
  orderManageForm,
  form: formReducer
})

export default rootReducer