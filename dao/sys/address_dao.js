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

    if (query_data && query_data.signal && query_data.user && !query_data.user.is_headquarters) {
        let ds = query_data.user.data_scopes;
        let sql = "select id,name from ?? where id in (select parent_id from ?? where 1=1 and level_type = 2 and del_flag = ?";
        // data filter start
        if (!toolUtils.isEmptyArray(ds)) {
            if (!query_data.user.is_admin && ds.indexOf(constant.DS.ALLCOMPANY.id) == -1) {
                ds.forEach(curr => {
                    if (curr == constant.DS.OFFICEANDCHILD.id && query_data.user.role_ids) {
                        sql += " and id in " + dbHelper.genInSql(query_data.user.city_ids);
                    }
                });
            }
        }
        // data filter end
        sql += ") and level_type = 1 and del_flag = ?";
        let params = [this.table, this.table, del_flag.SHOW, del_flag.SHOW];
        return baseDao.select(sql, params);
    } else {
        return baseDao.select(this.baseSql, [this.baseColumns, 1, del_flag.SHOW]);
    }
};
AddressDao.prototype.findCitiesByProvinceId = function(provinceId, query_data) {
    let sql = this.baseSql + ' and parent_id = ?';
    let ds = query_data.user.data_scopes;
    // data filter start
    if (query_data.signal && !toolUtils.isEmptyArray(ds)) {
        if (!query_data.user.is_admin && ds.indexOf(constant.DS.ALLCOMPANY.id) == -1 && !query_data.user.is_headquarters) {
            ds.forEach(curr => {
                if (curr == constant.DS.OFFICEANDCHILD.id && query_data.user.role_ids) {
                    sql += " and id in " + dbHelper.genInSql(query_data.user.city_ids);
                }
            });
        }
    }
    // data filter end
    return baseDao.select(sql, [this.baseColumns, 2, del_flag.SHOW, provinceId]);
};
AddressDao.prototype.findDistrictsByCityId = function(cityId) {
    let sql = this.baseSql + ' and parent_id = ?';
    return baseDao.select(sql, [this.baseColumns, 3, del_flag.SHOW, cityId]);
};
AddressDao.prototype.findStationsByMultipleCondition = function(query_obj) {
    let query = "select b.id 'station_id',b.name 'name',b.address 'address',b.coords 'coords'," +
        "b.remarks 'remarks',b.capacity 'capacity',b.phone 'phone'," +
        "a.id 'regionalism_id',a.name 'regionalism_name'," +
        "c.id 'city_id',c.name 'city_name'," +
        "d.id 'province_id',d.name 'province_name' " +
        "from %s a join %s c on a.parent_id = c.id " +
        "join %s d on c.parent_id = d.id " +
        "join %s b on a.id = b.regionalism_id " +
        "where b.del_flag = ? ";
    let params = [del_flag.SHOW];
    if (query_obj.station_name) {
        query += ' and b.name like ? ';
        params.push('%' + query_obj.station_name + '%');
    }
    if (query_obj.regionalism_id) {
        query += ' and a.id = ? ';
        params.push(query_obj.regionalism_id);
    }
    if (query_obj.city_id) {
        query += ' and c.id = ? ';
        params.push(query_obj.city_id);
    }
    if (query_obj.province_id) {
        query += ' and d.id = ? ';
        params.push(query_obj.province_id);
    }
    let sql = util.format(query, this.table, this.table, this.table, tables.buss_delivery_station);
    // return paging result if isPage
    if (query_obj.isPage) {
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
AddressDao.prototype.findAllCities = function(query_data) {
    let ds = query_data.user.data_scopes;
    let sql = "select * from ?? where level_type = 2 and del_flag = ?";
    let params = [tables.dict_regionalism, del_flag.SHOW];
    // data filter start
    if (!toolUtils.isEmptyArray(ds) && !query_data.user.is_headquarters) {
        if (!query_data.user.is_admin && ds.indexOf(constant.DS.ALLCOMPANY.id) == -1) {
            ds.forEach(curr => {
                if (curr == constant.DS.OFFICEANDCHILD.id && query_data.user.role_ids) {
                    sql += " and id in " + dbHelper.genInSql(query_data.user.city_ids);
                }
            });
        }
    }
    // data filter end
    return baseDao.select(sql, params);
};
module.exports = AddressDao;