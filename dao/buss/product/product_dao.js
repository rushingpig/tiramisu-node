/**
 * @des    : the data access function for product
 * @author : pigo.can
 * @date   : 15/12/17 上午9:31
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var baseDao = require('../../base_dao'),
    del_flag = baseDao.del_flag,
    tables = require('../../../config').tables,
    dbHelper = require('../../../common/DBHelper'),
    systemUtils = require('../../../common/SystemUtils'),
    config = require('../../../config');
    
const EXPIRE = {
    valid: 1,
    invalid: 0
};

function ProductDao(){
    this.base_table = config.tables.buss_product;
    this.baseColumns = ['id','name'];
    this.base_insert_sql = 'insert into ?? set ?';
    this.base_select_sql = 'select ?? from ?? where 1=1 and del_flag = ? ';
    this.base_update_sql = 'update ?? set ?';
}
//TODO: check sql after table confirmed
/**
 * query for product category list
 */
ProductDao.prototype.findAllCatetories = function(){
    let columns = Array.prototype.slice.apply(this.baseColumns);
    columns.push('parent_id');
    let params = [columns,tables.buss_product_category,del_flag.SHOW];
    return baseDao.select(this.base_select_sql,params);
};
//TODO: check sql after table confirmed
/**
 * query for the product list
 */
ProductDao.prototype.findProductsCount = function(product_name,category_id,regionalism_id){
    let sql = "",params = [];
    sql += "select bp.id,bps.size,bp.name,bpc.name as category_name,bps.regionalism_id ";
    sql += " from ?? bp";
    sql += " inner join ?? bpc on bp.category_id = bpc.id";
    sql += " inner join ?? bps on bp.id = bps.product_id where 1=1";
    params.push(tables.buss_product);
    params.push(tables.buss_product_category);
    params.push(tables.buss_product_sku);
    if(product_name){
        sql += " and bp.name like ?";
        params.push('%'+product_name+'%');
    }
    if(category_id){
        sql += " and bp.category_id = ? ";
        params.push(category_id);
    }
    if(regionalism_id){
        sql += " and bps.regionalism_id = ?";
        params.push(regionalism_id);
    }
    sql += ' group by bp.id,bps.size';
    return baseDao.select(dbHelper.countSql(sql),params).then((results)=>{
            let data = {
                results : results,
                sql : sql,
                params : params
            };
            return data;
        });
};
//TODO: check sql after table confirmed
/**
 * find the product list
 * @param preSql
 * @param preParams
 */
ProductDao.prototype.findProducts = function(preSql,preParams,page_no,page_size){
    let sql = "select t.name,t.category_name,bps2.*,dr.name as regionalism_name from (";
    sql += dbHelper.paginate(preSql,page_no,page_size);
    sql += ")t left join  buss_product_sku bps2 on t.id = bps2.product_id and t.size = bps2.size and t.regionalism_id = bps2.regionalism_id";
    sql += " left join dict_regionalism dr on dr.id = bps2.regionalism_id order by bps2.sort asc";
    return baseDao.select(sql,preParams);
};
//TODO: check sql after table confirmed
/**
 * find the products under the order id
 * @param orderId
 */
ProductDao.prototype.findProductsByOrderId = function(orderId){
    let columns = [
        'bp.name',
        'bp.category_id',
        'bps.size',
        'bos.num',
        'bos.discount_price',
        'bos.amount',
        'bos.choco_board',
        'bos.greeting_card',
        'bos.custom_name',
        'bos.custom_desc',
        'if(bos.atlas=0,\'不需要\',\'需要\') as atlas'
    ].join(','),params = [];
    let sql = "select "+columns+" from ?? bos";
    sql += " left join buss_order bo on bos.order_id = bo.id";
    sql += " left join buss_product_sku bps on bps.id = bos.sku_id";
    sql += " left join buss_product bp on bp.id = bps.product_id";
    sql += " where bos.order_id = ? and bos.del_flag = ?";
    params.push(tables.buss_order_sku,orderId,del_flag.SHOW);
    return baseDao.select(sql,params);
};

ProductDao.prototype.findDeliveryPayRule = function () {
    let sql = `SELECT * FROM ${tables.delivery_pay_rule} WHERE del_flag = ${del_flag.SHOW} `;
    let params = [];
    return baseDao.select(sql, params);
};

ProductDao.prototype.insertProduct = function(req, data, connection){
    if(connection){
        return baseDao.insertWithConnection(connection, this.base_insert_sql, [this.base_table, systemUtils.assembleInsertObj(req, data)]);
    } else {
        return baseDao.insert(this.base_insert_sql, [this.base_table, systemUtils.assembleInsertObj(req, data)]);
    }
};
ProductDao.prototype.insertSku = function (req, data, connection) {
    if(connection){
        return baseDao.insertWithConnection(connection, this.base_insert_sql, [config.tables.buss_product_sku, systemUtils.assembleInsertObj(req, data)]);
    } else {
        return baseDao.insert(this.base_insert_sql, [config.buss_product_sku, systemUtils.assembleInsertObj(req, data)]);
    }
}
ProductDao.prototype.insertProductWithSku = function (req, data) {
    let self = this;
    return baseDao.trans().then(connection => {
        let product_data = {
            category_id: data.category_id,
            name: data.name,
            del_flag: del_flag.SHOW
        };
        return self.insertProduct(req, product_data, connection)
            .then(productId => {
                let promises = data.sku.map(sku => {
                    let sku_data = {
                        product_id: productId,
                        size: sku.size,
                        website: sku.website,
                        original_price: sku.original_price,
                        price: sku.price,
                        regionalism_id: sku.regionalism_id,
                        book_time: sku.book_time,
                        presell_start: sku.presell_start,
                        presell_end: sku.presell_end,
                        send_start: sku.send_start,
                        send_end: sku.send_end,
                        expire_flag: EXPIRE.valid,
                        del_flag: del_flag.SHOW
                    };
                    let promise = self.insertSku(req, sku_data, connection);
                    // 如果是活动sku，需要同时存储关联的非活动sku
                    if(sku.activity_price){
                        promise.then(skuId => {
                            sku_data.ref = skuId;
                            sku_data.activity_price = sku.activity_price;
                            sku_data.activity_start = sku.activity_start;
                            sku_data.activity_end = sku.activity_end;
                            sku_data.expire_flag = EXPIRE.invalid;
                            sku_data.del_flag = del_flag.SHOW;
                            return self.insertSku(req, sku_data, connection);
                        });
                    }
                    return promise;
                });
                return Promise.all(promises);
            }).then(() => {
                return new Promise((resolve, reject) => {
                    connection.commit(err => {
                        connection.release();
                        if (err) return reject(err);
                        resolve();
                    });
                });
            }).catch(err => {
                return new Promise((resolve, reject) => {
                    connection.rollback(rollbackErr => {
                        connection.release();
                        if (rollbackErr) return reject(rollbackErr);
                        reject(err);
                    });
                });
            });
    });
}
ProductDao.prototype.getAllSkuByParams = function(params){
    let sql = 'select ' + params.join(',') + ' from ?? where 1=1';
    return baseDao.select(sql, [config.tables.buss_product_sku]);
};

module.exports = ProductDao;