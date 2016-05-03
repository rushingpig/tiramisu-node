"use strict";

var request = require('request');
const config = require('../config');
const logger = require('../common/LogHelper').systemLog();

const TARTETATIN_HOST = config.tartetatin_host;

/**
 * refund api
 * @param amount
 * @param order_no
 * @param charge_id
 */
module.exports.refund = function (amount, order_no, charge_id) {
    let opt = {
        method: 'POST',
        url: `${TARTETATIN_HOST}/v1/refund/other/create`,
        json: true
    };

    opt.body = {
        amount: amount,
        charge_id: charge_id,
        order_no: order_no
    };
    request(opt, (err, res, body)=> {
        if (err || res.statusCode != 200) {
            logger.error(`订单${order_no}退款失败  应退金额:${amount}  原收款单号:${charge_id}`);
            return Promise.reject(`订单${order_no}退款失败  应退金额:${amount}  原收款单号:${charge_id}`);
        }
        Promise.resolve(body);
    });
};
