import { reducer as formReducer, actionTypes } from 'redux-form';
// import store from 'stores/configureStore'; //循环引用
import { getGlobalStore, getGlobalState } from 'stores/getter';
import { SELECT_DEFAULT_VALUE, pay_status as PAY_STATUS, SRC, MODES } from 'config/app.config';
import { updateConfirmProductDiscountPrice } from 'actions/order_products';
import {getStationsByCityIds} from 'actions/user_manage_form';
import { delay, each, getDate, form as FORM,map} from 'utils/index';

import { REDUX_FORM_REINIT } from 'actions/form';
import FormFields from 'config/form.fields';

function preCheck(){
  var { pathname } = location;
  return pathname.startsWith('/om/index') && getGlobalState();
}

export function isSrc(special_src_id, src_id){
  if(preCheck()){
    var { orderManageForm: { mainForm: { all_order_srcs }}} = getGlobalState();
    //注意all_order_srcs是一个二维数组，第一个是一级，第二个是二维，src_id可能位于一维，也可能在二维
    if(all_order_srcs.length > 1 && src_id){
      var src1 = all_order_srcs[0].filter( n => n.id === special_src_id)[0] || {};
      if(src1.id == src_id){
        return true;
      }else{
        var src2 = all_order_srcs[1].filter(n => n.id == src_id)[0];
        if(src2 && src2.parent_id == src1.id){
          return true;
        }
      }
    }
  }
}

function getMode(mode_name){
  var { orderManageForm: { mainForm: { all_pay_modes }}} = getGlobalState();
  return all_pay_modes.filter( n => n.text == mode_name )[0] || {};
}

function _t(data){
  return map(data, (text, id) => ({id, text}))
}

export default formReducer.plugin({
  order_manage_filter: (state, action) => {
    if( action && action.form == 'order_manage_filter' ){
      if(
        action.field == 'begin_time' && action.value && state.begin_time && FORM.isDate(state.begin_time.value) ){
        try{
          var end_time = getDate( state.begin_time.value, 30 );
        }catch(e){
          end_time = undefined;
        }
        state.end_time = {touched: false, value: end_time, visited: false};
      }
      return {...state};
    }
    return state;
  },
  add_order: (state, action) => {
  //这里注意：所有的action都会进入，所以得使用以下判断, 以确保当前form为add_order
    if(action && action.form == 'add_order'){
      //重新初始化表单
      if(action.type == REDUX_FORM_REINIT){
        FormFields['add_order'].forEach( n => {
          state[n].value = state[n].initial;
        })
        return {...state};
      }else if(action.field == 'owner_mobile'){
        //电话号码
        switch(action.type){
          case actionTypes.FOCUS:
            state.owner_mobile.focus = true;
            return {...state}
          case actionTypes.BLUR:
            state.owner_mobile.focus = false;
            return {...state}
          default:
            return state;
        }
      }else if(action.field == 'recipient_mobile'){
        switch(action.type){
          case actionTypes.FOCUS:
            state.recipient_mobile.focus = true;
            return {...state}
          case actionTypes.BLUR:
            state.recipient_mobile.focus = false;
            return {...state}
          default:
            return state;
        }
      }else{
        //订单来源，支付方式，支付状态，产品应收 联动
        switch(action.type) {
          case actionTypes.FOCUS:
            if(action.field == '_update'){
              state.pay_status = {...state.pay_status, ...getPayStatus(state, action)};
            }
            return {...state};
          case actionTypes.BLUR:
            if(action.field == '_update'){
              state.pay_status = {...state.pay_status, ...getPayStatusByProductChange(state, action)};
            }
            return {...state};
          case actionTypes.RESET:
            if(action.field == 'src_id' || action.key == 'src_id'){
              state.src_id = {touched: false, value: SELECT_DEFAULT_VALUE, visited: false};
              state.pay_modes_id = {touched: false, visited: false};
              state.pay_status = {touched: false, visited: false};
            }
          // case actionTypes.BLUR:
          case actionTypes.CHANGE:
            if(action.field == 'src_id' || action.key == 'src_id'){
              state.pay_modes_id = {...state.pay_modes_id, ...getPayModesId(state, action)};
              state.pay_status = {...state.pay_status, ...getPayStatus(state, action)};
            }
            delay(() => {
              var { field, key } = action;
              if( field == 'pay_status' || key == 'pay_status' || field == 'pay_modes_id' || key == 'pay_modes_id' ){
                getGlobalStore().dispatch(updateConfirmProductDiscountPrice());
              }
            })
            return {...state};
          default:
            return state;
        }
      }
    }else{
      return state;
    }
  },
  add_user:(state,action) =>{
    if(action && action.form =='add_user'){
/*      if(action.field == 'dept_id'){
        if(action.type == actionTypes.CHANGE){
          state.roles_in = {...state.roles_in||[],...state.tmp_roles||[]};
        }
      }else if(action.field == 'province_id'){
        if(action.type == actionTypes.CHANGE){
          state.cities_in = {...state.cities_in||[],...state.tmp_cities||[]};
        }
      }*/
      if(action.field == 'tmp_roles'){
        if(action.type == actionTypes.CHANGE){
          state.roles_in = {...state.roles_in||[],...state.tmp_roles||[]};
        }
      }else if(action.field == 'tmp_cities'){
        if(action.type == actionTypes.CHANGE){
          state.cities_in = {...state.cities_in||[],...state.tmp_cities||[]};
        }
      }else if(action.field == 'tmp_stations'){
        if(action.type == actionTypes.CHANGE){
          state.stations_in = {...state.stations_in||[],...state.tmp_stations||[]};
        }
      }else if(action.field == 'is_national'){
        if(action.type == actionTypes.CHANGE){
          var store = getGlobalStore();
          var stations = store.getState().UserManageForm.dept_role.stations;
          if(state.is_national.value){
            state.stations_in = {value:stations};
          }else{
            state.stations_in = {value:[]};
          }
        }
      }
      /*if(action.field == '')*/
    }
    return state;  //required!
  },
});

  // order_manage_filter: (state, action) => {
  //   if(action && action.form == 'order_manage_filter'){
  //     // switch( action.type ){
  //     //   case actionTypes.CHANGE:
  //     //     if(action.field == 'src_id' || action.key == 'src_id'){
  //     //       state.pay_modes_id = {...state.pay_modes_id, ...getPayModesId(state, action)};
  //     //       state.pay_status = {...state.pay_status, ...getPayStatus(state, action)};
  //     //     }
  //     // }
  //   }
  // }
  // 
/*  add_user:(state,action) => {
    if (action && action.form == 'add_order'){
      
    }
  },*/



function getPayModesId(state, action){
  var src_id = state.src_id.value;
  var pay_modes_id = state.pay_modes_id.value;
  if(src_id){
    if(action.type == actionTypes.RESET){
      return {value: SELECT_DEFAULT_VALUE};
    }else{
      if(isSrc( SRC.group_site, src_id )){ //团购网站
        return { value: MODES.group_psd };
      }else if(isSrc( SRC.youzan, src_id)){ //有赞微商城
        return { value: MODES.wechat };
      }else if(isSrc( SRC.telephone400, src_id)){ //400电话
        if(pay_modes_id != MODES.cash || pay_modes_id != MODES.card){
          return { value: MODES.cash }; //默认一个
        }
      }else{
        if( action.type == actionTypes.CHANGE ){
          return {touched: false, value: SELECT_DEFAULT_VALUE, visited: false};
        }else{
          return state;
        }
      }
    }
  }
}

function getPayStatus(state, action){
  var src_id = state.src_id.value;
  var pay_status = state.pay_status.value;
  if(src_id){
    if(action.type == actionTypes.RESET){
      return {value: SELECT_DEFAULT_VALUE};
    }else{
      if(isSrc( SRC.group_site, src_id)){ //团购网站
        var { orderManageForm: { products: { confirm_list }}} = getGlobalState();
        //属于团购网站
        if(confirm_list.length > 1 || (confirm_list[0] && confirm_list[0].num > 1)){
          return { value: 'PARTPAYED' }; //部分付款
        }else{
          return { value: 'PAYED' }; //已付款
        }
      }else if(isSrc( SRC.youzan, src_id)){ //有赞微商城
        return { value: 'PAYED'};
      }else if(isSrc( SRC.telephone400, src_id )){
        return { value: 'COD' }; //货到付款
      }else{
        if( action.type == actionTypes.CHANGE ){
          return {touched: false, value: SELECT_DEFAULT_VALUE, visited: false};
        }else{
          return state;
        }
      }
    }
  }
}
/*
 * 产品变动只能将已付款变为部分付款
 */
function getPayStatusByProductChange(state, action){
  var src_id = state.src_id.value;
  var pay_status = state.pay_status.value;
  if(src_id){
    if(isSrc( SRC.group_site, src_id)){ //团购网站
      var { orderManageForm: { products: { confirm_list }}} = getGlobalState();
      //属于团购网站
      if(confirm_list.length > 1 || (confirm_list[0] && confirm_list[0].num > 1)){
        return { value: 'PARTPAYED' }; //部分付款
      }else{
        return { value: 'PAYED' }; //已付款
      }
    }
    return state;
  }
}
