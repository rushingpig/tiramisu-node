/**
 * @des    : the router of module order
 * @author : pigo
 * @date   : 16/3/24
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
var service = require('../../../../service'),
    orderService = service.order,
    productService = service.product,
    Constant = require('../../../../common/Constant');
module.exports = function (router) {
//*********************
//******** GET ********
//*********************
    router.get('/order/srcs',orderService.getOrderSrcList);  // 获取所有订单来源信息
    router.get('/order/:orderId',orderService.getOrderDetail);   // 获取指定订单号的订单详情
    router.get('/orders',orderService.listOrders(Constant.OSR.LIST));    // 获取订单列表
    router.get('/order/:orderId/products',productService.listOrderProducts); // 获取指定订单下的产品列表
    router.get('/order/:orderId/history',orderService.history);  // 获取指定订单的历史记录
    router.get('/orders/export',orderService.exportExcel);    //导出 订单 && 配送单 到excel文件

    router.get('/error/orders',orderService.listOrderError);    // 错误订单列表
//**********************
//******** POST ********
//**********************
    router.post('/order',orderService.addOrder); // 添加订单
    router.post('/coupon',orderService.validateCoupon);

//*********************
//******** PUT ********
//*********************
    router.put('/order/:orderId',orderService.editOrder(false));     // 保存
    router.put('/order/:orderId/submit',orderService.editOrder(true)); // 提交
    router.put('/order/:orderId/cancel',orderService.cancelOrder);   // 取消订单
    router.put('/order/:orderId/exception',orderService.exceptionOrder);     // 将订单置为异常状态(以是否投入生产作为节点)
    router.put('/order/:orderId/station',orderService.allocateStation);    // 分配配送站
    router.put('/order/:orderId/delivery',orderService.changeDelivery);  // 修改配送站

    router.put('/error/order/:merchantId/:srcId',orderService.dealOrderError);  // 编辑错误订单

//************************
//******** DELETE ********
//************************
};
