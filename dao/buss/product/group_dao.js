"use strict";

var _ = require('lodash');
var co = require('co');
var mysql = require('mysql');

const systemUtils = require('../../../common/SystemUtils');
const toolUtils = require('../../../common/ToolUtils');
var Constant = require('../../../common/Constant');
var baseDao = require('../../base_dao');
const del_flag = baseDao.del_flag;
const tables = require('../../../config').tables;


function GroupDao(table) {
    this.table = table || tables.buss_group_project;
    this.base_insert_sql = `INSERT INTO ?? SET ? `;
    this.base_update_sql = `UPDATE ?? SET ? `;
    this.base_select_sql = `SELECT * FROM ?? `;
}

GroupDao.prototype.findProduct = function (query, only_total) {
    if (!query) query = {};
    let page_no = query.page_no || 0;
    let page_size = query.page_size || 10;
    let sort_type = query.sort_type || 'DESC';

    let sql = `SELECT bp.id FROM ?? bps `;
    let params = [tables.buss_product_sku];
    sql += `INNER JOIN ?? bp ON bp.id = bps.product_id `;
    params.push(tables.buss_product);
    sql += `INNER JOIN ?? bpc ON bpc.id = bp.category_id `;
    params.push(tables.buss_product_category);
    sql += `INNER JOIN ?? bos ON bos.id = bps.website AND bos.parent_id = 3 `;  //  团购网站
    params.push(tables.buss_order_src);
    if (query.province_id || query.city_id) {
        sql += `INNER JOIN ?? dr2 ON dr2.id = bps.regionalism_id `;
        params.push(tables.dict_regionalism);
        if (query.city_id) {
            sql += `LEFT JOIN ?? sc ON sc.regionalism_id = dr2.id `;
            params.push(tables.sys_city);
        }
    }
    if (query.province_id) {
        sql += `INNER JOIN ?? dr3 ON dr3.id = dr2.parent_id and dr3.parent_id = ? `;
        params.push(tables.dict_regionalism);
        params.push(query.province_id);
    }

    sql += `WHERE bps.del_flag = 1 `;
    if (query.id) {
        sql += `AND bps.id = ? `;
        params.push(query.id);
    }
    if (query.city_id) {
        if (query.is_standard_area == '1') {
            sql += `AND dr2.parent_id = ? `;
            params.push(query.city_id);
        } else {
            sql += `AND sc.is_city = 1 AND dr2.id = ? `;
            params.push(query.city_id);
        }
    }
    if (query.category_id) {
        sql += `AND (bp.category_id = ? OR bpc.parent_id = ?) `;
        params.push(query.category_id);
        params.push(query.category_id);
    }
    if (query.src_id) {
        sql += `AND (bos.id = ? OR bos.parent_id = ?) `;
        params.push(query.src_id);
        params.push(query.src_id);
    }
    if (query.keywords) {
        sql += `AND bp.name LIKE ? `;
        params.push(`%${query.keywords}%`);
    }

    sql += `GROUP BY bp.id ${sort_type} LIMIT ${page_no * page_size},${page_size} `;

    return co(function*() {
        let ids = yield baseDao.select(sql, params);
        let _res = {
            total: ids.length,
            page_no: page_no,
            page_size: page_size,
            list: []
        };
        if (only_total) {
            _res.list = ids;
            return _res;
        }
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i].id;
            let info = yield GroupDao.prototype.findProductById(id);
            if (!info) continue;
            info.sku_id = info.id;
            info.spu_id = info.product_id;
            _res.list.push(info);
        }
        return _res;
    });
};

GroupDao.prototype.findProductById = function (product_id) {
    let columns = [
        'bps.id AS sku_id',
        'bps.size AS sku_size',
        'bps.price AS sku_price',
        'bp.id AS product_id',
        'bp.name AS product_name',
        'bp.category_id',
        'bpc.name AS category_name',
        'bpc.parent_id AS category_parent_id',
        'bpc2.name AS category_parent_name'
    ];
    let sql = `SELECT ${columns.join()} FROM ?? bps `;
    let params = [tables.buss_product_sku];
    sql += `INNER JOIN ?? bp ON bp.id = bps.product_id `;
    params.push(tables.buss_product);
    sql += `INNER JOIN ?? bpc ON bpc.id = bp.category_id `;
    params.push(tables.buss_product_category);
    sql += `LEFT JOIN ?? bpc2 ON bpc2.id = bpc.parent_id `;
    params.push(tables.buss_product_category);
    sql += `INNER JOIN ?? bos ON bos.id = bps.website AND bos.parent_id = 3 `;  //  团购网站
    params.push(tables.buss_order_src);
    sql += `LEFT JOIN ?? bos2 ON bos2.id = bos.parent_id `;  //  团购网站
    params.push(tables.buss_order_src);

    sql += `WHERE bps.del_flag = ${del_flag.SHOW} `;
    sql += `AND bp.id = ? `;
    params.push(product_id);

    return co(function*() {
        let _res = {};
        let info = yield baseDao.select(sql, params);
        if (!info || info.length == 0) return Promise.resolve(null);

        _res = _.pick(info[0], [
            'product_id',
            'product_name',
            'category_id',
            'category_name',
            'category_parent_id',
            'category_parent_name'
        ]);
        _res.sku_list = [];
        info.forEach(curr=> {
            let tmp = {};
            tmp.id = curr.sku_id;
            tmp.price = curr.sku_price;
            tmp.size = curr.sku_size;
            _res.sku_list.push(tmp);
        });
        return _res;
    });
};

GroupDao.prototype.findSku = function (query, only_total) {
    if (!query) query = {};
    let page_no = query.page_no || 0;
    let page_size = query.page_size || 10;
    let sort_type = query.sort_type || 'DESC';

    let sql = `SELECT bps.id, bps.created_time FROM ?? bps `;
    let params = [tables.buss_product_sku];
    sql += `INNER JOIN ?? bp ON bp.id = bps.product_id `;
    params.push(tables.buss_product);
    sql += `INNER JOIN ?? bpc ON bpc.id = bp.category_id `;
    params.push(tables.buss_product_category);
    sql += `INNER JOIN ?? bos ON bos.id = bps.website AND bos.parent_id = 3 `;  //  团购网站
    params.push(tables.buss_order_src);
    if (query.province_id || query.city_id) {
        sql += `INNER JOIN ?? dr2 ON dr2.id = bps.regionalism_id `;
        params.push(tables.dict_regionalism);
        if (query.city_id) {
            sql += `LEFT JOIN ?? sc ON sc.regionalism_id = dr2.id `;
            params.push(tables.sys_city);
        }
    }
    if (query.province_id) {
        sql += `INNER JOIN ?? dr3 ON dr3.id = dr2.parent_id and dr3.parent_id = ? `;
        params.push(tables.dict_regionalism);
        params.push(query.province_id);
    }

    sql += `WHERE bps.del_flag = 1 `;
    if (query.id) {
        sql += `AND bps.id = ? `;
        params.push(query.id);
    }
    if (query.city_id) {
        if (query.is_standard_area == '1') {
            sql += `AND dr2.parent_id = ? `;
            params.push(query.city_id);
        } else {
            sql += `AND sc.is_city = 1 AND dr2.id = ? `;
            params.push(query.city_id);
        }
    }
    if (query.category_id) {
        sql += `AND (bp.category_id = ? OR bpc.parent_id = ?) `;
        params.push(query.category_id);
        params.push(query.category_id);
    }
    if (query.src_id) {
        sql += `AND (bos.id = ? OR bos.parent_id = ?) `;
        params.push(query.src_id);
        params.push(query.src_id);
    }
    if (query.keywords) {
        sql += `AND bp.name LIKE ? `;
        params.push(`%${query.keywords}%`);
    }

    sql += `ORDER BY bp.created_time ${sort_type} LIMIT ${page_no * page_size},${page_size} `;

    return co(function*() {
        let ids = yield baseDao.select(sql, params);
        let _res = {
            total: ids.length,
            page_no: page_no,
            page_size: page_size,
            list: []
        };
        if (only_total) {
            _res.list = ids;
            return _res;
        }
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i].id;
            let info = yield GroupDao.prototype.findSkuById(id);
            if (!info || info.length == 0) continue;
            info[0].sku_id = info[0].id;
            info[0].spu_id = info[0].product_id;
            _res.list.push(info[0]);
        }
        return _res;
    });
};

GroupDao.prototype.findSkuById = function (sku_id) {
    let columns = [
        'bps.*',
        'bos.id AS src_id',
        'bos.name AS src_name',
        'bos.parent_id AS src_parent_id',
        'bos2.name AS src_parent_name',
        'bgp.id AS group_project_id',
        'bp.id AS product_id',
        'bp.name AS product_name',
        'bp.category_id',
        'bpc.name AS category_name',
        'bpc.parent_id AS category_parent_id',
        'bpc2.name AS category_parent_name',
        'dr.level_type AS city_level_type',
        'dr.id AS city_id',
        'dr.name AS city_name',
        'IF(dr.level_type = 2, dr2.id, dr3.id) AS province_id',
        'IF(dr.level_type = 2, dr2.name, dr3.name) AS province_name'
    ];
    let sql = `SELECT ${columns.join()} FROM ?? bps `;
    let params = [tables.buss_product_sku];
    sql += `INNER JOIN ?? bp ON bp.id = bps.product_id `;
    params.push(tables.buss_product);
    sql += `INNER JOIN ?? bpc ON bpc.id = bp.category_id `;
    params.push(tables.buss_product_category);
    sql += `LEFT JOIN ?? bpc2 ON bpc2.id = bpc.parent_id `;
    params.push(tables.buss_product_category);
    sql += `INNER JOIN ?? bos ON bos.id = bps.website `;  //  团购网站
    params.push(tables.buss_order_src);
    sql += `LEFT JOIN ?? bos2 ON bos2.id = bos.parent_id `;
    params.push(tables.buss_order_src);
    sql += `LEFT JOIN ?? bgp ON FIND_IN_SET(bps.id, bgp.skus) AND bps.del_flag = ${del_flag.SHOW} `;
    params.push(tables.buss_group_project);

    sql += `INNER JOIN ?? dr on dr.id = bgp.regionalism_id `;
    params.push(tables.dict_regionalism);
    sql += `INNER JOIN ?? dr2 on dr2.id = dr.parent_id `;
    params.push(tables.dict_regionalism);
    sql += `INNER JOIN ?? dr3 on dr3.id = dr2.parent_id `;
    params.push(tables.dict_regionalism);

    sql += `WHERE bps.del_flag = ${del_flag.SHOW} `;
    sql += `AND bps.id = ? `;
    params.push(sku_id);

    sql += `GROUP BY bps.id `;

    return baseDao.select(sql, params);
};

GroupDao.prototype.insertSku = function (sku_obj) {
    return baseDao.insert(this.base_insert_sql, [tables.buss_product_sku, sku_obj]);
};

GroupDao.prototype.updateSku = function (sku_id, sku_obj) {
    let sql = `${this.base_update_sql} WHERE id = ? `;
    return baseDao.update(sql, [tables.buss_product_sku, sku_obj, sku_id]);
};


GroupDao.prototype.findProject = function (query, only_total) {
    if (!query) query = {};
    let page_no = query.page_no || 0;
    let page_size = query.page_size || 10;
    let sort_type = query.sort_type || 'DESC';

    let sql = `SELECT bgp.id, bgp.created_time FROM ?? bgp `;
    let params = [tables.buss_group_project];
    sql += `LEFT JOIN ?? bos ON bos.id = bgp.src_id `;
    params.push(tables.buss_order_src);
    if (query.province_id || query.city_id) {
        sql += `INNER JOIN ?? dr2 on dr2.id = bgp.regionalism_id `;
        params.push(tables.dict_regionalism);
        if (query.city_id) {
            sql += `LEFT JOIN ?? sc on sc.regionalism_id = dr2.id `;
            params.push(tables.sys_city);
        }
    }
    if (query.province_id) {
        sql += `INNER JOIN ?? dr3 on dr3.id = dr2.parent_id and dr3.parent_id = ? `;
        params.push(tables.dict_regionalism);
        params.push(query.province_id);
    }

    sql += `WHERE bgp.del_flag = 1 `;
    if (query.id) {
        sql += `AND bgp.id = ? `;
        params.push(query.id);
    }
    if (query.city_id) {
        if (query.is_standard_area == '1') {
            sql += `AND dr2.parent_id = ? `;
            params.push(query.city_id);
        } else {
            sql += `AND sc.is_city = 1 AND dr2.id = ? `;
            params.push(query.city_id);
        }
    }
    if (query.online) {
    }
    if (query.src_id) {
        sql += `AND (bos.id = ? OR bos.parent_id = ?) `;
        params.push(query.src_id);
        params.push(query.src_id);
    }
    if (query.keywords) {
        sql += `AND bgp.name LIKE ? `;
        params.push(`%${query.keywords}%`);
    }

    sql += `ORDER BY bgp.created_time ${sort_type} LIMIT ${page_no * page_size},${page_size} `;

    return co(function*() {
        let ids = yield baseDao.select(sql, params);
        let _res = {
            total: ids.length,
            page_no: page_no,
            page_size: page_size,
            list: []
        };
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i].id;
            let info = yield GroupDao.prototype.findProjectById(id);
            if (info) {
                _res.list.push(info);
            }
        }
        return _res;
    });
};

GroupDao.prototype.findProjectById = function (project_id) {
    let columns = [
        'bgp.*',
        'bos.name AS src_name',
        'bps.id AS sku_id',
        'bps.size',
        'bps.price',
        'bp.name AS product_name',
        'bpc.name AS category_name',
        'dr.id AS city_id',
        'dr.name AS city_name',
        'dr.level_type AS city_level_type',
        'dr.parent_id AS city_parent_id',
        'dr2.name AS city_parent_name',
        'dr2.parent_id AS city_parent_parent_id',
        'dr3.name AS city_parent_parent_name',
        'dr.merger_name'
    ];
    let sql = `SELECT ${columns.join()} FROM ?? bgp `;
    let params = [tables.buss_group_project];
    sql += `LEFT JOIN ?? sc ON sc.regionalism_id = bgp.regionalism_id `;
    params.push(tables.sys_city);

    sql += `LEFT JOIN ?? bps ON bps.del_flag = ${del_flag.SHOW} AND FIND_IN_SET(bps.id, bgp.skus) `;
    params.push(tables.buss_product_sku);
    sql += `LEFT JOIN ?? bp ON bp.id = bps.product_id `;
    params.push(tables.buss_product);
    sql += `LEFT JOIN ?? bpc ON bpc.id = bp.category_id `;
    params.push(tables.buss_product_category);

    sql += `LEFT JOIN ?? bos ON bos.id = bgp.src_id `;
    params.push(tables.buss_order_src);

    sql += `INNER JOIN ?? dr on dr.id = bgp.regionalism_id `;
    params.push(tables.dict_regionalism);
    sql += `INNER JOIN ?? dr2 on dr2.id = dr.parent_id `;
    params.push(tables.dict_regionalism);
    sql += `INNER JOIN ?? dr3 on dr3.id = dr2.parent_id `;
    params.push(tables.dict_regionalism);

    sql += `WHERE bgp.del_flag = ${del_flag.SHOW} `;
    sql += `AND bgp.id = ? `;
    params.push(project_id);

    return co(function*() {
        let _res = {};
        let info = yield baseDao.select(sql, params);
        if (!info || info.length == 0) return Promise.resolve(null);

        _res = _.pick(info[0], [
            'id',
            'name',
            'start_time',
            'end_time',
            'src_id',
            'src_name',
            'province_id',
            'province_name',
            'city_id',
            'city_name',
            'regionalism_id',
            'regionalism_name'
        ]);
        if (info[0].city_level_type == 2) {
            _res.province_id = info[0].city_parent_id;
            _res.province_name = info[0].city_parent_name;
        } else {
            _res.province_id = info[0].city_parent_parent_id;
            _res.province_name = info[0].city_parent_parent_name;
        }
        _res.products = [];
        info.forEach(curr=> {
            let tmp = {};
            tmp.id = curr.sku_id;
            tmp.product_name = curr.product_name;
            tmp.category_name = curr.category_name;
            tmp.price = curr.price;
            tmp.size = curr.size;
            _res.products.push(tmp);
        });
        return _res;
    });
};

GroupDao.prototype.insertProject = function (project_obj) {
    return baseDao.insert(this.base_insert_sql, [tables.buss_group_project, project_obj]);
};

GroupDao.prototype.updateProject = function (project_id, project_obj) {
    let sql = `${this.base_update_sql} WHERE id = ? `;
    return baseDao.update(sql, [tables.buss_group_project, project_obj, project_id]);
};


module.exports = new GroupDao();
