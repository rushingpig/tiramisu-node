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
var paymentRouter = require('./payment');

router.get('/', function (req, res) {
  res.send('v1 api');
})
router.use('/payment', paymentRouter);

module.exports = router;
