/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/17 上午9:54
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
module.exports = {
    isEmptyArray : function(array){
        return !Array.isArray(array) || !array || array.length === 0;
    },
    isEmptyObject : function(object){
        return !object || this.isEmptyArray(Object.keys(object));
    },

};
