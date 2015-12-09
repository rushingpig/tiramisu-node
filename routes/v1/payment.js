/**
 * @des    :
 * @author : Deo Leung
 * @email  : zhanzhao.liang@xfxb.net
 */
'use strict';
var express = require('express');
var config = require('../../config');
var router = express.Router(config.exp_router_options);
var util = require('../../util/util');
var pingpp = require('pingpp')(config.ping_xx.apiKey);

function postPayment(req, res) {
  // TODO: Check order_no exists
  console.log(util.getClientIP(req));
  pingpp.charges.create({
      // TODO: Get order description from order_no
      subject: "something",
      // TODO: Get order detail body from order_no
      body: "Your Body",
      // TODO: Get how much to pay from order_no
      amount: 100,
      order_no: req.body.order_no,
      channel: req.body.channel,
      currency: 'cny',
      client_ip: util.getClientIP(req),
      // TODO: prepare proper app id for different channels.
       app: {id: "app_1Gqj58ynP0mHeX1q"}
    },
    function(err, charge) {
      if (err) {
        // TODO: log the error and give general error message respond
        res.status(500).send(err.message);
      } else {
        res.send(charge);
      }
  });
};

router
  .route('/')
  .post(
    util.checkMissingBodyProperties(['order_no', 'channel']),
    postPayment)

module.exports = router;
