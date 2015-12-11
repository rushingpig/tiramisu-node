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
var service = require('../../service');
var v = express.Router(config.exp_router_options);
var a = express.Router(config.exp_router_options);

router.use('/v',v);
router.use('/a',a);






router.get('/', function (req, res) {
    res.sendHtml('welcome to v1 api');
});
router.use('/payment', paymentRouter);




module.exports = router;
