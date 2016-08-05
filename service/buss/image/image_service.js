"use strict";
var res_obj = require('../../../util/res_obj'),
    Constant = require('../../../common/Constant'),
    systemUtils = require('../../../common/SystemUtils'),
    toolUtils = require('../../../common/ToolUtils'),
    TiramisuError = require('../../../error/tiramisu_error'),
    schema = require('../../../schema'),
    dao = require('../../../dao'),
    ImageDao = dao.image,
    imageDao = new ImageDao();

const TYPE = {
    dir: 'd',
    file: 'f'
};

function ImageService() {
}

ImageService.prototype.addImage = (req, res, next) => {
    req.checkBody(schema.addImage);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let data = {
        type: TYPE.file,
        parent_id: req.body.dir,
        name: req.body.name,
        size: req.body.size,
        url: req.body.url,
    };
    let promise = imageDao.insertDir(req, data).then(result => {
        res.api({
            id: result.insertId
        });
    });
    systemUtils.wrapService(res, next, promise);
};

ImageService.prototype.addDir = (req, res, next) => {
    req.checkBody(schema.addDir);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let dir = {
        type: TYPE.dir,
        parent_id: req.body.parent_id,
        name: req.body.name
    };
    let promise = imageDao.insertDir(req, dir).then(result => {
        res.api({
            id: result.insertId
        });
    });
    systemUtils.wrapService(res, next, promise);
};

ImageService.prototype.deleteDir = (req, res, next) => {
    req.checkBody(schema.deleteDir);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let promise = imageDao.deleteDir(req, req.body.ids).then(() => {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};

ImageService.prototype.moveDir = (req, res, next) => {
    req.checkBody(schema.moveDir);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let ids = req.body.ids;
    let id = req.body.id;
    let promise = imageDao.moveDir(req, ids, id).then(() => {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};

ImageService.prototype.renameDir = (req, res, next) => {
    req.checkBody(schema.renameDir);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let id = req.body.id;
    let name = req.body.name;
    let promise = imageDao.renameDir(req, id, name).then(() => {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
}
module.exports = new ImageService();