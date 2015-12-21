/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/16 下午3:40
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var dateUtils = require('./DateUtils');
module.exports = {
    /**
     * wrap the service promise for catch error
     * @param next
     * @param promise
     */
    wrapService : (next,promise)=> {
        promise.catch((err)=> {
            next(err);
        });
    },
    /**
     * get the order id for display
     * @param id
     * @param date
     */
    getOrderId : (id,date)=>{
        if(!Number.isInteger(id)){
            throw new Error('the id must be an integer...');
        }
        return dateUtils.format(date,'YYYYMMDD') + id.toString();
    },
};
