/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/17 下午2:55
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var DateUtils = {},
    moment = require('moment');
DateUtils.format = (date,format)=>{
    if(!format){
        return moment().format('YYYY-MM-DD');
    }
    return moment(date).format(format);
};
module.exports = DateUtils;
