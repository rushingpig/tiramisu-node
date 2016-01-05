/**
 * @des    :
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
    productService = service.product;

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
a.get('/provinces',addressService.getProvinces);
a.get('/province/:provinceId/cities',addressService.getCities);
//a.get(/^\/city\/(\d+)\/districts$/,addressService.getDistricts);
a.get('/city/:cityId/districts',addressService.getDistricts);
a.get('/stations',deliveryService.getDeliveryStationList);
a.get('/order/srcs',orderService.getOrderSrcList);
a.get('/pay/modes',orderService.getPayModeList);
a.get('/district/:districtId/shops',orderService.getShopList);
a.get('/product/categories',productService.getCategories);
a.get('/products',productService.listProducts);
a.get('/order/:orderId',orderService.getOrderDetail);
a.get('/orders',orderService.listOrders);
a.get('/order/:orderId/products',productService.listOrderProducts);
//**********************
//******** POST ********
//**********************

a.post('/order',orderService.addOrder);
a.post('/order/print/apply',orderService.applyForRePrint);

//*********************
//******** PUT ********
//*********************

a.put('/order/:orderId',orderService.editOrder(false));     // 保存
a.put('/order/:order/submit',orderService.editOrder(true)); // 提交
a.put('/orders/exchange',orderService.exchageOrders);

//************************
//******** DELETE ********
//************************



//=====================router for business end======================




router.get('/', function (req, res) {
    res.sendHtml('welcome to v1 api');
});
router.use('/payment', paymentRouter);




module.exports = router;
