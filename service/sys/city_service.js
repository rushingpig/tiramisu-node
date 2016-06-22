"use strict";

var _ = require('lodash');
var co = require('co');

var dao = require('../../dao');
var cityDao = dao.city;

var schema = schema = require('../../schema');
var systemUtils = require('../../common/SystemUtils');
var toolUtils = require('../../common/ToolUtils');
var TiramisuError = require('../../error/tiramisu_error');
const res_obj = require('../../util/res_obj');

module.exports.getRegionalisms = function (req, res, next) {
    let promise = co(function *() {
        let type = req.query.type;
        let level_type = 0;
        if (type == 'provinces') level_type = 1;
        else if (type == 'city') level_type = 2;
        else if (type == 'area' || type == 'county') level_type = 3;
        if (level_type == 0) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS));

        let query = {
            level_type: level_type,
            parent_id: req.query.parent_id
        };
        let _res = yield cityDao.findRegionalisms(query);
        let result = {
            list: []
        };
        _res.forEach(curr=> {
            let tmp = {
                regionalism_id: curr.id,
                regionalism_name: curr.name,
                level: curr.level_type,
                is_open: 0
            };
            tmp.first_letter = curr.pinyin[0];
            if (curr.is_city) {
                tmp.is_open = 1;
            }
            result.list.push(tmp);
        });
        result.total_count = result.list.length;

        return result;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getList = function (req, res, next) {
    let promise = co(function *() {
        let query = Object.assign({}, req.query);

        // 获取总数
        let total_count = yield cityDao.count(query);
        // 获取列表
        let allCity = yield cityDao.findAllCity(query);

        let publicField = ['online_time', 'delivery_time_range', 'is_diversion', 'manager_name', 'manager_mobile', 'order_time', 'remarks', 'SEO'];
        let map = {};
        allCity.forEach(curr=> {
            if (curr.is_city) {
                if (!map[curr.regionalism_id]) map[curr.regionalism_id] = {};
                map[curr.regionalism_id] = Object.assign(map[curr.regionalism_id], _.pick(curr, publicField));
                let tmp = map[curr.regionalism_id];
                tmp.city_id = curr.regionalism_id;
                tmp.city_name = curr.regionalism_name;
                tmp.is_county = 0;
                tmp.province_name = curr.parent_name;
                if (curr.level_type == 3) {
                    tmp.is_county = 1;
                    tmp.province_name = curr.parent_parent_name;
                }
            } else {
                if (!map[curr.parent_id]) map[curr.parent_id] = {};
                let tmp = map[curr.parent_id];
                if (!tmp.open_regionalisms) tmp.open_regionalisms = [];
                let tr = {};
                tr.regionalism_id = curr.id;
                tr.regionalism_name = curr.name;
                if (curr.order_time) tr.order_time = curr.order_time;
                tmp.open_regionalisms.push(tr);
            }
        });

        return {list: _.values(map), total_count: total_count};
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getCityInfo = function (req, res, next) {
    let promise = co(function *() {
        let city_id = req.params.cityId;
        let _res = yield cityDao.findCityById(city_id);
        if (!_res || _res.length == 0) return Promise.reject(new TiramisuError(res_obj.NO_MORE_RESULTS));

        let publicField = ['online_time', 'delivery_time_range', 'is_diversion', 'manager_name', 'manager_mobile', 'order_time', 'remarks', 'SEO'];
        let result = {};
        let area = [];
        let open_regionalisms = [];

        _res.forEach(curr=> {
            if (curr.is_city) {
                result = Object.assign(result, _.pick(curr, publicField));
                result.city_id = curr.id;
                result.city_name = curr.name;
                result.is_county = 0;
                result.province_id = curr.parent_id;
                area.unshift(curr.name);
                area.unshift(curr.parent_name);
                if (curr.level_type == 3) {
                    result.is_county = 1;
                    result.parent_city_id = curr.parent_id;
                    result.province_id = curr.parent_parent_id;
                    area.unshift(curr.parent_parent_name);
                }
                result.area = area.join(' ');
            } else {
                let tr = {};
                tr.regionalism_id = curr.id;
                tr.regionalism_name = curr.name;
                if (curr.order_time) tr.order_time = curr.order_time;
                open_regionalisms.push(tr);
            }
        });
        result.open_regionalisms = open_regionalisms;

        return result;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.editCityInfo = function (req, res, next) {
    let promise = co(function *() {
        let b = req.body;
        let city_id = req.params.cityId;
        if ((yield cityDao.isExist(city_id, true)) == false) {
            return Promise.reject(new TiramisuError(res_obj.INVALID_UPDATE_ID, '该城市未添加...'));
        }

        let areas = [];
        let city_obj = {
            regionalism_id: city_id,
            is_city: 1
        };
        city_obj = Object.assign(city_obj, _.pick(b, ['online_time', 'is_diversion', 'delivery_time_range', 'order_time', 'remarks', 'manager_name', 'manager_mobile']));
        if (b.open_regionalisms) {
            b.open_regionalisms.forEach(curr_r=> {
                let a = {
                    regionalism_id: curr_r.regionalism_id,
                    order_time: curr_r.order_time
                };
                areas.push(systemUtils.assembleUpdateObj(req, a));
            });
        }
        yield cityDao.updateCityInfo(city_id, systemUtils.assembleUpdateObj(req, city_obj), areas);

    }).then(()=> {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.addCity = function (req, res, next) {
    req.checkBody(schema.addCity);
    let errors = req.validationErrors();
    if (errors) {
        return res.api(res_obj.INVALID_PARAMS, errors);
    }

    let promise = co(function *() {
        let b = req.body;
        let city_id = b.city_id;
        if (yield cityDao.isExist(city_id)) {
            return Promise.reject(new TiramisuError(res_obj.INVALID_UPDATE_ID, '该市/县/区已添加...'));
        }

        let areas = [];
        let city_obj = {
            regionalism_id: city_id,
            is_city: 1
        };
        city_obj = Object.assign(city_obj, _.pick(b, ['online_time', 'is_diversion', 'delivery_time_range', 'order_time', 'remarks', 'manager_name', 'manager_mobile']));
        if (b.open_regionalisms) {
            b.open_regionalisms.forEach(curr_r=> {
                let a = {
                    regionalism_id: curr_r.regionalism_id,
                    order_time: curr_r.order_time
                };
                areas.push(systemUtils.assembleUpdateObj(req, a));
            });
        }
        yield cityDao.updateCityInfo(city_id, systemUtils.assembleUpdateObj(req, city_obj), areas);

    }).then(()=> {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.deleteCity = function (req, res, next) {
    let promise = co(function *() {
        let city_id = req.params.cityId;
        let _res = yield cityDao.deleteCityInfo(city_id);

    }).then(()=> {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
