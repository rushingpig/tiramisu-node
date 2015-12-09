function core_isFunction(arg) {
  return typeof arg === 'function';
}

function core_isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function core_isArray(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}

function core_isUndefined(arg) {
  return arg === void 0;
}

function core_isNull(arg){
  return typeof arg === 'object' && arg == null;
}

function clone(target){
  if(target && typeof target === 'object'){
    var newObj = target instanceof Array ? [] : {};
    for(var key in target){
      var val = target[key];
      newObj[key] = arguments.callee(val);
    }
    return newObj;
  }else{
    return target;
  }
}

function form_isNumber(input) { /**** 方法form_isNaN, form_isPositiveNumber 均依赖于本方法，改动需谨慎 **/
  return /^[+-]?((\d+.\d+)|(\d+))$/.test(input + '');
}

function form_isNumberAndLetter(input) {
  if (input === '') {
      return false;
  }
  return (input + '').replace(/[0-9a-zA-Z]*/, '').length === 0;
}

/**
 * isNaN: 原生isNaN的改进版, 判断输入是否为数字
 */
function form_isNaN(input) {
  return !form_isNumber(input);
}

function form_isPositiveNumber(input) {
  return form_isNumber(input) && parseFloat(input) > 0;
}
//正数 且 最大两位小数点，上限 30000
function form_isPositiveRightNumber(input) {
  return /^[+]?((\d+.(\d){1,2})|(\d)+)$/.test(input + '') && parseFloat(input) <= 30000 && parseFloat(input) > 0;
}

export default {
  core: {
    isArray: core_isArray,
  },
  form: {
    isNumber: form_isNumber,
    /*严格的表单验证(不会对输入进行trim操作)*/
    isNumberAndLetter: form_isNumberAndLetter,
    isNaN: form_isNaN,
    isPositiveNumber: form_isPositiveNumber, //正数
    isPositiveRightNumber: form_isPositiveRightNumber, //正数, 且最大两位小数，上限30000
  }
};
