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
        return baseDao.insertWithConnection(connection, this.base_insert_sql, [this.base_table, systemUtils.assembleInsertObj(req, data, true)]);
    } else {
        return baseDao.insert(this.base_insert_sql, [this.base_table, systemUtils.assembleInsertObj(req, data, true)]);
    }
};
ProductDao.prototype.insertSku = function (req, data, connection) {
    let self = this;
    let secondary_booktimes = data.secondary_booktimes || [];
    delete data.secondary_booktimes;
    if(connection){
        return baseDao.insertWithConnection(connection, self.base_insert_sql, [config.tables.buss_product_sku, systemUtils.assembleInsertObj(req, data, true)])
            .then(skuId => {
                let promises = secondary_booktimes.map(secondary_booktime => {
                    let book_time_date = {
                        sku_id: skuId,
                        book_time: secondary_booktime.book_time,
                        regionalism_id: secondary_booktime.regionalism_id
                    };
                    return baseDao.insertWithConnection(connection, self.base_insert_sql, [config.tables.buss_product_sku_booktime, book_time_date]);
                });
                return Promise.all(promises).then(() => {
                    return Promise.resolve(skuId);
                });
            });
    } else {
        return baseDao.insert(this.base_insert_sql, [config.buss_product_sku, systemUtils.assembleInsertObj(req, data, true)])
            .then(skuId => {
                let promises = secondary_booktimes.map(secondary_booktime => {
                    let book_time_date = {
                        sku_id: skuId,
                        book_time: secondary_booktime.book_time,
                        regionalism_id: secondary_booktime.regionalism_id
                    };
                    return baseDao.insert(self.base_insert_sql, [config.tables.buss_product_sku_booktime, book_time_date]);
                });
                return Promise.all(promises).then(() => {
                    return Promise.resolve(skuId);
                });
            });
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
                        del_flag: del_flag.SHOW,
                        secondary_booktimes: sku.secondary_booktimes
                    };
                    let promise = self.insertSku(req, sku_data, connection);
                    // 如果是活动sku，需要同时存储关联的非活动sku
                    if(sku.activity_price){
                        promise.then(skuId => {
                            sku_data.ref = skuId;
                            sku_data.activity_price = sku.activity_price;
                            sku_data.activity_start = sku.activity_start;
                            sku_data.activity_end = sku.activity_end;
                            sku_data.expire_flag = EXPIRE.valid;
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
ProductDao.prototype.getProductDetailByParams = function (data) {
    let columns = [
        'product.id as spu',
        'product.name as name',
        'product.detail_page as detail_page',
        'pic.pic_url as pic_url',
        'primary_cate.name as primary_cate_name',
        'secondary_cate.name as secondary_cate_name',
        'city.name as city_name',
        'province.name as province_name',
        //  统计当前条件下是否有商城上线sku
        'count(CASE WHEN website = 1 THEN 1 ELSE NULL END) as isMall',
        'sku.price as price',
        'min(sku.book_time) as book_time',
        'min(sku.created_time) as created_time',
        'min(sku.presell_start) as presell_start',
        'max(sku.presell_end) as presell_end',
        'count(CASE WHEN activity_start is not null THEN 1 ELSE NULL END) as isActivity',
    ];
    let params = [];
    let sql = 'select ' + columns.join(',') + ' from buss_product product ' 
        + ' left join (select product_id,pic_url FROM buss_product_pic group by product_id) pic on product.id = pic.product_id';
    
    sql += ' join buss_product_sku sku on sku.del_flag = 1 and product.id = sku.product_id ';
    // 如果是预售商品，presell_start大于上线时间
    // 如果是预售商品，presell_end小于下线时间
    if (data.presell_start) {
        sql += ' and sku.presell_start > ? or sku.created_time > ? ';
        params.push(data.presell_start);
        params.push(data.presell_start);
    }
    if (data.presell_end) {
        sql += ' and sku.presell_end < ? or sku.presell_end is null ';
        params.push(data.presell_end);
    }
    // 商城是否上线
    if (data.isMall == 1) {
        sql += ' and website = 1 ';
    }
    // 是否促销(活动)
    if (data.isActivity == 1) {
        sql += ' and activity_start is not null ';
    }
    
    // 二级分类
    sql += ' join buss_product_category secondary_cate on secondary_cate.del_flag = 1 and product.category_id = secondary_cate.id ';
    if (data.secondary_cate) {
        sql += ' and secondary_cate.id = ? ';
        params.push(data.secondary_cate);
    }
    
    // 一级分类
    sql += ' join buss_product_category primary_cate on primary_cate.del_flag = 1 and secondary_cate.parent_id = primary_cate.id ';
    if (data.primary_cate) {
        sql += ' and primary_cate.id = ? ';
        params.push(data.primary_cate);
    }
    
    // 城市
    sql += ' join dict_regionalism city on city.del_flag = 1 and sku.regionalism_id = city.id ';
    if (data.city) {
        sql += ' and city.id = ? ';
        params.push(data.city);
    }
    
    // 省份
    sql += ' join dict_regionalism province on province.del_flag = 1 and city.parent_id = province.id';
    if (data.province) {
        sql += ' and province.id = ? ';
        params.push(data.province);
    }
    
    sql += ' where product.del_flag = 1 ';
    // 产品名称
    if (data.name) {
        sql += ' and product.name like \'%' + data.name + '%\'';
    }
    
    // 根据产品、省份、城市分组
    sql += ' group by product.id,city.id';
    
    // 分页
    let pageNo = data.pageno || 0;
    let pageSize = data.pagesize || 10;
    
    let count_sql = dbHelper.countSql(sql);
    return baseDao.select(count_sql, params).then(result => {
        return baseDao.select(dbHelper.paginate(sql, pageNo, pageSize), params).then(_result => {
            return {
                result,
                _result
            };
        });
    });
};
ProductDao.prototype.deleteProductById = function (req, id, connection) {
    let sql = this.base_update_sql + ' where id = ?';
    return baseDao.execWithConnection(connection, sql, [this.base_table, systemUtils.assembleUpdateObj(req, {del_flag: del_flag.HIDE}, true), id]);
}
ProductDao.prototype.deleteSkuByProductId = function (req, id, connection) {
    let sql = this.base_update_sql + ' where product_id = ?';
    return baseDao.execWithConnection(connection, sql, [config.tables.buss_product_sku, systemUtils.assembleUpdateObj(req, {del_flag: del_flag.HIDE}, true), id]);
}
ProductDao.prototype.deleteProductAndSku = function (req, id) {
    let self = this;
    return baseDao.trans().then(connection => {
        return self.deleteProductById(req, id, connection)
            .then(() => {
                return self.deleteSkuByProductId(req, id, connection);
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

module.exports = ProductDao;