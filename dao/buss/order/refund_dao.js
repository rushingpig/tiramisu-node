"use strict";

var _ = require('lodash');
var co = require('co');

const systemUtils = require('../../../common/SystemUtils');
var Constant = require('../../../common/Constant');
var baseDao = require('../../base_dao');
const del_flag = baseDao.del_flag;
const tables = require('../../../config').tables;

const HISTORY_TYPE = Constant.HISTORY_TYPE.REFUND;

function RefundDao(table) {
    this.table = table || tables.buss_refund;
    this.base_insert_sql = `INSERT INTO ?? SET ? `;
    this.base_update_sql = `UPDATE ?? SET ? `;
    this.base_select_sql = `SELECT * FROM ?? `;
}

RefundDao.prototype.insertHistory = function (history_obj) {
    let _h = Object.assign({type: HISTORY_TYPE}, history_obj);
    return baseDao.insert(this.base_insert_sql, [tables.sys_history, _h]);
};

// RefundDao.prototype.batchInsertHistory = function (history_params) {
//     let _h = history_params.map(curr=> {
//         return curr.unshift(HISTORY_TYPE);
//     });
//     let sql = `INSERT INTO ?? (type,bind_id,option,created_by,created_time) VALUES ? `;
//     return baseDao.batchInsert(sql, [tables.sys_history, _h]);
// };

RefundDao.prototype.findHistory = function (query) {
    if (!query) query = {};
    let page_no = query.page_no || 0;
    let page_size = query.page_size || 10;
    let sort_type = query.sort_type || 'DESC';
    let columns = [
        'sh.option',
        'sh.remarks',
        'sh.created_time',
        'su.name AS created_by'
    ];
    let sql_info = `SELECT ${columns.join()} FROM `;
    let sql = `?? sh `;
    let params = [tables.sys_history];
    sql += `LEFT JOIN ?? su ON su.id = sh.created_by `;
    params.push(tables.sys_user);
    sql += `WHERE sh.type = ? AND sh.del_flag = ? AND sh.bind_id = ? `;
    params.push(HISTORY_TYPE);
    params.push(del_flag.SHOW);
    params.push(query.refund_id);

    return co(function *() {
        let total_sql = `SELECT count(*) AS total FROM ` + sql;
        let _res = {};
        let total = yield baseDao.select(total_sql, params);
        _res.total = total.total;

        sql += `ORDER BY created_time ${sort_type} LIMIT ${page_no * page_size},${page_size} `;
        _res.list = yield baseDao.select(sql_info + sql, params);
        _res.page_no = page_no;
        _res.page_size = page_size;
        return _res;
    });
};

RefundDao.prototype.findHistoryById = function (refund_id) {
    let sql = `SELECT * FROM ?? br WHERE type = ? AND del_flag = ? AND bind_id = ? `;
    let params = [tables.sys_history, HISTORY_TYPE, del_flag.SHOW, refund_id];
    return baseDao.select(sql, params);
};

RefundDao.prototype.insertRefund = function (refund_obj) {
    return baseDao.insert(this.base_insert_sql, [this.table, refund_obj]);
};

RefundDao.prototype.updateRefund = function (refund_id, refund_obj) {
    let sql = `${this.base_update_sql} WHERE id = ? `;
    return baseDao.insert(sql, [this.table, refund_obj, refund_id]);
};

RefundDao.prototype.deleteRefund = function (refund_id) {
    return RefundDao.prototype.updateRefund(refund_id, {status: 'CANCEL'});
};

RefundDao.prototype.findLastRefundByOrderId = function (order_id) {
    let sql = `SELECT * FROM ?? bre WHERE order_id = ? ORDER BY created_time DESC `;
    let params = [tables.buss_refund, order_id];
    return co(function *() {
        let results = yield baseDao.select(sql, params);
        if (!results || results.length == 0) return Promise.resolve(null);
        return Promise.resolve(results[0]);
    });
};

RefundDao.prototype.findOptionByOrderId = function (order_id) {
    let columns = [
        'bo.bind_order_id',
        'bo.origin_order_id',
        'bo.created_time AS order_created_time',
        'bo.owner_name',
        'bo.owner_mobile',
        'bo.total_amount',
        'bo.total_discount_price',
        'bo.payment_amount',
        'br.name AS recipient_name',
        'br.mobile AS recipient_mobile',
        'bre.status AS refund_status'
    ];
    let sql = `SELECT ${columns.join()} FROM ?? bo `;
    let params = [tables.buss_order];
    sql += `INNER JOIN ?? br ON br.id = bo.recipient_id `;
    params.push(tables.buss_recipient);
    sql += `LEFT JOIN ?? bre ON bre.order_id = bo.id AND FIND_IN_SET(bre.status, ? ) `;
    params.push(tables.buss_refund);
    params.push(['UNTREATED', 'TREATED', 'REVIEWED'].join());  // 不稳定状态

    sql += `WHERE bo.id = ? `;
    params.push(order_id);

    return co(function *() {
        let result = yield baseDao.select(sql, params);
        if (!result || result.length == 0) return null;
        result = result[0];
        let _res = _.omit(result, ['total_amount', 'total_discount_price']);
        if (_res.bind_order_id == 0) {
            delete _res.bind_order_id
        }
        if (_res.payment_amount === null) {
            let _p = result.total_discount_price || 0;
            let _a = result.total_amount || 0;
            _res.payment_amount = _p - _a;
        }
        return _res;
    });
};

RefundDao.prototype.findRefund = function (query) {
    if (!query) query = {};
    let page_no = query.page_no || 0;
    let page_size = query.page_size || 10;
    let sort_type = query.sort_type || 'DESC';
    let columns = [
        'bre.*',
        'su.name AS created_by',
        'bre.created_time',
        'su2.name As updated_by',
        'bre.updated_time',
        'bo.owner_name',
        'bo.owner_mobile',
        'bo.merchant_id',
        'bo.id AS order_id',
        'bo.created_time AS order_created_time',
        'bo2.id AS bind_order_id',
        'bo2.created_time AS bind_created_time'
    ];
    let sql = `SELECT ${columns.join()} FROM ?? bre `;
    let params = [tables.buss_refund];
    sql += `INNER JOIN ?? bo ON bo.id = bre.order_id `;
    params.push(tables.buss_order);
    sql += `LEFT JOIN ?? su ON su.id = bre.created_by `;
    params.push(tables.sys_user);
    sql += `LEFT JOIN ?? su2 ON su2.id = bo.updated_by `;
    params.push(tables.sys_user);
    sql += `LEFT JOIN ?? bo2 ON bo2.id = bo.bind_order_id `;
    params.push(tables.buss_order);
    sql += `INNER JOIN ?? br on br.id = bo.recipient_id `;
    params.push(tables.buss_recipient);
    if (query.province_id || query.city_id) {
        sql += `INNER JOIN ?? dr2 on dr2.id = br.regionalism_id `;
        params.push(tables.dict_regionalism);
        if (query.city_id) {
            sql += `left join ?? sc on sc.regionalism_id = dr2.id `;
            params.push(tables.sys_city);
        }
    }
    if (query.province_id) {
        sql += `INNER JOIN ?? dr3 on dr3.id = dr2.parent_id and dr3.parent_id = ? `;
        params.push(tables.dict_regionalism);
        params.push(query.province_id);
    }

    sql += `WHERE 1 = 1 `;
    if (query.begin_time) {
        sql += `AND  bre.created_time >= ? `;
        params.push(query.begin_time + ' 00:00~00:00');
    }
    if (query.end_time) {
        sql += `AND  bre.created_time <= ? `;
        params.push(query.end_time + ' 24:00~24:00');
    }
    if (query.is_urgent !== undefined) {
        sql += `AND  bre.is_urgent <= ? `;
        params.push(query.is_urgent);
    }
    if (query.way !== undefined) {
        sql += `AND  bre.way <= ? `;
        params.push(query.way);
    }
    if (query.status !== undefined) {
        sql += `AND  bre.status <= ? `;
        params.push(query.status);
    }
    if (query.keywords !== undefined) {
        sql += `AND  bre.order_id LIKE ? `;
        params.push(`%${systemUtils.getDBOrderId(query.keywords)}%`);
    }

    if (query.city_id) {
        if (query.is_standard_area == '1') {
            sql += `AND dr2.parent_id = ? `;
            params.push(query.city_id);
        } else {
            sql += `AND ((sc.is_city = 1 AND dr2.id = ? ) OR (sc.is_city = 0 AND dr2.parent_id = ? ) OR (dr2.id = ? )) `;
            params.push(query.city_id);
            params.push(query.city_id);
            params.push(query.city_id.toString().replace(/\d{2}$/, '99'));
        }
    }

    return co(function *() {
        let count_sql = sql.replace(/^SELECT .* FROM/, `SELECT count(*) AS total FROM`);
        let _res = {};
        let total = yield baseDao.select(count_sql, params);
        _res.total = total[0].total;

        sql += `ORDER BY bre.created_time ${sort_type} LIMIT ${page_no * page_size},${page_size} `;
        _res.list = yield baseDao.select(sql, params);
        _res.page_no = page_no;
        _res.page_size = page_size;
        return _res;
    });
};

RefundDao.prototype.findRefundById = function (refund_id) {
    let columns = [
        'br.*',
        'bo.created_time AS order_created_time'
    ];
    let sql = `SELECT ${columns.join()} FROM ?? br `;
    let params = [tables.buss_refund];
    sql += `INNER JOIN ?? bo ON bo.id = br.order_id `;
    params.push(tables.buss_order);
    sql += `WHERE br.del_flag = ? AND br.id = ? `;
    params.push(del_flag.SHOW);
    params.push(refund_id);
    return baseDao.select(sql, params);
};

module.exports = new RefundDao();
