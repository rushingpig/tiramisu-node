"use strict";

var co = require('co');
const Constant = require('../common/Constant');
const dao = require('../dao');
const productDao = new dao.product();

module.exports.deliveryPay = function (products) {
    return co(function *() {
        let pay = 0;
        let rules = yield productDao.findDeliveryPayRule();
        if (!rules || rules.length == 0) return Promise.reject('found pay calculator rule');
        let rule = {};
        rules.forEach(r=> {
            rule[r.category_id] = r.rule_type;
        });

        let x = 0, y = 0, z = 0, r = 0;
        products.forEach(p=> {
            let num = p.num || 0;
            if (p.product_name.indexOf('步步高升') != -1) {
                pay += 50 * num;
            } else if (p.product_name.indexOf('鹏程万里') != -1) {
                pay += 80 * num;
            } else {
                if (rule[p.category_id] == Constant.PAY_RULE.CAKE) x = x + num;
                if (rule[p.category_id] == Constant.PAY_RULE.COOKIE) y = y + num;
                if (rule[p.category_id] == Constant.PAY_RULE.WINE) z = z + num;
                if (rule[p.category_id] == Constant.PAY_RULE.SOUVENIR) r = r + num;
            }
        });

        if (x == 1 && y == 0) {
            pay += 20;
        } else if (x == 0 && y == 1) {
            pay += 15;
        } else if (x + y >= 6 && x + y <= 10) {
            pay += 50;
        } else if (x + y > 10) {
            pay += 80;
        } else {
            pay += 10 * (x + y);
        }

        pay += 10 * z;

        if (r == 0) {
        } else if (r <= 3) {
            pay += 15;
        } else {
            pay += 15 + ((r - 3) * 3);
        }

        return pay * 100;  // 返回结果单位为分
    });
};

module.exports.totalPrice = function (products) {

};
