"use strict";

var _ = require('lodash');
var co = require('co');

var Constant = require('../../../common/Constant');
var dao = require('../../../dao');
var groupDao = dao.group;

const schema = require('../../../schema');
const systemUtils = require('../../../common/SystemUtils');
const TiramisuError = require('../../../error/tiramisu_error');
const res_obj = require('../../../util/res_obj');

module.exports.getProductList = function (req, res, next) {
    let promise = co(function *() {
        let query = Object.assign({}, req.query);
        if (!query.city_id) query.city_id = query.regionalism_id;
        let _res = yield groupDao.findProduct(query);
        _res.list.forEach(curr=> {
            curr.is_online = 0;
            if (curr.website_sku_id) curr.is_online = 1;
        });
        return _res;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getSkuList = function (req, res, next) {
    let promise = co(function *() {
        let query = Object.assign({}, req.query);
        if (!query.city_id) query.city_id = query.regionalism_id;
        let _res = yield groupDao.findSku(query);
        _res.list.forEach(curr=> {
            curr.is_available = 1;
            curr.is_online = 0;
            if (curr.group_project_id) curr.is_available = 0;
            if (curr.website_sku_id) curr.is_online = 1;
        });
        return _res;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getSkuInfo = function (req, res, next) {
    let promise = co(function *() {
        let sku_id = req.params.skuId;
        let info = yield groupDao.findSkuById(sku_id);

        return info[0];
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.addSku = function (req, res, next) {
    let promise = co(function *() {
        let body = req.body;
        for (let i = 0; i < req.body.products.length; i++){
            let curr = req.body.products[i];
            let sku_info = {
                product_id: body.product_id,
                size: curr.size,
                display_name: curr.product_name,
                website: body.src_id,
                regionalism_id: body.regionalism_id,
                price: curr.price
            };
            yield groupDao.insertSku(systemUtils.assembleInsertObj(req, sku_info));
        }
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.delSku = function (req, res, next) {
    let promise = co(function *() {
        let sku_id = req.params.skuId;
        let sku_info = {
            del_flag: 0
        };
        return yield groupDao.updateSku(sku_id, systemUtils.assembleUpdateObj(req, sku_info));
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.editSku = function (req, res, next) {
    let promise = co(function *() {
        let sku_id = req.params.skuId;
        let sku_info = {};
        if (req.body.price) sku_info.price = req.body.price;
        if (req.body.display_name) sku_info.display_name = req.body.name;
        return yield groupDao.updateSku(sku_id, systemUtils.assembleUpdateObj(req, sku_info));
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};


module.exports.getProjectList = function (req, res, next) {
    let promise = co(function *() {
        let query = req.query;
        return yield groupDao.findProject(query);
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getProjectInfo = function (req, res, next) {
    let promise = co(function *() {
        let project_id = req.params.projectId;
        return yield groupDao.findProjectById(project_id);
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.addProject = function (req, res, next) {
    let promise = co(function *() {
        let body = req.body;
        let project_info = {
            name: body.name,
            regionalism_id: body.regionalism_id,
            src_id: body.src_id,
            start_time: body.start_time,
            end_time: body.end_time
        };
        if (!body.products || body.products.length == 0) return Promise.reject(new TiramisuError(res_obj.FAIL, `未选择商品...`));
        for (let i = 0; i < body.products.length; i++) {
            let sku = body.products[i];
            let query = {
                id: sku,
                src_id: body.src_id,
                city_id: body.regionalism_id
            };
            let info = yield groupDao.findSku(query, true);
            console.log(info);
            if (!info || info.total == 0) return Promise.reject(new TiramisuError(res_obj.FAIL, `sku:${sku}不存在...`));
        }
        project_info.skus = body.products.join();
        return yield groupDao.insertProject(project_info);
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.delProject = function (req, res, next) {
    let promise = co(function *() {
        let project_id = req.params.projectId;
        let project_info = {
            del_flag: 0
        };
        return yield groupDao.updateProject(project_id, project_info);
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.editProject = function (req, res, next) {
    let promise = co(function *() {
        let body = req.body;
        let project_id = req.params.projectId;
        let project_info = {
            name: body.name,
            start_time: body.start_time,
            end_time: body.end_time
        };
        for (let i = 0; i < body.products.length; i++) {
            let sku = body.products[i];
            let query = {
                id: sku,
                src_id: body.src_id,
                city_id: body.regionalism_id
            };
            let info = yield groupDao.findSku(query);
            if (!info || info.length == 0) return Promise.reject(new TiramisuError(res_obj.FAIL, `sku:${sku}不存在...`));
        }
        project_info.skus = body.products.join();
        return yield groupDao.updateProject(project_id, project_info);
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};
