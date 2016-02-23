import { reset, focus, blur, actionTypes, initialize, destroy } from 'redux-form';
// import * as RF from 'redux-form';
import FormFields from 'config/form.fields';

//可以手动触发redux-form的normalize动作
export function updateAddOrderForm(){
  return focus('add_order', '_update'); //form_name, field_name
}

//手动更改指定form的表单值
export function triggerFormUpdate(form_name, field_name, field_value){
  return blur(form_name, field_name, field_value);
}

export function resetFormUpdate(form_name, field_name, field_value){
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