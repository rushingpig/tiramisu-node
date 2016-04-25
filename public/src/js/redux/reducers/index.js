import { combineReducers } from 'redux';
import { routeReducer } from 'redux-simple-router';
import form from './form';
import login from './login';
import orderManage from './order_manage';
import orderManageForm from './order_manage_form';
import orderAbnormal from './order_abnormal';
import deliveryChange from './delivery_change';
import deliveryManage from './delivery_manage';
import distributeManage from './distribute_manage';
import deliveryPrintReview from './delivery_print_review';
import srcChannelManage from './central_src_channel_manage';
import stationManage from './station_manage';
import stationManageForm from './station_manage_form';
import stationSalaryManage from './station_salary';
import UserManage from './user_manage';
import UserManageForm from './user_manage_form';
import SystemAuthorityManage from './authority_system_manage';
import RoleAuthorityManage from './authority_role_manage';
import DeptRoleManage from './depart_role_manage';
import categorySearch from './category_search';
import categoryManage from './category_manage';
import categoryCitiesSelector from './category_cities_selector';

const rootReducer = combineReducers({
  form,
  routing: routeReducer,
  login,
  orderManage,
  orderManageForm,
  orderAbnormal,
  deliveryChange,
  deliveryManage,
  distributeManage,
  deliveryPrintReview,
  srcChannelManage,
  stationManage,
  stationManageForm,
  stationSalaryManage,
  RoleAuthorityManage,
  UserManage,
  UserManageForm,
  SystemAuthorityManage,
  DeptRoleManage,
  categorySearch,
  categoryManage,
  categoryCitiesSelector
});

export default rootReducer
