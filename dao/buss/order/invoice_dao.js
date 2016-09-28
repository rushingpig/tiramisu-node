"use strict";

var _ = require('lodash');
var co = require('co');

const systemUtils = require('../../../common/SystemUtils');
const toolUtils = require('../../../common/ToolUtils');
var Constant = require('../../../common/Constant');
var baseDao = require('../../base_dao');
const del_flag = baseDao.del_flag;
const tables = require('../../../config').tables;

const HISTORY_COMPANY = Constant.HISTORY_TYPE.COMPANY;
const HISTORY_INVOICE = Constant.HISTORY_TYPE.INVOICE;

function InvoiceDao(table) {
    this.table = table || tables.buss_invoice;
    this.base_insert_sql = `INSERT INTO ?? SET ? `;
    this.base_update_sql = `UPDATE ?? SET ? `;
    this.base_select_sql = `SELECT * FROM ?? `;
}

function insertHistory(type) {
    return function (history_obj) {
        let _h = Object.assign({type: type}, history_obj);
        return baseDao.insert(this.base_insert_sql, [tables.sys_history, _h]);
    }
}

function findHistory(type) {
    return function findHistory(query) {
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
        params.push(type);
        params.push(del_flag.SHOW);
        params.push(query.bind_id);

        return co(function *() {
            let total_sql = `SELECT count(*) AS total FROM ` + sql;
            let _res = {};
            let total = yield baseDao.select(total_sql, params);
            _res.total = total[0].total;

            sql += `ORDER BY created_time ${sort_type} LIMIT ${page_no * page_size},${page_size} `;
            _res.list = yield baseDao.select(sql_info + sql, params);
            _res.page_no = page_no;
            _res.page_size = page_size;
            return _res;
        });
    }
}

InvoiceDao.prototype.insertCompanyHistory = insertHistory(HISTORY_COMPANY);
InvoiceDao.prototype.insertInvoiceHistory = insertHistory(HISTORY_INVOICE);
InvoiceDao.prototype.findCompanyHistory = findHistory(HISTORY_COMPANY);
InvoiceDao.prototype.findInvoiceHistory = findHistory(HISTORY_INVOICE);

InvoiceDao.prototype.findCompanyList = function (query) {
    if (!query) query = {};
    let page_no = query.page_no || 0;
    let page_size = query.page_size || 10;
    let sort_type = query.sort_type || 'DESC';
    let columns = [
        'bc.*',
        'su.name AS created_by',
        'su2.name AS updated_by',
        'bo.id AS order_id',
        'bo.created_time AS order_created_time'
    ];
    let sql_info = `SELECT ${columns.join()} FROM `;
    let sql = `?? bc `;
    let params = [tables.buss_company];
    sql += `LEFT JOIN ?? su ON su.id = bc.created_by `;
    params.push(tables.sys_user);
    sql += `LEFT JOIN ?? su2 ON su2.id = bc.updated_by `;
    params.push(tables.sys_user);
    sql += `LEFT JOIN ?? bi ON bi.company_id = bc.id `;
    params.push(tables.buss_invoice);
    sql += `LEFT JOIN ?? bo ON bo.id = bi.order_id `;
    params.push(tables.buss_order);
    sql += `WHERE bc.del_flag = ? `;
    params.push(del_flag.SHOW);

    if (query.is_review !== undefined) {
        sql += `AND bc.is_review = ? `;
        params.push(query.is_review);
    }
    if (query.keywords) {
        sql += `AND bc.name LIKE ? `;
        params.push(`%${query.keywords}%`);
    }

    sql += `GROUP BY bc.id `;

    return co(function *() {
        let total_sql = `SELECT count(*) AS total FROM ` + sql;
        let _res = {};
        let total = yield baseDao.select(total_sql, params);
        _res.total = total.length;

        sql += `ORDER BY bc.created_time ${sort_type} LIMIT ${page_no * page_size},${page_size} `;
        _res.list = yield baseDao.select(sql_info + sql, params);
        _res.page_no = page_no;
        _res.page_size = page_size;
        return _res;
    });
};

InvoiceDao.prototype.insertCompany = function (company_obj) {
    return baseDao.insert(this.base_insert_sql, [tables.buss_company, company_obj]);
};

InvoiceDao.prototype.updateCompany = function (company_id, company_obj) {
    let sql = `${this.base_update_sql} WHERE id = ? `;
    return baseDao.update(sql, [tables.buss_company, company_obj, company_id]);
};

InvoiceDao.prototype.findCompanyById = function (company_id) {
    let sql = `SELECT * FROM ?? WHERE del_flag = ? AND id = ? `;
    let params = [tables.buss_company, del_flag.SHOW, company_id];
    return baseDao.select(sql, params);
};

InvoiceDao.prototype.findInvoiceList = function (query,excel) {
    if (!query) query = {};
    let page_no = query.page_no || 0;
    let page_size = query.page_size || 10;
    let sort_type = query.sort_type || 'DESC';
    let columns = [
        'bi.*',
        'bo.status AS order_status',
        'bo.created_time AS order_created_time',
        'bo.owner_name',
        'bo.owner_mobile',
        'dr2.name AS city',
        'bds.name AS delivery_name',
        'bos.merge_name AS src_name',
        'su.name AS created_by',
        'su2.name AS updated_by',
        'dr3.merger_name'
    ];
    let sql_info = `SELECT ${columns.join()} FROM `;
    let sql = `?? bi `;
    let params = [tables.buss_invoice];
    sql += `INNER JOIN ?? bo ON bo.id = bi.order_id `;
    params.push(tables.buss_order);
    if (query.keywords) {
        let match = '';
        sql += `INNER JOIN ?? bof on match(bof.owner_name,bof.owner_mobile,bof.recipient_name,bof.recipient_mobile,bof.recipient_address,bof.landmark,bof.show_order_id,bof.merchant_id,bof.coupon,bof.recipient_mobile_suffix,bof.owner_mobile_suffix) against(? IN BOOLEAN MODE) and bof.order_id = bo.id `;
        params.push(tables.buss_order_fulltext);
        query.keywords.split(' ').forEach((curr) => {
            if (curr) {
                match += '+' + curr + ' ';
            }
        });
        params.push(match + '*');
    }
    sql += `LEFT JOIN ?? bds ON bds.id = bo.delivery_id `;
    params.push(tables.buss_delivery_station);
    sql += `LEFT JOIN ?? bos ON bos.id = bo.src_id `;
    params.push(tables.buss_order_src);
    sql += `LEFT JOIN ?? br ON br.id = bo.recipient_id `;
    params.push(tables.buss_recipient);
    sql += `INNER JOIN ?? dr on dr.id = br.regionalism_id `;
    params.push(tables.dict_regionalism);
    sql += `INNER JOIN ?? dr2 on dr2.id = dr.parent_id `;
    params.push(tables.dict_regionalism);
    sql += `LEFT JOIN ?? su ON su.id = bi.created_by `;
    params.push(tables.sys_user);
    sql += `LEFT JOIN ?? su2 ON su2.id = bi.updated_by `;
    params.push(tables.sys_user);
    sql += `INNER JOIN ?? dr3 on dr3.id = bi.regionalism_id `;
    params.push(tables.dict_regionalism);
    sql += `WHERE bi.del_flag = ? `;
    params.push(del_flag.SHOW);
    if (query.begin_time) {
        sql += `AND  bi.created_time >= ? `;
        params.push(query.begin_time + ' 00:00~00:00');
    }
    if (query.end_time) {
        sql += `AND  bi.created_time <= ? `;
        params.push(query.end_time + ' 24:00~24:00');
    }
    if (query.status !== undefined) {
        if (query.status == 'WAITING') {
            sql += `AND bi.status = ? AND bo.status <> ? `;
            params.push('UNTREATED');
            params.push('COMPLETED');
        } else {
            sql += `AND bi.status = ? AND bo.status = ? `;
            params.push(query.status);
            params.push('COMPLETED');
        }
    }
    if (query.order_status !== undefined) {
        sql += `AND  bo.status = ? `;
        params.push(query.order_status);
    }
    if (query.province_id) {
        sql += `AND dr2.parent_id = ? `;
        params.push(query.province_id);
    }
    if (query.city_id) {
        sql += `AND dr.parent_id = ? `;
        params.push(query.city_id);
    }
    if (query.company_id) {
        sql += `AND bi.company_id = ? `;
        params.push(query.company_id);
    }
    if (query.src_id) {
        sql += `AND (bo.src_id = ? OR bos.parent_id = ?) `;
        params.push(query.src_id);
        params.push(query.src_id);
    }
    if (query.delivery_id) {
        sql += `AND bi.delivery_id = ? `;
        params.push(query.delivery_id);
    }

    return co(function *() {
        let total_sql = `SELECT count(*) AS total FROM ` + sql;
        let _res = {};
        let total = yield baseDao.select(total_sql, params);
        _res.total = total[0].total;

        sql += `ORDER BY bi.created_time ${sort_type} LIMIT ${page_no * page_size},${page_size} `;
        if (excel){
            sql = sql_info + sql.substring(0,sql.indexOf('LIMIT'));
            return {sql,params};
        }
        _res.list = yield baseDao.select(sql_info + sql, params);
        _res.page_no = page_no;
        _res.page_size = page_size;
        return _res;
    });
};

InvoiceDao.prototype.findInvoiceByOrderId = function (order_id) {
    let sql = `SELECT * FROM ?? WHERE del_flag = 1 AND order_id = ? AND status <> 'CANCEL' `;
    let params = [tables.buss_invoice, order_id];
    return baseDao.select(sql, params);
};

InvoiceDao.prototype.insertInvoice = function (invoice_obj) {
    return baseDao.insert(this.base_insert_sql, [tables.buss_invoice, invoice_obj]);
};

InvoiceDao.prototype.updateInvoice = function (invoice_id, invoice_obj) {
    let sql = `${this.base_update_sql} WHERE id = ? `;
    return baseDao.update(sql, [tables.buss_invoice, invoice_obj, invoice_id]);
};

InvoiceDao.prototype.findInvoiceById = function (invoice_id) {
    let columns = [
        'bi.*',
        'dr2.id AS city_id',
        'dr2.parent_id AS province_id',
        'bo.status AS order_status',
        'bo.created_time AS order_created_time'
    ];
    let sql = `SELECT ${columns.join()} FROM ?? bi `;
    let params = [tables.buss_invoice];
    sql += `INNER JOIN ?? bo ON bo.id = bi.order_id `;
    params.push(tables.buss_order);
    sql += `INNER JOIN ?? dr on dr.id = bi.regionalism_id `;
    params.push(tables.dict_regionalism);
    sql += `INNER JOIN ?? dr2 on dr2.id = dr.parent_id `;
    params.push(tables.dict_regionalism);
    sql += `WHERE bi.del_flag = ? AND bi.id = ? `;
    params.push(del_flag.SHOW);
    params.push(invoice_id);

    return baseDao.select(sql, params);
};

module.exports = new InvoiceDao();
