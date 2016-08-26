"use strict";

const config = require('../config');
var mongoose = require('mongoose');
const logger = require('../common/LogHelper').systemLog();

const uri = config.mongodb_uri;

mongoose.connect(uri, function (error) {
    if (error) {
        return logger.error('mongodb error : ', error);
    }
});

var OrderSchema = new mongoose.Schema({
    order_id: Number,
    info: Object
});
var OrderModel = mongoose.model('Order', OrderSchema);

module.exports.insert = function (order_obj) {
    return new Promise((resolve, reject)=> {
        let obj = {
            order_id: order_obj.id,
            info: order_obj
        };
        var m = new OrderModel(obj);
        m.save(function (err) {
            if (err) {
                logger.error(`mongodb insert [${order_obj.id}] error : ${err} `);
                return reject(err);
            }
            resolve();
        });
    });
};
