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
    let columns = [
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
        'bo.updated_time',
        'bo.greeting_card'
    ].join(',');
    let params = [];
    let sql = "select " + columns + " from ?? bo";
    params.push(tables.buss_order);
    if (query_data.keywords) {
        sql += " inner join ?? bof on match(bof.owner_name,bof.owner_mobile,bof.recipient_name,bof.recipient_mobile,bof.recipient_address,bof.landmark,bof.show_order_id) against(? IN BOOLEAN MODE) and bof.order_id = bo.id";
        params.push(tables.buss_order_fulltext);
        params.push('+' + query_data.keywords + '*');
    }
    sql += " left join ?? br on bo.recipient_id = br.id";
    params.push(tables.buss_recipient);
    if (query_data.city_id) {
        sql += " inner join ?? bds on bo.delivery_id = bds.id";
        sql += " inner join ?? dr2 on dr2.id = bds.regionalism_id and dr2.parent_id = ?";
        params.push(tables.buss_delivery_station);
        params.push(tables.dict_regionalism);
        params.push(query_data.city_id);
    }
    sql += " left join ?? bds2 on bo.delivery_id = bds2.id";
    params.push(tables.buss_delivery_station);
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
        sql += " and src_id = ?";
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
    if (query_data.deliveryman_id) {
        sql += " and bo.deliveryman_id = ?";
        params.push(query_data.deliveryman_id);
    }
    if (parseInt(query_data.print_status) === 1) {   //  查询已经打印过的订单
        sql += " and (bo.print_status = ? or bo.print_status = ?)";
        params.push(constant.PS.UNPRINTABLE);
        params.push(constant.PS.AUDITING);
    } else if (parseInt(query_data.is_print) === 0) {
        sql += " and (bo.print_status = ? or bo.print_status = ?)";
        params.push(constant.PS.PRINTABLE);
        params.push(constant.PS.REPRINTABLE);
    }

    if (parseInt(query_data.is_greeting_card) === 1) {
        sql += " and bo.greeting_card is not null";
    } else if (parseInt(query_data.is_greeting_card) === 0) {
        sql += " and bo.greeting_card is null";
    }

    if (query_data.order_ids && Array.isArray(query_data.order_ids)) {
        sql += " and bo.id in " + dbHelper.genInSql(query_data.order_ids);
    }
    switch (query_data.order_sorted_rules) {
        case constant.OSR.LIST:
            sql += " order by bo.created_time desc";
            break;
        case constant.OSR.DELIVERY_EXCHANGE:
            sql += " order by bo.delivery_time asc";
            break;
        case constant.OSR.DELIVER_LIST:
            sql += " order by bo.print_status asc,bo.delivery_time asc";
            break;
        case constant.OSR.RECEIVE_LIST:
            sql += " order by bo.delivery_time asc,bo.`status` asc";
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
        userId = order_obj.update_by,
        temp_connection = null;
    return baseDao.trans().then((tranconn) => {
        temp_connection = tranconn.connection;
        let trans = tranconn.trans;
        return new Promise((resolve, reject) => {
            trans.query(recipent_sql, recipient_params, (err_recipient) => {
                if (err_recipient) {
                    trans.rollback();
                    logger.error('when update recipient with recipient_id:[' + recipient_id + "] exception ==========>", err_recipient);
                    reject(err_recipient);
                    return;
                }
                trans.query(order_sql, order_params, (err_order) => {
                    if (err_order) {
                        trans.rollback();
                        logger.error('when update order with order_id:[' + order_id + "] exception ============>", err_order);
                        reject(err_order);
                        return;
                    }
                    let cb = function (err_cb) {
                        if (err_cb && trans.rollback) {
                            trans.rollback();
                            reject(err_cb);
                            return;
                        }
                    };
                    if (!toolUtils.isEmptyArray(add_skus)) {
                        add_skus.forEach((curr) => {
                            trans.query(this.base_insert_sql, [tables.buss_order_sku, curr], cb);
                        });
                    }
                    if (!toolUtils.isEmptyArray(delete_skuIds)) {
                        let order_sku_batch_update_sql = this.base_update_sql + " where order_id = ? and sku_id in " + dbHelper.genInSql(delete_skuIds);
                        trans.query(order_sku_batch_update_sql, [tables.buss_order_sku, {
                            del_flag: del_flag.HIDE,
                            updated_by: userId
                        }, order_id], cb);
                    }
                    if (!toolUtils.isEmptyArray(update_skus)) {
                        update_skus.forEach((curr) => {
                            let order_sku_update_sql = this.base_update_sql + " where order_id = ? and sku_id = ?";
                            let order_sku_update_params = [tables.buss_order_sku, curr, order_id, curr.sku_id];
                            trans.query(order_sku_update_sql, order_sku_update_params, cb);
                        });
                    }
                    trans.commit(() => {
                        temp_connection.release();
                        resolve();
                    });
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
        total_original_price = req.body.original_price,
        total_discount_price = req.body.discount_price,
        products = req.body.products,
        prefix_address = req.body.prefix_address,
        greeting_card = req.body.greeting_card;
    let recipientObj = {
        regionalism_id: regionalism_id,
        name: owner_name,
        mobile: recipient_mobile,
        landmark: recipient_landmark,
        delivery_type: delivery_type,
        address: recipient_address,
        del_flag: del_flag.SHOW
    };
    let trans, connection;

    return baseDao.trans().then((tranconn)=> {
        trans = tranconn.trans;
        connection = tranconn.connection;
        return new Promise((resolve, reject)=> {
            let cb = function (err_cb) {
                if (err_cb && trans.rollback) {
                    trans.rollback();
                    reject(err_cb);
                    return;
                }
            };
            trans.query(this.base_insert_sql, [tables.buss_recipient, recipientObj], (recipient_err, info)=> {
                if (recipient_err || !info.insertId) {
                    if (trans.rollback) trans.rollback();
                    reject(recipient_err || new TiramisuError(errorMessage.FAIL));
                    return;
                }
                if (toolUtils.isEmptyArray(products)) {
                    reject(new TiramisuError(errorMessage.ORDER_NO_PRODUCT));
                    return;
                }
                let recipientId = info.insertId;
                let orderObj = {
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
                    greeting_card: greeting_card
                };
                trans.query(this.base_insert_sql,[tables.buss_order,systemUtils.assembleInsertObj(req,orderObj)],(order_err,result)=>{
                    if (order_err || !result.insertId) {
                        if (trans.rollback) trans.rollback();
                        reject(order_err || new TiramisuError(errorMessage.FAIL));
                        return;
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
                    trans.query(skus_sql, [params], cb);
                    trans.query(this.base_insert_sql, [tables.buss_order_fulltext, order_fulltext_obj], cb);
                    trans.query(this.base_insert_sql, [tables.buss_order_history, systemUtils.assembleInsertObj(req, order_history_obj, true)], cb);
                    trans.commit(()=> {
                        connection.release();
                        resolve();
                    });
                });

            });
        });

    });

};
module.exports = OrderDao;

