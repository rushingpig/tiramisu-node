/**
 * @des    : the service module of user
 * @author : pigo.can
 * @date   : 15/12/9 下午4:19
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var dao = require('../../dao'),
    del_flag = require('../../dao/base_dao').del_flag,
    is_usable = require('../../dao/base_dao').is_usable,
    UserDao = dao.user,
    userDao = new UserDao(),
    addressDao = new dao.address(),
    deliveryDao = new dao.delivery(),
    schema = require('../../schema'),
    systemUtils = require('../../common/SystemUtils'),
    toolUtils = require('../../common/ToolUtils'),
    cryptoUtils = require('../../common/CryptoUtils'),
    res_obj = require('../../util/res_obj'),
    TiramisuError = require('../../error/tiramisu_error'),
    async = require('async');

function UserService() {

}
UserService.prototype.getUserInfo = (username, password)=> {
    return userDao.findByUsername(username, password).then((results) => {
        if (results.length == 0) {
            return null;
        } else {
            let user = {
                is_admin : false,
                permissions : [],
                roles : [],
                data_scopes : [],
                org_ids : []
            };
            //  ###     tips : 当给user属性赋值set类型时,存入session再取出来,属性值为空     ###
            let roles_set = new Set(),data_scopes_set = new Set(),org_ids_set = new Set();
            for(let i = 0;i < results.length;i++){
                let curr = results[i];
                if(i === 0){
                    // the admin id is fixed at 1
                    if(curr.id == 1){
                        user.is_admin = true;
                    }
                    user.id = curr.id;
                    user.username = curr.username;
                    user.city_ids = curr.city_ids ? curr.city_ids.split(',') : '';
                    user.station_ids = curr.station_ids ? curr.station_ids.split(',') : '';
                    user.user_type = curr.user_type;
                    user.no = curr.no;
                    user.name = curr.name;
                    user.is_headquarters = curr.is_headquarters;
                    user.is_national = curr.is_national;
                    user.is_usable = curr.is_usable;
                }
                if(curr.permission) user.permissions.push(curr.permission);
                if(curr.role_name && !roles_set.has(curr.role_id)){
                    user.roles.push({id:curr.role_id,name:curr.role_name});
                    roles_set.add(curr.role_id);
                    org_ids_set.add(curr.org_id);
                }
                if(curr.data_scope)  data_scopes_set.add(curr.data_scope);
            }
            user.data_scopes = Array.from(data_scopes_set.values());
            user.org_ids = Array.from(org_ids_set.values());
            return user;
        }
    });
};
/**
 * add user
 * @param req
 * @param res
 * @param next
 */
UserService.prototype.addUser = (req,res,next) => {
    req.checkBody(schema.addUser);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let b = req.body;
    let user_obj = {
        city_ids : b.city_ids ? b.city_ids.join(',') : '',
        mobile : b.mobile,
        name : b.name,
        password : cryptoUtils.md5(b.password),
        station_ids : b.station_ids ? b.station_ids.join(',') : '',
        username : b.username,
        city_names : b.city_names ? b.city_names.join(',') : '',
        is_usable : is_usable.enable
    };
    async.series([
        function(cb){
            if(parseInt(b.is_headquarters) === 1){
                addressDao.findAllCities().then(cities => {
                    let city_names = [];
                    cities.forEach(curr => {
                        city_names.push(curr.name);
                    });
                    user_obj.city_names = city_names.join(',');
                    cb(null);
                });
            }else {
                cb(null);
            }
        },
        function(cb){
            let promise = userDao.insertUser(systemUtils.assembleInsertObj(req,user_obj)).then(insertId=>{
                if(!insertId){
                    throw new TiramisuError(res_obj.FAIL,'新增用户异常...');
                }
                let user_role_objs = [];
                b.role_ids.forEach(curr=>{
                    user_role_objs.push([insertId,curr]);
                });
                return userDao.batchInsertUserRole(user_role_objs);
            }).then(affectRows => {
                if(!affectRows){
                    throw new TiramisuError(res_obj.FAIL,'新增用户角色映射关系异常...');
                }
                res.api();
                cb(null);
            }).catch(err => {
                if(err.code == 'ER_DUP_ENTRY'){
                    throw new TiramisuError(res_obj.EXIST_USERNAME,err);
                }
                throw err;
            });
            systemUtils.wrapService(res,next,promise,cb);
        }
    ]);
};
/**
 * delete user from the list for display
 * @param req
 * @param res
 * @param next
 */
UserService.prototype.deleteUser = (req,res,next) => {
    req.checkParams('userId','请指定要删除的用户ID...').isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let user_id = req.params.userId;
    let user_obj = {
        del_flag : del_flag.HIDE
    };
    let promise = userDao.updateUserById(systemUtils.assembleUpdateObj(req,user_obj),user_id).then(affectRows=>{
        if(!affectRows){
            throw new TiramisuError(res_obj.FAIL,'删除用户失败,请稍后重试...');
        }
        res.api();
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * enable or disable the user
 * @param req
 * @param res
 * @param next
 */
UserService.prototype.enOrdisableUser = (req,res,next) => {
    req.checkParams('userId','请指定要启用或禁用的用户ID...').isInt();
    // req.checkBody('is_usable','请指定对该用户的操作 启用 | 禁用').isBoolean();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let user_id = req.params.userId;
    let user_obj = {
        is_usable : req.body.is_usable ? 1 : 0
    };
    let promise = userDao.updateUserById(systemUtils.assembleUpdateObj(req,user_obj),user_id).then(affectRows => {
        if(!affectRows){
            throw new TiramisuError(res_obj.FAIL,'启用 | 禁用 用户失败,请稍后重试...');
        }
        res.api();
    });
    systemUtils.wrapService(res,next,promise);
};
UserService.prototype.getUserDetail = (req,res,next) => {
    req.checkParams('userId','请指定要查询的用户ID...').isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let user_id = req.params.userId;
    let res_data = {
        roles : [],
        cities : [],
        stations : []
    };
    let promise = userDao.findUserById(user_id).then(results => {
        if(!(results)){
            throw new TiramisuError(res_obj.USER_NOT_EXIST,'该用户不存在,请确认用户ID...');
        }

        let city_ids_str = '',station_ids_str = '';
        results.forEach((curr,index)=> {
            if(index === 0){
                city_ids_str = curr.city_ids || '';
                res_data.id = curr.id;
                res_data.mobile = curr.mobile;
                res_data.name = curr.name;
                res_data.username = curr.username;
                res_data.is_headquarters = curr.is_headquarters;
                res_data.is_national = curr.is_national;
                station_ids_str = curr.station_ids || '';
            }
            res_data.roles.push({role_id : curr.role_id,role_name : curr.role_name});
        });
        let city_ids = city_ids_str.split(','),station_ids = station_ids_str.split(',');
        return addressDao.findCitiesByIds(city_ids).then(result => {
            if(result){
                result.forEach(curr => {
                    res_data.cities.push({city_id : curr.id,city_name : curr.name});
                });
            }
            return deliveryDao.findAllStations({station_ids});
        }).then(result => {
            if(result){
                result.forEach(curr => {
                    res_data.stations.push({station_id : curr.id,station_name : curr.name});
                });
            }
            res.api(res_data);
        });
    });
    systemUtils.wrapService(res,next,promise);
};
UserService.prototype.listUsers = (req,res,next) => {
    req.checkQuery(schema.listUsers);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let q = req.query;
    let query_data = {
        org_id : q.org_id,
        uname_or_name : q.uname_or_name,
        page_no : q.page_no,
        page_size : q.page_size,
        user : req.session.user
    };
    let promise = userDao.findUsers(query_data).then(_res => {
        if(toolUtils.isEmptyArray(_res._result) || toolUtils.isEmptyArray(_res.result)){
            throw new TiramisuError(res_obj.NO_MORE_PAGE_RESULTS,null);
        }
        let res_data = {
            list : [],
            total : _res.result[0].total,
            page_no : q.page_no
        };
        let user_map = new Map();
        _res._result.forEach(curr=>{
            if(!user_map.has(curr.id)){
                let user_obj = {
                    city_names : curr.is_headquarters ? '总部' : curr.city_names,
                    id : curr.id,
                    is_usable : curr.is_usable,
                    mobile : curr.mobile,
                    name : curr.name,
                    username : curr.username,
                    role_names : curr.role_name
                };
                user_map.set(curr.id,user_obj);
            }else{
                user_map.get(curr.id).role_names += ','+curr.role_name;
            }
        });
        res_data.list = Array.from(user_map.values());
        res.api(res_data);
    });
    systemUtils.wrapService(res,next,promise);
};
UserService.prototype.editUser = (req,res,next) => {
    req.checkBody(schema.editUser);
    req.checkParams('userId','请指定要编辑的用户ID...').isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let b = req.body,user_id = req.params.userId;
    let user_obj = {
        city_ids : b.city_ids.join(','),
        mobile : b.mobile,
        name : b.name,
        password : cryptoUtils.md5(b.password),
        station_ids : b.station_ids,
        username : b.username,
        is_headquarters : b.is_headquarters,
        is_national : b.is_national
    };
    async.series([
        function(cb){
            if(parseInt(b.is_headquarters) === 1){
                addressDao.findAllCities().then(cities => {
                    let city_names = [];
                    cities.forEach(curr => {
                        city_names.push(curr.name);
                    });
                    user_obj.city_names = city_names.join(',');
                    cb(null);
                });
            }else {
                cb(null);
            }
        },
        function(cb){
            let promise = userDao.updateUserById(systemUtils.assembleUpdateObj(req,user_obj),user_id).then(affectRows=>{
                if(!toolUtils.isInt(affectRows)){
                    throw new TiramisuError(res_obj.FAIL,'更新用户异常...');
                }
                return userDao.deleteUserRole(user_id);
            }).then(deleteRows => {
                if(!deleteRows){
                    throw new TiramisuError(res_obj.FAIL,'更新用户异常...');
                }
                let user_role_objs = [];
                b.role_ids.forEach(curr=>{
                    user_role_objs.push([user_id,curr]);
                });
                return userDao.batchInsertUserRole(user_role_objs);
            }).then(affectRows => {
                if(!affectRows){
                    throw new TiramisuError(res_obj.FAIL,'新增用户角色映射关系异常...');
                }
                res.api();
                cb(null);
            });
            systemUtils.wrapService(res,next,promise,cb);
        }
    ]);
};
module.exports = new UserService();