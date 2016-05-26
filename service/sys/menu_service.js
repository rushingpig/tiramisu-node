/**
 * @des    :
 * @author : pigo
 * @date   : 16/3/28
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
'use strict';
var dao = require('../../dao'),
    del_flag = require('../../dao/base_dao').del_flag,
    menuDao = dao.menu,
    schema = require('../../schema'),
    systemUtils = require('../../common/SystemUtils'),
    toolUtils = require('../../common/ToolUtils'),
    res_obj = require('../../util/res_obj'),
    TiramisuError = require('../../error/tiramisu_error'),
    constant = require('../../common/Constant');
var _ = require('lodash');
var co = require('co');

function MenuService() {

}
MenuService.prototype.addMenu = (req,res,next) => {
    req.checkBody(schema.addMenu);
    let errors = req.validationErrors();
    if (errors) {
        return res.api(res_obj.INVALID_PARAMS,errors);
    }
    let b = req.body;
    let menu_obj = {
        permission : b.code,
        name : b.name,
        description : b.description,
        module_id : b.module_id,
        type : b.type
    };
    let promise = menuDao.insertMenu(systemUtils.assembleInsertObj(req,menu_obj)).then(insertId => {
        if(!insertId){
            throw new TiramisuError(res_obj.FAIL,'新增权限记录异常...');
        }
        res.api();
    });
    systemUtils.wrapService(res,next,promise);
};
MenuService.prototype.addModule = (req,res,next) => {
    req.checkBody('module_name','请输入模块名称....').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.api(res_obj.INVALID_PARAMS,errors);
    }
    let b = req.body;
    let menu_obj = {
        name : b.module_name,
        type : 'MODULE'
    };
    let promise = co(function *() {
        if (b.parent_id) {
            let parent = yield menuDao.findModuleById(b.parent_id);
            if (toolUtils.isEmptyArray(parent)) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS, 'not found parent_id...'));
            parent = parent[0];
            menu_obj.parent_id = parent.id;
            menu_obj.parent_ids = parent.parent_ids + ',' + parent.id;
            menu_obj.level = parent.level + 1;
        } else {
            menu_obj.parent_id = 0;
            menu_obj.parent_ids = '';
            menu_obj.level = 1;
        }
        let insertId = yield menuDao.insertMenu(systemUtils.assembleInsertObj(req, menu_obj));
        if (!insertId) return Promise.reject(new TiramisuError(res_obj.FAIL, '新增模块记录异常...'));
    }).then(res.api);
    systemUtils.wrapService(res, next, promise);
};
MenuService.prototype.editModule = (req, res, next) => {
    let promise = co(function *() {
        let b = req.body;
        if (!b.parent_id || !b.module_name) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS));
        let module_id = req.params.moduleId;
        let module = yield menuDao.findModuleById(module_id);
        if (toolUtils.isEmptyArray(module)) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS, 'not found moduleId...'));
        let menu_obj = {
            type: 'MODULE'
        };
        if (b.module_name) {
            menu_obj.module_name = b.module_name;
        }
        if (b.parent_id) {
            let parent = yield menuDao.findModuleById(b.parent_id);
            if (toolUtils.isEmptyArray(parent)) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS, 'not found parent_id...'));
            parent = parent[0];
            menu_obj.parent_id = parent.id;
            menu_obj.parent_ids = parent.parent_ids + ',' + parent.id;
            menu_obj.level = parent.level + 1;
        }
        let result = yield menuDao.updateMenuById(module_id, systemUtils.assembleUpdateObj(req, menu_obj));
        if (!result) return Promise.reject(new TiramisuError(res_obj.FAIL, '更新模块记录异常...'));
    }).then(res.api);
    systemUtils.wrapService(res, next, promise);
};
MenuService.prototype.deleteMenu = (req,res,next) => {
    req.checkParams('privilegeId','请指定要操作的权限ID...').isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let menu_id = req.params.privilegeId;
    let menu_obj = {
        del_flag : del_flag.HIDE
    };
    let promise = menuDao.updateMenuById(menu_id,systemUtils.assembleUpdateObj(req,menu_obj)).then(affectRows => {
        if(!affectRows){
            throw new TiramisuError(res_obj.FAIL,'删除权限异常....');
        }
        res.api();
    });
    systemUtils.wrapService(res,next,promise);
};
MenuService.prototype.listMenus = (req,res,next) => {
    req.checkQuery('role_id').optional().isInt();
    req.checkQuery('module_name').optional().notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.api(res_obj.INVALID_PARAMS,errors);
    }
    let q = req.query;
    let query_data = {
        role_id : q.role_id,
        module_name : q.module_name,
        user : req.session.user
    };
    let promise = menuDao.findMenus(query_data).then(result => {
        if(toolUtils.isEmptyArray(result)){
            throw new TiramisuError(res_obj.NO_MORE_PAGE_RESULTS);
        }
        let res_data = {
            list : result,
            total : result.length
        };
        res.api(res_data);
    });
    systemUtils.wrapService(res,next,promise);
};
MenuService.prototype.getMenuDetail = (req,res,next) => {
    req.checkParams('privilegeId','请指定要操作的权限ID...').isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let menu_id = req.params.privilegeId;
    let promise = menuDao.findMenuById(menu_id).then(result => {
        if(toolUtils.isEmptyArray(result)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let curr = result[0];
        let res_data = {
            id : curr.id,
            name : curr.name,
            description : curr.description,
            module_name : curr.module_name,
            type : curr.type,
            code : curr.permission,
            module_id : curr.module_id
        };
        res.api(res_data);
    });
    systemUtils.wrapService(res,next,promise);
};
MenuService.prototype.editMenu = (req,res,next) => {
    req.checkBody(schema.editMenu);
    req.checkParams('privilegeId','请指定要操作的权限ID...').isInt();
    let errors = req.validationErrors();
    if (errors) {
        return res.api(res_obj.INVALID_PARAMS,errors);
    }
    let b = req.body;
    let menu_id = req.params.privilegeId;
    let menu_obj = {
        permission : b.code,
        name : b.name,
        description : b.description,
        module_id : b.module_id,
        type : b.type
    };
    let promise = menuDao.updateMenuById(menu_id,systemUtils.assembleUpdateObj(req,menu_obj)).then(insertId => {
        if(!insertId){
            throw new TiramisuError(res_obj.FAIL,'新增权限记录异常...');
        }
        res.api();
    });
    systemUtils.wrapService(res,next,promise);
};
MenuService.prototype.listAllModules = (req,res,next) => {
    let promise = menuDao.findAllModules().then(result => {
        if(toolUtils.isEmptyArray(result)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let data = {};
        result.forEach(curr => {
            data[curr.id] = _.omit(curr, 'id');
        });
        res.api(data);
    });
    systemUtils.wrapService(res,next,promise);
};
module.exports = new MenuService();
