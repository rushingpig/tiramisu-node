/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/3 下午2:05
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";
var express = require('express');
var router = express.Router({
    caseSensitive:false,
    mergeParams:false,
    strict:false
});


function assembleRouter(){

    router.get('/mt',mt_controller.checkTicket);
    return router;

}


module.exports = assembleRouter();
