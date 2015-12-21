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
    orderService = service.order;

var v = express.Router(config.exp_router_options);
var a = express.Router(config.exp_router_options);

// router for normal http request
router.use('/v',v);
// router for xhr ajax request
router.use('/a',a);


//=====================router for business begin====================
a.get('/provinces',addressService.getProvinces);
a.get('/province/:provinceId/cities',addressService.getCities);
//a.get(/^\/city\/(\d+)\/districts$/,addressService.getDistricts);
a.get('/city/:cityId/districts',addressService.getDistricts);
a.get('/stations',deliveryService.getDeliveryStationList);
a.get('/order/srcs',orderService.getOrderSrcList);
a.post('/order/add',orderService.addOrder);
a.get('/pay/modes',orderService.getPayModeList);
a.get('/district/:districtId/shops',orderService.getShopList);
//=====================router for business end======================




router.get('/', function (req, res) {
    res.sendHtml('welcome to v1 api');
});
router.use('/payment', paymentRouter);




module.exports = router;
