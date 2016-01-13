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
var baseDao = require('../base_dao'),
    del_flag = baseDao.del_flag;
function AddressDao(table){
    this.table = table || tables.dict_regionalism;
    this.baseSql = util.format('select ?? from %s where 1=1 and level_type = ? and del_flag = ?',this.table);
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


module.exports = AddressDao;
