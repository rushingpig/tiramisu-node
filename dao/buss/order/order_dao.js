'use strict';
var baseDao = require('../../base_dao'),
    util = require('util'),
    toolUtils = require('../../../common/ToolUtils'),
    systemUtils = require('../../../common/SystemUtils'),
    Constant = require('../../../common/Constant'),
    dbHelper = require('../../../common/DBHelper'),
    logger = require('../../../common/LogHelper').systemLog(),
    constant = require('../../../common/Constant'),
    del_flag = baseDao.del_flag,
    tables = require('../../../config').tables,
    errorMessage = require('../../../util/res_obj'),
    TiramisuError = require('../../../error/tiramisu_error');
var async = require('async');

function OrderDao() {
    this.baseColumns = ['id', 'name'];
    this.base_insert_sql = 'insert into ?? set ?';
    this.base_select_sql = 'select ?? from ?? where 1=1 and del_flag = ? ';
    this.base_update_sql = 'update ?? set ?';
}
/**
 * get the order sources
 */
OrderDao.prototype.findAllOrderSrc = function () {
    let params = [['id', 'name', 'parent_id', 'level'], tables.buss_order_src, del_flag.SHOW];
    return baseDao.select(this.base_select_sql, params);
};
/**
 * new order
 */
OrderDao.prototype.insertOrder = function (orderObj) {
    return baseDao
        .insert(this.base_insert_sql, [tables.buss_order, orderObj])
        .then(result => {
            return new Promise((resolve, reject) => resolve(result));
        })
        .catch(err => {
            if (err.code === 'ER_DUP_ENTRY') {
                throw new TiramisuError(errorMessage.DUPLICATE_EXTERNAL_ORDER, orderObj.merchant_id);
            }
            throw err;
        });
};

OrderDao.prototype.addOrderError = function (orderErrorObj) {
  return baseDao
    .insert(this.base_insert_sql, [tables.buss_order_error, orderErrorObj])
    .catch(err => {
        if (err.code === 'ER_DUP_ENTRY') {
            throw new TiramisuError(errorMessage.DUPLICATE_EXTERNAL_ORDER, orderErrorObj.merchant_id);
        }
        throw err;
    });
};

OrderDao.prototype.editOrderError = function (orderErrorObj, merchant_id, src_id) {
  const updateSQL = this.base_update_sql + ' WHERE merchant_id = ? AND src_id = ?';
  return baseDao
    .update(updateSQL, [tables.buss_order_error, orderErrorObj, merchant_id, src_id]);
};

/**
 * new recipient record
 */
OrderDao.prototype.insertRecipient = function (recipientObj) {
    return baseDao.insert(this.base_insert_sql, [tables.buss_recipient, recipientObj]);
};
/**
 * get the pay modes
 * @returns {Promise}
 */
OrderDao.prototype.findAllPayModes = function () {
    let params = [this.baseColumns, tables.buss_pay_modes, del_flag.SHOW];
    return baseDao.select(this.base_select_sql, params);
};
/**
 * get the shops by regionalismId
 * @param districtId
 */
OrderDao.prototype.findShopByRegionId = function (districtId) {
    let sql = this.base_select_sql + ' and regionalism_id = ?';
    let params = [this.baseColumns, tables.buss_shop, del_flag.SHOW, districtId];
    return baseDao.select(sql, params);
};
/**
 * update the order info
 * @param orderObj
 * @param order_id
 */
OrderDao.prototype.updateOrder = function (orderObj, order_id) {
    let sql = this.base_update_sql + " where id = ?";
    return baseDao.update(sql, [tables.buss_order, orderObj, order_id]);
};
/**
 * new order-sku record
 * @param order_sku_obj
 */
OrderDao.prototype.insertOrderSku = function (order_sku_obj) {
    return baseDao.insert(this.base_insert_sql, [tables.buss_order_sku, order_sku_obj]);
};
OrderDao.prototype.batchInsertOrderSku = function (params) {
    let sql = "insert into " + tables.buss_order_sku + "(order_id,sku_id,num,choco_board,greeting_card,atlas,custom_name,custom_desc,discount_price,amount) values ?";
    return baseDao.batchInsert(sql, [params]);
};
OrderDao.prototype.insertOrderFulltext = function (order_fulltext_obj) {
    return baseDao.insert(this.base_insert_sql, [tables.buss_order_fulltext, order_fulltext_obj]);
};
/**
 * update the fulltext table of order
 * @param order_fulltext_obj
 * @param orderId
 * @returns {Promise}
 */
OrderDao.prototype.updateOrderFulltext = function (order_fulltext_obj, orderId) {
    let sql = this.base_update_sql + " where order_id = ?";
    return baseDao.update(sql, [tables.buss_order_fulltext, order_fulltext_obj, orderId]);
};
/**
 * find the order detail info by orderId or orderIds
 * @param orderId
 */
OrderDao.prototype.findOrderById = function (orderIdOrIds) {
    let columns = ['br.delivery_type',
        'bo.owner_name',
        'bo.id',
        'bo.owner_mobile',
        'br.id as recipient_id',
        'br.`name` as recipient_name',
        'br.mobile as recipient_mobile',
        'br.address as recipient_address',
        'br.landmark',
        'bds.id as delivery_id',
        'bds.name as delivery_name',
        'bpm.id as pay_modes_id',
        'bpm.name as pay_name',
        'bo.pay_status',
        'bo.delivery_time',
        'bo.src_id',
        'bo.remarks',
        'bo.status',
        'bo.coupon',
        'bo.invoice',
        'bo.total_amount',
        'bo.total_discount_price',
        'bo.total_original_price',
        'bo.merchant_id',
        'bp.`name` as product_name',
        'bp.original_price',
        'bos.amount',
        'bos.num',
        'bps.size',
        'bps.price',
        'bos.sku_id',
        'bos.discount_price',
        'bos.choco_board',
        'bos.greeting_card',
        'bos.custom_name',
        'bos.custom_desc',
        'bos.atlas',
        'bosrc.merge_name',
        'dr.name as regionalism_name',
        'dr.id as regionalism_id',
        'dr2.name as city_name',
        'dr2.id as city_id',
        'dr3.name as province_name',
        'dr3.id as province_id',
        'bo.updated_time',
        'bo.created_time',
        'su1.name as created_by',
        'su2.name as deliveryman_name'
    ].join(',');
    let sql = "select " + columns + " from ?? bo", params = [];
    params.push(tables.buss_order);
    sql += " left join ?? br on bo.recipient_id = br.id";
    params.push(tables.buss_recipient);
    sql += " left join ?? bosrc on bo.src_id = bosrc.id";
    params.push(tables.buss_order_src);
    sql += " left join ?? bpm on bo.pay_modes_id = bpm.id";
    params.push(tables.buss_pay_modes);
    sql += " left join ?? bds on bo.delivery_id = bds.id";
    params.push(tables.buss_delivery_station);
    sql += " left join ?? dr on br.regionalism_id = dr.id";
    params.push(tables.dict_regionalism);
    sql += " left join ?? dr2 on dr.parent_id = dr2.id";
    params.push(tables.dict_regionalism);
    sql += " left join ?? dr3 on dr2.parent_id = dr3.id";
    params.push(tables.dict_regionalism);
    sql += " left join ?? bos on bo.id = bos.order_id and bos.del_flag = ?";
    params.push(tables.buss_order_sku);
    params.push(del_flag.SHOW);
    sql += " left join ?? bps on bos.sku_id = bps.id";
    params.push(tables.buss_product_sku);
    sql += " left join ?? bp on bps.product_id = bp.id";
    params.push(tables.buss_product);
    sql += " left join ?? su1 on bo.created_by = su1.id";
    params.push(tables.sys_user);
    sql += " left join ?? su2 on bo.deliveryman_id = su2.id";
    params.push(tables.sys_user);
    sql += " where 1=1 and bo.del_flag = ? ";
    params.push(del_flag.SHOW);
    if (Array.isArray(orderIdOrIds)) {
        if (orderIdOrIds.length === 1) {
            sql += " and bo.id = ?";
            params.push(orderIdOrIds[0]);
        } else {
            sql += " and bo.id in" + dbHelper.genInSql(orderIdOrIds);
        }
    } else {
        sql += " and bo.id = ?";
        params.push(orderIdOrIds);
    }

    return baseDao.select(sql, params);
};
/**
 * query for the order list by the given terms
 */
OrderDao.prototype.findOrderList = function (query_data) {
    let columns_arr = [
        'bo.id',
        'bo.merchant_id',
        'bo.owner_name',
        'bo.owner_mobile',
        'bo.created_time',
        'bo.pay_status',
        'bo.delivery_time',
        'bo.is_deal',
        'bo.is_submit',
        'bo.exchange_time',
        'bo.print_time',
        'bo.cancel_reason',
        'bo.remarks',
        'bo.total_original_price',
        'bo.total_discount_price',
        'bo.total_amount',
        'bo.coupon',
        'bo.`status`',
        'bo.submit_time',
        'bo.signin_time',
        'bo.print_status',
        'bo.invoice',
        'bpm.name as pay_modes_name',
        'bds2.name as delivery_name',
        'br.delivery_type',
        'br.address',
        'br.landmark',
        'br.name as recipient_name',
        'br.mobile as recipient_mobile',
        'dr.merger_name',
        'bos.merge_name as src_name',
        'su1.name as created_by',
        'su2.name as updated_by',
        'su3.name as deliveryman_name',
        'su3.mobile as deliveryman_mobile',
        'su4.name as last_opt_cs',
        'bo.updated_time',
        'bo.greeting_card'
    ];
    if(query_data.list_products){
        columns_arr = columns_arr.concat(['bp.`name` as product_name',
            'bp.original_price',
            'bosku.amount',
            'bosku.num',
            'bps.size',
            'bps.price',
            'bosku.sku_id',
            'bosku.discount_price',
            'bosku.choco_board',
            'bosku.greeting_card as product_greeting_card',
            'bosku.custom_name',
            'bosku.custom_desc',
            'bosku.atlas']);
    }
    let columns = columns_arr.join(',');
    let params = [],data_scopes = query_data.user.data_scopes;
    let sql = "select " + columns + " from ?? bo force index(IDX_DELIVERY_TIME)";
    params.push(tables.buss_order);
    if (query_data.keywords) {
        let match = '';
        sql += " inner join ?? bof on match(bof.owner_name,bof.owner_mobile,bof.recipient_name,bof.recipient_mobile,bof.recipient_address,bof.landmark,bof.show_order_id,bof.merchant_id) against(? IN BOOLEAN MODE) and bof.order_id = bo.id";
        params.push(tables.buss_order_fulltext);
        query_data.keywords.split(' ').forEach((curr)=>{
            if(curr){
                match += '+'+curr+' ';
            }
        });
        params.push(match + '*');
    }
    sql += " inner join ?? br on bo.recipient_id = br.id";
    params.push(tables.buss_recipient);
    if (query_data.city_id) {
        sql += " inner join ?? dr2 on dr2.id = br.regionalism_id and dr2.parent_id = ?";
        params.push(tables.dict_regionalism);
        params.push(query_data.city_id);
    }
    sql += " left join ?? bds2 on bo.delivery_id = bds2.id";
    params.push(tables.buss_delivery_station);
    if(data_scopes.indexOf(constant.DS.CITY) !== -1){
        sql += " inner join ?? dr3 on dr3.id = bds2.regionalism_id";
        params.push(tables.dict_regionalism);

    }
    if(query_data.list_products){
        sql += " left join ?? bosku on bo.id = bosku.order_id and bosku.del_flag = ?";
        params.push(tables.buss_order_sku);
        params.push(del_flag.SHOW);
        sql += " left join ?? bps on bosku.sku_id = bps.id";
        params.push(tables.buss_product_sku);
        sql += " left join ?? bp on bps.product_id = bp.id";
        params.push(tables.buss_product);
    }
    sql += " left join ?? bos on bo.src_id = bos.id";
    params.push(tables.buss_order_src);
    sql += " left join ?? dr on br.regionalism_id = dr.id";
    params.push(tables.dict_regionalism);
    sql += " left join ?? su1 on su1.id = bo.created_by";
    params.push(tables.sys_user);
    sql += " left join ?? su2 on su2.id = bo.updated_by";
    params.push(tables.sys_user);
    sql += " left join ?? su3 on su3.id = bo.deliveryman_id";
    params.push(tables.sys_user);
    sql += " left join ?? su4 on su4.id = bo.last_opt_cs";
    params.push(tables.sys_user);
    sql += " left join ?? bpm on bpm.id = bo.pay_modes_id";
    params.push(tables.buss_pay_modes);

    sql += " where 1=1";
    if (query_data.owner_mobile) {
        sql += " and bo.owner_mobile = ?";
        params.push(query_data.owner_mobile);
    }
    if (query_data.begin_time) {
        sql += " and bo.delivery_time >= ?";
        params.push(query_data.begin_time + ' 00:00~00:00');
    }
    if (query_data.end_time) {
        sql += " and bo.delivery_time <= ?";
        params.push(query_data.end_time + ' 24:00~24:00');
    }
    if (query_data.is_deal == 0) {
        sql += " and bo.is_deal = 0";
    }else if(query_data.is_deal == 1){
        sql += " and bo.is_deal = 1";
    }
    if (query_data.is_submit == 0) {
        sql += " and bo.is_submit = 0"
    }else if(query_data.is_submit == 1){
        sql += " and bo.is_submit = 1";
    }
    if (query_data.src_id) {
        sql += " and (src_id = ? or bos.parent_id = ?)";
        params.push(query_data.src_id);
        params.push(query_data.src_id);
    }
    if (query_data.status) {
        if (Array.isArray(query_data.status)) {
            let temp_sql = " and (";
            query_data.status.forEach((curr) => {
                temp_sql += " bo.status = ? or";
                params.push(curr);
            });
            sql += temp_sql.substring(0, temp_sql.length - 3);
            sql += ")";
        } else {
            sql += " and bo.status = ?";
            params.push(query_data.status);
        }
    }
    if (query_data.delivery_id) {
        sql += " and bo.delivery_id = ?";
        params.push(query_data.delivery_id);
    }
    if(query_data.delivery_type){
        sql += " and br.delivery_type = ?";
        params.push(query_data.delivery_type);
    }
    if (query_data.deliveryman_id) {
        sql += " and bo.deliveryman_id = ?";
        params.push(query_data.deliveryman_id);
    }
    if (parseInt(query_data.print_status) === 1) {   //  查询已经打印过的订单
        sql += " and (bo.print_status = ? or bo.print_status = ?)";
        params.push(constant.PS.UNPRINTABLE);
        params.push(constant.PS.AUDITING);
    } else if (parseInt(query_data.print_status) === 0) {
        sql += " and (bo.print_status = ? or bo.print_status = ?)";
        params.push(constant.PS.PRINTABLE);
        params.push(constant.PS.REPRINTABLE);
    }

    if (parseInt(query_data.is_greeting_card) === 1) {
        sql += " and bo.greeting_card is not null";
    } else if (parseInt(query_data.is_greeting_card) === 0) {
        sql += " and (bo.greeting_card is null or bo.greeting_card = '')";
    }

    if (query_data.order_ids && Array.isArray(query_data.order_ids)) {
        sql += " and bo.id in " + dbHelper.genInSql(query_data.order_ids);
    }
    // data filter begin
    let ds_sql = "",temp_sql = "";
    if(!toolUtils.isEmptyArray(data_scopes)){
        ds_sql += " and (";
        data_scopes.forEach((curr)=>{

            if(curr == constant.DS.STATION){
                temp_sql += " or bo.delivery_id = ?";
                params.push(query_data.user.station_id);
            }
            if(curr == constant.DS.CITY){
                temp_sql += " or dr3.parent_id = ?";
                params.push(query_data.user.city_id);
            }
            if(curr == constant.DS.SELF_DELIVERY){
                temp_sql += " or bo.deliveryman_id = ?";
                params.push(query_data.user.id);
            }
            if(curr == constant.DS.ALLCOMPANY){
                temp_sql += " or 1 = 1";
            }
        });
        ds_sql += temp_sql.replace(/^ or/,'');
        ds_sql += ")";
    }
    if(query_data.user && query_data.user.is_admin){
        ds_sql = "";
    }
    // data filter end
    switch (query_data.order_sorted_rules) {
        case constant.OSR.LIST:
            sql += ds_sql;
            sql += " order by bo.created_time desc";
            break;
        case constant.OSR.DELIVERY_EXCHANGE:
            sql += ds_sql;
            sql += " order by bo.delivery_time asc";
            break;
        case constant.OSR.DELIVER_LIST:
            sql += ds_sql;
            sql += " order by bo.print_status asc,bo.delivery_time asc";
            break;
        case constant.OSR.RECEIVE_LIST:
            sql += ds_sql;
            sql += " order by bo.`status` asc,bo.delivery_time asc";
            break;
        default:
        // do nothing && order by with the db self
    }
    let countSql = dbHelper.countSql(sql);
    return baseDao.select(countSql, params).then((result) => {
        return baseDao.select(dbHelper.paginate(sql, query_data.page_no, query_data.page_size), params).then((_result) => {
            return {
                result: result,
                _result: _result
            };
        });
    });
};
/**
 * update the order by order id with transaction
 * @param order_obj
 * @param order_id
 * @param recipient_obj
 * @param recipient_id
 * @param products
 * @returns {Promise|Promise.<T>|MPromise}
 */
OrderDao.prototype.editOrder = function (order_obj, order_id, recipient_obj, recipient_id, products, add_skus, delete_skuIds, update_skus) {
    let order_sql = this.base_update_sql + " where id = ?", recipent_sql = order_sql,
        recipient_params = [tables.buss_recipient, recipient_obj, recipient_id],
        order_params = [tables.buss_order, order_obj, order_id],
        userId = order_obj.update_by;
    if (toolUtils.isEmptyArray(add_skus)) add_skus = [];
    if (toolUtils.isEmptyArray(update_skus)) update_skus = [];
    return baseDao.trans().then(transaction => {
        return new Promise((resolve, reject) => {
            transaction.query(recipent_sql, recipient_params, (err_recipient) => {
                if (err_recipient) {
                    logger.error('when update recipient with recipient_id:[' + recipient_id + "] exception ==========>", err_recipient);
                    return reject(err_recipient);
                }
                transaction.query(order_sql, order_params, (err_order) => {
                    if (err_order) {
                        logger.error('when update order with order_id:[' + order_id + "] exception ============>", err_order);
                        return reject(err_order);
                    }
                    async.each(
                      add_skus,
                      (curr, cb) => {
                        transaction.query(this.base_insert_sql, [tables.buss_order_sku, curr], cb);
                      },
                      err => {
                        if (err) return reject(err);
                        async.each(
                          update_skus,
                          (curr, cb) => {
                            const order_sku_update_sql = this.base_update_sql + " where order_id = ? and sku_id = ? and del_flag = ?";
                            const order_sku_update_params = [tables.buss_order_sku, curr, order_id, curr.sku_id,del_flag.SHOW];
                            transaction.query(order_sku_update_sql, order_sku_update_params, cb);
                          },
                          err => {
                            if (err) return reject(err);
                            if (!toolUtils.isEmptyArray(delete_skuIds)) {
                                const order_sku_batch_update_sql = this.base_update_sql + " where order_id = ? and sku_id in " + dbHelper.genInSql(delete_skuIds);
                                transaction.query(
                                  order_sku_batch_update_sql,
                                  [
                                    tables.buss_order_sku,
                                    {
                                        del_flag: del_flag.HIDE,
                                        updated_by: userId
                                    },
                                    order_id
                                  ],
                                  err => {
                                    if (err) return reject(err);
                                    resolve();
                                  }
                                );
                            } else {
                              resolve();
                            }
                          }
                        );
                      }
                    );
                });
            });
        }).then(ignore => {
          return new Promise((resolve, reject) => {
            transaction.commit(err => {
              transaction.release();
              if (err) return reject(err);
              resolve();
            });
          });
        }).catch(err => {
          return new Promise((resolve, reject) => {
            transaction.rollback(rollbackError => {
              transaction.release();
              if (rollbackError) return reject(rollbackError);
              reject(err);
            });
          });
        });

    });
};
/**
 * update the recipient info
 * @param recipient_obj
 * @param recipient_id
 * @returns {Promise|Promise.<T>|MPromise}
 */
OrderDao.prototype.updateRecipient = function (recipient_obj, recipient_id) {
    let sql = this.base_update_sql + " where id = ?",
        params = [tables.buss_recipient, recipient_obj, recipient_id];
    return baseDao.update(sql, params);
};
/**
 * find order status and updated_time to control concurrency
 * @param order_id
 * @returns {Promise}
 */
OrderDao.prototype.findVersionInfoById = function (order_id) {
    let sql = this.base_select_sql + " and id = ?";
    let columns = ['status', 'updated_time'];
    return baseDao.select(sql, [columns, tables.buss_order, order_id]);
};
/**
 * insert a record of the order
 * @param order_id
 */
OrderDao.prototype.insertOrderHistory = function (order_history_obj) {
    return baseDao.insert(this.base_insert_sql, [tables.buss_order_history, order_history_obj]);
};
/**
 * batch insert records
 * @param order_history_objs
 */
OrderDao.prototype.batchInsertOrderHistory = function (order_history_params) {
    let sql = "insert into ??(order_id,`option`,created_by,created_time) values ?";
    return baseDao.batchInsert(sql, [tables.buss_order_history, order_history_params]);
};
/**
 * find the history of the order
 * @param orderId
 * @returns {Promise}
 */
OrderDao.prototype.findOrderHistory = function (query_data) {
    let columns = [
        'boh.order_id',
        'boh.`option`',
        'boh.created_time',
        'su.`name` as created_by'
    ].join(','), params = [];
    let sql = "select " + columns + " from ?? boh";
    params.push(tables.buss_order_history);
    sql += " left join ?? su on su.id = boh.created_by";
    params.push(tables.sys_user);
    sql += " where 1=1 and boh.order_id = ? and boh.del_flag = ?";
    sql += " order by boh.created_time ";
    sql += query_data.sort_type ? query_data.sort_type : ' desc';
    params.push(query_data.order_id);
    params.push(del_flag.SHOW);
    let countSql = dbHelper.countSql(sql);
    return baseDao.select(countSql, params).then((result) => {
        return baseDao.select(dbHelper.paginate(sql, query_data.page_no, query_data.page_size), params).then((_result) => {
            return {result, _result};
        });
    });

};
/**
 * get the order list by the given order ids
 * @param order_ids
 * @returns {Promise}
 */
OrderDao.prototype.findOrdersByIds = function (order_ids) {
    let sql = "select * from ?? where id in" + dbHelper.genInSql(order_ids);
    return baseDao.select(sql, [tables.buss_order]);
};
/**
 * batch update orders by the given order ids
 * @param update_obj
 * @param order_ids
 */
OrderDao.prototype.updateOrders = function (update_obj, order_ids) {
    let sql = this.base_update_sql + " where id in" + dbHelper.genInSql(order_ids);
    baseDao.update(sql, [tables.buss_order, update_obj]);
};
/**
 * insert order in transaction
 * @param req
 */
OrderDao.prototype.insertOrderInTransaction = function (req) {
    let delivery_type = req.body.delivery_type,
        owner_name = req.body.owner_name,
        owner_mobile = req.body.owner_mobile,
        recipient_name = req.body.recipient_name,
        recipient_mobile = req.body.recipient_mobile,
        regionalism_id = req.body.regionalism_id,
        recipient_address = req.body.recipient_address,
        recipient_landmark = req.body.recipient_landmark,
        delivery_id = req.body.delivery_id,
        src_id = req.body.src_id,
        pay_modes_id = req.body.pay_modes_id,
        pay_status = req.body.pay_status,
        delivery_time = req.body.delivery_time,
        invoice = req.body.invoice,
        remarks = req.body.remarks,
        total_amount = req.body.total_amount,
        total_original_price = req.body.total_original_price,
        total_discount_price = req.body.total_discount_price,
        products = req.body.products,
        prefix_address = req.body.prefix_address,
        greeting_card = req.body.greeting_card,
        coupon = req.body.coupon;
    let recipientObj = {
        regionalism_id: regionalism_id,
        name: recipient_name,
        mobile: recipient_mobile,
        landmark: recipient_landmark,
        delivery_type: delivery_type,
        address: recipient_address,
        del_flag: del_flag.SHOW
    };

    return baseDao.trans().then(transaction => {
        return new Promise((resolve, reject)=> {
            // recipient
            transaction.query(this.base_insert_sql, [tables.buss_recipient, recipientObj], (recipient_err, info)=> {
                if (recipient_err || !info.insertId) {
                    return reject(recipient_err || new TiramisuError(errorMessage.FAIL));
                }
                if (toolUtils.isEmptyArray(products)) {
                    return reject(new TiramisuError(errorMessage.ORDER_NO_PRODUCT));
                }
                let recipientId = info.insertId;
                let orderObj = {
                    office_id : req.session.user.office_id,
                    recipient_id: recipientId,
                    delivery_id: delivery_id,
                    src_id: src_id,
                    pay_modes_id: pay_modes_id,
                    pay_status: pay_status,
                    owner_name: owner_name,
                    owner_mobile: owner_mobile,
                    is_submit: 0,
                    is_deal: 1,
                    status: Constant.OS.TREATED,
                    remarks: remarks,
                    invoice: invoice,
                    delivery_time: delivery_time,
                    total_amount: total_amount,
                    total_original_price: total_original_price,
                    total_discount_price: total_discount_price,
                    greeting_card: greeting_card,
                    coupon : coupon,
                    last_opt_cs : req.session.user.id
                };
                // order
                transaction.query(this.base_insert_sql,[tables.buss_order,systemUtils.assembleInsertObj(req,orderObj)],(order_err,result)=>{
                    if (order_err || !result.insertId) {
                        return reject(order_err || new TiramisuError(errorMessage.FAIL));
                    }
                    let orderId = result.insertId, params = [];
                    products.forEach((curr) => {
                        let arr = [];
                        arr.push(orderId);
                        arr.push(curr.sku_id);
                        arr.push(curr.num);
                        arr.push(curr.choco_board || '');
                        arr.push(curr.greeting_card || '');
                        arr.push(curr.atlas);
                        arr.push(curr.custom_name || '');
                        arr.push(curr.custom_desc || '');
                        arr.push(curr.discount_price || 0);
                        arr.push(curr.amount || 0);
                        params.push(arr);
                    });
                    let order_fulltext_obj = {
                        order_id: orderId,
                        show_order_id: systemUtils.getShowOrderId(orderId, new Date()),
                        owner_name: systemUtils.encodeForFulltext(owner_name),
                        owner_mobile: owner_mobile,
                        recipient_name: systemUtils.encodeForFulltext(recipient_name),
                        recipient_mobile: recipient_mobile,
                        recipient_address: systemUtils.encodeForFulltext(prefix_address + recipient_address),
                        landmark: systemUtils.encodeForFulltext(recipient_landmark)
                    };
                    let order_history_obj = {
                        order_id: orderId,
                        option: '添加订单'
                    };
                    let skus_sql = "insert into " + tables.buss_order_sku + "(order_id,sku_id,num,choco_board,greeting_card,atlas,custom_name,custom_desc,discount_price,amount) values ?";
                    transaction.query(skus_sql, [params], err => {
                      if (err) return reject(err);
                      transaction.query(this.base_insert_sql, [tables.buss_order_fulltext, order_fulltext_obj], err => {
                        if (err) return reject(err);
                        transaction.query(this.base_insert_sql, [tables.buss_order_history, systemUtils.assembleInsertObj(req, order_history_obj, true)], err => {
                          if (err) return reject(err);
                          resolve();
                        });
                      });
                    });
                });

            });
        }).then(ignore => {
          return new Promise((resolve, reject) => {
            transaction.commit(err => {
              transaction.release();
              if (err) return reject(err);
              resolve();
            });
          });
        }).catch(err => {
          return new Promise((resolve, reject) => {
            transaction.rollback(rollbackError => {
              transaction.release();
              if (rollbackError) return reject(rollbackError);
              reject(err);
            });
          });
        });
    });
};

const srcIdMapping = new Map(
    [
        [ 10000,1 ],
        [ 10001,2 ],
        [ 10002,3 ],
        [ 10003,4 ],
        [ 10004,5 ],
        [ 10005,6 ],
        [ 10006,7 ],
        [ 10007,8 ],
        [ 10008,9 ],
        [ 10009,10 ],
        [ 10010,11 ],
        [ 10011,12 ],
        [ 10012,13 ],
        [ 10013,14 ],
        [ 10014,15 ],
        [ 10015,16 ],
        [ 10016,17 ],
        [ 10017,18 ],
        [ 10018,19 ],
        [ 10019,20 ],
        [ 10020,21 ],
        [ 10021,22 ],
        [ 10022,23 ],
        [ 10023,24 ],
        [ 10024,25 ],
        [ 10025,26 ],
        [ 10026,27 ],
        [ 10027,28 ],
        [ 11027,29 ],
        [ 11029,30 ],
        [ 11030,31 ],
        [ 12030,32 ],
        [ 12031,33 ],
        [ 12032,34 ],
        [ 12033,35 ],
        [ 11007,38 ],
        [ 11012,39 ],
        [ 11013,40 ],
        [ 11014,41 ],
        [ 11015,42 ],
        [ 12011,43 ],
        [ 12012,44 ],
    ]
);

OrderDao.prototype.insertExternalOrderInTransaction = function (req) {
    let delivery_type = req.body.delivery_type,
        owner_name = req.body.owner_name,
        owner_mobile = req.body.owner_mobile,
        recipient_name = req.body.recipient_name,
        recipient_mobile = req.body.recipient_mobile,
        regionalism_id = req.body.regionalism_id,
        recipient_address = req.body.recipient_address || '',
        recipient_landmark = req.body.recipient_landmark || '',
        src_id = req.body.src_id >= 10000? srcIdMapping.get(req.body.src_id): req.body.src_id,
        pay_modes_id = req.body.pay_modes_id,
        pay_status = req.body.pay_status,
        delivery_time = req.body.delivery_time,
        invoice = req.body.invoice,
        remarks = req.body.remarks,
        total_amount = req.body.total_amount,
        total_original_price = req.body.total_original_price,
        total_discount_price = req.body.total_discount_price,
        products = req.body.products,
        greeting_card = req.body.greeting_card,
        // TODO: notice we assume all the coupon are numbers only
        coupon = req.body.coupon? toolUtils.extractNumbers(req.body.coupon): null,
        merchant_id = req.body.merchant_id;
    let recipientObj = {
        regionalism_id: regionalism_id,
        name: recipient_name,
        mobile: recipient_mobile,
        landmark: recipient_landmark,
        delivery_type: delivery_type,
        address: recipient_address,
        del_flag: del_flag.SHOW
    };

    return baseDao.trans().then(transaction => {
        return new Promise((resolve, reject)=> {
            // recipient
            transaction.query(this.base_insert_sql, [tables.buss_recipient, recipientObj], (recipient_err, info)=> {
                if (recipient_err || !info.insertId) {
                    return reject(recipient_err || new TiramisuError(errorMessage.FAIL));
                }
                if (toolUtils.isEmptyArray(products)) {
                    return reject(new TiramisuError(errorMessage.ORDER_NO_PRODUCT));
                }
                let recipientId = info.insertId;
                let orderObj = {
                    //office_id : req.session.user.office_id,
                    recipient_id: recipientId,
                    // force not setting the delivery station id
                    delivery_id: -1,
                    src_id: src_id,
                    pay_modes_id: pay_modes_id,
                    pay_status: pay_status,
                    owner_name: owner_name,
                    owner_mobile: owner_mobile,
                    is_submit: 0,
                    is_deal: 1,
                    status: Constant.OS.UNTREATED,
                    remarks: remarks,
                    invoice: invoice,
                    delivery_time: delivery_time,
                    total_amount: total_amount,
                    total_original_price: total_original_price,
                    total_discount_price: total_discount_price,
                    greeting_card: greeting_card,
                    coupon : coupon,
                    merchant_id : merchant_id,
                    created_by: req.session.user.id
                };
                // order
                transaction.query(this.base_insert_sql,[tables.buss_order,systemUtils.assembleInsertObj(req,orderObj)],(order_err,result)=>{
                    if (order_err && order_err.code === 'ER_DUP_ENTRY') {
                        return reject(new TiramisuError(errorMessage.DUPLICATE_EXTERNAL_ORDER, orderObj.merchant_id));
                    }
                    if (order_err || !result.insertId) {
                        return reject(order_err || new TiramisuError(errorMessage.FAIL));
                    }
                    let orderId = result.insertId, params = [];
                    products.forEach((curr) => {
                        let arr = [];
                        arr.push(orderId);
                        arr.push(curr.sku_id);
                        arr.push(curr.num);
                        arr.push(curr.choco_board || '');
                        arr.push(curr.greeting_card || '');
                        arr.push(curr.atlas);
                        arr.push(curr.custom_name || '');
                        arr.push(curr.custom_desc || '');
                        arr.push(curr.discount_price || 0);
                        arr.push(curr.amount || 0);
                        params.push(arr);
                    });
                    let order_fulltext_obj = {
                        order_id: orderId,
                        show_order_id: systemUtils.getShowOrderId(orderId, new Date()),
                        owner_name: systemUtils.encodeForFulltext(owner_name),
                        owner_mobile: owner_mobile,
                        recipient_name: systemUtils.encodeForFulltext(recipient_name),
                        recipient_mobile: recipient_mobile,
                        recipient_address: systemUtils.encodeForFulltext(recipient_address),
                        landmark: systemUtils.encodeForFulltext(recipient_landmark),
                        merchant_id : merchant_id
                    };
                    let order_history_obj = {
                        order_id: orderId,
                        option: '添加订单',
                        created_by : req.session.user.id
                    };
                    let skus_sql = "insert into " + tables.buss_order_sku + "(order_id,sku_id,num,choco_board,greeting_card,atlas,custom_name,custom_desc,discount_price,amount) values ?";
                    transaction.query(skus_sql, [params], err => {
                      if (err) return reject(err);
                      transaction.query(this.base_insert_sql, [tables.buss_order_fulltext, order_fulltext_obj], err => {
                        if (err) return reject(err);
                        transaction.query(this.base_insert_sql, [tables.buss_order_history, systemUtils.assembleInsertObj(req, order_history_obj, true)], err => {
                          if (err) return reject(err);
                          resolve();
                        });
                      });
                    });
                });
            });
        }).then(ignore => {
          return new Promise((resolve, reject) => {
            transaction.commit(err => {
              transaction.release();
              if (err) return reject(err);
              resolve();
            });
          });
        }).catch(err => {
          return new Promise((resolve, reject) => {
            transaction.rollback(rollbackError => {
              transaction.release();
              if (rollbackError) return reject(rollbackError);
              reject(err);
            });
          });
        });
    });
};
/**
 * batch update order_fulltext records
 * @param orderIds
 * @param updateObj
 * @returns {Promise}
 */
OrderDao.prototype.batchUpdateOrderFulltext = function(orderIds,updateObj){
    let sql = "update ?? set ? where order_id in" + dbHelper.genInSql(orderIds);
    let params = [tables.buss_order_fulltext,updateObj];
    return baseDao.update(sql,params);
};

module.exports = OrderDao;