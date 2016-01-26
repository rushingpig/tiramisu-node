/**
 * @des    : the router of the v1 version
 * @author : pigo.can
 * @date   : 15/12/3 下午2:05
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";
var express = require('express');
var config = require('../../config');
var router = express.Router(config.exp_router_options);
// service module
var paymentRouter = require('./payment');
var service = require('../../service'),
    addressService = service.address,
    deliveryService = service.delivery,
    orderService = service.order,
    productService = service.product,
    Constant = require('../../common/Constant');

var v = express.Router(config.exp_router_options);
var a = express.Router(config.exp_router_options);

// router for normal http request
router.use('/v',v);
// router for xhr ajax request
router.use('/a',a);


//=====================router for business begin====================

//*********************
//******** GET ********
//*********************
a.get('/provinces',addressService.getProvinces);    // 获取所有省份信息
a.get('/province/:provinceId/cities',addressService.getCities); // 获取指定省份下的所有城市信息
//a.get(/^\/city\/(\d+)\/districts$/,addressService.getDistricts);
a.get('/city/:cityId/districts',addressService.getDistricts);   // 获取指定城市下的所有行政区域信息
a.get('/stations',deliveryService.getDeliveryStationList);  // 获取所有配送站信息
a.get('/order/srcs',orderService.getOrderSrcList);  // 获取所有订单来源信息
a.get('/pay/modes',orderService.getPayModeList);    // 获取所有支付方式信息
a.get('/district/:districtId/shops',orderService.getShopList);  // 获取指定行政区域下的门店信息
a.get('/product/categories',productService.getCategories);  // 获取所有产品分类
a.get('/products',productService.listProducts); // 获取产品列表
a.get('/order/:orderId',orderService.getOrderDetail);   // 获取指定订单号的订单详情
a.get('/orders',orderService.listOrders(Constant.OSR.LIST));    // 获取订单列表
a.get('/order/:orderId/products',productService.listOrderProducts); // 获取指定订单下的产品列表
a.get('/order/:orderId/history',orderService.history);  // 获取指定订单的历史记录

a.get('/orders/exchange',orderService.listOrders(Constant.OSR.DELIVERY_EXCHANGE));  // 订单转送单列表
a.get('/orders/delivery',orderService.listOrders(Constant.OSR.DELIVER_LIST));   // 送货单管理列表
a.get('/orders/signin',orderService.listOrders(Constant.OSR.RECEIVE_LIST));     // 配送单管理列表
a.get('/order/reprint/applies',deliveryService.listReprintApplies); // 获取申请重新打印列表
a.get('/delivery/deliverymans',deliveryService.listDeliverymans);   // 获取配送员列表

a.get('/orders/print',deliveryService.print);   // 打印订单
a.get('/order/:orderId/reprint',deliveryService.reprint);   // 重新打印订单
//**********************
//******** POST ********
//**********************

a.post('/order',orderService.addOrder); // 添加订单

a.post('/order/reprint/apply',deliveryService.applyForRePrint); // 申请重新打印

//*********************
//******** PUT ********
//*********************

a.put('/order/:orderId/validate',deliveryService.validate); // 检验重新打印的验证码
a.put('/order/:orderId',orderService.editOrder(false));     // 保存
a.put('/order/:orderId/submit',orderService.editOrder(true)); // 提交
a.put('/orders/exchange',deliveryService.exchageOrders);    // 转换订单
a.put('/order/reprint/apply/:apply_id',deliveryService.auditReprintApply);  // 审核指定订单的重新打印
a.put('/order/:orderId/signin',deliveryService.signinOrder);    // 签收订单
a.put('/order/:orderId/unsignin',deliveryService.unsigninOrder);    // 未签收订单
a.put('/delivery/deliveryman',deliveryService.allocateDeliveryman); // 分配配送员

//************************
//******** DELETE ********
//************************
a.delete('/order/:orderId',orderService.cancelOrder);   // 取消订单


//=====================router for business end======================




router.get('/', function (req, res) {
    res.sendHtml('welcome to v1 api');
});
router.use('/payment', paymentRouter);




module.exports = router;
