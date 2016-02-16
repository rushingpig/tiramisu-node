import { focus } from 'redux-form';

//模拟form：add_order 更新
export function updateAddOrderForm(){
  return focus('add_order', '_update'); //form_name, field_name
}
