"use strict";

const config = require('../config');
var request = require('request');
const logger = require('../common/LogHelper').systemLog();

const sms_host = config.backup_host;

module.exports.url_post = function (order_id, not_return) {
    return new Promise((resolve, reject)=> {
        request.post({
            url: sms_host + `/v1/i/order/${order_id}/backup`
        }, (err, res)=> {
            if (err || res.statusCode !== 200) {
                logger.error(`备份订单${order_id}失败`);
            }
            if (not_return) return;
            if (err) {
                reject(err || res.statusCode);
            } else {
                resolve();
            }
        });
    });
};
