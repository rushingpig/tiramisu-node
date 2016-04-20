/**
 * @des    :
 * @author : pigo
 * @date   : 16/3/29
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
'use strict';
module.exports = {
    code : {
        notEmpty : true
    },
    description : {
        notEmpty : true
    },
    module_id : {
        isInt : true
    },
    name : {
        notEmpty : true
    },
    type : {
        isIn : {
            options : [['LIST','ELEMENT']]
        }
    }
};
