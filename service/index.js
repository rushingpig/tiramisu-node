/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/9 下午3:20
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";

const service = {
    user : require('./sys/user_service'),
    address : require('./sys/address_service'),
    delivery : require('./buss/delivery/delivery_service'),
    order : require('./buss/order/order_service'),
};

module.exports = service;


