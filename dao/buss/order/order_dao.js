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
}
/**
 * 获取所有的订单来源
 */
OrderDao.prototype.findAllOrderSrc = function(){
    let params = [['id','name','parent_id','level'],tables.buss_order_src,del_flag.SHOW];
    return baseDao.select(this.base_select_sql,params);
};
/**
 * 新增订单
 */
OrderDao.prototype.insertOrder = function(orderObj){
    return baseDao.insert(this.base_insert_sql,[tables.buss_order,orderObj]);
};
/**
 * 新增 收/取 货人信息
 */
OrderDao.prototype.insertRecipient = function(recipientObj){
    return baseDao.insert(this.base_insert_sql,[tables.buss_recipient,recipientObj]);
};
/**
 * 获取支付方式
 * @type {OrderDao}
 */
OrderDao.prototype.findAllPayModes = function(){
    let params = [this.baseColumns,tables.buss_pay_modes,del_flag.SHOW];
    return baseDao.select(this.base_select_sql,params);
};
/**
 * 根据行政区域获取分店列表
 * @param regionalismId
 */
OrderDao.prototype.findShopByRegionId = function(districtId){
    let sql = this.base_select_sql + ' and regionalism_id = ?';
    let params = [this.baseColumns,tables.buss_shop,del_flag.SHOW,districtId];
    return baseDao.select(sql,params);
};
module.exports = new OrderDao();