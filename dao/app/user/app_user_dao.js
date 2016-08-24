'use strict';
var baseDao = require('../../base_dao'),
    util = require('util'),
    co = require('co'),
    toolUtils = require('../../../common/ToolUtils'),
    systemUtils = require('../../../common/SystemUtils'),
    Constant = require('../../../common/Constant'),
    dbHelper = require('../../../common/DBHelper'),
    logger = require('../../../common/LogHelper').systemLog(),
    constant = require('../../../common/Constant'),
    del_flag = baseDao.del_flag,
    IS_IN_BLACKLIST = baseDao.IS_IN_BLACKLIST,
    errorMessage = require('../../../util/res_obj'),
    TiramisuError = require('../../../error/tiramisu_error'),
    res_obj = require('../../../util/res_obj');
var config = require('../../../config');
const tables = config.tables;
var request = require('request');
var moment = require('moment');


function AppUserDao() {
    this.base_insert_sql = 'insert into ?? set ?';
    this.base_select_sql = 'select ?? from ?? where 1=1 and del_flag = ? ';
    this.base_update_sql = 'update ?? set ?';
}
/**
 * 根据条件查询app用户
 * @param query_data
 */
AppUserDao.prototype.findAppUsers = function (query_data) {
    let columns = [
        'aup.*',
        'aua.auth_token',
        'dr1.name as province_name',
        'dr2.name as city_name',
        'dr3.name as regionalism_name'
    ].join(',');
    let params = [];
    let sql = "select " + columns + " from ?? aup";
    params.push(tables.app_user_profiles);
    sql += " inner join ?? aua on aup.uuid = aua.uuid ";
    params.push(tables.app_user_auths);
    if (query_data.keywords) {
        sql += " and aua.auth_id = ?";
        params.push(query_data, keywords);
    }

    sql += " left join ?? dr1 on aup.province_id = dr1.id";
    sql += " left join ?? dr2 on aup.city_id = dr2.id";
    sql += " left join ?? dr3 on aup.regionalism_id = dr3.id";
    params.push(tables.dict_regionalism);
    params.push(tables.dict_regionalism);
    params.push(tables.dict_regionalism);
    sql += " where 1=1";
    if (query_data.province_id) {
        sql += " and aup.province_id = ?";
        params.push(query_data.province_id);
    }
    if (query_data.city_id) {
        sql += " and qup.city_id = ?";
        params.push(query_data.city_id);
    }
    if (query_data.uuid) {
        sql += " and aup.uuid = ?";
        params.push(query_data.uuid);
    }
    sql += " order by aup.created_time desc";
    return baseDao.select(dbHelper.replaceCountSql(sql),params).then(result => {
        return baseDao.select(dbHelper.paginate(sql, query_data.page_no, query_data.page_size), params).then((_result)=>{
            return {result,_result};
        });
    });
};
/**
 * 根据用户ID查询用户详情
 * @param uuid
 */
AppUserDao.prototype.findAppUserByUUID = function (uuid) {
    let columns = [
        'aup.*',
        'aua.auth_token',
        'dr1.name as province_name',
        'dr2.name as city_name',
        'dr3.name as regionalism_name'
    ].join(',');
    let params = [];
    let sql = "select " + columns + " from ?? aup";
    params.push(tables.app_user_profiles);
    sql += " inner join ?? aua on aup.uuid = aua.uuid ";
    params.push(tables.app_user_auths);
    sql += " left join ?? dr1 on aup.province_id = dr1.id";
    sql += " left join ?? dr2 on aup.city_id = dr2.id";
    sql += " left join ?? dr3 on aup.regionalism_id = dr3.id";
    params.push(tables.dict_regionalism);
    params.push(tables.dict_regionalism);
    params.push(tables.dict_regionalism);
    sql += " where aup.uuid = ?";
    params.push(uuid);
    return baseDao.select(sql, params);
};
/**
 * 将用户加入到黑名单
 * @param uuid
 */
AppUserDao.prototype.insertBlacklist = function (req,uuid) {
    return baseDao.insert(this.base_insert_sql,[tables.app_user_blacklist,systemUtils.assembleInsertObj(req, {uuid})]);
};
/**
 * 查询用户的登录日志
 * @param uuid
 * @param last_id
 */
AppUserDao.prototype.findLoginLogs = function (query_data) {
    let sql = "select id,login_ip as ip,visit_src,created_time as datetime from ?? where uuid = ?";
    let params = [tables.logs_user_login,query_data.uuid];
    if (query_data.last_id){
        sql += " and id < ?";
        params.push(query_data.last_id);
    }
    sql += " order by id desc";
    return baseDao.select(dbHelper.paginate(sql,query_data.page_no,query_data.page_size), params);
};
/**
 * 更新用户profiles为黑名单
 */
AppUserDao.prototype.blacklistUserProfiles = function (uuid) {
    let sql = "update ?? set is_in_blacklist = ? where uuid = ?";
    let params = [tables.app_user_profiles,IS_IN_BLACKLIST.YES,uuid];
    return baseDao.update(sql, params);
};

module.exports = new AppUserDao();