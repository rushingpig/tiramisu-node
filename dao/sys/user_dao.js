/**
 * @des    : the dao for user module
 * @author : pigo.can
 * @date   : 15/12/9 下午4:18
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var baseDao = require('../base_dao');
var tables = require('../../config').tables;
var sys_user = tables.sys_user;
function UserDao(table){
    this.table = table || tables.sys_user;
}

UserDao.prototype.findByUsername = (username,password)=>{
    let sql = 'select * from ?? where username = ? and password = ?';
    let params = [sys_user,username,password];
    return baseDao.select(sql,params);
};

module.exports = UserDao;
