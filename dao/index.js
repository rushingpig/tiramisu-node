/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/9 下午3:47
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
module.exports = {
    menu : require('./sys/menu_dao'),
    user : require('./sys/user_dao'),
    address : require('./sys/address_dao'),
    delivery : require('./buss/delivery/delivery_dao'),
    order : require('./buss/order/order_dao'),
    product : require('./buss/product/product_dao'),
};
