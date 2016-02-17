import { reducer as formReducer } from 'redux-form';
// import store from 'stores/configureStore'; //循环引用
import { getGlobalState } from 'stores/getter';

function preCheck(){
  var { pathname } = location;
  return (pathname == '/om/index/add' || pathname == '/om/index/edit') && getGlobalState();
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

export default formReducer.normalize({
  //表单数据再处理，（可以在这里改变form的值）
  add_order: {
    pay_modes_id: (value, preValue, allValues, preAllValues) => {
      if(isSrc('第三方预约', allValues.src_id)){
        return getMode('团购密码').id; //团购密码id（TODO）
      }else if(isSrc('有赞', allValues.src_id)){  
        return getMode('微信').id; //微信支付id
      }else if(isSrc('电话', allValues.src_id)){
        return getMode('货到付款（现金）').id;
      }
    },
    pay_status: (value, preValue, allValues, preAllValues) => {
      if(isSrc('第三方预约', allValues.src_id) || isSrc('有赞', allValues.src_id) || isSrc('幸福商城', allValues.src_id)){
        var { orderManageForm: { products: { confirm_list }}} = getGlobalState();
        //属于第三方预约
        if(confirm_list.length > 1){
          return 'PARTPAYED'; //部分付款（TODO）
        }else{
          return 'PAYED'; //已付款（TODO）
        }
      }else if(isSrc('电话', allValues.src_id)){
        return 'COD'; //货到付款
      }
    },
  }
});