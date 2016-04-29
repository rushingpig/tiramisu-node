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
    orgDao = dao.org,
    schema = require('../../schema'),
    systemUtils = require('../../common/SystemUtils'),
    toolUtils = require('../../common/ToolUtils'),
    res_obj = require('../../util/res_obj'),
    TiramisuError = require('../../error/tiramisu_error');

function OrgService() {

}
/**
 * get all organizations
 * @param req
 * @param res
 * @param next
 */
OrgService.prototype.listAllOrgs = (req,res,next) => {
    let query_data = {
        user : req.session.user,
        signal : req.query.signal
    };
    let promise = orgDao.findAllOrgs(query_data).then(results => {
        if(toolUtils.isEmptyArray(results)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let data = {
            list : [],
            total : 0
        };
        results.forEach(curr => {
            data.list.push({id:curr.id,name:curr.name});
        });
        data.total = data.list.length;
        res.api(data);
    });
    systemUtils.wrapService(res,next,promise);
};
OrgService.prototype.addOrg = (req,res,next) => {
    req.checkBody('description','请填写部门描述...').optional().notEmpty();
    req.checkBody('name','请填写部门名称').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let org_obj = {
        description : req.body.description,
        name : req.body.name
    };
    let promise = orgDao.insertOrg(systemUtils.assembleInsertObj(req,org_obj)).then(insertId => {
        if(!(toolUtils.isInt(insertId) && parseInt(insertId) > 0)){
            throw new TiramisuError(res_obj.FAIL,'新增机构部门失败...');
        }
        res.api();
    });
    systemUtils.wrapService(res,next,promise);

};

module.exports = new OrgService();
