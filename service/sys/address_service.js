/**
 * @des    : the service for the address
 * @author : pigo.can
 * @date   : 15/12/16 下午3:12
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var dao = require('../../dao'),
    addressDao = dao.address,
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
    systemUtils.wrapService(next,addressDao.findAllProvinces(), (results)=> {
        let data = {};
        if(!results || results.length == 0){
            res.api(res_obj.NO_MORE_RESULTS,null);
            return;
        }
        results.forEach((curr, index, arra)=> {
            data[curr.id] = curr.name;
        });
        res.api(data);
    });
};
AddressService.prototype.getCities = (req, res, next)=> {
    let provinceId = req.params.provinceId;
    systemUtils.wrapService(next,addressDao.findCitiesByProvinceId(provinceId), (results)=> {
        let data = {};
        console.log(results);
        if(!results || results.length == 0){
            res.api(res_obj.NO_MORE_RESULTS,null);
            return;
        }
        results.forEach((curr, index, arra)=> {
            data[curr.id] = curr.name;
        });
        res.api(data);
    });
};
AddressService.prototype.getDistricts = (req, res, next)=> {
    let cityId = req.params.cityId;
    systemUtils.wrapService(next,addressDao.findDistrictsByCityId(cityId), (results)=> {
        let data = {};
        if(!results || results.length == 0){
            res.api(res_obj.NO_MORE_RESULTS,null);
            return;
        }
        results.forEach((curr, index, arra)=> {
            data[curr.id] = curr.name;
        });
        res.api(data);
    });
};



module.exports = new AddressService();


