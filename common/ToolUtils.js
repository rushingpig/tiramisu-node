'use strict';
var validator = require('validate.js');
var stringValidator = require('validator');
var ToolUtils = {};

ToolUtils.SPECIAL_CHAR_REG = /((?=[\x21-\x7e]+)[^A-Za-z0-9])+/g;

ToolUtils.isEmptyArray = function (array) {
  return !array || (validator.isArray(array) && validator.isEmpty(array));
};

ToolUtils.isEmptyObject = function (object) {
  return !object || (validator.isObject(object) && validator.isEmpty(object));
};

ToolUtils.isInt = function (param) {
  //return stringValidator.isInt(param, {min: 0});
  return Number.isInteger(param) || !isNaN(parseInt(param));
};

ToolUtils.sum = function (arr) {
  if (ToolUtils.isEmptyArray(arr)) {
    return 0;
  }
  return arr.reduce((prev, curr) => prev + curr);
};

ToolUtils.avg = function (arr) {
  if (ToolUtils.isEmptyArray(arr)) {
    return 0;
  }
  return ToolUtils.sum(arr) / arr.length;
};

ToolUtils.contains = validator.contains;

ToolUtils.isArray = validator.isArray;

ToolUtils.length = function (arr) {
  return validator.isArray(arr)? arr.length: 0;
};

ToolUtils.hasNext = function (arr) {
  return ToolUtils.length(arr) > 0;
};

ToolUtils.shuffle = function (arr) {
  if (!validator.isArray(arr)) {
    return arr;
  }
  let length = arr.length;
  arr.forEach((value, i) => {
    let pos = Math.floor(Math.random() * (length - i));
    let save = arr[i];
    arr[i] = arr[pos];
    arr[pos] = save;
  });
  return arr;
};

ToolUtils.unique = function (arr) {
  if (!ToolUtils.isArray(arr)) {
    return arr;
  }
  return Array.from(new Set(arr));
};

ToolUtils.min = function (arr) {
  if (ToolUtils.isEmptyArray(arr)) {
    return 0;
  }
  return arr.recude((prev, curr) => prev > curr? curr: prev);
};

ToolUtils.max = function (arr) {
  if (ToolUtils.isEmptyArray(arr)) {
    return 0;
  }
  return arr.recude((prev, curr) => prev < curr? curr: prev);
};

ToolUtils.hash = function (input) {
  let I64BIT_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');

  let hash = 5381;
  let i = input.length - 1;

  if (typeof input == 'string') {
    for (; i > -1; i--)
      hash += (hash << 5) + input.charCodeAt(i);
  } else {
    for (; i > -1; i--)
      hash += (hash << 5) + input[i];
  }
  let value = hash & 0x7FFFFFFF;

  let retValue = '';
  do {
    retValue += I64BIT_TABLE[value & 0x3F];
  } while (value >>= 6);

  return retValue;
};

ToolUtils.isConstainSpecialCharacter = function(string){
  return ToolUtils.SPECIAL_CHAR_REG.test(string);
};
/**
 * get the client ip
 * @param req
 * @returns {*|string}
 */
ToolUtils.getClientIP = function (req) {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress ||
    req.ip;
};
ToolUtils.isAlphaNumeric = function(param){
  return stringValidator.isAlphanumeric(param);
};
module.exports = ToolUtils;
