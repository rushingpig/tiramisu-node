/**
 * @des    : the data access function for order
 * @author : pigo.can
 * @date   : 15/12/17 上午9:31
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var baseDao = require('../../base_dao');
var tables = require('../../../config').tables;
function OrderDao(){
    this.baseColumns = ['id','name'];
}
OrderDao.prototype.findAllOrderSrc = function(){
    let sql = 'select ?? from ?? where 1=1 and del_flag = ?';
    let params = [this.baseColumns,tables.buss_order_src,1];
    return baseDao.select(sql,params);
}

module.exports = new OrderDao();