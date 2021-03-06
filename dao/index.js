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
    city: require('./sys/city_dao'),
    delivery : require('./buss/delivery/delivery_dao'),
    order : require('./buss/order/order_dao'),
    invoice : require('./buss/order/invoice_dao'),
    refund : require('./buss/order/refund_dao'),
    product : require('./buss/product/product_dao'),
    group : require('./buss/product/group_dao'),
    org : require('./sys/org_dao'),
    role : require('./sys/role_dao'),
    category : require('./buss/product/category_dao'),
    image : require('./buss/image/image_dao'),
    appUser : require('./app/user/app_user_dao'),
    homepage : require('./buss/homepage/homepage_dao')
};
