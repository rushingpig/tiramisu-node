import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import login from './login';
import orderManage from './order_manage';
import orderManageAdd from './order_manage_add';

const rootReducer = combineReducers({
  login,
  orderManage,
  orderManageAdd,
  form: formReducer
})

export default rootReducer