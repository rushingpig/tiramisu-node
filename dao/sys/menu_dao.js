/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/9 下午3:30
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var baseDao = require('../base_dao'),
    del_flag = baseDao.del_flag,
    is_usable = baseDao.is_usable,
    tables = require('../../config').tables,
    dbHelper = require('../../common/DBHelper');


function MenuDao(table){
    this.table = table || tables.sys_menu;
    this.base_insert_sql = "insert into ?? set ?";
    this.base_update_sql = "update ?? set ?";
    this.base_select_sql = "select * from ??";
}

MenuDao.prototype.insertMenu = function(menu_obj){
    return baseDao.insert(this.base_insert_sql,[this.table,menu_obj]);
};

MenuDao.prototype.updateMenuById = function(menu_id,menu_obj){
    let sql = this.base_update_sql + " where id = ?";
    let params = [this.table,menu_obj,menu_id];
    return baseDao.update(sql,params);
};
MenuDao.prototype.findMenus = function(query_data){
    let columns = [
        'sm.id',
        'sm.name',
        'sm.description',
        'sm2.name as module_name',
        'sm.module_id',
        'sm.type',
        'sm.permission as code'
    ].join(',');
    let sql = "select " + columns + " from ?? sm";
    let params = [this.table];
    if(query_data.role_id){
        sql += " inner join ?? srm on srm.menu_id = sm.id and srm.role_id = ?";
        params.push(tables.sys_role_menu);
        params.push(query_data.role_id);
    }
    sql += " inner join ?? sm2 on sm.module_id = sm2.id";
    params.push(this.table);
    sql += " where sm.del_flag = ? and sm.type != 'MODULE'";
    params.push(del_flag.SHOW);
    if(query_data.module_name){
        sql += " and sm.module_name like ?";
        params.push('%'+query_data.module_name+'%');
    }
    sql += " group by sm.module_id,sm.type,sm.id";
    return baseDao.select(sql,params);
};
MenuDao.prototype.findMenuById = function(menu_id){
    let sql = "select sm.*,sm2.id as module_id,sm2.name as module_name from ?? sm inner join ?? sm2 on sm.module_id = sm2.id where sm.id = ? and sm.del_flag = ?";
    let params = [this.table,this.table,menu_id,del_flag.SHOW];
    return baseDao.select(sql,params);
};
MenuDao.prototype.findAllModules = function(){
    let sql = "select id,name from ?? where type = 'MODULE' and del_flag = ?";
    let params = [this.table,del_flag.SHOW];
    return baseDao.select(sql,params);
};
module.exports = new MenuDao();
