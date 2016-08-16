/**
 * 公共的action
 */

export const FORM_CHANGE = 'FORM_CHANGE_';
/**
 * 输入框的onchange事件
 * @param  {string} name 输入框的名字: reducer依据name，进行区分
 */
export function onFormChange(name, e){
  return {
    type: FORM_CHANGE + name,
    value: e.target.value
  }
}