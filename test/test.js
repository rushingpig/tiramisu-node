/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/10 下午4:30
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var crypto = require('crypto-js');
var md5 = require('crypto-js/md5');

console.log(crypto.MD5('123',{outputLength:2}).toString());