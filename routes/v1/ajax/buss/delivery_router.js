/**
 * @des    : the router for module delivery
 * @author : pigo
 * @date   : 16/3/24
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
var service = require('../../../../service'),
    deliveryService = service.delivery,
    orderService = service.order,
    Constant = require('../../../../common/Constant');
module.exports = function (router) {
//*********************
//******** GET ********
//*********************
    router.get('/orders/exchange',orderService.listOrders(Constant.OSR.DELIVERY_EXCHANGE));  // 订单转送单列表
    router.get('/orders/delivery',orderService.listOrders(Constant.OSR.DELIVER_LIST));   // 送货单管理列表
    router.get('/orders/signin',orderService.listOrders(Constant.OSR.RECEIVE_LIST));     // 配送单管理列表
    router.get('/order/reprint/applies',deliveryService.listReprintApplies); // 获取申请重新打印列表
    router.get('/delivery/deliverymans',deliveryService.listDeliverymans);   // 获取配送员列表
    router.get('/order/:orderId/deliverymans',deliveryService.listDeliverymansByOrder);   // 获取订单所在配送站的配送员列表
    router.get('/orders/print',deliveryService.print);   // 打印订单
    router.get('/order/:orderId/reprint',deliveryService.reprint);   // 重新打印订单
//**********************
//******** POST ********
//**********************
    router.post('/orders/delivery',orderService.listOrders(Constant.OSR.DELIVER_LIST,true)); // 批量扫描获取送货单列表
    router.post('/orders/signin',orderService.listOrders(Constant.OSR.RECEIVE_LIST,true));   // 批量扫面获取配送单列表
    router.post('/order/reprint/apply',deliveryService.applyForRePrint); // 申请重新打印

//*********************
//******** PUT ********
//*********************
    router.put('/order/:orderId/validate',deliveryService.validate); // 检验重新打印的验证码
    router.put('/orders/exchange',deliveryService.exchageOrders);    // 转换订单
    router.put('/order/reprint/apply/:apply_id',deliveryService.auditReprintApply);  // 审核指定订单的重新打印
    router.put('/order/:orderId/signin',deliveryService.signinOrder);    // 签收订单
    router.put('/order/:orderId/unsignin',deliveryService.unsigninOrder);    // 未签收订单
    router.put('/delivery/deliveryman',deliveryService.allocateDeliveryman); // 分配配送员

//************************
//******** DELETE ********
//************************
};
