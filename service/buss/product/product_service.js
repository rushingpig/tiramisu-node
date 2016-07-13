/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/17 上午9:39
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var res_obj = require('../../../util/res_obj'),
    Constant = require('../../../common/Constant'),
    systemUtils = require('../../../common/SystemUtils'),
    toolUtils = require('../../../common/ToolUtils'),
    TiramisuError = require('../../../error/tiramisu_error'),
    schema = require('../../../schema'),
    dao = require('../../../dao'),
    OrderDao = dao.order,
    orderDao = new OrderDao(),
    ProductDao = dao.product,
    productDao = new ProductDao(),
    xlsx = require('node-xlsx');

function ProductService() {

}
/**
 * get all of the product categories
 * @param req
 * @param res
 * @param next
 */
ProductService.prototype.getCategories = (req, res, next)=> {
    let promise = productDao.findAllCatetories().then((results)=> {
        if (toolUtils.isEmptyArray(results)) {
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let data = [];
        results.forEach((curr)=> {
            let obj = {};
            obj.id = curr.id;
            obj.name = curr.name;
            obj.parent_id = curr.parent_id;
            data.push(obj);
        });
        res.api(data);
    });
    systemUtils.wrapService(res,next, promise);
};
/**
 * get the product list based on the query term
 * @param req
 * @param res
 * @param next
 */
ProductService.prototype.listProducts = (req, res, next) => {
    let product_name = req.query.name,
        category_id = req.query.category_id,
        regionalism_id = req.query.city_id,
        page_no = req.query.page_no,
        page_size = req.query.page_size,
        isAddition = req.query.isAddition;
    let res_data = {
        list: [],
        page_no : page_no
    }, temp_obj = {};
    // 要通过子查询进行分页
    let promise = productDao.findProductsCount(product_name, category_id, regionalism_id, isAddition).then((data)=> {
        if (toolUtils.isEmptyArray(data.results)) {
            throw new TiramisuError(res_obj.NO_MORE_PAGE_RESULTS);
        }
        let preSql = data.sql, preParams = data.params;
        res_data.total = data.results[0].total;
        return productDao.findProducts(preSql, preParams, page_no, page_size, regionalism_id);
    }).then((_re)=> {
        if (toolUtils.isEmptyArray(_re)) {
            throw new TiramisuError(res_obj.NO_MORE_PAGE_RESULTS);
        }
        _re.forEach((curr)=> {
            let key = curr.product_id + curr.size + curr.name;
            if (!temp_obj.hasOwnProperty(key)) {
                temp_obj[key] = {
                    category_name: curr.category_name,
                    name: curr.name,
                    product_id: curr.product_id,
                    size: curr.size,
                    skus: []
                };
            }
            let sku_obj = {
                original_price: curr.price,
                discount_price: curr.price,
                is_delivery: curr.is_delivery,
                is_local_site: curr.is_local_site,
                sku_id: curr.id,
                img_url: '',  // TODO: 未确定产品图片来源
                website: curr.website,
                regionalism_name : curr.regionalism_name
            };
            temp_obj[key].skus.push(sku_obj);
        });
        for (let o in temp_obj) {
            res_data.list.push(temp_obj[o]);
        }
        // TODO: 在获取订单可选的产品列表时，每种产品sku只返回一个
        if (req.query.__only_accessory__) {
            let existProduct = [];
            let selectStr = ['蛋糕帽', '蜡烛', '数字蜡烛', '餐具'];
            let tmpList = [];
            for (let i = 0; i < res_data.list.length; i++) {
                let tmpP = res_data.list[i];
                // TODO: 餐具模糊匹配
                if (tmpP.name && tmpP.name.indexOf('餐具') != -1 && existProduct.indexOf('餐具') == -1) {
                    tmpP.skus = [tmpP.skus[0]];
                    tmpList.push(tmpP);
                    existProduct.push('餐具');
                    continue;
                }
                selectStr.forEach(str=> {
                    if(tmpP.name == str && existProduct.indexOf(str) == -1){
                        tmpP.skus = [tmpP.skus[0]];
                        tmpList.push(tmpP);
                        existProduct.push(str);
                        return false;
                    }
                });
            }
            res_data.list = tmpList;
            res_data.total = tmpList.length;
        }
        res.api(res_data);
    });
    systemUtils.wrapService(res,next, promise);
};
/**
 * get the product list of the special order id
 * @param req
 * @param res
 * @param next
 */
ProductService.prototype.listOrderProducts = (req,res,next)=>{
    req.checkParams('orderId').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let orderId = req.params.orderId;
    let promise = productDao.findProductsByOrderId(orderId).then((results)=>{
        if(toolUtils.isEmptyArray(results)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        res.api(results);
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * get the accessory list
 * @param req
 * @param res
 * @param next
 */
ProductService.prototype.listAccessory = (req, res, next)=> {
    req.query.isAddition = 1;
    req.query.page_no = 0;
    // req.query.page_size = 10;
    return ProductService.prototype.listProducts(req, res, next);
};
ProductService.prototype.listAccessoryByOrder = (req, res, next)=> {
    let orderId = systemUtils.getDBOrderId(req.params.orderId);

    let promise = orderDao.findOrderById(orderId).then(orders=> {
        if(toolUtils.isEmptyArray(orders)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let curr = orders[0];
        req.query.isAddition = 1;
        req.query.page_no = 0;
        req.query.city_id = curr.city_id;
        req.query.__only_accessory__ = true;
        // req.query.page_size = 10;
        ProductService.prototype.listProducts(req, res, next);
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * add a product and sku for it
 * @param req
 * @param res
 * @param next
 */
ProductService.prototype.addProductWithSku = (req, res, next)=> {
    req.checkBody(schema.addProduct);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let promise = productDao.insertProductWithSku(req, req.body)
        .then(() => {
            res.api();
        });
    systemUtils.wrapService(res, next, promise);
};
/**
 * get sku size list
 * @param req
 * @param res
 * @param next
 */
ProductService.prototype.getAllSize = (req, res, next)=> {
    let promise = productDao.getAllSkuByParams(['distinct(size) as size'])
        .then((results) => {
            if(toolUtils.isEmptyArray(results)){
                throw new TiramisuError(res_obj.NO_MORE_RESULTS);
            }
            res.api(results);
        });
    systemUtils.wrapService(res, next, promise);
};
/**
 * get product details by multiple conditions
 * @param req
 * @param res
 * @param next
 */
ProductService.prototype.getProductDetails = (req, res, next)=> {
    let formatDetails = results => {
        return results.map(result => {
            return {
              spu: result.spu,
              name: result.name,
              detail_page: result.detail_page,
              pic_url: result.pic_url,
              primary_cate_name: result.primary_cate_name,
              secondary_cate_name: result.secondary_cate_name,
              city_name: result.city_name,
              city_id: result.city_id,
              province_name: result.province_name,
              price: result.price,
              book_time: result.book_time,
              isMall: result.isMall > 0 ? true : false,
              start_time: result.presell_start ? result.presell_start : result.created_time,
              end_time: result.presell_end,
              isActivity: result.isActivity > 0 ? true : false
            };
        });
    }
    let promise = productDao.getProductDetailByParams(req, req.query)
        .then((results) => {
            if(toolUtils.isEmptyArray(results)){
                throw new TiramisuError(res_obj.NO_MORE_RESULTS);
            }
            let res_data = {
                count: results.result[0].total,
                products: formatDetails(results._result)
            };
            res.api(res_data);
        });
    systemUtils.wrapService(res, next, promise);
};
/**
 * delete product & skus
 * @param req
 * @param res
 * @param next
 */
ProductService.prototype.deleteProduct = (req, res, next)=> {
    let promise = productDao.deleteProductAndSku(req, req.params.productId)
        .then(() => {
            res.api();
        });
    systemUtils.wrapService(res, next, promise);
};
/**
 * batch delete skus
 * @param req
 * @param res
 * @param next
 */
ProductService.prototype.deleteSku = (req, res, next)=> {
    let promise = productDao.batchDeleteSku(req, req.body)
        .then(() => {
            res.api();
        });
    systemUtils.wrapService(res, next, promise);
};
/**
 * get product and its sku detail
 * @param req
 * @param res
 * @param next
 */
ProductService.prototype.getProductAndSku = (req, res, next)=> {
    req.checkQuery('productId', 'productId can not be null').notEmpty();
    req.checkQuery('cityId', 'cityId can not be null').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let promise = productDao.getProductAndCategoryById(req.query.productId)
        .then(product_result => {
            return productDao.getSkuWithBooktimeByProductAndCity(req.query)
                .then(sku_result => {
                    //格式化最终返回结果
                    let product = product_result[0];
                    product.isPresell = 0;
                    product.presell_start = null;
                    product.presell_end = null;
                    product.book_time = null;
                    product.secondary_book_time = {};
                    let skus = [];
                    //临时存储skuid，用于过滤重复sku
                    let sku_ids = [];
                    sku_result.forEach(item => {
                        //若sku存在预售，则整个产品为预售商品
                        if(item.presell_start || item.presell_end){
                            product.isPresell =1;
                            product.presell_start = item.presell_start;
                            product.presell_end = item.presell_end;
                        }
                        //若sku存在预约时间，则整个产品为此预约时间
                        if(item.book_time){
                            product.book_time = item.book_time;
                        }
                        //若sku存在第二预约时间，则整个产品为此第二预约时间
                        if(item.secondary_book_time && item.secondary_book_time_region){
                            product.secondary_book_time[item.secondary_book_time_region] = item.secondary_book_time;
                        }
                        //产品省份、城市为sku省份、城市
                        product.city_id = item.city_id;
                        product.city_name = item.city_name;
                        product.province_id = item.province_id;
                        if(sku_ids.indexOf(item.id) > -1){
                            return;
                        }
                        skus.push({
                            size: item.size,
                            original_price: item.original_price,
                            price: item.price,
                            activity_price: item.activity_price,
                            activity_start: item.activity_start,
                            activity_end: item.activity_end,
                            website: item.website
                        });
                        sku_ids.push(item.id);
                    });
                    return Promise.resolve({product,skus});
                });
        }).then(result => {
            res.api(result);
        });
    systemUtils.wrapService(res, next, promise);
};
/**
 * get sku and its price list
 * @param req
 * @param res
 * @param next
 */
ProductService.prototype.listSkuPrice = (req, res, next)=> {
    req.checkQuery('productId', 'productId can not be null').notEmpty();
    req.checkQuery('cityId', 'cityId can not be null').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let promise = productDao.getProductAndCategoryById(req.query.productId)
        .then(product_result => {
            return productDao.getSkuByProductAndCity(req.query)
                .then(sku_result => {
                    let product = product_result[0];
                    let skus = [];
                    sku_result.page_result.forEach(item => {
                        product.city_id = item.city_id;
                        product.city_name = item.city_name;
                        product.province_id = item.province_id;
                        let sku = {
                            id: item.id,
                            website: item.website,
                            size: item.size,
                            original_price: item.original_price,
                            price: item.price
                        };
                        skus.push(sku);
                    });
                    let result = {
                        total: sku_result.count_result[0].total,
                        product: product,
                        skus: skus
                    };
                    return Promise.resolve(result);
                });
        }).then(result => {
            res.api(result);
        });;
    systemUtils.wrapService(res, next, promise);
};
/**
 * get product info and its sku list with regions
 * @param req
 * @param res
 * @param next
 */
ProductService.prototype.getProductAndSkuWithRegions = (req, res, next)=> {

    function formatSku(data) {
        let format_data = {};
        data.forEach(item => {
            if(!format_data[item.id]){
                format_data[item.id] = {
                    id: item.id,
                    size: item.size,
                    website: item.website,
                    regionalism_id: item.regionalism_id,
                    original_price: item.original_price,
                    price: item.price,
                    book_time: item.book_time,
                    presell_start: item.presell_start,
                    presell_end: item.presell_end,
                    send_start: item.send_start,
                    send_end: item.send_end,
                    activity_price: item.activity_price,
                    activity_start: item.activity_start,
                    activity_end: item.activity_end,
                    secondary_book_time: {
                        time: null,
                        regions: []
                    }
                };
            }
            if(item.secondary_book_time && item.secondary_book_time_region_id && item.secondary_book_time_region_name){
                format_data[item.id].secondary_book_time.time = item.secondary_book_time;
                format_data[item.id].secondary_book_time.regions.push({
                    id: item.secondary_book_time_region_id,
                    name: item.secondary_book_time_region_name
                });
            }
        });
        return Object.keys(format_data).map(key => {
            return format_data[key];
        });
    }

    req.checkQuery('productId', 'productId can not be null').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let promise = productDao.getProductAndCategoryById(req.query.productId)
        .then(product_result => {
            return productDao.getSkuByProductWithRegion(req.query.productId)
                .then(sku_result => {
                    // 格式化响应结果
                    let product = product_result[0];
                    let sku = formatSku(sku_result);
                    return Promise.resolve({product, sku});
                });
        }).then(result => {
            res.api(result);
        });
    systemUtils.wrapService(res, next, promise);
};
ProductService.prototype.modifyProductWithSku = (req, res, next) => {
    // TODO:记录操作日志
    let promise = productDao.modifyProductAndSku(req, req.body)
        .then(() => {
            res.api();
        });
    systemUtils.wrapService(res, next, promise);
}
ProductService.prototype.exportSku = (req, res, next) => {
    let order_srcs = {};
    let promise = orderDao.findAllOrderSrc()
        .then(order_src_results => {
            order_src_results.forEach(item => {
                order_srcs[item.id] = item.name;
            });
            return productDao.getSkuByMultipleCondition(req, req.query);
        }).then(sku_results => {
            
            // 用于判断是否商城上线
            let is_malls = [];
            sku_results.forEach(result => {
                if (result.website == 1) {
                    is_malls.push(result.product_id);
                }
            });

            let data = [];
            data.push([
                '上线城市',
                '产品编码（spu）',
                '名称',
                '一级分类',
                '二级分类',
                '上线时间',
                '下线时间',
                '商城上线',
                '预约时间',
                'sku编码',
                '渠道',
                '规格',
                '原价',
                '渠道价格',
                '是否促销',
                '活动价格',
                '活动时间',
            ]);
            sku_results.forEach(result => {
                let sku = {
                    city_name: result.city_name,
                    product_id: result.product_id,
                    product: result.product_name,
                    primary_cate_name: result.primary_cate_name,
                    secondary_cate_name: result.secondary_cate_name,
                    start_time: null,
                    end_time: null,
                    isMall: '否',
                    book_time: result.book_time,
                    sku_id: result.sku_id,
                    website: null,
                    size: result.size,
                    original_price: result.original_price,
                    price: result.price,
                    isActivity: '否',
                    activity_price: '/',
                    activity_time: '/',
                };
                sku.start_time = result.presell_start || result.created_time;
                sku.end_time = result.presell_end || '';
                sku.website = order_srcs[result.website] || '未知渠道';
                if (result.activity_price) {
                    sku.isActivity = '是';
                    sku.activity_price = result.activity_price;
                }
                if (result.activity_start && result.activity_end) {
                    sku.activity_time = result.activity_start + '~' + result.activity_end;
                }
                // 商城是否上线
                if (is_malls.indexOf(result.product_id) > -1) {
                    sku.isMall = '是';
                }
                data.push(
                    Object.keys(sku).map(key => {
                        return sku[key];
                    })
                );
            });
            let filename = '产品导出报表.xlsx';
            let buffer = xlsx.build([{name: filename, data: data}]);
            res.set({
                'Content-Type': 'application/vnd.ms-excel',
                'Content-Disposition':  "attachment;filename=" + encodeURIComponent(filename) ,
                'Pragma':'no-cache',
                'Expires': 0
            });
            res.send(buffer);
        });
    systemUtils.wrapService(res, next, promise);
}
module.exports = new ProductService();