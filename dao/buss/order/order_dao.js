/**
 * @des    : the data access function for order
 * @author : pigo.can
 * @date   : 15/12/17 上午9:31
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var baseDao = require('../../base_dao'),
    del_flag = baseDao.del_flag;
var tables = require('../../../config').tables;
function OrderDao(){
    this.baseColumns = ['id','name'];
    this.base_insert_sql = 'insert into ?? set ?';
    this.base_select_sql = 'select ?? from ?? where 1=1 and del_flag = ? ';
    this.base_update_sql = 'update ?? set ?';
}
/**
 * get the order sources
 */
OrderDao.prototype.findAllOrderSrc = function(){
    let params = [['id','name','parent_id','level'],tables.buss_order_src,del_flag.SHOW];
    return baseDao.select(this.base_select_sql,params);
};
/**
 * new order
 */
OrderDao.prototype.insertOrder = function(orderObj){
    return baseDao.insert(this.base_insert_sql,[tables.buss_order,orderObj]);
};
/**
 * new recipient record
 */
OrderDao.prototype.insertRecipient = function(recipientObj){
    return baseDao.insert(this.base_insert_sql,[tables.buss_recipient,recipientObj]);
};
/**
 * get the pay modes
 * @type {OrderDao}
 */
OrderDao.prototype.findAllPayModes = function(){
    let params = [this.baseColumns,tables.buss_pay_modes,del_flag.SHOW];
    return baseDao.select(this.base_select_sql,params);
};
/**
 * get the shops by regionalismId
 * @param regionalismId
 */
OrderDao.prototype.findShopByRegionId = function(districtId){
    let sql = this.base_select_sql + ' and regionalism_id = ?';
    let params = [this.baseColumns,tables.buss_shop,del_flag.SHOW,districtId];
    return baseDao.select(sql,params);
};
/**
 * update the order info
 * @param orderObj
 */
OrderDao.prototype.updateOrder = function(orderObj){
    return baseDao.update(this.base_update_sql,[tables.buss_order,orderObj]);
};



module.exports = new OrderDao();