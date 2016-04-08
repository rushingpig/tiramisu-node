/**
 * @des    : the dao for user module
 * @author : pigo.can
 * @date   : 15/12/9 下午4:18
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var baseDao = require('../base_dao'),
    del_flag = baseDao.del_flag,
    tables = require('../../config').tables,
    dbHelper = require('../../common/DBHelper');;
function UserDao(table){
    this.table = table || tables.sys_user;
    this.base_insert_sql = "insert into ?? set ?";
    this.base_update_sql = "update ?? set ?";
}
/**
 * find user info and permissions by username and password
 * @param username
 * @param password
 * @returns {Promise}
 */
UserDao.prototype.findByUsername = (username,password)=>{
    let columns = [
        'su.id',
        'su.`name`',
        'su.org_Id',
        'su.username',
        'su.city_ids',
        'su.station_ids',
        'su.user_type',
        'su.no',

        'sr.data_scope',
        'sr.id as role_id',
        'sr.name as role_name',

        'sm.parent_id',
        'sm.parent_ids',
        'sm.`name` as menu_name',
        'sm.permission',
        'sm.sort'
    ].join(',');
    let sql = "select distinct " + columns + " from ?? su",params=[];
    params.push(tables.sys_user);
    sql += " left join ?? sur on su.id = sur.user_id";
    params.push(tables.sys_user_role);
    sql += " left join ?? sr on sr.id = sur.role_id and sr.del_flag = ?";
    params.push(tables.sys_role);
    params.push(del_flag.SHOW);
    sql += " left join ?? srm on srm.role_id = sr.id";
    params.push(tables.sys_role_menu);
    sql += " left join ?? sm on sm.id = srm.menu_id and sm.del_flag = ?";
    params.push(tables.sys_menu);
    params.push(del_flag.SHOW);
    sql += " where 1=1 and su.del_flag = ?";
    sql += " and su.username = ? and su.`password` = ? ";
    params = params.concat(del_flag.SHOW,username,password);
    return baseDao.select(sql,params);
};
UserDao.prototype.insertUser = function(user_obj){
    return baseDao.insert(this.base_insert_sql,[tables.sys_user,user_obj]);
};
UserDao.prototype.batchInsertUserRole = function(user_role_objs){
    let sql = "insert into ?? values ?";
    let params = [tables.sys_user_role,user_role_objs];
    return baseDao.batchInsert(sql,params);
};
UserDao.prototype.updateUserById = function(user_obj,user_id){
    let sql = this.base_update_sql + " where id = ?";
    let params = [tables.sys_user,user_obj,user_id];
    return baseDao.update(sql,params);
};
UserDao.prototype.findUserById = function(user_id){
    let columns = [
        'su.city_ids',
        'su.id',
        'su.name',
        'su.username',
        'su.mobile',
        'su.is_usable',
        'su.station_ids',
        'su.is_headquarters',
        'su.is_national',
        'sr.id as role_id',
        'sr.name as role_name'
    ].join(','),params = [];
    let sql = "select " + columns + " from ?? su";
    params.push(tables.sys_user);
    sql += " left join ?? sur on su.id = sur.user_id";
    params.push(tables.sys_user_role);
    sql += " left join ?? sr on sur.role_id = sr.id";
    params.push(tables.sys_role);
    sql += " where su.id = ? and su.del_flag = ?";
    params.push(user_id,del_flag.SHOW);
    return baseDao.select(sql,params);
};
UserDao.prototype.findUsers = function(query_data){
    let prefix_sql = "select t.*,sr2.name as role_name from (",suffix_sql = "";
    let columns = [
        'su.username',
        'su.id',
        'su.name',
        'su.mobile',
        'su.city_ids',
        'su.is_usable',
        'su.city_names'
    ].join(','),params = [];
    let sql = "select distinct " + columns + " from ?? su";
    params.push(tables.sys_user);
    sql += " inner join ?? sur on sur.user_id = su.id";
    params.push(tables.sys_user_role);
    sql += " inner join ?? sr on sr.id = sur.role_id";
    params.push(tables.sys_role);
    if(query_data.org_id){
        sql += " and sr.org_id = ?";
        params.push(query_data.org_id);
    }
    sql += " where 1=1";
    if(query_data.uname_or_name){
        sql += " and (su.username like ? or su.name like ?)";
        params.push('%'+query_data.uname_or_name+'%');
        params.push('%'+query_data.uname_or_name+'%');
    }
    sql += " and su.del_flag = ?";
    params.push(del_flag.SHOW);
    suffix_sql += " )t inner join ?? sur2 on sur2.user_id = t.id";
    params.push(tables.sys_user_role);
    suffix_sql += " inner join ?? sr2 on sr2.id = sur2.role_id";
    params.push(tables.sys_role);

    let count_sql = dbHelper.countSql(sql);
    return baseDao.select(count_sql,params).then(result=>{
        let pagination_sql = prefix_sql + dbHelper.paginate(sql,query_data.page_no,query_data.page_size) + suffix_sql;
        return baseDao.select(pagination_sql,params).then(_result => {
            return {result,_result};
        });
    });
};
/**
 * delete from table by the user_id
 * @param user_id
 */
UserDao.prototype.deleteUserRole = function(user_id){
    let sql = "delete from ?? where user_id = ?";
    let params = [tables.sys_user_role,user_id];
    return baseDao.delete(sql,params);

};
module.exports = UserDao;
