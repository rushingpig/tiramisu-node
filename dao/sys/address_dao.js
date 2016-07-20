/**
 * @des    : get the provinces / cities / districts
 * @author : pigo.can
 * @date   : 15/12/16 下午2:43
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var util = require('util');
var async = require('async');
var tables = require('../../config').tables;
var dbHelper = require('../../common/DBHelper'),
    toolUtils = require('../../common/ToolUtils'),
    SystemUtils = require('../../common/SystemUtils'),
    constant = require('../../common/Constant');
var baseDao = require('../base_dao'),
    del_flag = baseDao.del_flag;

let LEVEL = constant.REGIONALISM_LEVEL;

function AddressDao(table) {
    this.table = table || tables.dict_regionalism;
    this.baseSql = util.format('select ?? from %s where 1=1 and level_type = ? and del_flag = ?', this.table);
    this.base_insert_sql = 'insert into ?? set ?';
    this.base_update_sql = "update ?? set ?";
    this.base_delete_sql = 'delete from ?? where id = ?';
    this.baseColumns = ['id', 'name'];
}
// if you want to use 'this'(object) in the statement ,don not use '=>'
AddressDao.prototype.findAllProvinces = function(query_data) {
    let columns = [
        'DISTINCT dr.id',
        'dr.name'
    ];
    let ds = query_data.user.data_scopes;
    let sql = `SELECT ${columns.join()} FROM ?? dr `;
    let params = [tables.dict_regionalism];
    sql += `INNER JOIN ?? dr2 ON dr2.parent_id = dr.id `;
    params.push(tables.dict_regionalism);
    sql += `INNER JOIN ?? dr3 ON dr3.parent_id = dr2.id `;
    params.push(tables.dict_regionalism);
    sql += `INNER JOIN ?? sc ON sc.regionalism_id = dr2.id OR sc.regionalism_id = dr3.id `;
    params.push(tables.sys_city);
    sql += `WHERE dr.level_type = ${LEVEL.PROVINCE} `;
    sql += `AND sc.is_city = 1 `;
    if (!query_data.user.is_admin && ds.indexOf(constant.DS.ALLCOMPANY.id) == -1 && !query_data.user.is_headquarters) {
        if (query_data.signal) {
            sql += `AND sc.regionalism_id IN ` + dbHelper.genInSql(query_data.user.city_ids);
        }
    }

    return baseDao.select(sql, params);
};
AddressDao.prototype.findCities = function(query_data) {
    let columns = [
        'dr.id',
        'dr.name',
        'dr.level_type',
        'dr2.name AS parent_name'
    ];
    let ds = query_data.user.data_scopes;
    let sql = `SELECT ${columns.join()} FROM ?? dr `;
    let params = [tables.dict_regionalism];
    sql += `INNER JOIN ?? dr2 ON dr2.id = dr.parent_id `;
    params.push(tables.dict_regionalism);
    if (query_data.is_standard_area == '1') {
        sql += `LEFT JOIN ?? dr3 ON dr3.parent_id = dr.id `;
        params.push(tables.dict_regionalism);
        sql += `INNER JOIN ?? sc ON sc.regionalism_id = dr.id OR sc.regionalism_id = dr3.id `;
        params.push(tables.sys_city);
        sql += `WHERE 1 = 1 `;
        if (query_data.province_id) {
            sql += `AND dr2.id = ? `;
            params.push(query_data.province_id);
        }
        if(query_data.city_id){
            sql += `AND dr.id = ? `;
            params.push(query_data.city_id);
        }
    } else {
        sql += `INNER JOIN ?? sc ON sc.regionalism_id = dr.id AND sc.is_city = 1 `;
        params.push(tables.sys_city);
        sql += `WHERE 1 = 1 `;
        if (query_data.province_id) {
            sql += `AND ( dr2.id = ? OR (dr2.parent_id = ? AND dr2.level_type = ${LEVEL.CITY} ) )`;
            params.push(query_data.province_id);
            params.push(query_data.province_id);
        }
        if (query_data.city_id) {
            sql += `AND ( dr.id = ? OR (dr.parent_id = ? AND dr2.level_type = ${LEVEL.CITY} ) )`;
            params.push(query_data.city_id);
            params.push(query_data.city_id);
        }
    }
    if (!query_data.user.is_admin && ds.indexOf(constant.DS.ALLCOMPANY.id) == -1 && !query_data.user.is_headquarters) {
        if (query_data.signal) {
            sql += `AND sc.regionalism_id IN ` + dbHelper.genInSql(query_data.user.city_ids);
        }
    }

    return baseDao.select(sql, params);
};
AddressDao.prototype.findDistrictsByCityId = function(cityId, query) {
    if (!query) query = {};
    let columns = [
        'dr.id',
        'dr.name'
    ];
    let sql = `SELECT ${columns.join()} FROM ?? dr `;
    let params = [tables.dict_regionalism];
    sql += `INNER JOIN ?? sc ON sc.regionalism_id = dr.id `;
    params.push(tables.sys_city);
    sql += `WHERE dr.parent_id = ? `;
    params.push(cityId);
    if (query.is_standard_area != '1') {
        sql += `AND sc.is_city = 0 `;
    }

    return baseDao.select(sql, params);
};
AddressDao.prototype.findStationsByMultipleCondition = function(query_obj) {
    let columns = [
        'bds.id AS station_id',
        'bds.name',
        'bds.address',
        'bds.coords',
        'bds.remarks',
        'bds.capacity',
        'bds.phone',
        'dr.id AS regionalism_id',
        'dr.name AS regionalism_name',
        'dr2.id AS city_id',
        'dr2.name AS city_name',
        'dr3.id AS province_id',
        'dr3.name AS province_name'
    ];
    let sql = `SELECT ${columns.join()} FROM ?? bds `;
    let params = [tables.buss_delivery_station];
    sql += `INNER JOIN ?? dr ON dr.id = bds.regionalism_id `;
    params.push(tables.dict_regionalism);
    sql += `INNER JOIN ?? dr2 ON dr2.id = dr.parent_id `;
    params.push(tables.dict_regionalism);
    sql += `INNER JOIN ?? dr3 ON dr3.id = dr2.parent_id `;
    params.push(tables.dict_regionalism);

    sql += `INNER JOIN ?? sc ON sc.regionalism_id = dr.id `;
    params.push(tables.sys_city);

    sql += `WHERE bds.del_flag = ? `;
    params.push(del_flag.SHOW);
    if (query_obj.station_name) {
        sql += `AND bds.name LIKE ? `;
        params.push(`%${query_obj.station_name}%`);
    }
    if (query_obj.regionalism_id) {
        sql += `AND dr.id = ? `;
        params.push(query_obj.regionalism_id);
    }
    if (query_obj.city_id) {
        if (query_obj.is_standard_area == '1') {
            sql += `AND dr.parent_id = ?  `;
            params.push(query_obj.city_id);
        } else {
            sql += `AND ( (dr.id = ? AND sc.is_city = 1 ) OR (dr.parent_id = ? AND sc.is_city = 0 ) ) `;
            params.push(query_obj.city_id);
            params.push(query_obj.city_id);
        }
    }
    if (query_obj.province_id) {
        sql += `AND dr3.id = ? `;
        params.push(query_obj.province_id);
    }
    let ds = (query_obj.user) ? query_obj.user.data_scopes : [];
    if (!query_obj.user.is_admin && ds.indexOf(constant.DS.ALLCOMPANY.id) == -1 && !query_obj.user.is_headquarters) {
        if (query_obj.signal) {
            let tmp_city_str = dbHelper.genInSql(query_obj.user.city_ids);
            sql += `AND id IN ` + dbHelper.genInSql(query_obj.user.city_ids);
            sql += `AND ( `;
            sql += `(sc.is_city = 1 AND dr.id IN ${tmp_city_str} ) `;
            sql += `OR (sc.is_city = 0 AND dr.parent_id IN ${tmp_city_str} ) `;
            sql += `) `;
        }
    }
    // return paging result if isPage
    // 兼容
    if (query_obj.isPage == 1 || query_obj.isPage == 'true') {
        let countSql = dbHelper.countSql(sql);
        let pagination_sql = dbHelper.paginate(sql, query_obj.page_no, query_obj.page_size);
        return baseDao.select(countSql, params).then((count_result) => {
            return baseDao.select(pagination_sql, params).then((pagination_result) => {
                return {
                    count_result,
                    pagination_result
                };
            });
        });
    } else {
        return baseDao.select(sql, params);
    }
};
AddressDao.prototype.updateStationByStationId = function(req, stationId, update_obj) {
    let sql = this.base_update_sql + ' where id = ? ';
    return baseDao.update(sql, [tables.buss_delivery_station, SystemUtils.assembleUpdateObj(req, update_obj), stationId]);
};
AddressDao.prototype.deleteStationById = function(stationId) {
    let sql = this.base_update_sql + ' where id = ? ';
    let delete_obj = {
        del_flag: 0
    };
    return baseDao.select(sql, [tables.buss_delivery_station, delete_obj, stationId]);
};
AddressDao.prototype.addStation = function(req, insert_obj) {
    let params = [tables.buss_delivery_station, SystemUtils.assembleInsertObj(req, insert_obj)];
    return baseDao.insert(this.base_insert_sql, params);
};
AddressDao.prototype.modifyStationCoordsInTransaction = function(req, arr) {
    return baseDao.trans().then(transaction => {
        return new Promise((resolve, reject) => {
            let sql = this.base_update_sql + ' where id = ? ';
            async.each(arr, (item, cb) => {
                transaction.query(sql, [tables.buss_delivery_station, SystemUtils.assembleUpdateObj(req, {
                    coords: item.coords
                }), item.id], cb);
            }, err => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        }).then(() => {
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
AddressDao.prototype.findCitiesByIds = function(city_ids) {
    let sql = "select * from ?? where id in " + dbHelper.genInSql(city_ids) + " and level_type = 2 and del_flag = ?";
    let params = [tables.dict_regionalism, del_flag.SHOW];
    return baseDao.select(sql, params);
};
AddressDao.prototype.getProvincesAndCites = function(){
    let columns = [
        'province.id as province_id',
        'province.name as province_name',
        'case syscity.regionalism_id when district.id then district.id when city.id then city.id end as city_id',
        'case syscity.regionalism_id when district.id then district.name when city.id then city.name end as city_name',
        'case syscity.regionalism_id when district.id then district.level_type when city.id then city.level_type end as level_type'
    ];
    let sql = 'select ' + columns.join(',') + ' from ?? province join ?? city on province.id = city.parent_id and province.level_type = 1 and province.del_flag = ? and city.level_type = 2 and city.del_flag = ? ' + 
        ' join ?? district on city.id = district.parent_id and district.level_type = 3 and district.del_flag = ? ' +
        ' join ?? syscity on district.id = syscity.regionalism_id or city.id = syscity.regionalism_id ';
    let params = [this.table, this.table, del_flag.SHOW, del_flag.SHOW, this.table, del_flag.SHOW, tables.sys_city];
    return baseDao.select(sql, params);
};
module.exports = AddressDao;