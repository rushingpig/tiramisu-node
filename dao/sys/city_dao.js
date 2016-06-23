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
    let sql = `SELECT sc.regionalism_id FROM ?? sc `;
    let params = [tables.sys_city];
    sql += `INNER JOIN ?? dr ON dr.id = sc.regionalism_id `;
    params.push(tables.dict_regionalism);
    sql += `LEFT JOIN ?? dr2 ON dr2.id = dr.parent_id AND dr2.level_type = ${LEVEL_CITY} `;
    params.push(tables.dict_regionalism);

    sql += `WHERE sc.is_city IS NOT NULL `;
    if (query.name) {
        sql += `AND dr.name LINK ? `;
        params.push(`%${query.name}%`);
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
        let sql = `SELECT sc.regionalism_id FROM ?? sc `;
        let params = [tables.sys_city];
        sql += `INNER JOIN ?? dr ON dr.id = sc.regionalism_id `;
        params.push(tables.dict_regionalism);
        sql += `LEFT JOIN ?? dr2 ON dr2.id = dr.parent_id AND dr2.level_type = ${LEVEL_CITY} `;
        params.push(tables.dict_regionalism);

        sql += `WHERE sc.is_city IS NOT NULL `;
        if (query.name) {
            sql += `AND dr.name LINK ? `;
            params.push(`%${query.name}%`);
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
    let trans;
    return co(function *() {
        trans = yield baseDao.trans(true);
        let sql;
        let params;

        if (!areas) {
            sql = `UPDATE ?? SET ? WHERE regionalism_id = ? `;
            params = [tables.sys_city, city_obj, city_id];
            yield baseDao.delete(sql, params);
            yield trans.commit();
            return;
        }

        // 清除旧的信息
        sql = `UPDATE ?? dr `;
        params = [tables.dict_regionalism];
        sql += `INNER JOIN ?? sc ON sc.regionalism_id = dr.id `;
        params.push(tables.sys_city);
        sql += `INNER JOIN ?? dr2 ON dr2.id = dr.parent_id AND dr2.level_type = ${LEVEL_CITY} `;
        params.push(tables.dict_regionalism);
        sql += `SET dr.del_flag = ${del_flag.HIDE} `;
        sql += `WHERE dr.id = ? OR (dr2.id = ? AND dr.id NOT REGEXP '[0-9]{4}99' AND sc.is_city IS NULL ) `;
        params.push(city_id, city_id);
        yield baseDao.delete(sql, params);

        sql = `DELETE sc FROM ?? sc `;
        params = [tables.sys_city];
        sql += `INNER JOIN ?? dr ON dr.id = sc.regionalism_id `;
        params.push(tables.dict_regionalism);
        sql += `LEFT JOIN ?? dr2 ON dr2.id = dr.parent_id AND dr2.level_type = ${LEVEL_CITY} `;
        params.push(tables.dict_regionalism);
        sql += `WHERE dr.id = ? OR (dr2.id = ? AND sc.is_city IS NULL ) `;
        params.push(city_id, city_id);
        yield baseDao.delete(sql, params);

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
        sql += `WHERE dr.id = ? OR FIND_IN_SET(dr2.id, ? )`;
        params.push(city_id, area_ids.join());
        yield baseDao.delete(sql, params);

        areas.unshift(city_obj);
        for (let i = 0; i < areas.length; i++) {
            sql = `INSERT INTO ?? SET ? `;
            params = [tables.sys_city, areas[i]];
            yield baseDao.insert(sql, params);
        }
        // sql = `INSERT INTO ?? VALUES ? `;
        // params = [tables.sys_city, areas.unshift(city_obj)];
        // yield baseDao.insert(sql, params);

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
        let params = [];

        // 清除旧的信息
        sql = `UPDATE ?? dr `;
        params = [tables.dict_regionalism];
        sql += `INNER JOIN ?? sc ON sc.regionalism_id = dr.id `;
        params.push(tables.sys_city);
        sql += `INNER JOIN ?? dr2 ON dr2.id = dr.parent_id AND dr2.level_type = ${LEVEL_CITY} `;
        params.push(tables.dict_regionalism);
        sql += `SET dr.del_flag = ${del_flag.HIDE} `;
        sql += `WHERE dr.id = ? OR (dr2.id = ? AND sc.is_city IS NULL ) `;
        params.push(city_id, city_id);
        yield baseDao.delete(sql, params);

        sql = `DELETE sc FROM ?? sc `;
        params = [tables.sys_city];
        sql += `INNER JOIN ?? dr ON dr.id = sc.regionalism_id `;
        params.push(tables.dict_regionalism);
        sql += `LEFT JOIN ?? dr2 ON dr2.id = dr.parent_id AND dr2.level_type = ${LEVEL_CITY} `;
        params.push(tables.dict_regionalism);
        sql += `WHERE dr.id = ? OR (dr2.id = ? AND sc.is_city IS NULL ) `;
        params.push(city_id, city_id);
        yield baseDao.delete(sql, params);

        //  检查城市下是否还有开通的区域
        sql = `SELECT dr.level_type, dr.parent_id FROM ?? dr WHERE dr.id = ? `;
        params = [tables.dict_regionalism, city_id];
        let city_info = yield baseDao.select(sql, params);
        if (city_info && city_info[0]) {
            city_info = city_info[0];
            let c_id;
            if (city_info.level_type == LEVEL_CITY) {
                c_id = city_id;
            } else if (city_info.level_type == LEVEL_CITY) {
                c_id = city_info.parent_id;
            }
            let sql = `SELECT count(*) FROM ?? sc `;
            let params = [tables.sys_city];
            sql += `INNER JOIN ?? dr ON dr.id = sc.regionalism_id `;
            params.push(tables.dict_regionalism);
            sql += `INNER JOIN ?? dr2 ON dr2.id = dr.parent_id `;
            params.push(tables.dict_regionalism);
            sql += `WHERE dr.id = ? OR dr2.id = ? `;
            params.push(c_id);
            params.push(c_id);
            let tmp = yield baseDao.select(sql, params);
            if (tmp && tmp[0] && tmp[0]['count(*)'] > 0) {
                sql = `UPDATE ?? dr SET dr.del_flag = ${del_flag.SHOW} WHERE dr.id = ? `;
                params = [tables.dict_regionalism, c_id];
                yield baseDao.select(sql, params);
            }
        }

        yield trans.commit();
    }).catch(err=> {
        if (trans && typeof trans.rollback == 'function') trans.rollback();
        return Promise.reject(err);
    });
};

module.exports = new CityDao();

