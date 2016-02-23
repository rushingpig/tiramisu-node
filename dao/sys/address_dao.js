/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/16 下午2:43
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var util = require('util');
var tables = require('../../config').tables;
var dbHelper = require('../../common/DBHelper');
var baseDao = require('../base_dao'),
    del_flag = baseDao.del_flag;
function AddressDao(table){
    this.table = table || tables.dict_regionalism;
    this.baseSql = util.format('select ?? from %s where 1=1 and level_type = ? and del_flag = ?',this.table);
    this.base_update_sql = "update ?? set ?";
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
AddressDao.prototype.findStationsByCityId = function(query_obj){
    let sql = util.format("select b.id 'id',a.name 'district_name',b.name 'station_name'," +
        "b.address 'address',b.position 'position' " +
        "from %s a join %s b on a.id = b.regionalism_id " +
        "where a.level_type = ? and a.del_flag = ? and a.parent_id = ?", this.table, tables.buss_delivery_station);
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
AddressDao.prototype.updateStationByStationId = function(stationId, update_obj){
    let sql = this.base_update_sql + ' where id = ? ';
    return baseDao.update(sql,[tables.buss_delivery_station, update_obj, stationId]);
};
AddressDao.prototype.getStationsByName = function(station_name){
    let sql = util.format("select b.id 'id',a.name 'district_name',b.name 'station_name'," +
        "b.address 'address',b.position 'position' " +
        "from %s a join %s b on a.id = b.regionalism_id " +
        "where a.level_type = ? and a.del_flag = ? and b.name = ?", this.table, tables.buss_delivery_station);
    let params = [3, del_flag.SHOW, station_name];
    return baseDao.select(sql, params);
};

module.exports = AddressDao;
