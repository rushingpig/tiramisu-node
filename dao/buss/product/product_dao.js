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

var co = require('co');
const DEFAULT_TEMPLATE = 1;

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
    let columns = [
        'distinct primary_cate.id as id',
        'primary_cate.name as name',
        'primary_cate.parent_id as parent_id'
    ];
    let sql = 'select ' + columns.join(',') + ' from ?? primary_cate join ?? secondary_cate on (primary_cate.id = secondary_cate.parent_id and primary_cate.del_flag = ? and secondary_cate.del_flag = ?) or (primary_cate.parent_id <> 0 and primary_cate.del_flag = ?)';
    let params = [tables.buss_product_category,tables.buss_product_category,del_flag.SHOW,del_flag.SHOW,del_flag.SHOW];
    return baseDao.select(sql, params);
};
ProductDao.prototype.findAllCatetoriesIncludeSingle = function(){
    let columns = Array.prototype.slice.apply(this.baseColumns);
    columns.push('parent_id');
    let params = [columns,tables.buss_product_category,del_flag.SHOW];
    return baseDao.select(this.base_select_sql,params);
}
//TODO: check sql after table confirmed
/**
 * query for the product list
 */
ProductDao.prototype.findProductsCount = function(product_name,category_id,regionalism_id, isAddition, is_standard_area){
    let sql = "",params = [];
    sql += "select bp.id,bps.size as size,bp.name,count(bps.id) as num,bpc.name as category_name,bpc.isAddition";
    sql += " from ?? bp";
    sql += " inner join ?? bpc on bp.category_id = bpc.id";
    sql += " inner join ?? bps on bp.id = bps.product_id and bps.del_flag = 1";
    sql += " inner join ?? dict on bps.regionalism_id = dict.id and dict.del_flag = 1";
    sql += " where 1 = 1 ";
    params.push(tables.buss_product);
    params.push(tables.buss_product_category);
    params.push(tables.buss_product_sku);
    params.push(tables.dict_regionalism);
    if (regionalism_id) {
        if (is_standard_area) {
            sql += " and (dict.level_type = 3 and dict.parent_id = ?) or (dict.level_type = 2 and dict.id = ?)";
            params.push(regionalism_id);
            params.push(regionalism_id);
        } else {
            sql += " and dict.id = ?";
            params.push(regionalism_id);
        }
    }
    if(product_name){
        sql += " and bp.name like ?";
        params.push('%'+product_name+'%');
    }
    if(category_id){
        sql += " and (bpc.id = ? or bpc.parent_id = ?) ";
        params.push(category_id);
        params.push(category_id);
    }
    if(isAddition){
        sql += " and bpc.isAddition = ?";
        params.push(isAddition);
    }
    sql += ' group by bp.id,bps.size having num > 0 ';
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
ProductDao.prototype.findProducts = function(preSql, preParams, page_no, page_size, regionalism_id, is_standard_area){
    let params = [];
    let sql = "select t.name,t.category_name,bps2.*,dr.name as regionalism_name from (";
    sql += dbHelper.paginate(preSql,page_no,page_size);
    sql += ")t left join  buss_product_sku bps2 on t.id = bps2.product_id and t.size = bps2.size and bps2.del_flag = 1 ";
    sql += " left join dict_regionalism dr on dr.id = bps2.regionalism_id ";
    sql += " where 1 = 1 ";
    if (regionalism_id) {
        if (is_standard_area) {
            sql += " and (dr.level_type = 3 and dr.parent_id = ?) or (dr.level_type = 2 and dr.id = ?)";
            params.push(regionalism_id);
            params.push(regionalism_id);
        } else {
            sql += " and dr.id = ?";
            params.push(regionalism_id);
        }
    }
    sql += " order by bps2.sort asc";
    return baseDao.select(sql,preParams.concat(params));
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
        'bos.sku',
        'bos.spu',
        'if(bos.atlas=0,\'不需要\',\'需要\') as atlas'
    ].join(','),params = [];
    let sql = "select "+columns+" from ?? bos";
    sql += " left join buss_order bo on bos.order_id = bo.id";
    sql += " left join buss_product_sku bps on bps.id = bos.sku_id";
    sql += " left join buss_product bp on bp.id = bps.product_id";
    sql += " where bos.order_id = ? and bos.del_flag = ?";
    params.push(tables.buss_order_sku,orderId,del_flag.SHOW);
    return co(function* () {
        let result = yield baseDao.select(sql, params);
        result.forEach(curr=> {
            if(curr.sku && curr.spu && curr.spc){
                try{
                    curr.sku = JSON.parse(curr.sku);
                    curr.spu = JSON.parse(curr.spu);
                    curr.name = curr.sku.display_name || curr.spu.name;
                    curr.category_id = curr.spu.category_id;
                    curr.size = curr.sku.size;
                    delete curr.sku;
                    delete curr.spu;
                }catch (err){

                }
            }
        });
        return result;
    });
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
                        activity_price: sku.activity_price,
                        activity_start: sku.activity_start,
                        activity_end: sku.activity_end,
                        del_flag: del_flag.SHOW,
                        secondary_booktimes: sku.secondary_booktimes
                    };
                    return self.insertSku(req, sku_data, connection);
                });
                return Promise.all(promises)
                    .then(() => {
                        return Promise.resolve(productId);
                    });
            }).then(productId => {
                return new Promise((resolve, reject) => {
                    connection.commit(err => {
                        connection.release();
                        if (err) return reject(err);
                        resolve(productId);
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
ProductDao.prototype.getProductDetailByParams = function (req, data) {
    let columns = [
        'product.id as spu',
        'product.name as name',
        'pic.pic_url as pic_url',
        'primary_cate.name as primary_cate_name',
        'secondary_cate.name as secondary_cate_name',
        'city.name as city_name',
        'city.id as city_id',
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
        sql += ' and (sku.presell_start > ? or (sku.created_time > ? and sku.presell_start is null)) ';
        params.push(data.presell_start);
        params.push(data.presell_start);
    }
    if (data.presell_end) {
        sql += ' and (sku.presell_end < ? or sku.presell_end is null) ';
        params.push(data.presell_end);
    }
    // 商城是否上线
    if (data.isMall == 1) {
        sql += ' and sku.website = 1 ';
    }
    // 是否促销(活动)
    if (data.isActivity == 1) {
        if (data.presell_start) {
            sql += ' and sku.activity_start > ? ';
            params.push(data.presell_start);
        }
        if (data.presell_end) {
            sql += ' and sku.activity_end < ? ';
            params.push(data.presell_end);
        }
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
    // 权限控制：限制查询用户所属区域产品
    if (!req.session.user.is_headquarters) {
        sql += ' and city.id in ' + dbHelper.genInSql(req.session.user.city_ids);
    }
    if (data.city) {
        sql += ' and city.id = ? ';
        params.push(data.city);
    }
    
    // 省份
    sql += ' join dict_regionalism province on province.del_flag = 1 and city.parent_id = province.id';
    if (data.province) {
        sql += ' and ((city.level_type = 2 and province.id = ?) or (city.level_type = 3 and province.parent_id = ?))';
        params.push(data.province);
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
ProductDao.prototype.deleteSku = function (req, data, connection) {
    let sql = this.base_update_sql + ' where product_id = ? and regionalism_id = ? ';
    return baseDao.execWithConnection(connection, sql, [config.tables.buss_product_sku, systemUtils.assembleUpdateObj(req, {del_flag: del_flag.HIDE}, true), data.product_id, data.regionalism_id]);
}
ProductDao.prototype.batchDeleteSku = function (req, skus) {
    let self = this;
    return baseDao.trans().then(connection => {
        let promises = skus.map(sku => {
            let data = {
                product_id: sku.spu,
                regionalism_id: sku.city
            };
            return self.deleteSku(req, data, connection);
        });
        Promise.all(promises)
            .then(() => {
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
ProductDao.prototype.getProductAndCategoryById = function (productId) {
    let columns = [
        'product.id as id',
        'product.name as product_name',
        'primary_cate.id as primary_cate_id',
        'primary_cate.name as primary_cate_name',
        'secondary_cate.id as secondary_cate_id',
        'secondary_cate.name as secondary_cate_name'
    ];
    let sql = 'select ' + columns.join(',') + ' from ?? product left join ?? secondary_cate on product.category_id = secondary_cate.id left join ?? primary_cate on secondary_cate.parent_id = primary_cate.id where product.id = ? and product.del_flag = 1';
    let params = [];
    params.push(config.tables.buss_product);
    params.push(config.tables.buss_product_category);
    params.push(config.tables.buss_product_category);
    params.push(productId);
    return baseDao.select(sql, params);
}
ProductDao.prototype.getSkuWithBooktimeByProductAndCity = function (data) {
    let columns = [
        'sku.id as id',
        'sku.size as size',
        'sku.website as website',
        'sku.original_price as original_price',
        'sku.price as price',
        'sku.book_time as book_time',
        'secondary_booktime.book_time as secondary_book_time',
        'secondary_dict.name as secondary_book_time_region',
        'dict_city.id as city_id',
        'dict_city.name as city_name',
        'case dict_city.level_type when 3 then dict_province.parent_id when 2 then dict_province.id end as province_id',
        'sku.presell_start as presell_start',
        'sku.presell_end as presell_end',
        'sku.activity_price as activity_price',
        'sku.activity_start as activity_start',
        'sku.activity_end as activity_end'
    ];
    let sql = 'select ' + columns.join(',') + ' from ?? sku left join ?? secondary_booktime on sku.id = secondary_booktime.sku_id and secondary_booktime.del_flag = 1 ' + 
        'join ?? dict_city on sku.regionalism_id = dict_city.id and dict_city.del_flag = 1 join ?? dict_province on dict_city.parent_id = dict_province.id and dict_province.del_flag = 1 ' + 
        'left join ?? secondary_dict on secondary_booktime.regionalism_id = secondary_dict.id ' + 
        'where sku.product_id = ? and sku.regionalism_id = ? and sku.del_flag = 1';
    let params = [];
    params.push(config.tables.buss_product_sku);
    params.push(config.tables.buss_product_sku_booktime);
    params.push(config.tables.dict_regionalism);
    params.push(config.tables.dict_regionalism);
    params.push(config.tables.dict_regionalism);
    params.push(data.productId);
    params.push(data.cityId);
    return baseDao.select(sql, params);
}
ProductDao.prototype.getSkuByProductAndCity = function (data) {
    let columns = [
        'sku.id as id',
        'sku.website as website',
        'sku.size as size',
        'sku.original_price as original_price',
        'sku.price as price',
        'dict_city.id as city_id',
        'dict_city.name as city_name',
        'case dict_city.level_type when 3 then dict_province.parent_id when 2 then dict_province.id end as province_id'
    ];
    let sql = 'select ' + columns.join(',') + ' from ?? sku join ?? dict_city on sku.regionalism_id = dict_city.id and dict_city.del_flag = 1 ' +
        ' join ?? dict_province on dict_city.parent_id = dict_province.id and dict_province.del_flag = 1 ' +
        ' where sku.product_id = ? and sku.regionalism_id = ? and sku.del_flag = 1';
    let params = [];
    params.push(config.tables.buss_product_sku);
    params.push(config.tables.dict_regionalism);
    params.push(config.tables.dict_regionalism);
    params.push(data.productId);
    params.push(data.cityId);
    // 分页
    let pageNo = data.pageno || 0;
    let pageSize = data.pagesize || 10;
    let count_sql = dbHelper.countSql(sql);
    let page_sql = dbHelper.paginate(sql, pageNo, pageSize);
    return baseDao.select(count_sql, params).then(count_result => {
        return baseDao.select(page_sql, params).then(page_result => {
            return {
                count_result,
                page_result
            };
        });
    });
}
ProductDao.prototype.getSkuByProductWithRegion = function (productId) {
    let columns = [
        'sku.id as id',
        'sku.size as size',
        'sku.website as website',
        'sku.regionalism_id as regionalism_id',
        'sku.original_price as original_price',
        'sku.price as price',
        'sku.book_time as book_time',
        'secondary_booktime.book_time as secondary_book_time',
        'dict.name as secondary_book_time_region_name',
        'dict.id as secondary_book_time_region_id',
        'sku.presell_start as presell_start',
        'sku.presell_end as presell_end',
        'sku.send_start as send_start',
        'sku.send_end as send_end',
        'sku.activity_price as activity_price',
        'sku.activity_start as activity_start',
        'sku.activity_end as activity_end'
    ];
    let sql = 'select ' + columns.join(',') + ' from ?? sku left join ?? secondary_booktime on sku.id = secondary_booktime.sku_id and secondary_booktime.del_flag = 1 left join ?? dict on secondary_booktime.regionalism_id = dict.id where sku.product_id = ? and sku.del_flag = 1';
    let params = [];
    params.push(config.tables.buss_product_sku);
    params.push(config.tables.buss_product_sku_booktime);
    params.push(config.tables.dict_regionalism);
    params.push(productId);
    return baseDao.select(sql, params);
}
ProductDao.prototype.insertSecondaryBookTime = function (req, data, connection) {
    return baseDao.execWithConnection(connection, this.base_insert_sql, [config.tables.buss_product_sku_booktime, systemUtils.assembleInsertObj(req, data, true)]);
}
ProductDao.prototype.updateProductById = function (req, data, id, connection) {
    let sql = this.base_update_sql + ' where id = ?';
    return baseDao.execWithConnection(connection, sql, [this.base_table, systemUtils.assembleUpdateObj(req, data, true), id]);
}
ProductDao.prototype.updateSkuById = function (req, data, id, connection) {
    let sql = this.base_update_sql + ' where id = ?';
    return baseDao.execWithConnection(connection, sql, [config.tables.buss_product_sku, systemUtils.assembleUpdateObj(req, data, true), id]);
}
ProductDao.prototype.updateSecondaryBooktimeBySkuId = function (req, data, id, connection) {
    let sql = this.base_update_sql + ' where id = ?';
    return baseDao.execWithConnection(connection, sql, [config.tables.buss_product_sku_booktime, systemUtils.assembleUpdateObj(req, data, true), id]);
}
ProductDao.prototype.getSecondaryBooktime = function (sku_id, regionalism_id) {
    let columns = ['id'];
    let sql = this.base_select_sql + ' and sku_id = ? and regionalism_id = ?';
    return baseDao.select(sql, [columns, config.tables.buss_product_sku_booktime, del_flag.SHOW, sku_id, regionalism_id]);
}
ProductDao.prototype.getSecondaryBooktimeBySkuId = function (sku_id) {
    let columns = ['id', 'book_time', 'regionalism_id'];
    let sql = this.base_select_sql + ' and sku_id = ? and del_flag = 1';
    return baseDao.select(sql, [columns, config.tables.buss_product_sku_booktime, del_flag.SHOW, sku_id]);
}
ProductDao.prototype.updateSkuWithSecondaryBooktime = function (req, data, id, connection) {
    let self = this;
    let secondary_booktimes = data.secondary_booktimes;
    delete data.secondary_booktimes;
    return self.updateSkuById(req, data, id, connection)
        .then(() => {
            return self.getSecondaryBooktimeBySkuId(id)
                .then(results => {
                    // 只要不是已存在第二预约时间，则删除
                    let deleted_booktimes = [];
                    results.forEach(result => {
                        let need_delete = true;
                        secondary_booktimes.forEach(secondary_booktime => {
                            if (secondary_booktime.book_time == result.book_time && secondary_booktime.regionalism_id == result.regionalism_id) {
                                need_delete = false;
                            }
                        });
                        if (need_delete) {
                            deleted_booktimes.push(result.id);
                        }
                    });
                    // 删除不存在的第二预约时间
                    let deleted_promises = deleted_booktimes.map(deleted_booktime_id => {
                        return self.updateSecondaryBooktimeBySkuId(req, {del_flag: del_flag.HIDE}, deleted_booktime_id, connection);
                    });
                    // 生成新的第二预约时间
                    let added_promises = secondary_booktimes.map(secondary_booktime => {
                        secondary_booktime.sku_id = id;
                        return self.insertSecondaryBookTime(req, secondary_booktime, connection);
                    });
                    return Promise.all(deleted_promises.concat(added_promises));
                });
        });
}
ProductDao.prototype.getProductById = function (id) {
    let sql = 'select * from ?? where id = ? and del_flag = ?';
    return baseDao.select(sql, [config.tables.buss_product, id, del_flag.SHOW]);
}
ProductDao.prototype.getSkuById = function (id) {
    let sql = 'select * from ?? where id = ? and del_flag = ?';
    return baseDao.select(sql, [config.tables.buss_product_sku, id, del_flag.SHOW]);
}
ProductDao.prototype.modifyProductAndSku = function (req, data) {
    let self = this;
    return baseDao.trans().then(connection => {
        let productId = data.product.id;
        let promise = Promise.resolve();
        // 修改product
        if (data.product) {
            promise.then(() => {
                let product_data = {
                    category_id: data.product.category_id,
                    name: data.product.name
                };
                return self.updateProductById(req, product_data, productId, connection);
            });
        }
        // 修改sku
        if (data.sku) {
            let promises = data.sku.map(sku => {
                let sku_id = sku.id;
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
                    activity_price: sku.activity_price,
                    activity_start: sku.activity_start,
                    activity_end: sku.activity_end,
                    del_flag: del_flag.SHOW,
                    secondary_booktimes: sku.secondary_booktimes
                };
                return self.updateSkuWithSecondaryBooktime(req, sku_data, sku_id, connection);
            });
            promise.then(() => {
                return Promise.all(promises);
            });
        }
        // 新增sku
        if (data.new_sku) {
            promise.then(() => {
                let promises = data.new_sku.map(sku => {
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
                        activity_price: sku.activity_price,
                        activity_start: sku.activity_start,
                        activity_end: sku.activity_end,
                        del_flag: del_flag.SHOW,
                        secondary_booktimes: sku.secondary_booktimes
                    };
                    return self.insertSku(req, sku_data, connection);
                });
                return Promise.all(promises);
            });
        }
        // 删除sku
        if (data.deleted_sku) {
            promise.then(() => {
                let promises = data.deleted_sku.map(skuId => {
                    // 删除sku
                    return self.updateSkuById(req, {del_flag: del_flag.HIDE}, skuId, connection)
                        .then(() => {
                            // 删除第二预约时间
                            return self.updateSecondaryBooktimeBySkuId(req, {del_flag: del_flag.HIDE}, skuId, connection);
                        });
                });
                return Promise.all(promises);
            });
        }
        return promise.then(() => {
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
ProductDao.prototype.getSkuByMultipleCondition = function (req, data) {
    let params = [];
    let columns = [
        'sku.id as sku_id',
        'sku.size as size',
        'sku.original_price as original_price',
        'sku.price as price',
        'sku.website as website',
        'sku.book_time as book_time',
        'sku.presell_start as presell_start',
        'sku.created_time as created_time',
        'sku.presell_end as presell_end',
        'sku.activity_price as activity_price',
        'sku.activity_start as activity_start',
        'sku.activity_end as activity_end',
        'product.id as product_id',
        'product.name as product_name',
        'city.name as city_name',
        'primary_cate.name as primary_cate_name',
        'secondary_cate.name as secondary_cate_name',
    ];
    let query_sql = 'select ' + columns.join(',') + ' from ?? sku join ?? product on sku.product_id = product.id';
    params.push(config.tables.buss_product_sku);
    params.push(config.tables.buss_product);

    query_sql += ' join ?? city on sku.regionalism_id = city.id';
    params.push(config.tables.dict_regionalism);

    query_sql += ' join ?? province on city.parent_id = province.id';
    params.push(config.tables.dict_regionalism);

    query_sql += ' join ?? secondary_cate on product.category_id = secondary_cate.id ';
    params.push(config.tables.buss_product_category);

    query_sql += ' join ?? primary_cate on secondary_cate.parent_id = primary_cate.id ';
    params.push(config.tables.buss_product_category);

    let where_sql = ' where 1 = 1 ';
    // 产品名称
    if (data.name) {
        where_sql += ' and product.name like \'%' + data.name + '%\'';
    }
    // 如果是预售商品，presell_start大于上线时间
    if (data.presell_start) {
        where_sql += ' and (sku.presell_start > ? or (sku.created_time > ? and sku.presell_start is null)) ';
        params.push(data.presell_start);
        params.push(data.presell_start);
    }
    // 如果是预售商品，presell_end小于下线时间
    if (data.presell_end) {
        where_sql += ' and (sku.presell_end < ? or sku.presell_end is null) ';
        params.push(data.presell_end);
    }
    // 一级分类id
    if (data.primary_cate) {
        where_sql += ' and primary_cate.id = ? ';
        params.push(data.primary_cate);
    }
    // 二级分类id
    if (data.secondary_cate) {
        where_sql += ' and secondary_cate.id = ? ';
        params.push(data.secondary_cate);
    }
    // 商城是否上线
    if (data.isMall == 1) {
        where_sql += ' and sku.website = 1 ';
    }
    // 是否促销(活动)
    if (data.isActivity == 1) {
        if (data.presell_start) {
            where_sql += ' and sku.activity_start > ? ';
        }
        if (data.presell_end) {
            where_sql += ' and sku.activity_end < ? ';
        }
    }
    // 省id
    if (data.province) {
        where_sql += ' and province.id = ? ';
        params.push(data.province);
    }
    // 市id
    if (data.city) {
        where_sql += ' and city.id = ? ';
        params.push(data.city);
    }

    let sql = query_sql + where_sql;
    return baseDao.select(sql, params);
}
ProductDao.prototype.insertProductDetail = function (req, data, connection) {
    if(connection){
        return baseDao.insertWithConnection(connection, this.base_insert_sql, [config.tables.buss_product_detail, systemUtils.assembleInsertObj(req, data, true)]);
    } else {
        return baseDao.insert(this.base_insert_sql, [config.tables.buss_product_detail, systemUtils.assembleInsertObj(req, data, true)]);
    }
}
ProductDao.prototype.insertProductDetailSepc = function (req, data, connection) {
    if(connection){
        return baseDao.insertWithConnection(connection, this.base_insert_sql, [config.tables.buss_product_detail_spec, systemUtils.assembleInsertObj(req, data, true)]);
    } else {
        return baseDao.insert(this.base_insert_sql, [config.tables.buss_product_detail_spec, systemUtils.assembleInsertObj(req, data, true)]);
    }
}
ProductDao.prototype.insertProductTemplateData = function (req, data, connection) {
    if(connection){
        return baseDao.insertWithConnection(connection, this.base_insert_sql, [config.tables.buss_product_template_data, systemUtils.assembleInsertObj(req, data, true)]);
    } else {
        return baseDao.insert(this.base_insert_sql, [config.tables.buss_product_template_data, systemUtils.assembleInsertObj(req, data, true)]);
    }
}
ProductDao.prototype.insertProductInfo = function (req, data) {
    let self = this;
    return baseDao.trans().then(connection => {
        let arr = [];
        data.infos.forEach(info_data => {
            info_data.regionalism_ids.forEach(regionalism_id => {
                arr.push({
                    product_detail: {
                        product_id: data.product_id,
                        regionalism_id: regionalism_id,
                        list_img: info_data.info.list_img,
                        list_copy: info_data.info.list_copy,
                        detail_top_copy: info_data.info.detail_top_copy,
                        detail_template_copy: info_data.info.detail_template_copy,
                        detail_template_copy_end: info_data.info.detail_template_copy_end,
                        detail_img_1: info_data.info.detail_img_1,
                        detail_img_2: info_data.info.detail_img_2,
                        detail_img_3: info_data.info.detail_img_3,
                        detail_img_4: info_data.info.detail_img_4,
                        consistency: info_data.info.consistency,
                    },
                    product_detail_spec: info_data.info.spec,
                    product_template_data: info_data.info.template_data
                });
            });
        });
        let promises = arr.map(item => {
            //buss_product_detail
            self.insertProductDetail(req, item.product_detail, connection)
                .then(detail_id => {
                    //buss_product_detail_spec
                    let product_detail_spec_promises = item.product_detail_spec.map(product_detail_spec => {
                        product_detail_spec.detail_id = detail_id;
                        return self.insertProductDetailSepc(req, product_detail_spec, connection);
                    });
                    return Promise.all(product_detail_spec_promises)
                        .then(() => {
                            return Promise.resolve(detail_id);
                        });
                })
                .then(detail_id => {
                    //buss_product_template_data
                    let product_template_data_promise = item.product_template_data.map(product_template_data => {
                        product_template_data.detail_id = detail_id;
                        product_template_data.template_id = product_template_data.template_id || DEFAULT_TEMPLATE;
                        return self.insertProductTemplateData(req, product_template_data, connection);
                    });
                    return Promise.all(product_template_data_promise);
                });
        });
        Promise.all(promises)
            .then(() => {
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
// 查询已添加详情城市
ProductDao.prototype.getProductDetailHasAddCities = function (product_id) {
    let sql = "select id,regionalism_id,consistency from ?? where product_id = ? and del_flag = ?";
    let params = [config.tables.buss_product_detail, product_id, del_flag.SHOW];
    return baseDao.select(sql, params);
}
// 查询可添加详情城市
ProductDao.prototype.getProductDetailCanAddCities = function (product_id) {
    let sql = "select distinct dict_city.id as city_id,dict_city.name as city_name,(case dict_province.level_type when 1 then dict_province.id when 2 then dict_province.parent_id end) as province_id " +
        "from ?? sku join ?? dict_city on sku.regionalism_id = dict_city.id and sku.product_id = ? and sku.del_flag = ? and dict_city.del_flag = ? " + 
        "join ?? dict_province on dict_city.parent_id = dict_province.id and dict_province.del_flag = ? ";
    let params = [config.tables.buss_product_sku, config.tables.dict_regionalism, product_id, del_flag.SHOW, del_flag.SHOW, config.tables.dict_regionalism, del_flag.SHOW];
    return baseDao.select(sql, params);
}
ProductDao.prototype.getProductSpecByDetailId = function (detail_id) {
    let sql = 'select ?? from ?? where del_flag = ? and detail_id = ?';
    let columns = [
        'key',
        'value',
    ];
    let params = [columns, config.tables.buss_product_detail_spec, del_flag.SHOW, detail_id];
    return baseDao.select(sql, params);
}
ProductDao.prototype.getProductTemplateDataByDetailId = function (detail_id) {
    let sql = 'select ?? from ?? where del_flag = ? and detail_id = ?';
    let columns = [
        'template_id',
        'position_id',
        'value',
    ];
    let params = [columns, config.tables.buss_product_template_data, del_flag.SHOW, detail_id];
    return baseDao.select(sql, params);
}
ProductDao.prototype.getProductDetailByProductIdAndRegionId = function (product_id, regionalism_id) {
    let sql = this.base_select_sql + ' and product_id = ? and regionalism_id = ?';
    let columns = [
        'id',
        'list_img',
        'list_copy',
        'detail_top_copy',
        'detail_template_copy',
        'detail_template_copy_end',
        'detail_img_1',
        'detail_img_2',
        'detail_img_3',
        'detail_img_4',
    ];
    let params = [columns, config.tables.buss_product_detail, del_flag.SHOW, product_id, regionalism_id];
    return baseDao.select(sql, params);
}
ProductDao.prototype.getProductInfoByProductIdAndRegionId = function (product_id, regionalism_id) {
    let self = this;
    return self.getProductDetailByProductIdAndRegionId(product_id, regionalism_id)
        .then(detail_result => {
            let detail_id = detail_result[0].id;
            let promises = [
                self.getProductSpecByDetailId(detail_id),
                self.getProductTemplateDataByDetailId(detail_id)
            ];
            return Promise.all(promises)
                .then(detail_data => {
                    let spec_result = detail_data[0];
                    let template_result = detail_data[1];
                    let result = detail_result[0];
                    result.spec = spec_result;
                    result.template_data = template_result;
                    return Promise.resolve(result);
                });
        });
}
ProductDao.prototype.deleteAllSpec = function (req, detail_id, connection) {
    let sql =  this.base_update_sql + ' where detail_id = ?';
    let data = {
        del_flag: del_flag.HIDE
    };
    if(connection){
        return baseDao.execWithConnection(connection, sql, [config.tables.buss_product_detail_spec, systemUtils.assembleUpdateObj(req, data, true), detail_id]);
    } else {
        return baseDao.update(sql, [config.tables.buss_product_detail_spec, systemUtils.assembleUpdateObj(req, data, true), detail_id]);
    }
}
ProductDao.prototype.deleteAllTemplateData = function (req, detail_id, connection) {
    let sql =  this.base_update_sql + ' where detail_id = ?';
    let data = {
        del_flag: del_flag.HIDE
    };
    if(connection){
        return baseDao.execWithConnection(connection, sql, [config.tables.buss_product_template_data, systemUtils.assembleUpdateObj(req, data, true), detail_id]);
    } else {
        return baseDao.update(sql, [config.tables.buss_product_template_data, systemUtils.assembleUpdateObj(req, data, true), detail_id]);
    }
}
ProductDao.prototype.updateProductDetail = function (req, data, id, connection) {
    let sql = this.base_update_sql + ' where id = ?';
    if(connection){
        return baseDao.execWithConnection(connection, sql, [config.tables.buss_product_detail, systemUtils.assembleUpdateObj(req, data, true), id]);
    } else {
        return baseDao.insert(sql, [config.tables.buss_product_detail, systemUtils.assembleUpdateObj(req, data, true), id]);
    }
}
ProductDao.prototype.modifyProductInfo = function (req, data) {
    let self = this;
    let product_id = data.product_id;
    let modified_infos = data.modified_infos;
    let new_infos = data.new_infos;
    return baseDao.trans().then(connection => {
        // 修改旧数据
        let modified_promises = modified_infos.map(modified_info => {
            let detail_id = modified_info.detail_id;
            let product_detail = {
                list_img: modified_info.list_img,
                list_copy: modified_info.list_copy,
                detail_top_copy: modified_info.detail_top_copy,
                detail_template_copy: modified_info.detail_template_copy,
                detail_template_copy_end: modified_info.detail_template_copy_end,
                detail_img_1: modified_info.detail_img_1,
                detail_img_2: modified_info.detail_img_2,
                detail_img_3: modified_info.detail_img_3,
                detail_img_4: modified_info.detail_img_4,
                consistency: modified_info.consistency,
            };
            let product_detail_specs = modified_info.spec;
            let product_template_datas = modified_info.template_data;
            return self.updateProductDetail(req, product_detail, detail_id, connection)
                .then(() => {
                    return self.deleteAllSpec(req, detail_id, connection)
                        .then(() => {
                            let product_detail_spec_promises = product_detail_specs.map(product_detail_spec => {
                                product_detail_spec.detail_id = detail_id;
                                return self.insertProductDetailSepc(req, product_detail_spec, connection);
                            });
                            return Promise.all(product_detail_spec_promises);
                        });
                }).then(() => {
                    return self.deleteAllTemplateData(req, detail_id, connection)
                        .then(() => {
                            let product_template_data_promise = product_template_datas.map(product_template_data => {
                                product_template_data.detail_id = detail_id;
                                product_template_data.template_id = product_template_data.template_id || DEFAULT_TEMPLATE;
                                return self.insertProductTemplateData(req, product_template_data, connection);
                            });
                            return Promise.all(product_template_data_promise);
                        });
                });
        });
        // 插入新数据
        let new_promises = new_infos.map(new_info => {
            let product_detail = {
                product_id: product_id,
                regionalism_id: new_info.regionalism_id,
                list_img: new_info.list_img,
                list_copy: new_info.list_copy,
                detail_top_copy: new_info.detail_top_copy,
                detail_template_copy: new_info.detail_template_copy,
                detail_template_copy_end: new_info.detail_template_copy_end,
                detail_img_1: new_info.detail_img_1,
                detail_img_2: new_info.detail_img_2,
                detail_img_3: new_info.detail_img_3,
                detail_img_4: new_info.detail_img_4,
                consistency: new_info.consistency,
            };
            let product_detail_specs = new_info.spec;
            let product_template_datas = new_info.template_data;
            return self.insertProductDetail(req, product_detail, connection)
                .then(detail_id => {
                    let product_detail_spec_promises = product_detail_specs.map(product_detail_spec => {
                        product_detail_spec.detail_id = detail_id;
                        return self.insertProductDetailSepc(req, product_detail_spec, connection);
                    });
                    return Promise.all(product_detail_spec_promises)
                        .then(() => {
                            return Promise.resolve(detail_id);
                        });
                }).then(detail_id => {
                    let product_template_data_promise = product_template_datas.map(product_template_data => {
                        product_template_data.detail_id = detail_id;
                        product_template_data.template_id = product_template_data.template_id || DEFAULT_TEMPLATE;
                        return self.insertProductTemplateData(req, product_template_data, connection);
                    });
                    return Promise.all(product_template_data_promise);
                });
        });

        return Promise.all(modified_promises)
            .then(()=> {
                return Promise.all(new_promises);
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
            });;
    });
}
module.exports = ProductDao;