/**
 * @des    : the dao module of role
 * @author : pigo
 * @date   : 16/3/28
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
'use strict';
var dao = require('../../dao'),
    del_flag = require('../../dao/base_dao').del_flag,
    roleDao = dao.role,
    schema = require('../../schema'),
    systemUtils = require('../../common/SystemUtils'),
    toolUtils = require('../../common/ToolUtils'),
    res_obj = require('../../util/res_obj'),
    TiramisuError = require('../../error/tiramisu_error'),
    constant = require('../../common/Constant');

function RoleService() {

}
/**
 * add a role
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
RoleService.prototype.addRole = (req, res, next) => {
    req.checkBody(schema.addRole);
    let errors = req.validationErrors();
    if (errors) {
        return res.api(res_obj.INVALID_PARAMS, errors);
    }
    let role_obj = {
        description: req.body.description,
        name: req.body.name,
        data_scope: req.body.data_scope_id,
        org_id: req.body.org_id
    };
    let promise = roleDao.insertRole(systemUtils.assembleInsertObj(req,role_obj)).then(insertId => {
        if (!(toolUtils.isInt(insertId) && parseInt(insertId) > 0)) {
            throw new TiramisuError(res_obj.FAIL, '添加角色失败...');
        }
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * the the data scope of the special role
 * @param req
 * @param res
 * @param next
 */
RoleService.prototype.getRoleDataScopes = (req, res, next) => {
    let promise = Promise.resolve().then(ignore => {
        let data = [];
        for (let key in constant.DS) {
            let curr = constant.DS[key];
            data.push({id: curr.id, name: curr.name});
        }
        res.api(data);
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * find all the role list by the query iterms
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
RoleService.prototype.listRoles = (req, res, next) => {
    req.checkQuery(schema.listRoles);
    let errors = req.validationErrors();
    if (errors) {
        return res.api(res_obj.INVALID_PARAMS, errors);
    }
    let q = req.query;
    let query_data = {
        org_id: q.org_id,
        role_name: q.role_name,
        page_no: q.page_no || '',
        page_size: q.page_size || ''
    };
    let promise = roleDao.findRoles(query_data).then(_res => {
        if (toolUtils.isEmptyArray(_res.result) || toolUtils.isEmptyArray(_res._result)) {
            throw new TiramisuError(res_obj.NO_MORE_PAGE_RESULTS, null);
        }
        let res_data = {
            list: [],
            page_no: q.page_no,
            total: _res.result[0].total
        };
        _res._result.forEach(curr => {
            let role_obj = {
                description: curr.description,
                id: curr.id,
                name: curr.name
            };
            res_data.list.push(role_obj);
        });
        res.api(res_data);
    });
    systemUtils.wrapService(res, next, promise);
};
RoleService.prototype.deleteRole = (req, res, next) => {
    req.checkParams('roleId', '请指定要删除的角色ID....').isInt();
    let errors = req.validationErrors();
    if (errors) {
        return res.api(res_obj.INVALID_PARAMS, errors);
    }
    let role_id = req.params.roleId;
    let role_obj = {
        del_flag: del_flag.HIDE
    };
    let promise = roleDao.updateRoleById(role_id, systemUtils.assembleUpdateObj(req, role_obj)).then(affectedRows => {
        if (!toolUtils.isInt(affectedRows)) {
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        }
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
RoleService.prototype.getRoleDetail = (req, res, next) => {
    req.checkParams('roleId', '请指定要获取的角色ID....').isInt();
    let errors = req.validationErrors();
    if (errors) {
        return res.api(res_obj.INVALID_PARAMS, errors);
    }
    let role_id = req.params.roleId;
    let promise = roleDao.findRoleById(role_id).then(result => {
        if (toolUtils.isEmptyArray(result)) {
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let role = result[0];
        let data = {
            id: role.id,
            name: role.name,
            description: role.description,
            org_id : role.org_id,
            data_scope_id : role.data_scope
        };
        res.api(data);
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * edit the role properties
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
RoleService.prototype.editRole = (req, res, next) => {
    req.checkParams('roleId', '请指定要删除的角色ID....').isInt();
    req.checkBody(schema.editRole);
    let errors = req.validationErrors();
    if (errors) {
        return res.api(res_obj.INVALID_PARAMS, errors);
    }
    let role_id = req.params.roleId, b = req.body;
    let role_obj = {
        org_id: b.org_id,
        name: b.name,
        description: b.description
    };
    let promise = roleDao.updateRoleById(role_id, systemUtils.assembleUpdateObj(req, role_obj)).then(affectRows => {
        if (!toolUtils.isInt(affectRows)) {
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID, null);
        }
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * allocate the privileges of role
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
RoleService.prototype.allocatePrivileges = (req, res, next) => {
    req.checkParams('roleId', '请填写要分配权限的角色ID...').isInt();
    req.checkBody('privilege_ids', '请输入要分配的权限ID集合...').isArray();
    let errors = req.validationErrors();
    if (errors) {
        return res.api(res_obj.INVALID_PARAMS, errors);
    }
    let role_id = req.params.roleId, role_menu_ids = [];
    req.body.privilege_ids.forEach(curr => {
        role_menu_ids.push([role_id, curr]);
    });
    let promise = roleDao.batchDeleteRoleMenu(role_id).then(results => {
        return roleDao.batchInsertRoleMenu(role_id, role_menu_ids);
    }).then(result => {
        if (!result) {
            throw new TiramisuError(res_obj.FAIL, '批量新增角色权限关系异常...');
        }
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
module.exports = new RoleService();
