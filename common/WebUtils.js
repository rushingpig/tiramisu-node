/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/3 下午2:32
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";
var ServerResponse = require('http').ServerResponse;
function WebUtils(){

}

WebUtils.cakeRes = function cakeRes(res,code,msg){
    let data = {};
    if(!res || !(res instanceof ServerResponse)){
        throw  new Error("the first param must be an instance of ServerResponse...");
    }
    data.code = code || 200;
    data.msg = msg || '';
    res.json(data);
    return;
};

module .exports = WebUtils;