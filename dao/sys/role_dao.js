/**
 * @des    : the dao module of organization
 * @author : pigo
 * @date   : 16/3/28
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
'use strict';
var baseDao = require('../base_dao'),
    del_flag = baseDao.del_flag,
    is_usable = baseDao.is_usable,
    tables = require('../../config').tables,
    dbHelper = require('../../common/DBHelper'),
    toolUtils = require('../../common/ToolUtils'),
    constant = require('../../common/Constant');

function RoleDao(table){
    this.table = table || tables.sys_role;
    this.base_insert_sql = "insert into ?? set ?";
    this.base_update_sql = "update ?? set ?";
}

RoleDao.prototype.insertRole = function(role_obj){
    return baseDao.insert(this.base_insert_sql,[tables.sys_role,role_obj]);
};
RoleDao.prototype.findRoles = function(query_data){
    let sql = "select * from ?? where 1=1 and del_flag = ?",params = [];
    let ds = query_data.user.data_scopes;
    params.push(tables.sys_role);
    params.push(del_flag.SHOW);
    if(query_data.org_id){
        sql += " and org_id = ?";
        params.push(query_data.org_id);
    }
    if(query_data.role_name){
        sql += " and name like ?";
        params.push('%'+query_data.role_name+'%');
    }
    // data filter start
    if(!toolUtils.isEmptyArray(ds)){
        if(!query_data.user.is_admin && ds.indexOf(constant.DS.ALLCOMPANY.id) == -1){
            ds.forEach(curr => {
                if(curr == constant.DS.OFFICEANDCHILD.id && query_data.user.role_ids){
                    sql += " and org_id in "+dbHelper.genInSql(query_data.user.org_ids);
                }
            });
        }
    }
    // data filter end
    let count_sql = dbHelper.countSql(sql);
    return baseDao.select(count_sql,params).then(result => {
        let pagination_sql = '';
        if(query_data.page_no){
            pagination_sql = dbHelper.paginate(sql,query_data.page_no,query_data.page_size);
        }else{
            pagination_sql = sql;
        }
        return baseDao.select(pagination_sql,params).then(_result => {
            return {result,_result};
        });
    });
};
RoleDao.prototype.updateRoleById = function(role_id,role_obj){
    let sql = this.base_update_sql + " where id = ?";
    let params = [this.table,role_obj,role_id];
    return baseDao.update(sql,params);
};
RoleDao.prototype.findRoleById = function(role_id){
    let sql = "select * from ?? where id = ?";
    let params = [this.table,role_id];
    return baseDao.select(sql,params);
};
RoleDao.prototype.batchInsertRoleMenu = function(role_id,role_menu_ids){
    let sql = "insert into ?? values ?";
    let params = [tables.sys_role_menu,role_menu_ids];
    return baseDao.batchInsert(sql,params);
};
RoleDao.prototype.batchDeleteRoleMenu = function(role_id){
    let sql = "delete from ?? where role_id = ?";
    return baseDao.delete(sql,[tables.sys_role_menu,role_id]);
};
module.exports = new RoleDao();
