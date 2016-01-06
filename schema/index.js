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
    editOrder : require('./buss/order/edit_order'),
    exchangeOrder : require('./buss/order/exchange_order'),
    printApply : require('./buss/delivery/print_apply'),
    reprintApplies : require('./buss/delivery/list_reprint_applies'),
    auditApply : require('./buss/delivery/audit_apply'),
    signinOrder : require('./buss/delivery/signin_order'),
    unsigninOrder : require('./buss/delivery/unsignin_order'),
};