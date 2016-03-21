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
var dbHelper = require('../../common/DBHelper');
var baseDao = require('../base_dao'),
    del_flag = baseDao.del_flag;
function AddressDao(table){
    this.table = table || tables.dict_regionalism;
    this.baseSql = util.format('select ?? from %s where 1=1 and level_type = ? and del_flag = ?',this.table);
    this.base_insert_sql = 'insert into ?? set ?';
    this.base_update_sql = "update ?? set ?";
    this.base_delete_sql = 'delete from ?? where id = ?';
    this.baseColumns = ['id','name'];
}
// if you want to use 'this'(object) in the statement ,don not use '=>'
AddressDao.prototype.findAllProvinces = function(){
    return baseDao.select(this.baseSql,[this.baseColumns,1,del_flag.SHOW]);
};
AddressDao.prototype.findCitiesByProvinceId = function(provinceId){
    let sql = this.baseSql + ' and parent_id = ?';
    return baseDao.select(sql,[this.baseColumns,2,del_flag.SHOW,provinceId]);
};
AddressDao.prototype.findDistrictsByCityId = function(cityId){
    let sql = this.baseSql + ' and parent_id = ?';
    return baseDao.select(sql,[this.baseColumns,3,del_flag.SHOW,cityId]);
};
AddressDao.prototype.findStationsByRegionalismId = function(query_obj){
    let sql = util.format("select b.id 'station_id',b.name 'name',b.address 'address',b.coords 'coords'," +
        "b.remarks 'remarks',b.capacity 'capacity',b.phone 'phone'," +
        "a.id 'regionalism_id',a.name 'regionalism_name'," +
        "c.id 'city_id',c.name 'city_name'," +
        "d.id 'province_id',d.name 'province_name' " +
        "from %s a join %s c on a.parent_id = c.id " +
        "join %s d on c.parent_id = d.id " +
        "join %s b on a.id = b.regionalism_id " +
        "where a.level_type = ? and b.del_flag = ? and a.id = ?", this.table, this.table, this.table, tables.buss_delivery_station);
    let countSql = dbHelper.countSql(sql);
    let pagination_sql = dbHelper.paginate(sql,query_obj.page_no,query_obj.page_size);
    let params = [3, del_flag.SHOW, query_obj.regionalismId];
    return baseDao.select(countSql, params).then((count_result) => {
        return baseDao.select(pagination_sql, params).then((pagination_result) => {
            return {
                count_result, pagination_result
            };
        });
    });
};
AddressDao.prototype.findStationsByCityId = function(query_obj){
    let sql = util.format("select b.id 'station_id',b.name 'name',b.address 'address',b.coords 'coords'," +
        "b.remarks 'remarks',b.capacity 'capacity',b.phone 'phone'," +
        "a.id 'regionalism_id',a.name 'regionalism_name'," +
        "c.id 'city_id',c.name 'city_name'," +
        "d.id 'province_id',d.name 'province_name' " +
        "from %s a join %s c on a.parent_id = c.id " +
        "join %s d on c.parent_id = d.id " +
        "join %s b on a.id = b.regionalism_id " +
        "where a.level_type = ? and b.del_flag = ? and c.id = ?", this.table, this.table, this.table, tables.buss_delivery_station);
    let countSql = dbHelper.countSql(sql);
    let pagination_sql = dbHelper.paginate(sql,query_obj.page_no,query_obj.page_size);
    let params = [3, del_flag.SHOW, query_obj.cityId];
    return baseDao.select(countSql, params).then((count_result) => {
        return baseDao.select(pagination_sql, params).then((pagination_result) => {
            return {
                count_result, pagination_result
            };
        });
    });
};
AddressDao.prototype.findStationsByProvinceId = function(query_obj){
    let sql = util.format("select b.id 'station_id',b.name 'name',b.address 'address',b.coords 'coords'," +
        "b.remarks 'remarks',b.capacity 'capacity',b.phone 'phone'," +
        "a.id 'regionalism_id',a.name 'regionalism_name'," +
        "c.id 'city_id',c.name 'city_name'," +
        "d.id 'province_id',d.name 'province_name' " +
        "from %s a join %s c on a.parent_id = c.id " +
        "join %s d on c.parent_id = d.id " +
        "join %s b on a.id = b.regionalism_id " +
        "where a.level_type = ? and b.del_flag = ? and d.id = ?", this.table, this.table, this.table, tables.buss_delivery_station);
    let countSql = dbHelper.countSql(sql);
    let pagination_sql = dbHelper.paginate(sql,query_obj.page_no,query_obj.page_size);
    let params = [3, del_flag.SHOW, query_obj.provinceId];
    return baseDao.select(countSql, params).then((count_result) => {
        return baseDao.select(pagination_sql, params).then((pagination_result) => {
            return {
                count_result, pagination_result
            };
        });
    });
};
AddressDao.prototype.updateStationByStationId = function(stationId, update_obj){
    let sql = this.base_update_sql + ' where id = ? ';
    return baseDao.update(sql,[tables.buss_delivery_station, update_obj, stationId]);
};
AddressDao.prototype.getStationsByName = function(station_name){
    let sql = util.format("select b.id 'station_id',b.name 'name',b.remarks 'remarks'," +
        "b.address 'address',b.position 'position',b.capacity 'capacity',b.phone 'phone'," +
        "a.name 'regionalism_name',a.id 'regionalism_id'," +
        "c.name 'city_name',c.id 'city_id'," +
        "d.id 'province_id',d.name 'province_name' " +
        "from %s a join %s c on a.parent_id = c.id " +
        "join %s d on c.parent_id = d.id " +
        "join %s b on a.id = b.regionalism_id " +
        "where a.level_type = ? and a.del_flag = ? and b.name = ?", this.table, this.table, this.table, tables.buss_delivery_station);
    let params = [3, del_flag.SHOW, station_name];
    return baseDao.select(sql, params);
};
AddressDao.prototype.deleteStationById = function(stationId){
    let params = [tables.buss_delivery_station, stationId];
    return baseDao.select(this.base_delete_sql, params);
};
AddressDao.prototype.addStation = function(insert_obj){
    let params = [tables.buss_delivery_station, insert_obj];
    return baseDao.insert(this.base_insert_sql, params);
};
AddressDao.prototype.modifyStationCoordsInTransaction = function(arr){
    return baseDao.trans().then(transaction => {
        return new Promise((resolve, reject) => {
            let sql = this.base_update_sql + ' where id = ? ';
            async.each(arr, (item, cb) => {
                transaction.query(sql, [tables.buss_delivery_station, {coords: item.coords}, item.id], cb);
            }, err => {
                if(err){
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

module.exports = AddressDao;