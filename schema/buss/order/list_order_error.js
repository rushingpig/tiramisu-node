/**
 * @des    :
 * @author : pigo
 * @date   : 16/4/21 下午3:38
 * @email  : zhenglin.zhu@xfxb.net
 */
'use strict';
var constant = require('../../../common/Constant');
module.exports = {
    begin_time : {
        optional : true,
        isDate : true
    },
    end_time : {
        optional : true,
        isDate : true
    },
    is_deal : {
        optional : true,
        isInt : true
    },
    merchant_id : {
        optional : true,
        notEmpty : true
    },
    src_id : {
        optional : true,
        isInt : true
    },
    type : {
        optional : true,
        isIn: {
            options: [Object.keys(constant.BUSS_ORDER_ERROR.TYPE)]
        }
    }
};
