"use strict";
var res_obj = require('../../../util/res_obj'),
    Constant = require('../../../common/Constant'),
    systemUtils = require('../../../common/SystemUtils'),
    toolUtils = require('../../../common/ToolUtils'),
    TiramisuError = require('../../../error/tiramisu_error'),
    schema = require('../../../schema'),
    dao = require('../../../dao'),
    HomepageDao = dao.homepage,
    homepageDao = new HomepageDao(),
    tv4 = require('tv4');

function HomepageService() {
}

HomepageService.prototype.addHomepage = (req, res, next) => {
    let correct = tv4.validate(req.body, schema.addHomepage);
    if (!correct) {
        res.api(res_obj.INVALID_PARAMS, toolUtils.formatTv4Error(tv4.error));
        return;
    }
    let promise = homepageDao.insertHomepage(req, req.body)
        .then(() => {
            res.api();
        });
    systemUtils.wrapService(res, next, promise);
};

HomepageService.prototype.modifyHomepage = (req, res, next) => {
    let correct = tv4.validate(req.body, schema.addHomepage);
    if (!correct) {
        res.api(res_obj.INVALID_PARAMS, toolUtils.formatTv4Error(tv4.error));
        return;
    }
    let promise = homepageDao.modifyHomepage(req, req.body)
        .then(() => {
            res.api();
        });
    systemUtils.wrapService(res, next, promise);
};

module.exports = new HomepageService();