"use strict";

var _ = require('lodash');
var co = require('co');

var Constant = require('../../common/Constant');
var dao = require('../../dao');
var cityDao = dao.city;

var schema = schema = require('../../schema');
var systemUtils = require('../../common/SystemUtils');
var toolUtils = require('../../common/ToolUtils');
var TiramisuError = require('../../error/tiramisu_error');
const res_obj = require('../../util/res_obj');

let LEVEL = Constant.REGIONALISM_LEVEL;

module.exports.getRegionalisms = function (req, res, next) {
    let promise = co(function *() {
        let type = req.query.type;
        let level_type = 0;
        if (type == 'province') level_type = 1;
        else if (type == 'city') level_type = 2;
        else if (type == 'district') level_type = 3;
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
            if (curr.regionalism_id) {
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
        if (query.is_county !== undefined) query.is_county = (query.is_county == 1);
        if (query.exist_second_order_time) query.exist_second_order_time = (query.exist_second_order_time == 1);

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
                if (!tmp.open_regionalisms) tmp.open_regionalisms = [];
                if (!tmp.second_order_regionalisms) tmp.second_order_regionalisms = [];
                tmp.city_id = curr.regionalism_id;
                tmp.city_name = curr.name;
                tmp.is_county = 0;
                tmp.province_name = curr.parent_name;
                if (curr.level_type == LEVEL.DISTRICT) {
                    tmp.is_county = 1;
                    tmp.province_name = curr.parent_parent_name;
                }
            } else {
                if (!map[curr.parent_id]) map[curr.parent_id] = {};
                let tmp = map[curr.parent_id];
                if (!tmp.open_regionalisms) tmp.open_regionalisms = [];
                if (!tmp.second_order_regionalisms) tmp.second_order_regionalisms = [];
                let tr = {};
                tr.regionalism_id = curr.id;
                tr.regionalism_name = curr.name;
                if (curr.order_time) {
                    tr.order_time = curr.order_time;
                    tmp.second_order_regionalisms.push(curr.name);
                    if (!tmp.second_order_time) {
                        tmp.second_order_time = curr.order_time;
                    }
                }
                tmp.open_regionalisms.push(tr);
            }
        });

        let list = _.values(map);
        list.forEach(curr=> {
            curr.second_order_regionalisms = curr.second_order_regionalisms.join('/');
        });
        list.sort((a, b)=> {
            return a.city_id - b.city_id;
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
        if ((yield cityDao.isExist(city_id, true)) == false) {
            return Promise.reject(new TiramisuError(res_obj.INVALID_UPDATE_ID, '该城市未添加...'));
        }

        let _res = yield cityDao.findCityById(city_id);
        if (!_res || _res.length == 0) return Promise.reject(new TiramisuError(res_obj.NO_MORE_RESULTS));

        let publicField = ['online_time', 'delivery_time_range', 'is_diversion', 'manager_name', 'manager_mobile', 'order_time', 'remarks', 'SEO'];
        let result = {};
        let area = [];
        let regionalisms = [];
        let second_order_time;
        let second_order_regionalisms = [];

        _res.forEach(curr=> {
            if (curr.is_city) {
                result = Object.assign(result, _.pick(curr, publicField));
                result.city_id = curr.id;
                result.city_name = curr.name;
                result.is_county = 0;
                result.province_id = curr.parent_id;
                area.unshift(curr.name);
                area.unshift(curr.parent_name);
                if (curr.level_type == LEVEL.DISTRICT) {
                    result.is_county = 1;
                    result.parent_city_id = curr.parent_id;
                    result.province_id = curr.parent_parent_id;
                    area.unshift(curr.parent_parent_name);
                }
                result.area = area.join(' ');
            } else {
                let tr = {
                    is_open: 0,
                    regionalism_id: curr.id,
                    regionalism_name: curr.name
                };
                if (curr.regionalism_id) {
                    tr.is_open = 1;
                    if (curr.order_time) {
                        tr.order_time = curr.order_time;
                        second_order_regionalisms.push(curr.id);
                        if (!second_order_time) second_order_time = curr.order_time;
                    }
                }
                regionalisms.push(tr);
            }
        });
        if (!result.is_county) {
            result.regionalisms = regionalisms;
            if (second_order_time) {
                result.second_order_time = second_order_time;
                result.second_order_regionalisms = second_order_regionalisms;
            }
        }

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

        let areas;
        let city_obj = {
            regionalism_id: city_id,
            is_city: 1
        };
        city_obj = Object.assign(city_obj, _.pick(b, ['online_time', 'is_diversion', 'delivery_time_range', 'order_time', 'remarks', 'SEO', 'manager_name', 'manager_mobile']));
        if (b.open_regionalisms) {
            areas = [];
            let id_top4 = city_id.toString().substr(0, 4);
            b.open_regionalisms.forEach(curr_r=> {
                if (id_top4 !== curr_r.regionalism_id.toString().substr(0, 4)) return;
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
            let id_top4 = city_id.toString().substr(0, 4);
            b.open_regionalisms.forEach(curr_r=> {
                if (id_top4 !== curr_r.regionalism_id.toString().substr(0, 4)) return;
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
        if ((yield cityDao.isExist(city_id, true)) == false) {
            return Promise.reject(new TiramisuError(res_obj.INVALID_UPDATE_ID, '该城市未添加...'));
        }
        yield cityDao.deleteCityInfo(city_id);

    }).then(()=> {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
