"use strict";

const config = require('../config');
var mongoose = require('mongoose');
const logger = require('../common/LogHelper').systemLog();

var uri = 'mongodb://cupcake_qa:17F2wDwxI39w@120.76.25.32:27017/cupcake';

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
