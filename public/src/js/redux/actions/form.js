import { focus, blur } from 'redux-form';

//可以手动触发redux-form的normalize动作
export function updateAddOrderForm(){
  return focus('add_order', '_update'); //form_name, field_name
}

//手动更改指定form的表单值
export function triggerFormUpdate(form_name, field_name, field_value){
  return blur(form_name, field_name, field_value);
}