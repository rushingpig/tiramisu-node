/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/17 上午9:31
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var baseDao = require('../../base_dao');
var tables = require('../../../config').tables;
function DeliveryDao(){
    this.baseColumns = ['id','name'];
}
DeliveryDao.prototype.findAllStations = function(){
    let sql = 'select ?? from ?? where 1=1 and del_flag = ?';
    let params = [this.baseColumns,tables.buss_delivery_station,1];
    return baseDao.select(sql,params);
}

module.exports = new DeliveryDao();