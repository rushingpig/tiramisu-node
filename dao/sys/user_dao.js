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
    tables = require('../../config').tables;
function UserDao(table){
    this.table = table || tables.sys_user;
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
        'su.city_id',
        'su.station_id',
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

module.exports = UserDao;
