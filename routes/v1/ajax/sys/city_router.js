"use strict";

var cityService = require('../../../../service/sys/city_service');
module.exports = function (router) {
//*********************
//******** GET ********
//*********************
    router.get('/citys', cityService.getList);  //  获取开通城市列表
    router.get('/city/:cityId/info', cityService.getCityInfo);  // 获取开通城市详情
    router.get('/regionalisms', cityService.getRegionalisms);  // 获取区域列表

//**********************
//******** POST ********
//**********************
    router.post('/city/:cityId/info', cityService.editCityInfo);  // 修改开通城市信息


//*********************
//******** PUT ********
//*********************
    router.put('/city', cityService.addCity);  // 增加开通城市

//************************
//******** DELETE ********
//************************
    router.delete('/city/:cityId', cityService.deleteCity);  //  删除开通城市

};
