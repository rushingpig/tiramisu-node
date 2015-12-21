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
        if(!Array.isArray(array) || !array || array.length === 0){
            return true;
        }
        return false;
    },
    isEmptyObject : function(object){
        if(!object || this.isEmptyArray(Object.keys(object))){
            return true;
        }
        return false;
    },

};
