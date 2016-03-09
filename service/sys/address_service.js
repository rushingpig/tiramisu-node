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
    systemUtils.wrapService(res,next, addressDao.findAllProvinces().then((results)=> {
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
        res.api(res_obj.INVALID_PARAMS,null);
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
 * get stations by city id
 * @param req
 * @param res
 * @param next
 */
AddressService.prototype.getStationsById = (req,res,next)=>{
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
        res.api(res_obj.INVALID_PARAMS,null);
        return;
    }
    let stationId = req.params.stationId;
    let update_obj = {
        coords: req.body.coords
    };
    let promise = addressDao.updateStationByStationId(stationId, systemUtils.assembleUpdateObj(req, update_obj)).then(() => {
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
        res.api(res_obj.INVALID_PARAMS,null);
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


module.exports = new AddressService();


