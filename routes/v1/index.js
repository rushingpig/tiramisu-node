/**
 * @des    : the router of the v1 version
 * @author : pigo.can
 * @date   : 15/12/3 下午2:05
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
// TODO classify the router
"use strict";
var express = require('express');
var config = require('../../config');
var router = express.Router(config.exp_router_options);
// service module
var service = require('../../service'),
    addressService = service.address,
    deliveryService = service.delivery,
    orderService = service.order,
    productService = service.product,
    categoryService = service.category,
    Constant = require('../../common/Constant');
var fileUtils = require('../../common/FileUtils');
var fs = require('fs');
var path = require('path');
var v = express.Router(config.exp_router_options);
var a = express.Router(config.exp_router_options);
var routerI = express.Router(config.exp_router_options);

// router for normal http request
router.use('/v', v);
// router for xhr ajax request
router.use('/a', a);
// router for internal(whitelisted) http requests
router.use('/i', routerI);

// add order from external source
routerI.post('/order', orderService.addExternalOrder);
routerI.post('/order/error', orderService.addOrderError);
routerI.put('/order/error', orderService.editOrderError);
routerI.post('/order/:orderId/backup', orderService.orderBackup);
//=====================router for business begin====================

//*********************
//******** GET ********
//*********************
a.get('/provinces',addressService.getProvinces);    // 获取所有省份信息
a.get('/province/:provinceId/cities',addressService.getCities); // 获取指定省份下的所有城市信息
a.get('/city/:cityId/cities', addressService.getCities); // 获取指定城市下的所有开通城市
a.get('/provinces/cities', addressService.getProvincesAndCites); // 获取所有省份与城市信息
//a.get(/^\/city\/(\d+)\/districts$/,addressService.getDistricts);
a.get('/city/:cityId/districts', addressService.getDistricts); // 获取指定城市下的所有行政区域信息
a.get('/cities', addressService.getAllCities);
a.get('/stations/search', addressService.getStationsByMultipleCondition); // 根据多个条件查询配送站
a.get('/stations', deliveryService.getDeliveryStationList); // 获取所有配送站信息
a.get('/station', deliveryService.getStationInfo); // 获取指定配送站信息
a.get('/pay/modes', orderService.getPayModeList); // 获取所有支付方式信息
a.get('/district/:districtId/shops', orderService.getShopList); // 获取指定行政区域下的门店信息
a.get('/product/categories', productService.getCategories); // 获取所有产品分类
a.get('/products', productService.listProducts); // 获取产品列表
a.get('/product/accessory', productService.listAccessory);   // 获取配件列表
a.get('/product/accessory/order/:orderId', productService.listAccessoryByOrder); // 获取指定订单下可选的配件列表

a.get('/orders/exchange',orderService.listOrders(Constant.OSR.DELIVERY_EXCHANGE));  // 订单转送单列表
a.get('/orders/delivery',orderService.listOrders(Constant.OSR.DELIVER_LIST));   // 送货单管理列表
a.get('/orders/signin',orderService.listOrders(Constant.OSR.RECEIVE_LIST));     // 配送单管理列表
a.get('/order/reprint/applies',deliveryService.listReprintApplies); // 获取申请重新打印列表
a.get('/delivery/deliverymans',deliveryService.listDeliverymans);   // 获取配送员列表

a.get('/orders/print',deliveryService.print);   // 打印订单
a.get('/order/:orderId/reprint',deliveryService.reprint);   // 重新打印订单

a.get('/product/categories/name', categoryService.listCategoriesByName); // 根据分类名称搜索
a.get('/product/category/:id/remarks', categoryService.getCategoryRemark); // 获取分类备注
a.get('/product/category/:id/regions/pc', categoryService.getCategoryRegionsForPC); // 获取分类PC上线城市
a.get('/product/categories/search', categoryService.listCategoriesByMultipleCondition); // 根据条件查询分类
a.get('/product/category/:id/secondary', categoryService.getSecondaryCategoriesByPrimaryCategoryId); // 查询一级分类下的二级分类
a.get('/product/category/:id/details', categoryService.getCategoryDetailsById); // 查询分类详情
a.get('/product/sku/size', productService.getAllSize); // 规格提示
a.get('/product/details', productService.getProductDetails); // 根据多个条件搜索产品详情
a.get('/product/skus', productService.getProductAndSku); // 查看产品信息
a.get('/product/skus/price', productService.listSkuPrice); // 查看产品规格价格列表
a.get('/product/skus/details', productService.getProductAndSkuWithRegions); // 获取产品信息(用于产品&sku编辑)
a.get('/product/skus/xlsx', productService.exportSku); // 导出sku
a.get('/product/info/cities', productService.getProductDetailCities); // 获取可添加商品详情和已添加商品详情的城市
a.get('/product/info', productService.getProductDetailByProductIdAndRegionId); // 获取商品详情

a.get('/product/skus/sizes', productService.getSkuSize); // 获取所有管理规格信息
a.get('/product/skus/sizes/name', productService.getSkuSizeByName); // 通过名称查询管理规格信息

//**********************
//******** POST ********
//**********************

a.post('/delivery/autoAllocate', deliveryService.autoAllocateStation); // 自动分配配送站

a.post('/orders/delivery', orderService.listOrders(Constant.OSR.DELIVER_LIST, true)); // 批量扫描获取送货单列表
a.post('/orders/signin', orderService.listOrders(Constant.OSR.RECEIVE_LIST, true)); // 批量扫面获取配送单列表

a.post('/order', orderService.addOrder); // 添加订单

a.post('/order/reprint/apply', deliveryService.applyForRePrint); // 申请重新打印

a.post('/order/src', orderService.addOrderSrc); // 添加来源渠道

a.post('/coupon', orderService.validateCoupon);

a.post('/station', addressService.addStation); //新增配送站

a.post('/product/categories/primary', categoryService.addPrimaryCategory);  // 新增一级分类
a.post('/product/categories/secondary', categoryService.addSecondaryCategory);  // 新增二级分类

a.post('/product/sku', productService.addProductWithSku);  // 新增产品
a.post('/product/info', productService.addProductInfo);  // 新增商品详情

a.post('/product/skus/sizes', productService.addSkuSize);   //新增管理规格信息

//*********************
//******** PUT ********
//*********************

a.put('/order/src/:srcId', orderService.editOrderSrc); // 修改来源渠道信息

a.put('/order/src/:srcId', orderService.editOrderSrc); // 修改来源渠道信息

a.put('/station/:stationId', addressService.modifyStation);   // 修改配送站信息
a.put('/stations/scope', addressService.batchModifyStationCoords);   // 批量修改配送站范围

a.put('/product/category/primary', categoryService.modifyPrimaryCategory);  // 修改一级分类
a.put('/product/category/secondary', categoryService.modifySecondaryCategory);  // 修改二级分类
a.put('/product/categories/sort', categoryService.rankCategoris);  // 二级分类排序

a.put('/product/skus', productService.deleteSku);  // 批量删除sku
a.put('/product/sku', productService.modifyProductWithSku);  // 编辑产品&sku
a.put('/product/info', productService.modifyProductInfo);  // 编辑产品&sku

a.put('/product/skus/sizes/online', productService.modifySkuSizeValidation);  // 编辑管理规格信息上下线
a.put('/product/skus/sizes/specs', productService.modifySkuSizeSpec);  // 编辑管理规格信息
a.put('/product/skus/sizes/sort', productService.modifySkuSizeSort);  // 移动管理规格信息

//************************
//******** DELETE ********
//************************

a.delete('/order/src/:srcId', orderService.delOrderSrc); // 删除来源渠道

a.delete('/station/:stationId', addressService.deleteStation);

a.delete('/product/:productId', productService.deleteProduct);  // 删除产品及其sku
a.delete('/product/categories/:id', categoryService.deleteCategory); // 删除分类(移动分类下产品到指定分类)

//=====================router for business end======================

//======================将路由分模块管理,不同的路由放在不同的文件夹下按需传入不同的路由即可====================
/**
fs.readdirSync(__dirname).forEach((curr)=>{
    let absolutePath = __dirname+path.sep+curr;
    if(fs.statSync(absolutePath).isDirectory()){
        fileUtils.autoRequireRouter(absolutePath,a);
    }
});
*/
fileUtils.autoRequireRouter(path.resolve(__dirname, 'ajax'), a);
//=====================================================================================================


router.get('/', function(req, res) {
  res.sendHtml('welcome to v1 api');
});

module.exports = router;
