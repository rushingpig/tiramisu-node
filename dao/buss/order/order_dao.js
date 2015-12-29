/**
 * @des    : the data access function for order
 * @author : pigo.can
 * @date   : 15/12/17 上午9:31
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var baseDao = require('../../base_dao'),
    util = require('util'),
    del_flag = baseDao.del_flag,
    tables = require('../../../config').tables;
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
/**
 * new order-sku record
 * @param order_sku_obj
 */
OrderDao.prototype.insertOrderSku = function(order_sku_obj){
    return baseDao.insert(this.base_insert_sql,[tables.buss_order_sku,order_sku_obj]);
};
OrderDao.prototype.batchInsertOrderSku = function(params){
    let sql = "insert into "+tables.buss_order_sku+"(order_id,sku_id,num,choco_board,greeting_card,atlas,custom_name,custom_desc,discount_price) values ?";
    return baseDao.batchInsert(sql,[params]);
};
/**
 * find the order detail info by orderId
 * @param orderId
 */
OrderDao.prototype.findOrderById = function(orderId){
    let columns = ['br.delivery_type',
        'bo.owner_name',
        'bo.owner_mobile',
        'br.`name` as recipient_name',
        'br.mobile as recipient_mobile',
        'br.address as recipient_address',
        'bds.id as delivery_id',
        'bds.name as delivery_name',
        'bpm.id as pay_modes_id',
        'bpm.name as pay_name',
        'bo.pay_status',
        'bo.delivery_time',
        'bo.src_id',
        'bo.remarks',
        'bp.`name` as product_name',
        'bp.original_price',
        'bos.num',
        'bps.size',
        'bps.price',
        'bos.discount_price',
        'bos.choco_board',
        'bos.greeting_card',
        'bos.custom_name',
        'bos.custom_desc'].join(',');
    let sql = "select "+columns+" from ?? bo";
    sql += " left join buss_recipient br on bo.recipient_id = br.id";
    sql += " left join buss_pay_modes bpm on bo.pay_modes_id = bpm.id";
    sql += " left join buss_delivery_station bds on bo.delivery_id = bds.id";
    sql += " left join dict_regionalism dr on br.regionalism_id = dr.id";
    sql += " left join buss_order_sku bos on bo.id = bos.order_id";
    sql += " left join buss_product_sku bps on bos.sku_id = bps.id";
    sql += " left join buss_product bp on bps.product_id = bp.id";
    sql += " where bo.id = ?";
    let params = [tables.buss_order,orderId];
    return baseDao.select(sql,params);
};

OrderDao.prototype.findOrderList = function(){

};


module.exports = new OrderDao();