"use strict";

var groupService = require('../../../../service/buss/product/group_service');

module.exports = function (router) {
//*********************
//******** GET ********
//*********************
    router.get('/group/buying/product/list', groupService.getProductList);  //  获取产品列表
    router.get('/group/buying/sku/list', groupService.getSkuList);  //  获取团购商品列表
    router.get('/group/buying/project/list', groupService.getProjectList);  //  获取团购项目列表

    router.get('/group/buying/sku/:skuId', groupService.getSkuInfo);  //  获取商品详情
    router.get('/group/buying/project/:projectId', groupService.getProjectInfo);  //  获取项目详情

//**********************
//******** POST ********
//**********************
    router.post('/group/buying/sku', groupService.addSku); //  增加商品
    router.post('/group/buying/project', groupService.addProject); //  增加项目

//*********************
//******** PUT ********
//*********************
    router.put('/group/buying/sku/:skuId', groupService.editSku); //
    router.put('/group/buying/project/:projectId', groupService.editProject); //

//************************
//******** DELETE ********
//************************
    router.delete('/group/buying/sku/:skuId', groupService.delSku); //
    router.delete('/group/buying/project/:projectId', groupService.delProject); //
};
