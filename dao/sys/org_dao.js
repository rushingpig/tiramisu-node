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
    constant = require('../../common/Constant'),
    dbHelper = require('../../common/DBHelper'),
    toolUtils = require('../../common/ToolUtils');
function OrgDao(table){
    this.table = table || tables.sys_organization;
    this.base_insert_sql = "insert into ?? set ?";
    this.base_update_sql = "update ?? set ?";
}

OrgDao.prototype.findAllOrgs = function(query_data){
    let sql = "select distinct so.* from ?? so",params = [];
    params.push(tables.sys_organization);
    // data filter begin
    let ds_sql = "";
    let data_scopes = query_data.user.data_scopes;
    let role_ids = query_data.user.roles.map(curr => {
        return curr.id;
    });
    if(!toolUtils.isEmptyArray(data_scopes)){
        data_scopes.forEach((curr)=>{

            if(curr == constant.DS.OFFICEANDCHILD.id){
                ds_sql += " inner join ?? sr on sr.id in " + dbHelper.genInSql(role_ids) + " and sr.org_id = so.id";
                params.push(tables.sys_role);
            }
        });
    }
    if(query_data.user && (query_data.user.is_admin || data_scopes.indexOf(constant.DS.ALLCOMPANY.id) != -1)){
        ds_sql = "";
    }
    sql += ds_sql;
    // data filter end
    sql += " where so.del_flag = ? and so.is_usable = ?";
    params.push(del_flag.SHOW);
    params.push(is_usable.enable);
    return baseDao.select(sql,params);
};
OrgDao.prototype.insertOrg = function(org_obj){
    return baseDao.insert(this.base_insert_sql,[tables.sys_organization,org_obj]);
};

module.exports = new OrgDao();
