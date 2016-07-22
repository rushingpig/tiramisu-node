"use strict";

const config = require('../config');
var request = require('request');

const sms_host = config.sms_host;

module.exports.send = function (body) {
    return new Promise((resolve, reject)=> {
        request.post({
            url: sms_host,
            body: body,
            json: true
        }, (err, res)=> {
            if (err || res.statusCode !== 200) {
                return reject(err || res.statusCode);
            }
            resolve();
        });
    });
};
