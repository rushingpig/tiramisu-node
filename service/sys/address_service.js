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

function AddressService() {

}
/**
 * get the province list
 * @param req
 * @param res
 * @param next
 */
AddressService.prototype.getProvinces = (req, res, next)=> {
    let signal = req.query.signal;
    let query_data = {
        signal : signal,
        user : req.session.user
    };
    systemUtils.wrapService(res,next, addressDao.findAllProvinces(query_data).then((results)=> {
        let data = {};
        if (!results || results.length === 0) {
            res.api(res_obj.NO_MORE_RESULTS, null);
            return;
        }
        results.forEach((curr, index, arra)=> {
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
AddressService.prototype.getCities = (req, res, next)=> {
    let provinceId = req.params.provinceId;
    systemUtils.wrapService(res,next, addressDao.findCitiesByProvinceId(provinceId).then((results)=> {
            let data = {};
            if (!results || results.length == 0) {
                res.api(res_obj.NO_MORE_RESULTS, null);
                return;
            }
            results.forEach((curr, index, arra)=> {
                data[curr.id] = curr.name;
            });
            res.api(data);
        })
    );
};
/**
 * get districts by city id
 * @param req
 * @param res
 * @param next
 */
AddressService.prototype.getDistricts = (req, res, next)=> {
    req.checkParams('cityId').notEmpty().isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let cityId = req.params.cityId;
    systemUtils.wrapService(res,next, addressDao.findDistrictsByCityId(cityId).then((results)=> {
            let data = {};
            if (!results || results.length == 0) {
                res.api(res_obj.NO_MORE_RESULTS, null);
                return;
            }
            results.forEach((curr, index, arra)=> {
                data[curr.id] = curr.name;
            });
            res.api(data);
        })
    );
};
/**
 * get stations by district id
 * include province & city & regionlism
 * @param req
 * @param res
 * @param next
 */
AddressService.prototype.getStationsByDistrictId = (req,res,next)=>{
    req.checkQuery('regionalism_id').optional().isInt();
    req.checkQuery('city_id').optional().isInt();
    req.checkQuery('province_id').optional().isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,null);
        return;
    }
    let query_obj = {
        regionalismId: req.query.regionalism_id,
        cityId: req.query.city_id,
        provinceId: req.query.province_id,
        page_no: req.query.page_no || 0,
        page_size: req.query.page_size || 20
    };
    let method = query_obj.regionalismId ? 'findStationsByRegionalismId' :
        query_obj.cityId ? 'findStationsByCityId' : 'findStationsByProvinceId';
    let promise = addressDao[method](query_obj).then((results) => {
        if (!results || results.length == 0) {
            res.api(res_obj.NO_MORE_RESULTS, null);
            return;
        }
        res.api(results);
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * modify the info of the station by stationId
 * @param req
 * @param res
 * @param next
 */
AddressService.prototype.modifyStation = (req,res,next)=>{
    req.checkParams('stationId').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let stationId = req.params.stationId;
    let promise = addressDao.updateStationByStationId(stationId, systemUtils.assembleUpdateObj(req, req.body)).then(() => {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * get station by station name
 * @param req
 * @param res
 * @param next
 */
AddressService.prototype.getStationsByName = (req,res,next)=>{
    req.checkQuery('station_name','请填写有效的配送站名称...').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let station_name = req.query['station_name'];
    let promise = addressDao.getStationsByName(station_name).then((result) => {
        if (!result || result.length == 0) {
            res.api(res_obj.NO_MORE_RESULTS, null);
            return;
        }
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * delete station by station id
 * @param req
 * @param res
 * @param next
 */
AddressService.prototype.deleteStation = (req,res,next)=>{
    req.checkParams('stationId').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
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
AddressService.prototype.addStation = (req,res,next)=>{
    let promise = addressDao.addStation(req.body).then(() => {
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
AddressService.prototype.batchModifyStationCoords = (req,res,next)=>{
    req.checkBody('data', 'data为空').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let promise = addressDao.modifyStationCoordsInTransaction(req.body.data).then(() => {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
AddressService.prototype.getAllCities = (req,res,next) => {
    let signal = req.query.signal;
    let query_data = {
        signal : signal,
        user : req.session.user
    };
    let promise = addressDao.findAllCities(query_data).then(result => {
        if(toolUtils.isEmptyArray(result)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let data = {};
        result.forEach(curr => {
            data[curr.id] = curr.name;
        });
        res.api(data);
    });
    systemUtils.wrapService(res,next,promise);
};

module.exports = new AddressService();


