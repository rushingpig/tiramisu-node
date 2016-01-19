/**
 * @des    : the tool module for Array | Number | String | Object and so on
 * @author : pigo.can
 * @date   : 15/12/17 上午9:54
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var ToolUtils = {};

ToolUtils.isEmptyArray = function (array) {
    return !Array.isArray(array) || !array || array.length === 0;
};
ToolUtils.isEmptyObject = function (object) {
    return !object || ToolUtils.isEmptyArray(Object.keys(object));
};
ToolUtils.isInt = function (param) {
    return /^[0-9]+$/g.test(param) && Number.isInteger(parseInt(param));
};

ToolUtils.sum = function (arr) {
    if (!ToolUtils.isArray(arr)) {
        return result;
    }
    if (arr.length == 0) {
        return 0;
    }
    let result = arr[0];
    let length = arr.length;
    for (let i = 1; i < length; i++) {
        result += arr[i];
    }
    return result;

};

ToolUtils.avg = function (arr) {
    let result = 0;
    if (!ToolUtils.isArray(arr)) {
        return result;
    }
    let length = arr.length;
    if (length == 0) {
        return result;
    }
    result = ToolUtils.sum(arr) / length;
    return result;
};

ToolUtils.contains = function (arr, x) {

    var result = false;

    if (!ToolUtils.isArray(arr)) {

        return result;

    }

    var length = arr.length;

    if (length == 0) {

        return result;

    }

    for (var i = 0; i < length; i++) {

        if (arr[i] == x) {

            return true;

        }

    }

    return result;

};


ToolUtils.isArray = function (arr) {
    return Array.isArray(arr) && arr != undefined && arr.constructor == Array
};


ToolUtils.length = function (arr) {

    var result = 0;

    if (!ToolUtils.isArray(arr)) {

        return result;

    }

    result = arr.length;

    return result;

};


ToolUtils.hasNext = function (arr) {
    let result = false;
    if (!ToolUtils.isArray(arr)) {
        return result;
    }
    result = arr.length > 0 ? true : false;
    return result;
};


ToolUtils.shuffle = function (arr) {
    if (!ToolUtils.isArray(arr)) {
        return arr;
    }
    let length = arr.length;
    for (var i = 0; i < length; i++) {
        var pos = parseInt(Math.random() * (length - i));
        var save = arr[i];
        arr[i] = arr[pos];
        arr[pos] = save;
    }
    return arr;
};


ToolUtils.unique = function (arr) {
    if (!ToolUtils.isArray(arr)) {
        return arr;
    }
    let u = [];
    var length = arr.length;
    for (var i = 0; i < length; i++) {
        var o = arr[i];
        if (!ToolUtils.contains(u, o)) {
            u.push(o);
        }
    }
    return u;
};


ToolUtils.min = function (arr) {
    var result = 0;
    if (!ToolUtils.isArray(arr)) {
        return result;
    }
    var length = arr.length;
    if (length == 0) {
        return result;
    }
    result = arr[0];
    for (var i = 1; i < length; i++) {
        var o = arr[i];
        if (o < result) {
            result = o;
        }
    }
    return result;
};
ToolUtils.max = function (arr) {
    let result = 0;
    if (!ToolUtils.isArray(arr)) {
        return result;
    }
    let length = arr.length;
    if (length == 0) {
        return result;
    }
    result = arr[0];
    for (let i = 1; i < length; i++) {
        let o = arr[i];
        if (o > result) {
            result = o;
        }
    }
    return result;
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
    }  while (value >>= 6);

    return retValue;
};
module.exports = ToolUtils;