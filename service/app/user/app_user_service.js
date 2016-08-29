/* global , */
/**
 * @des    : the service module of the order
 * @author : pigo.can
 * @date   : 15/12/17 上午9:39
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var res_obj = require('../../../util/res_obj'),
    systemUtils = require('../../../common/SystemUtils'),
    toolUtils = require('../../../common/ToolUtils'),
    dateUtils = require('../../../common/DateUtils'),
    TiramisuError = require('../../../error/tiramisu_error'),
    Constant = require('../../../common/Constant'),
    schema = require('../../../schema'),
    listAppUsers = schema.listAppUsers,
    listAppUserLoginLogs = schema.listAppUserLoginLogs,
    del_flag = require('../../../dao/base_dao').del_flag,
    baseDao = require('../../../dao/base_dao'),
    dao = require('../../../dao'),
    appUserDao = dao.appUser,
    util = require('util'),
    config = require('../../../config'),
    s = systemUtils.sanitizeAddress,
    toolUtils = require('../../../common/ToolUtils');
var request = require('request');

function AppUserService() {}
/**
 * 获取app用户列表
 * @param req
 * @param res
 * @param next
 */
AppUserService.prototype.listAppUsers = (req, res, next) => {
    req.checkQuery(listAppUsers);
    let errors = req.validationErrors();
    if (errors) {
        return res.api(res_obj.INVALID_PARAMS, errors);
    }
    let q = req.query;
    let query_data = {
        page_no : q.page_no,
        page_size : q.page_size,
        keywords : q.keywords,
        province_id : q.province_id,
        city_id : q.city_id
    };
    // 根据条件筛选app用户
    let promise = appUserDao.findAppUsers(query_data).then((results) => {
        if (toolUtils.isEmptyArray(results._result)) {
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let data = {
            list : [],
            total : results.result.total,
            page_no : q.page_no
        };
        results._result.forEach((curr,index) => {
            let res_data = {
                address : (s(curr.province_name) + " " + s(curr.city_name) + " " + s(curr.regionalism_name) + " " + s(curr.address)).trim(),
                birthday : curr.birthday ? curr.birthday : "",
                is_in_blacklist : curr.is_in_blacklist,
                nick_name : s(curr.nick_name),
                passworded : !systemUtils.isBlankDBValue(curr.auth_token),
                auth_id : curr.auth_id,
                sex : systemUtils.getSexName(curr.sex),
                uuid : curr.uuid,
            };
            data.list.push(res_data);
        });
        res.api(data);
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * 获取app用户详情
 * @param req
 * @param res
 * @param next
 */
AppUserService.prototype.getAppUserInfo = (req,res,next) => {
    req.checkParams('uuid').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.api(res_obj.INVALID_PARAMS, errors);
    }
    let uuid = req.params.uuid;
    let promise = appUserDao.findAppUserByUUID(uuid).then(_res => {
        if (toolUtils.isEmptyArray(_res)) {
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let curr = _res[0];
        let data = {
            address : (s(curr.province_name) + " " + s(curr.city_name) + " " + s(curr.regionalism_name) + " " + s(curr.address)).trim(),
            birthday : curr.birthday ? curr.birthday : "",
            avatar : curr.avatar,
            is_in_blacklist : curr.is_in_blacklist,
            nick_name : s(curr.nick_name),
            passworded : !systemUtils.isBlankDBValue(curr.auth_token),
            auth_id : curr.auth_id,
            sex : systemUtils.getSexName(curr.sex)
        };
        res.api(data);
    });
    systemUtils.wrapService(res, next, promise);
};

/**
 * 将某个用户加入到黑名单
 * @param req
 * @param res
 * @param next
 */
AppUserService.prototype.addBlackList = (req,res,next) => {
    req.checkParams('uuid').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.api(res_obj.INVALID_PARAMS, errors);
    }
    let uuid = req.params.uuid;
    let user_profile_promise = appUserDao.blacklistUserProfiles(uuid).then((affectedRows) => {
        if (affectedRows < 1){
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        }
    });
    let blacklist_promise = appUserDao.insertBlacklist(req, uuid).then(insertResult => {
        if (insertResult < 1){
            throw new TiramisuError(res_obj.FAIL);
        }
    }).catch((err)=>{
        if (err.code === 'ER_DUP_ENTRY') {
            throw new TiramisuError(res_obj.ALREADY_IN_BLACKLIST);
        }
    });
    let promise = Promise.all([user_profile_promise,blacklist_promise]).then(()=>{
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};

/**
 * 获取用户登录日志
 * @param req
 * @param res
 * @param next
 */
AppUserService.prototype.getUserLoginLogs = (req,res,next) => {
    req.checkQuery(listAppUserLoginLogs);
    req.checkParams('uuid').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.api(res_obj.INVALID_PARAMS, errors);
    }
    let q = req.query;
    let query_data = {
        uuid : req.params.uuid,
        page_no : q.page_no,
        page_size : q.page_size,
        last_id : q.last_id
    };
    let promise = appUserDao.findLoginLogs(query_data).then(results => {
        if (toolUtils.isEmptyArray(results)) {
            return res.api(res_obj.NO_MORE_RESULTS_ARR);
        }
        let data = {
            list : [],
            last_id : results[results.length - 1].id
        };
        results.forEach((curr) => {
            let res_data = {
                ip : s(curr.ip),
                visit_src : s(curr.visit_src),
                datetime : curr.datetime
            };
            data.list.push(res_data);
        });
        res.api(data);
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * 导出app用户excel列表
 * @param req
 * @param res
 * @param next
 */
AppUserService.prototype.exportExcel = (req,res,next) => {
    let q = req.query;
    let query_data = {
        keywords : q.keywords,
        province_id : q.province_id,
        city_id : q.city_id
    };

    let promise = appUserDao.findAppUsers(query_data,true).then((resObj) => {
        if (!resObj) {
            return res.api(res_obj.FAIL);
        }
        let uri = config.base_excel_host + '/users';
        // 请求导出excel服务
        request({
            uri : uri,
            method : 'post',
            timeout : 120000, // 30s超时
            json : true,
            body : resObj
        }).on('error', (err) => {
            return res.api(res_obj.FAIL, err);
        }).pipe(res || null);
    });
};

module.exports = new AppUserService();