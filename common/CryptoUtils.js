/**
 * @des    : the module for crypto
 * @author : pigo.can
 * @date   : 15/12/14 上午9:24
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";

/**
 crypto-js/core
 crypto-js/x64-core
 crypto-js/lib-typedarrays
 crypto-js/md5
 crypto-js/sha1
 crypto-js/sha256
 crypto-js/sha224
 crypto-js/sha512
 crypto-js/sha384
 crypto-js/sha3
 crypto-js/ripemd160
 crypto-js/hmac-md5
 crypto-js/hmac-sha1
 crypto-js/hmac-sha256
 crypto-js/hmac-sha224
 crypto-js/hmac-sha512
 crypto-js/hmac-sha384
 crypto-js/hmac-sha3
 crypto-js/hmac-ripemd160
 crypto-js/pbkdf2
 crypto-js/aes
 crypto-js/tripledes
 crypto-js/rc4
 crypto-js/rabbit
 crypto-js/rabbit-legacy
 crypto-js/evpkdf
 crypto-js/format-openssl
 crypto-js/format-hex
 crypto-js/enc-latin1
 crypto-js/enc-utf8
 crypto-js/enc-hex
 crypto-js/enc-utf16
 crypto-js/enc-base64
 crypto-js/mode-cfb
 crypto-js/mode-ctr
 crypto-js/mode-ctr-gladman
 crypto-js/mode-ofb
 crypto-js/mode-ecb
 crypto-js/pad-pkcs7
 crypto-js/pad-ansix923
 crypto-js/pad-iso10126
 crypto-js/pad-iso97971
 crypto-js/pad-zeropadding
 crypto-js/pad-nopadding
 * @constructor
 */
function CryptoUtils(){
    this.instance = require('crypto-js');
}
/**
 * MD5加密
 * @param message
 * @param key
 * @returns {*}
 */
CryptoUtils.prototype.md5 = function(message,key){
    return this.instance.MD5(message,key).toString();
};
/**
 * encryt with base64 and encoding utf8
 * @param message
 * @returns {*|string}
 */
CryptoUtils.prototype.base64 = function(message){
    let wordArray = this.instance.enc.Utf8.parse(message);
    return this.instance.enc.Base64.stringify(wordArray);
};
/**
 * decrypt with base64 and encoding utf8
 * @param base64
 * @returns {*|string}
 */
CryptoUtils.prototype.unBase64 = function(base64){
    return this.instance.enc.Base64.parse(base64).toString(this.instance.enc.Utf8);
};
module.exports = new CryptoUtils();

//console.log(new CryptoUtils().md5('123') === '202cb962ac59075b964b07152d234b70');