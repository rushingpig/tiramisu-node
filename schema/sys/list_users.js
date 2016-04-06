/**
 * @des    :
 * @author : pigo
 * @date   : 16/3/28
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
'use strict';
module.exports = {
    org_id : {
        optional : true,
        isInt : true
    },
    page_no : {
        isInt : true
    },
    page_size : {
        isInt : true
    },
    uname_or_name : {
        optional : true,
        notEmpty : true
    }
};
