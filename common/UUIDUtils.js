/**
 * @des    : the utils for project
 * @author : pigo.can
 * @date   : 15/12/14 下午4:19
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var uuid = require('uuid');

function UUIDUtils(){

}
/**
 * get an uuid with 32 length based on time
 * @param options
 * @returns {*}
 */
UUIDUtils.uuid = function(options){
    if(options){
        return uuid.v1(options).replace(/-/g,'');
    }
    return uuid.v1().replace(/-/g,'');
};
/**
 * Generate and return a RFC4122 v4 UUID.
 * @param options
 * @returns {*}
 */
UUIDUtils.uuidv4 = function(options){
    if(options){
        return uuid.v4(options).replace(/-/g,'');
    }
    return uuid.v4().replace(/-/g,'');
}
/**
 *  parse UUIDs
 * @param id    (String) UUID(-like) string
 * @param buffer    (Array | Buffer) Array or buffer where UUID bytes are to be written. Default: A new Array or Buffer is used
 * @param offset    (Number) Starting index in buffer at which to begin writing. Default: 0
 */
UUIDUtils.parse = function(id,buffer,offset){
    return uuid.parse(id,buffer,offse);
};
/**
 * unparse UUIDs
 * @param buffer
 * @param offset
 * @returns {*}
 */
UUIDUtils.unparse = function(buffer,offset){
    return uuid.unparse(buffer,offset);
};
module.exports = UUIDUtils;

