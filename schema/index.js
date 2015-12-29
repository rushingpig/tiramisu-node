/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/21 下午4:56
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
module.exports = {
    addOrder : require('./buss/order/add_order'),
    addProduct : require('./buss/product/add_product'),
    getOrder : require('./buss/order/get_order'),
    listOrder : require('./buss/order/list_order'),
};