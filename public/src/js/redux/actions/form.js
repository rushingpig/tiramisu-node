/*
 * 使用前需要 bindActionCreators
 */
import { reset, focus, blur, change, actionTypes, initialize, destroy } from 'redux-form';
import FormFields from 'config/form.fields';

//可以手动触发redux-form的plugin: reducer
export function updateAddOrderForm(){
  return focus('add_order', '_update'); //form_name, field_name
}
//单单通过_update 修改pay_status
export function updateAddOrderFormPayStatus(){
  return blur('add_order', '_update');
}

//手动更改指定form的表单值
export function triggerFormUpdate(form_name, field_name, field_value){
  return change(form_name, field_name, field_value);
}

export function resetFormUpdate(form_name, field_name){
  return reset(form_name, field_name, -1);
}

export function initForm(form_name, data){
  return dispatch => {
    dispatch(destroyForm(form_name));
    dispatch(initialize(form_name, data, FormFields[form_name]));
  }
}

export function destroyForm(form_name){
  return destroy(form_name);
}