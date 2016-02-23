import { reducer as formReducer, actionTypes } from 'redux-form';
import * as xxx from 'redux-form';
// import store from 'stores/configureStore'; //循环引用
import { getGlobalStore, getGlobalState } from 'stores/getter';
import { SELECT_DEFAULT_VALUE, pay_status as PAY_STATUS } from 'config/app.config';
import { updateConfirmProductDiscountPrice } from 'actions/order_products';
import { delay, each } from 'utils/index';

import { REDUX_FORM_REINIT } from 'actions/form';
import FormFields from 'config/form.fields';

// setTimeout(() => {
//   console.dir(xxx);
// })

function preCheck(){
  var { pathname } = location;
  return pathname.startsWith('/om/index') && getGlobalState();
}

export function isSrc(name, src_id){
  if(preCheck()){
    var { orderManageForm: { mainForm: { all_order_srcs }}} = getGlobalState();
    //注意all_order_srcs是一个二维数组，第一个是一级，第二个是二维，src_id可能位于一维，也可能在二维
    if(all_order_srcs.length > 1 && src_id){
      var src1 = all_order_srcs[0].filter( n => n.name === name)[0] || {};
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

export default formReducer.plugin({
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
          case actionTypes.BLUR:
          case actionTypes.CHANGE:
          case actionTypes.RESET:
            if(action.field == 'src_id' || action.key == 'src_id'){
              state.pay_modes_id = {...state.pay_modes_id, ...getPayModesId(state, action)};
              state.pay_status = {...state.pay_status, ...getPayStatus(state, action)};
            }
            delay(() => {
              var p = PAY_STATUS[state.pay_status.value];
              if( p == '已付款' || p == '部分付款'){
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
  }
})

function getPayModesId(state, action){
  var src_id = state.src_id.value;
  var pay_modes_id = state.pay_modes_id.value;
  if(src_id){
    if(action.type == actionTypes.RESET){
      return {value: SELECT_DEFAULT_VALUE};
    }else{
      if(isSrc('第三方预约', src_id)){
        return { value: getMode('团购券').id }; //团购券id（TODO）
      }else if(isSrc('有赞', src_id)){  
        return { value: getMode('微信支付').id }; //微信支付id
      }else if(isSrc('电话', src_id)){
        // var mode_cash = getMode('货到付款（现金）');
        // var mode_card = getMode('货到付款（POS）');
        var mode_cash = getMode('现金');
        var mode_card = getMode('现金');
        if(pay_modes_id != mode_cash.id || pay_modes_id != mode_card.id){
          return { value: mode_cash.id };
        }
      }else{
        return {touched: false, value: SELECT_DEFAULT_VALUE, visited: false};
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
      if(isSrc('第三方预约', src_id) || isSrc('有赞', src_id)){
        var { orderManageForm: { products: { confirm_list }}} = getGlobalState();
        //属于第三方预约
        if(confirm_list.length > 1 || (confirm_list[0] && confirm_list[0].num > 1)){
          return { value: 'PARTPAYED' }; //部分付款（TODO）
        }else{
          return { value: 'PAYED' }; //已付款（TODO）
        }
      }else if(isSrc('电话', src_id)){
        return { value: 'COD' }; //货到付款
      }else{
        return {touched: false, value: SELECT_DEFAULT_VALUE, visited: false};
      }
    }
  }
}
/*
export default formReducer.normalize({
  //表单数据再处理，（可以在这里改变form的值）
  add_order: {
    pay_modes_id: (value, preValue, allValues, preAllValues) => {
      var { src_id } = allValues;
      if(src_id){
        if(isSrc('第三方预约', src_id)){
          return getMode('团购券').id; //团购券id（TODO）
        }else if(isSrc('有赞', src_id)){  
          return getMode('微信').id; //微信支付id
        }else if(isSrc('电话', src_id)){
          var mode_cash = getMode('货到付款（现金）');
          var mode_card = getMode('货到付款（POS）');
          if(value == mode_cash.id || value == mode_card.id){
            return value;
          }else{
            if(preValue == mode_cash.id || preValue == mode_card.id){
              return preValue;
            }else{
              return mode_cash.id;
            }
          }
        }else{
          //说明手动更改
          // return allValues.src_id != preAllValues.src_id ? SELECT_DEFAULT_VALUE : value;
          return value;
        }
      }else{
        return value;
      }
    },
    pay_status: (value, preValue, allValues, preAllValues) => {
      var { src_id } = allValues;
      if(src_id){
        if(isSrc('第三方预约', src_id) || isSrc('有赞', src_id)){
          var { orderManageForm: { products: { confirm_list }}} = getGlobalState();
          //属于第三方预约
          if(confirm_list.length > 1 || (confirm_list[0] && confirm_list[0].num > 1)){
            return 'PARTPAYED'; //部分付款（TODO）
          }else{
            return 'PAYED'; //已付款（TODO）
          }
        }else if(isSrc('电话', src_id)){
          return 'COD'; //货到付款
        }else{
          //说明手动更改
          // return allValues.src_id != preAllValues.src_id ? SELECT_DEFAULT_VALUE : value;
          return value;
        }
      }else{
        return value;
      }
    },
  }
});*/