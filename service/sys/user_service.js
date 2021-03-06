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
var _ = require('lodash');
var co = require('co');

function UserService() {

}
UserService.prototype.getUserInfo = (username, password)=> {
    return co(function *() {
        let results = yield userDao.findByUsername(username, password);
        if(results.length == 0) return null;
        let user = {
            is_admin: false,
            permissions: [],
            roles: [],
            data_scopes: [],
            org_ids: [],
            role_ids: [],
            src_ids: []
        };
        //  ###     tips : 当给user属性赋值set类型时,存入session再取出来,属性值为空     ###
        let roles_set = new Set(), data_scopes_set = new Set(), org_ids_set = new Set();
        for (let i = 0; i < results.length; i++) {
            let curr = results[i];
            if (i === 0) {
                // the admin id is fixed at 1
                if (curr.id == 1) {
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

                if (user.is_admin || user.is_headquarters) {
                    let all_city = yield addressDao.findCities({user: user});
                    all_city.forEach(c=> {
                        let tmp_id = c.id.toString();
                        if (user.city_ids.indexOf(tmp_id) == -1)
                            user.city_ids.push(tmp_id);
                    });
                }
                if (user.is_admin || user.is_national) {
                    let query_station = {city_ids: user.city_ids, user: user};
                    if (!user.is_admin) query_station.is_national = 0;
                    let all_station = yield deliveryDao.findAllStations(query_station);
                    all_station.forEach(c=> {
                        let tmp_id = c.id.toString();
                        if (user.station_ids.indexOf(tmp_id) == -1)
                            user.station_ids.push(tmp_id);
                    });
                }
            }
            if(curr.permission) user.permissions.push(curr.permission);
            if(curr.role_name && !roles_set.has(curr.role_id)){
                user.roles.push({id:curr.role_id,name:curr.role_name});
                user.role_ids.push(curr.role_id);
                roles_set.add(curr.role_id);
                org_ids_set.add(curr.org_id);
                if (curr.src_id == 0) user.is_all_src = 1;  // src_id为0时 将具有所有渠道权限
                if(curr.src_id){
                    user.src_ids.push(curr.src_id);
                }
            }
            if (curr.data_scope)  data_scopes_set.add(curr.data_scope);
        }
        user.data_scopes = Array.from(data_scopes_set.values());
        user.org_ids = Array.from(org_ids_set.values());
        _.pull(user.city_ids, '999');  // 删除999 当勾选时时会出现999
        _.pull(user.station_ids, '999');  // 删除999 当勾选所属城市全部配送站时会出现999
        return user;
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
    let curr_user = req.session.user;
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
    if (curr_user.is_headquarters) user_obj.is_headquarters = b.is_headquarters;
    if (curr_user.is_national) user_obj.is_national = b.is_national;
    let promise = co(function *() {
        if ((yield userDao.isExist(user_obj))) {
            return Promise.reject(new TiramisuError(res_obj.EXIST_USER_MOBILE));
        }
        if (parseInt(b.is_headquarters) !== 1) {
            yield addressDao.findCitiesByIds(b.city_ids).then(cities => {
                let city_names = [];
                cities.forEach(curr => {
                    city_names.push(curr.name);
                });
                user_obj.city_names = city_names.join(',');
            });
        }
        let role_ids = b.role_ids || [];
        let only_admin_roles = b.only_admin_roles || [];
        return userDao.insertUser(systemUtils.assembleInsertObj(req, user_obj), role_ids, only_admin_roles);
    }).then(insertId=> {
        if (!insertId) {
            throw new TiramisuError(res_obj.FAIL, '新增用户异常...');
        }
        res.api();
    }).catch(err=> {
        if (err.code == 'ER_DUP_ENTRY') {
            throw new TiramisuError(res_obj.EXIST_USERNAME, res_obj.EXIST_USERNAME.msg);
        }
        throw err;
    });
    systemUtils.wrapService(res, next, promise);
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

    let promise = co(function *() {
        let user_info = yield userDao.findUserById(user_id);
        if(!user_info){
            return Promise.reject(new TiramisuError(res_obj.USER_NOT_EXIST,'该用户不存在,请确认用户ID...'));
        }

        let city_ids_str = '',station_ids_str = '';
        user_info.forEach((curr,index)=> {
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
            res_data.roles.push({role_id: curr.role_id, role_name: curr.role_name, only_admin: curr.only_admin});
        });
        let city_ids = city_ids_str.split(','),station_ids = station_ids_str.split(',');
        if (res_data.is_national) {
            let all_station = yield deliveryDao.findAllStations({city_ids: city_ids, user: res_data, is_national: 0});
            all_station.forEach(c=> {
                let tmp_id = c.id.toString();
                if (station_ids.indexOf(tmp_id) == -1)
                    station_ids.push(tmp_id);
            });
        }

        let cities = yield addressDao.findCitiesByIds(city_ids);
        if(cities){
            cities.forEach(curr => {
                res_data.cities.push({city_id : curr.id,city_name : curr.name});
            });
        }
        let stations = yield deliveryDao.findAllStations({station_ids});
        if(stations){
            stations.forEach(curr => {
                res_data.stations.push({station_id : curr.id,station_name : curr.name});
            });
        }
        res.api(res_data);
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
    let query_data = Object.assign({user: req.session.user}, req.query);
    if (query_data.uname_or_name) query_data.uname_or_name = query_data.uname_or_name.replace(/(^\s*)|(\s*$)/g, '');
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
    let curr_user = req.session.user;
    let b = req.body,user_id = req.params.userId;
    let user_obj = {
        city_ids : b.city_ids ? b.city_ids.join(',') : '',
        mobile : b.mobile,
        name : b.name,
        station_ids : b.station_ids ? b.station_ids.join(',') : '',
        username : b.username,
        city_names : b.city_names ? b.city_names.join(',') : ''
    };
    if (curr_user.is_headquarters) user_obj.is_headquarters = b.is_headquarters;
    if (curr_user.is_national) user_obj.is_national = b.is_national;
    if(b.password){
        user_obj.password = cryptoUtils.md5(b.password);
    }
    let promise = co(function *() {
        if ((yield userDao.isExist(user_obj, {user_id: user_id}))) {
            return Promise.reject(new TiramisuError(res_obj.EXIST_USER_MOBILE));
        }
        if (parseInt(b.is_headquarters) !== 1) {
            yield addressDao.findCitiesByIds(b.city_ids).then(cities => {
                let city_names = [];
                cities.forEach(curr => {
                    city_names.push(curr.name);
                });
                user_obj.city_names = city_names.join(',');
            });
        }
        let role_ids = b.role_ids || [];
        let only_admin_roles = b.only_admin_roles || [];
        return userDao.updateUserById(systemUtils.assembleUpdateObj(req, user_obj), user_id, role_ids, only_admin_roles);
    }).then(()=> {
        res.api();
    }).catch(err=> {
        if (err.code == 'ER_DUP_ENTRY') {
            throw new TiramisuError(res_obj.EXIST_USERNAME, err);
        }
        throw err;
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * change the user password
 * @param req
 * @param res
 * @param next
 */
UserService.prototype.changePwd = (req,res,next) => {
    req.checkParams('username','请指定要修改的用户登录名。。。').notEmpty();
    req.checkBody(schema.changePwd);
    let errors = req.validationErrors();
    if (errors) {
        return res.api(res_obj.INVALID_PARAMS,errors);
    }
    let new_password = req.body.new_password,
        old_password = req.body.old_password,
        db_password = cryptoUtils.md5(old_password.toString().trim()),
        new_db_password = cryptoUtils.md5(new_password.toString().trim()),
        verify_new_password = req.body.verify_new_password,
        username = req.params.username;
    if(new_password !== verify_new_password){
        return res.api(res_obj.PWD_NOT_CONSISTENT,null,null);
    }
    let promise = new UserService().getUserInfo(username,db_password).then(user => {
        if(!user){
            throw new TiramisuError(res_obj.INCORRECT_PWD);
        }
        let user_id = user.id;
        let user_obj = {
            password : new_db_password
        };
        return userDao.updateUserById(user_obj,user_id);

    }).then(affectRows => {
        if(!toolUtils.isInt(affectRows)){
            throw new TiramisuError(res_obj.FAIL,'重置密码异常...');
        }
        res.api();
    });
    systemUtils.wrapService(res,next,promise);

};
module.exports = new UserService();
