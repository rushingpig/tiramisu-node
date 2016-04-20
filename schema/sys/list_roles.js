/**
 * @des    :
 * @author : pigo
 * @date   : 16/3/29
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
'use strict';
module.exports = {
    org_id : {
        optional : true,
        isInt : true
    },
    role_name : {
        optional : true,
        notEmpty : true
    },
    page_no : {
        optional : true,
        isInt : true
    },
    page_size : {
        optional : true,
        isInt : true
    }
};
