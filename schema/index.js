'use strict';
module.exports = {
  addOrderSrc: require('./buss/order/add_order_src'),
  editOrderSrc: require('./buss/order/edit_order_src'),
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
  getDeliveryRecord: require('./buss/delivery/get_delivery_record'),
  allocateStation: require('./buss/order/allocate_station'),
  addUser : require('./sys/add_user'),
  editUser : require('./sys/edit_user'),
  listUsers : require('./sys/list_users'),
  addRole : require('./sys/add_role'),
  listRoles : require('./sys/list_roles'),
  editRole : require('./sys/edit_role'),
  addMenu : require('./sys/add_menu'),
  editMenu : require('./sys/edit_menu'),
  listOrderError : require('./buss/order/list_order_error'),
  changePwd : require('./sys/change_pwd'),
  addPrimaryCategory: require('./buss/product/add_primary_category'),
  addSecondaryCategory: require('./buss/product/add_secondary_category'),
  listCategory: require('./buss/product/list_category'),
  addProductSku: require('./buss/product/add_product_sku'),
  addCity: require('./sys/add_city'),
  addImage: require('./buss/image/add_image'),
  addDir: require('./buss/image/add_dir'),
  deleteDir: require('./buss/image/delete_dir'),
  moveDir: require('./buss/image/move_dir'),
  renameDir: require('./buss/image/rename_dir')
};