"use strict";

var _ = require('lodash');
var co = require('co');

var baseDao = require('../base_dao');
const del_flag = baseDao.del_flag;
const is_usable = baseDao.is_usable;
const tables = require('../../config').tables;

const LEVEL_PROVINCES = 1;
const LEVEL_CITY = 2;
const LEVEL_COUNTY = 3;

function CityDao(table) {
    this.table = table || tables.sys_city;
    this.base_insert_sql = `INSERT INTO ?? SET ? `;
    this.base_update_sql = `UPDATE ?? SET ? `;
    this.base_select_sql = `SELECT * FROM ?? `;
}

CityDao.prototype.findRegionalisms = function (query) {
    let columns = [
        'dr.id',
        'dr.name',
        'dr.level_type',
        'dr.parent_id',
        'dr.pinying AS pinyin',
        'sc.is_city'
    ];
    let sql = `SELECT ${columns.join()} FROM ?? dr `;
    let params = [tables.dict_regionalism];
    sql += `LEFT JOIN ?? sc ON sc.regionalism_id = dr.id `;
    params.push(tables.sys_city);
    sql += `WHERE 1 = 1 `;
    sql += `AND dr.id NOT REGEXP '[0-9]{4}99' `;
    if (query.level_type) {
        sql += `AND dr.level_type = ? `;
        params.push(query.level_type);
    }
    if (query.parent_id) {
        sql += `AND dr.parent_id = ? `;
        params.push(query.parent_id);
    }

    return baseDao.select(sql, params);
};

CityDao.prototype.count = function (query) {
    let sql = `SELECT DISTINCT sc.regionalism_id FROM ?? sc `;
    let params = [tables.sys_city];
    sql += `INNER JOIN ?? dr ON dr.id = sc.regionalism_id `;
    params.push(tables.dict_regionalism);
    sql += `LEFT JOIN ?? dr2 ON dr2.id = dr.parent_id AND dr2.level_type = ${LEVEL_CITY} `;
    params.push(tables.dict_regionalism);

    sql += `WHERE sc.is_city IS NOT NULL `;
    if (query.city_name) {
        sql += `AND dr.name LIKE ? `;
        params.push(`%${query.city_name}%`);
    }
    if (query.is_county !== undefined) {
        sql += `AND dr.level_type = ? `;
        params.push(query.is_county ? LEVEL_COUNTY : LEVEL_CITY);
    }
    if (query.province_id) {
        sql += `AND ( `;
        sql += `(dr.level_type = ${LEVEL_CITY} AND dr.parent_id = ? ) OR (dr.level_type = ${LEVEL_COUNTY} AND dr2.parent_id = ? ) `;
        sql += `) `;
        params.push(query.province_id);
        params.push(query.province_id);
    }
    if (query.exist_second_order_time !== undefined) {
        sql += `AND dr.id `;
        if (query.exist_second_order_time) {
            sql += `IN `;
        } else {
            sql += `NOT IN `;
        }
        sql += `(SELECT DISTINCT dr3.parent_id FROM ?? sc2 `;
        params.push(tables.sys_city);
        sql += `INNER JOIN ?? dr3 ON dr3.id = sc2.regionalism_id AND dr3.level_type = ${LEVEL_COUNTY} `;
        params.push(tables.dict_regionalism);
        sql += `WHERE sc2.is_city IS NULL AND sc2.order_time IS NOT NULL ) `;
    }

    return baseDao.select(sql, params).then(result=> {
        return Promise.resolve(result.length);
    });
};

CityDao.prototype.isExist = function (city_id, is_city) {
    let sql = `SELECT sc.regionalism_id FROM ?? sc `;
    let params = [tables.sys_city];
    sql += `WHERE sc.regionalism_id = ? `;
    params.push(city_id);

    if (is_city !== undefined) {
        if (is_city) {
            sql += `AND sc.is_city IS NOT NULL `;
        } else {
            sql += `AND sc.is_city IS NULL `;
        }
    }

    return baseDao.select(sql, params).then(r=> {
        return Promise.resolve((r && r.length > 0));
    });
};

CityDao.prototype.findAllCity = function (query) {
    if (!query) query = {};
    let page_no = query.page_no || 0;
    let page_size = query.page_size || 10;
    return co(function *() {
        let sql = `SELECT DISTINCT sc.regionalism_id FROM ?? sc `;
        let params = [tables.sys_city];
        sql += `INNER JOIN ?? dr ON dr.id = sc.regionalism_id `;
        params.push(tables.dict_regionalism);
        sql += `LEFT JOIN ?? dr2 ON dr2.id = dr.parent_id AND dr2.level_type = ${LEVEL_CITY} `;
        params.push(tables.dict_regionalism);

        sql += `WHERE sc.is_city IS NOT NULL `;
        if (query.city_name) {
            sql += `AND dr.name LIKE ? `;
            params.push(`%${query.city_name}%`);
        }
        if (query.is_county !== undefined) {
            sql += `AND dr.level_type = ? `;
            params.push(query.is_county ? LEVEL_COUNTY : LEVEL_CITY);
        }
        if (query.province_id) {
            sql += `AND ( `;
            sql += `(dr.level_type = ${LEVEL_CITY} AND dr.parent_id = ? ) OR (dr.level_type = ${LEVEL_COUNTY} AND dr2.parent_id = ? ) `;
            sql += `) `;
            params.push(query.province_id);
            params.push(query.province_id);
        }
        if (query.exist_second_order_time !== undefined) {
            sql += `AND dr.id `;
            if (query.exist_second_order_time) {
                sql += `IN `;
            } else {
                sql += `NOT IN `;
            }
            sql += `(SELECT DISTINCT dr3.parent_id FROM ?? sc2 `;
            params.push(tables.sys_city);
            sql += `INNER JOIN ?? dr3 ON dr3.id = sc2.regionalism_id AND dr3.level_type = ${LEVEL_COUNTY} `;
            params.push(tables.dict_regionalism);
            sql += `WHERE sc2.is_city IS NULL AND sc2.order_time IS NOT NULL ) `;
        }
        sql += `LIMIT ${page_no * page_size},${page_size}  `;

        let city_ids = yield baseDao.select(sql, params);
        let ids = [];
        city_ids.forEach(curr=> {
            ids.push(curr.regionalism_id);
        });
        return CityDao.prototype.findCityById(ids, true);
    });
};

CityDao.prototype.findCityById = function (city_id, only_open) {
    let columns = [
        'sc.*',
        'dr.id',
        'dr.name',
        'dr.level_type',
        'dr.parent_id',

        'dr2.name AS parent_name',
        'dr3.name AS parent_parent_id',
        'dr3.name AS parent_parent_name'
    ];
    let sql = `SELECT ${columns.join()} FROM ?? sc `;
    let params = [tables.sys_city];
    if (only_open) {
        sql += `INNER JOIN ?? dr ON dr.id = sc.regionalism_id `;
    } else {
        sql += `RIGHT JOIN ?? dr ON dr.id = sc.regionalism_id `;
    }
    params.push(tables.dict_regionalism);
    sql += `LEFT JOIN ?? dr2 ON dr2.id = dr.parent_id `;
    params.push(tables.dict_regionalism);
    sql += `LEFT JOIN ?? dr3 ON dr3.id = dr2.parent_id `;
    params.push(tables.dict_regionalism);
    sql += `LEFT JOIN ?? sc2 ON sc2.regionalism_id = dr2.id AND dr2.level_type = ${LEVEL_CITY} `;
    params.push(tables.sys_city);
    if (_.isArray(city_id)) {
        sql += `WHERE FIND_IN_SET(dr.id, ? ) OR (FIND_IN_SET(dr2.id, ? ) AND sc.is_city IS NULL ) `;
        params.push(city_id.join(), city_id.join());
    } else {
        sql += `WHERE dr.id = ? OR ( dr2.id = ? AND dr.id NOT REGEXP '[0-9]{4}99' AND sc.is_city IS NULL ) `;
        params.push(city_id, city_id);
    }

    return baseDao.select(sql, params);
};

CityDao.prototype.updateCityInfo = function (city_id, city_obj, areas) {
    if (!areas) {
        let sql = `UPDATE ?? SET ? WHERE regionalism_id = ? `;
        let params = [tables.sys_city, city_obj, city_id];
        return baseDao.update(sql, params);
    }
    let trans;
    return co(function *() {
        trans = yield baseDao.trans(true);
        let sql;
        let params;

        // 清除旧的信息
        sql = `UPDATE ?? dr `;
        params = [tables.dict_regionalism];
        sql += `INNER JOIN ?? sc ON sc.regionalism_id = dr.id `;
        params.push(tables.sys_city);
        sql += `INNER JOIN ?? dr2 ON dr2.id = dr.parent_id AND dr2.level_type = ${LEVEL_CITY} `;
        params.push(tables.dict_regionalism);
        sql += `SET dr.del_flag = ${del_flag.HIDE} `;
        sql += `WHERE dr2.id = ? AND dr.id NOT REGEXP '[0-9]{4}99' AND sc.is_city IS NULL `;
        params.push(city_id, city_id);
        yield trans.query(sql, params);

        sql = `DELETE sc FROM ?? sc `;
        params = [tables.sys_city];
        sql += `INNER JOIN ?? dr ON dr.id = sc.regionalism_id `;
        params.push(tables.dict_regionalism);
        sql += `LEFT JOIN ?? dr2 ON dr2.id = dr.parent_id AND dr2.level_type = ${LEVEL_CITY} `;
        params.push(tables.dict_regionalism);
        sql += `WHERE dr.id = ? OR (dr2.id = ? AND sc.is_city IS NULL ) `;
        params.push(city_id, city_id);
        yield trans.query(sql, params);

        // 添加新信息
        let area_ids = [];
        areas.forEach(curr=> {
            area_ids.push(curr.regionalism_id);
        });
        sql = `UPDATE ?? dr `;
        params = [tables.dict_regionalism];
        sql += `INNER JOIN ?? dr2 ON dr2.id = dr.parent_id AND dr2.level_type = ${LEVEL_CITY} `;
        params.push(tables.dict_regionalism);
        sql += `SET dr.del_flag = ${del_flag.SHOW} `;
        sql += `WHERE dr.parent_id = ? AND FIND_IN_SET(dr.id, ? ) `;
        params.push(city_id, area_ids.join());
        yield trans.query(sql, params);
        yield addRegionalism(trans, city_id);

        areas.unshift(city_obj);
        for (let i = 0; i < areas.length; i++) {
            sql = `INSERT INTO ?? SET ? `;
            params = [tables.sys_city, areas[i]];
            yield trans.query(sql, params);
        }

        yield trans.commit();
    }).catch(err=> {
        if (trans && typeof trans.rollback == 'function') trans.rollback();
        return Promise.reject(err);
    });
};

CityDao.prototype.deleteCityInfo = function (city_id) {
    let trans;
    return co(function *() {
        trans = yield baseDao.trans(true);
        let sql;
        let params;

        // 清除旧的信息
        sql = `UPDATE ?? dr `;
        params = [tables.dict_regionalism];
        sql += `INNER JOIN ?? sc ON sc.regionalism_id = dr.id `;
        params.push(tables.sys_city);
        sql += `INNER JOIN ?? dr2 ON dr2.id = dr.parent_id AND dr2.level_type = ${LEVEL_CITY} `;
        params.push(tables.dict_regionalism);
        sql += `SET dr.del_flag = ${del_flag.HIDE} `;
        sql += `WHERE dr2.id = ? AND sc.is_city IS NULL `;
        params.push(city_id, city_id);
        yield trans.query(sql, params);
        yield delRegionalism(trans, city_id);

        sql = `DELETE sc FROM ?? sc `;
        params = [tables.sys_city];
        sql += `INNER JOIN ?? dr ON dr.id = sc.regionalism_id `;
        params.push(tables.dict_regionalism);
        sql += `LEFT JOIN ?? dr2 ON dr2.id = dr.parent_id AND dr2.level_type = ${LEVEL_CITY} `;
        params.push(tables.dict_regionalism);
        sql += `WHERE dr.id = ? OR (dr2.id = ? AND sc.is_city IS NULL ) `;
        params.push(city_id, city_id);
        yield trans.query(sql, params);

        yield trans.commit();
    }).catch(err=> {
        if (trans && typeof trans.rollback == 'function') trans.rollback();
        return Promise.reject(err);
    });
};

function setFlag(connection, ids, flag) {
    if (ids.length == 0) return Promise.resolve();
    let sql = `UPDATE ?? dr SET dr.del_flag = ? `;
    let params = [tables.dict_regionalism, flag];
    sql += `WHERE FIND_IN_SET(dr.id, ? ) `;
    params.push(ids.join());
    return connection.query(sql, params);
}

function addRegionalism(connection, id, reg_ids) {
    return co(function *() {
        if (!reg_ids) reg_ids = [];
        reg_ids.push(id);
        let sql = `SELECT dr.id, dr.parent_id, dr.del_flag FROM ?? dr WHERE dr.id = ? `;
        let params = [tables.dict_regionalism, id];
        let info = yield connection.query(sql, params);
        if (!info || !info[0]) return Promise.reject(`NOT FOUND regionalism_id = ${id}`);
        info = info[0];

        if (info.del_flag == 1 || info.parent_id == 0) {
            return yield setFlag(connection, reg_ids, del_flag.SHOW);
        } else {
            return yield addRegionalism(connection, info.parent_id, reg_ids);
        }
    });
}

function delRegionalism(connection, id, reg_ids) {
    return co(function *() {
        if (!reg_ids) reg_ids = [];
        let sql = `SELECT dr.id, dr.parent_id FROM ?? dr WHERE dr.parent_id = ? `;
        let params = [tables.dict_regionalism, id];
        sql += `AND dr.id NOT REGEXP '[0-9]{4}99' `;
        sql += `AND dr.del_flag = ${del_flag.SHOW} `;
        sql += `AND dr.id NOT IN ( ? )`;
        params.push(reg_ids.join());
        let info = yield connection.query(sql, params);
        if (!info) return Promise.reject(`NOT FOUND regionalism_id = ${id}`);

        if (info.length > 0) {
            return yield setFlag(connection, reg_ids, del_flag.HIDE);
        } else {
            reg_ids.push(id);
            let sql = `SELECT dr.parent_id FROM ?? dr WHERE dr.id = ? `;
            let params = [tables.dict_regionalism, id];
            let tmp = yield connection.query(sql, params);
            if (!tmp || !tmp[0]) return Promise.reject(`NOT FOUND regionalism_id = ${id}`);
            let parent_id = tmp[0].parent_id;
            if (parent_id == 0) {
                return setFlag(connection, reg_ids, del_flag.HIDE);
            } else {
                return yield delRegionalism(connection, parent_id, reg_ids);
            }
        }
    });
}

module.exports = new CityDao();

