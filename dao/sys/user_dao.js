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
    dbHelper = require('../../common/DBHelper'),
    constant = require('../../common/Constant'),
    toolUtils = require('../../common/ToolUtils');
var co = require('co');

function UserDao(table){
    this.table = table || tables.sys_user;
    this.base_insert_sql = "insert into ?? set ?";
    this.base_update_sql = "update ?? set ?";
}

UserDao.prototype.isExist = function (query, ignore) {
    if (!query) return Promise.resolve(true);
    if (!ignore) ignore = {};
    return new Promise((resolve, reject)=> {
        let sql = `SELECT id FROM ?? su `;
        let params = [tables.sys_user];
        sql += `WHERE 1 = 1 `;
        sql += `AND su.del_flag = ? `;
        params.push(del_flag.SHOW);
        if (query.mobile) {
            sql += `AND su.mobile = ? `;
            params.push(query.mobile);
        }

        if (ignore.user_id) {
            sql += `AND su.id != ? `;
            params.push(ignore.user_id);
        }
        baseDao.select(sql, params).then(result=> {
            resolve(result && result.length > 0);
        }).catch(reject);
    });
};

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
        'su.username',
        'su.city_ids',
        'su.station_ids',
        'su.user_type',
        'su.no',
        'su.is_usable',
        'su.is_headquarters',
        'su.is_national',

        'sr.data_scope',
        'sr.id as role_id',
        'sr.name as role_name',
        'sr.org_id',
        'sr.src_id',

        'sm.parent_id',
        'sm.parent_ids',
        'sm.`name` as menu_name',
        'sm.permission',
        'sm.sort'
    ].join(',');
    let sql = "select distinct " + columns + " from ?? su",params=[];
    params.push(tables.sys_user);
    sql += " inner join ?? sur on su.id = sur.user_id";
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
UserDao.prototype.insertUser = function(user_obj, role_ids, only_admin_roles){
    let _this = this;
    let trans;
    return co(function *() {
        trans = yield baseDao.trans(true);
        let results = yield trans.query(_this.base_insert_sql, [tables.sys_user, user_obj]);
        let user_id = results.insertId;
        let user_roles = [];
        role_ids.forEach(curr=> {
            let user_role = [user_id, curr, 0];
            if (only_admin_roles.indexOf(curr) != -1) {
                user_role[2] = 1;
            }
            user_roles.push(user_role);
        });
        let sql = "insert into ?? values ?";
        let params = [tables.sys_user_role, user_roles];
        yield trans.query(sql, params);
        yield trans.commit();
        return user_id;
    }).catch(err=> {
        if (trans && typeof trans.rollback == 'function') trans.rollback();
        return Promise.reject(err);
    });
};
UserDao.prototype.batchInsertUserRole = function(user_role_objs){
    let sql = "insert into ?? values ?";
    let params = [tables.sys_user_role,user_role_objs];
    return baseDao.batchInsert(sql,params);
};
UserDao.prototype.updateUserById = function(user_obj, user_id, role_ids, only_admin_roles){
    let _this = this;
    let trans;
    return co(function *() {
        trans = yield baseDao.trans(true);
        let sql = _this.base_update_sql + " where id = ?";
        let params = [tables.sys_user, user_obj, user_id];
        let result = yield trans.query(sql, params);

        if (role_ids) {
            sql = "delete from ?? where user_id = ?";
            params = [tables.sys_user_role, user_id];
            yield trans.query(sql, params);

            let user_roles = [];
            role_ids.forEach(curr=> {
                let user_role = [user_id, curr, 0];
                if (only_admin_roles && only_admin_roles.indexOf(curr) != -1) {
                    user_role[2] = 1;
                }
                user_roles.push(user_role);
            });
            sql = "insert into ?? values ?";
            params = [tables.sys_user_role, user_roles];
            yield trans.query(sql, params);
        }
        yield trans.commit();
        return result.affectedRows;
    }).catch(err=> {
        if (trans && typeof trans.rollback == 'function') trans.rollback();
        return Promise.reject(err);
    });
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
        'sr.name as role_name',
        'sur.only_admin'
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
    let ds = query_data.user.data_scopes,org_ids = query_data.user.org_ids,station_ids = query_data.user.station_ids,
        is_national = query_data.user.is_national;
    let columns = [
        'su.username',
        'su.id',
        'su.name',
        'su.mobile',
        'su.city_ids',
        'su.is_usable',
        'su.city_names',
        'su.is_headquarters'
    ].join(','),params = [];
    let sql = "select distinct " + columns + " from ?? su";
    params.push(tables.sys_user);
    sql += " inner join ?? sur on sur.user_id = su.id";
    params.push(tables.sys_user_role);
    sql += " inner join ?? sr on sr.id = sur.role_id";
    params.push(tables.sys_role);
    sql += " where 1=1";
    if (query_data.province_id) {
        let province_id_str = query_data.province_id.toString();
        sql += " and (su.city_ids REGEXP ? or su.is_headquarters = 1) ";
        params.push(province_id_str.substr(0, 2) + '[0-9]{4}');
    }
    if (query_data.city_id) {
        let city_id_str = query_data.city_id.toString();
        if (query_data.is_standard_area == '1') {
            sql += " and (su.city_ids REGEXP ? or su.is_headquarters = 1)";
            params.push(city_id_str.substr(0, 4) + '[0-9]{2}');
        } else {
            sql += " and (FIND_IN_SET( ? , su.city_ids) or su.is_headquarters = 1) ";
            params.push(query_data.city_id);
        }
    }
    if (query_data.is_headquarters) {
        sql += ` and su.is_headquarters = ? `;
        params.push(query_data.is_headquarters);
    }
    // data filter begin
    let ds_sql = "",temp_sql = "";
    if(!toolUtils.isEmptyArray(ds)){
        ds_sql += " and (";
        if(!query_data.user.is_admin && ds.indexOf(constant.DS.ALLCOMPANY.id) == -1){
            ds.forEach(curr => {
                if(curr == constant.DS.OFFICEANDCHILD.id){
                    temp_sql += " or sr.org_id in" + dbHelper.genInSql(org_ids);
                }else if(curr == constant.DS.STATION_ALL_USERS.id ){
                    station_ids.forEach(function (curr) {
                        temp_sql += " or FIND_IN_SET( ? , su.station_ids)";
                        params.push(curr);
                    });
                }
            });

            ds_sql += temp_sql.replace(/^ or/,'');
            ds_sql += ")";
        }else {
            ds_sql = "";
        }
        if(' and ()'.trim() == ds_sql.trim()){
            ds_sql = "";
        }
    }
    sql += ds_sql;
    if(!query_data.user.is_admin){
        sql += " and su.id != 1";
    }
    // data filter end
    if(!query_data.user.is_admin && ds.indexOf(constant.DS.ALLCOMPANY.id) == -1) {
        sql += " and sr.org_id in " + dbHelper.genInSql(org_ids);
    }
    if(query_data.org_id){
        sql += " and sr.org_id = ?";
        params.push(query_data.org_id);
    }

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
        console.log(require('mysql').format(pagination_sql,params));
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
