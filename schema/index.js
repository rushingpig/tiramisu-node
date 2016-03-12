'use strict';
module.exports = {
  addOrder: require('./buss/order/add_order'),
  addExternalOrder: require('./buss/order/add_external_order'),
  addOrderError: require('./buss/order/add_order_error'),
  editOrderError: require('./buss/order/edit_order_error'),
  addProduct: require('./buss/product/add_product'),
  getOrder: require('./buss/order/get_order'),
  listOrder: require('./buss/order/list_order'),
  editOrder: require('./buss/order/edit_order'),
  exchangeOrder: require('./buss/order/exchange_order'),
  printApply: require('./buss/delivery/print_apply'),
  reprintApplies: require('./buss/delivery/list_reprint_applies'),
  auditApply: require('./buss/delivery/audit_apply'),
  signinOrder: require('./buss/delivery/signin_order'),
  unsigninOrder: require('./buss/delivery/unsignin_order'),
  deliveryman: require('./buss/delivery/deliveryman'),
  allocateStation: require('./buss/order/allocate_station')
};