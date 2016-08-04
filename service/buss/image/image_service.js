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
/**
 * add new image
 * @param req
 * @param res
 * @param next
 */
ImageService.prototype.addImage = (req, res, next) => {
    req.checkBody(schema.addImage);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let image = {
        url: req.body.url,
        name: req.body.name,
        size: req.body.size,
    };
    let promise = imageDao.insertImage(req, image).then(result => {
        let dir = {
            type: TYPE.file,
            parent_id: req.body.dir,
            img_id: result.insertId
        };
        return imageDao.insertDir(req, dir).then( () => {
            res.api();
        });
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * add new dir
 * @param req
 * @param res
 * @param next
 */
ImageService.prototype.addDir = (req, res, next)=> {
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
    let promise = imageDao.insertDir(req, dir).then(() => {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
module.exports = new ImageService();