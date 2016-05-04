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
    ProductDao = dao.product,
    productDao = new ProductDao();

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
        page_size = req.query.page_size;
    let res_data = {
        list: [],
        page_no : page_no
    }, temp_obj = {};
    // 要通过子查询进行分页
    let promise = productDao.findProductsCount(product_name, category_id ,regionalism_id).then((data)=> {
        if (toolUtils.isEmptyArray(data.results)) {
            throw new TiramisuError(res_obj.NO_MORE_PAGE_RESULTS);
        }
        let preSql = data.sql, preParams = data.params;
        res_data.total = data.results[0].total;
        return productDao.findProducts(preSql, preParams,page_no,page_size);
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
    req.query.category_id = Constant.PRODUCT.ACCESSORY_ID;
    req.query.page_no = 0;
    // req.query.page_size = 10;
    return ProductService.prototype.listProducts(req, res, next);
};

module.exports = new ProductService();

