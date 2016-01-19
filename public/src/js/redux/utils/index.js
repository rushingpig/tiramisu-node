import Noty from './_noty';
import React from 'react';

function core_isFunction(arg) {
  return typeof arg === 'function';
}

function core_isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function core_isString(arg) {
  return typeof arg === 'string';
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
function form_isDate(input){
  return /^[0-9]{4}-(((0[13578]|(10|12))-(0[1-9]|[1-2][0-9]|3[0-1]))|(02-(0[1-9]|[1-2][0-9]))|((0[469]|11)-(0[1-9]|[1-2][0-9]|30)))$/.test(input);
}
function form_isTime(input){
  return /^(([0-1]?[0-9])|([2][0-3])):([0-5]?[0-9])(:([0-5]?[0-9]))?$/.test(input);
}
//简单版
function form_isMobile(input){
  return /^\d{11}$/.test(input);
}
/**
*
* 描述：日期格式化
*   date   date   日期
*   format string 格式
*   return string
*
* 例子：
*   dateFormat(new Date(2015,9,27), "yyyy-MM-dd") 返回 "2015-10-27"
*
**/
function dateFormat(date, format = 'yyyy-MM-dd') {
  var o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    "S": date.getMilliseconds()
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return format;
}

// 日期偏移
function getDate(base, offset) {
  var now = arguments.length == 2 ? new Date(base) : new Date(),
    o = parseInt(arguments.length == 2 ? offset : arguments[0]) * 24 * 60 * 60 * 1000 || 0,
    month = now.getMonth() + 1,
    newDate = new Date(new Date(now.getFullYear() + '-' + month + '-' + now.getDate() + ' 00:00:00').getTime() + o);
  return dateFormat(newDate, 'yyyy-MM-dd');
};

/**
 * Applies a function to every key-value pair inside an object.
 *
 * @param {Object} obj The source object.
 * @param {Function} fn The mapper function that receives the value and the key.
 * @returns {Object} A new object that contains the mapped values for the keys.
 */
function mapValues(obj, fn) {
  return Object.keys(obj).reduce((result, key) => {
    result[key] = fn(obj[key], key)
    return result
  }, {})
}
function each(target, cb) {
  if (target && typeof target === 'object') {
    if (core_isArray(target)) {
      //target.forEach(target, cb);
      for (var i = 0, len = target.length; i < len; i++)
        cb(target[i], i);
    } else {
      for (var a in target)
        cb(target[a], a);
    }
  }
}
function map(target, cb) {
  var res = [];
  each(target, function(n, i) {
    res.push(cb(n, i));
  });
  return res;
}


function toFixed(target, digit){
  var t = parseFloat(target);
  digit = typeof digit == 'undefined' ? 2 : digit; //默认2位
  if(isNaN(t)){
    return '';
  }else{
    return Number(t.toFixed(digit));
  }
}

//给类似"{修改} {配送站} 为 {龙华站}"这样的文本 着色
function colour(input){
  input = (input + '').trim().split('\n');
  var results = [];
  input.forEach((_input, j) => {
    var tmp = [];
    _input = _input.match(/[^\{\}]*/g);
    var createSpan = index => <span key={index} className="strong">{_input[index]}</span>;
    for(var i=0,len=_input.length; i<len; i++){
      if(_input[i] == ""){
        if( i + 1 <len && _input[i+1] && _input[i+2] == ""){
          tmp.push(createSpan(i+1));
          i += 2;
        }
      }else{
        tmp.push(_input[i]);
      }
    }
    input.length > 1 && tmp.push(<br key={'br' + j} />);
    results.push(<span key={'record-row' + j} className="nowrap">{tmp}</span>); //不允许换行
  })
  return results;
}

export default {
  core: {
    isArray: core_isArray,
    isObject: core_isObject,
    isString: core_isString,
  },
  form: {
    isNumber: form_isNumber,
    /*严格的表单验证(不会对输入进行trim操作)*/
    isNumberAndLetter: form_isNumberAndLetter,
    isNaN: form_isNaN,
    isPositiveNumber: form_isPositiveNumber, //正数
    isPositiveRightNumber: form_isPositiveRightNumber, //正数, 且最大两位小数，上限30000
    isDate: form_isDate, //yyyy-MM-dd
    isTime: form_isTime, //HH:mm:ss 或 HH:mm
    isMobile: form_isMobile, //简单版
  },
  dateFormat,
  getDate,

  //对象、数组
  mapValues,
  each,
  map,

  toFixed,

  Noty,          //提示信息小窗口：param：（type， text);

  colour,        //
};
