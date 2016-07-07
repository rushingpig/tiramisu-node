/**
 * @des    : the service for the address
 * @author : pigo.can
 * @date   : 15/12/16 下午3:12
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var dao = require('../../dao'),
    AddressDao = dao.address,
    addressDao = new AddressDao(),
    systemUtils = require('../../common/SystemUtils'),
    toolUtils = require('../../common/ToolUtils'),
    TiramisuError = require('../../error/tiramisu_error'),
    res_obj = require('../../util/res_obj');

var Constant = require('../../common/Constant');
let LEVEL = Constant.REGIONALISM_LEVEL;

function AddressService() {

}
/**
 * get the province list
 * @param req
 * @param res
 * @param next
 */
AddressService.prototype.getProvinces = (req, res, next) => {
    let signal = req.query.signal;
    let query_data = {
        signal: signal,
        user: req.session.user
    };
    systemUtils.wrapService(res, next, addressDao.findAllProvinces(query_data).then((results) => {
        let data = {};
        if (!results || results.length === 0) {
            res.api(res_obj.NO_MORE_RESULTS, null);
            return;
        }
        results.forEach((curr, index, arra) => {
            data[curr.id] = curr.name;
        });
        res.api(data);
    }));
};
/**
 * get city list by province id
 * @param req
 * @param res
 * @param next
 */
AddressService.prototype.getCities = (req, res, next) => {
    let provinceId = req.params.provinceId;
    let signal = req.query.signal;
    let query_data = {
        signal: signal,
        user: req.session.user
    };
    systemUtils.wrapService(res, next, addressDao.findCitiesByProvinceId(provinceId, query_data).then((results) => {
        let data = {};
        if (!results || results.length == 0) {
            res.api(res_obj.NO_MORE_RESULTS, null);
            return;
        }
        results.forEach((curr, index, arra) => {
            if (curr.level_type == LEVEL.CITY)
                data[curr.id] = curr.name;
            else
                data[curr.id] = `${curr.parent_name}:${curr.name}`;
        });
        res.api(data);
    }));
};
/**
 * get districts by city id
 * @param req
 * @param res
 * @param next
 */
AddressService.prototype.getDistricts = (req, res, next) => {
    req.checkParams('cityId').notEmpty().isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let cityId = req.params.cityId;
    systemUtils.wrapService(res, next, addressDao.findDistrictsByCityId(cityId).then((results) => {
        let data = {};
        if (!results || results.length == 0) {
            res.api(res_obj.NO_MORE_RESULTS, null);
            return;
        }
        results.forEach((curr, index, arra) => {
            data[curr.id] = curr.name;
        });
        res.api(data);
    }));
};
/**
 * get stations by multiple condition
 * include province & city & regionlism & station_name
 * @param req
 * @param res
 * @param next
 */
AddressService.prototype.getStationsByMultipleCondition = (req, res, next) => {
    req.checkQuery('regionalism_id').optional().isInt();
    req.checkQuery('city_id').optional().isInt();
    req.checkQuery('province_id').optional().isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let query = Object.assign({user: req.session.user}, req.query);
    let promise = addressDao.findStationsByMultipleCondition(query).then((results) => {
        if (!results || results.length == 0) {
            res.api(res_obj.NO_MORE_RESULTS, null);
            return;
        }
        let data;
        if (req.query.isPage == 0 || req.query.isPage == 'false') {
            data = {
                list: results
            };
        } else {
            data = {
                list: results.pagination_result,
                total: results.count_result[0].total
            };
        }
        res.api(data);
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * modify the info of the station by stationId
 * @param req
 * @param res
 * @param next
 */
AddressService.prototype.modifyStation = (req, res, next) => {
    req.checkParams('stationId').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let stationId = req.params.stationId;
    let promise = addressDao.updateStationByStationId(req, stationId, systemUtils.assembleUpdateObj(req, req.body)).then(() => {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * delete station by station id
 * @param req
 * @param res
 * @param next
 */
AddressService.prototype.deleteStation = (req, res, next) => {
    req.checkParams('stationId').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let stationId = req.params['stationId'];
    let promise = addressDao.deleteStationById(stationId).then(() => {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * add station
 * @param req
 * @param res
 * @param next
 */
AddressService.prototype.addStation = (req, res, next) => {
    let promise = addressDao.addStation(req, req.body).then(() => {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * modify multiple stations coords in transaction
 * @param req
 * @param res
 * @param next
 */
AddressService.prototype.batchModifyStationCoords = (req, res, next) => {
    req.checkBody('data', 'data为空').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let promise = addressDao.modifyStationCoordsInTransaction(req, req.body.data).then(() => {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
AddressService.prototype.getAllCities = (req, res, next) => {
    let signal = req.query.signal;
    let query_data = {
        signal: signal,
        user: req.session.user
    };
    let promise = addressDao.findAllCities(query_data).then(result => {
        if (toolUtils.isEmptyArray(result)) {
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let data = {};
        result.forEach(curr => {
            data[curr.id] = curr.name;
        });
        res.api(data);
    });
    systemUtils.wrapService(res, next, promise);
};

/**
 * get all provinces and cities info
 * @param req
 * @param res
 * @param next
 */
AddressService.prototype.getProvincesAndCites = (req,res,next)=>{
    let promise = addressDao.getProvincesAndCites(req.body.data)
        .then(results => {
            res.api(results);
        });
    systemUtils.wrapService(res, next, promise);
};

module.exports = new AddressService();