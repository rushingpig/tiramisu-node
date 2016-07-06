'use strict';
var res_obj = require('../../../util/res_obj'),
    systemUtils = require('../../../common/SystemUtils'),
    toolUtils = require('../../../common/ToolUtils'),
    TiramisuError = require('../../../error/tiramisu_error'),
    schema = require('../../../schema'),
    dao = require('../../../dao'),
    CategoryDao = dao.category,
    categoryDao = new CategoryDao();

function CategoryService() {}

/**
 * add first category
 * @param req
 * @param res
 * @param next
 */
CategoryService.prototype.addPrimaryCategory = (req,res,next)=>{
    req.checkBody(schema.addPrimaryCategory);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let promise = categoryDao.insertPrimaryCategory(req, req.body)
        .then(() => {
            res.api();
        }
    );
    systemUtils.wrapService(res,next,promise);
};
/**
 * add second category
 * @param req
 * @param res
 * @param next
 */
CategoryService.prototype.addSecondaryCategory = (req,res,next)=>{
    req.checkBody(schema.addSecondaryCategory);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let promise = categoryDao.insertSecondaryCategory(req, req.body)
        .then(() => {
            res.api();
        }
    );
    systemUtils.wrapService(res,next,promise);
};
/**
 * get categories by name
 * @param req
 * @param res
 * @param next
 */
CategoryService.prototype.listCategoriesByName = (req,res,next)=>{
    req.checkQuery('name').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let data = {
        name : req.query.name
    };
    let promise = categoryDao.findCategoriesByName(data).then((results)=>{
        if(toolUtils.isEmptyArray(results)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS_ARR);
        }
        res.api(results);
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * get category remark by id
 * @param req
 * @param res
 * @param next
 */
CategoryService.prototype.getCategoryRemark = (req,res,next)=>{
    req.checkParams('id').notEmpty().isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let data = {
        id : req.params.id
    };
    let promise = categoryDao.getCategoryRemarkById(data).then((results)=>{
        if(toolUtils.isEmptyArray(results)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        res.api(results[0]);
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * get category regions for pc by id
 * @param req
 * @param res
 * @param next
 */
CategoryService.prototype.getCategoryRegionsForPC = (req,res,next)=>{
    req.checkParams('id').notEmpty().isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let data = {
        id : req.params.id
    };
    let promise = categoryDao.getCategoryRegionsById(data).then((results)=>{
        if(toolUtils.isEmptyArray(results)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS_ARR);
        }
        res.api(results);
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * find categories by multiple condition
 * condition: primary_id
 * condition: secondary_id
 * condition: province_id
 * condition: city_id
 * @param req
 * @param res
 * @param next
 */
CategoryService.prototype.listCategoriesByMultipleCondition = (req,res,next)=>{
    req.checkQuery(schema.listCategory);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let promise = categoryDao.findCategoriesList(req.query).then(results => {
        if(toolUtils.isEmptyArray(results)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS_ARR);
        }
        res.api(results);
    });
    systemUtils.wrapService(res,next,promise);
};

/**
 * modify primary category by id
 * @param req
 * @param res
 * @param next
 */
CategoryService.prototype.modifyPrimaryCategory = (req,res,next)=>{
    req.checkBody(schema.modifyPrimaryCategory);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let body = req.body;
    let data = {
        id: body.id,
        cities_add: body.cities_add || [],
        cities_delete: body.cities_delete || []
    };
    let hasCategory = false;
    let category = {};
    if (body.name) {
        hasCategory = true;
        category.name = body.name;
    }
    if (body.remarks) {
        hasCategory = true;
        category.remarks = body.remarks;
    }
    if (body.isAddition) {
        hasCategory = true;
        category.isAddition = body.isAddition;
    }
    if (hasCategory) {
        data.category = category;
    }
    let promise = categoryDao.updatePrimaryCategory(req, data)
        .then(() => {
            res.api();
        }
    );
    systemUtils.wrapService(res,next,promise);
};

/**
 * modify secondary category by id
 * @param req
 * @param res
 * @param next
 */
CategoryService.prototype.modifySecondaryCategory = (req,res,next)=>{
    req.checkBody(schema.modifySecondaryCategory);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let body = req.body;
    let data = {
        id: body.id,
        cities_add: body.cities_add || [],
        cities_delete: body.cities_delete || []
    };
    let hasCategory = false;
    let category = {};
    if (body.parent_id) {
        hasCategory = true;
        category.parent_id = body.parent_id;
    }
    if (body.name) {
        hasCategory = true;
        category.name = body.name;
    }
    if (body.remarks) {
        hasCategory = true;
        category.remarks = body.remarks;
    }
    if (body.isAddition) {
        hasCategory = true;
        category.isAddition = body.isAddition;
    }
    if (hasCategory) {
        data.category = category;
    }
    let promise = categoryDao.updateSecondaryCategory(req, data)
        .then(() => {
            res.api();
        }
    );
    systemUtils.wrapService(res,next,promise);
};

/**
 * get secondary categories by primary category id
 * @param req
 * @param res
 * @param next
 */
CategoryService.prototype.getSecondaryCategoriesByPrimaryCategoryId = (req,res,next)=>{
    req.checkParams('primary_id').notEmpty().isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let data = {
        id: req.params.primary_id
    };
    let promise = categoryDao.findSecondaryCategoriesByPrimaryCategoryId(req, data)
        .then(results => {
            if(toolUtils.isEmptyArray(results)){
                throw new TiramisuError(res_obj.NO_MORE_RESULTS);
            }
            res.api(results);
        }
    );
    systemUtils.wrapService(res,next,promise);
};

/**
 * get category details by id
 * @param req
 * @param res
 * @param next
 */
CategoryService.prototype.getCategoryDetailsById = (req,res,next)=>{
    req.checkParams('id').notEmpty().isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let promise = Promise.all([
        categoryDao.getCategoryById(req.params), 
        categoryDao.getCategoryRegionsById(req.params)
    ]).then(results => {
        if(toolUtils.isEmptyArray(results[0])){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let res_obj = {
            category: results[0][0],
            regions: results[1]
        };
        res.api(res_obj);
    });
    systemUtils.wrapService(res,next,promise);
};

/**
 * rank categories in new sort
 * @param req
 * @param res
 * @param next
 */
CategoryService.prototype.rankCategoris = (req,res,next)=>{
    req.checkBody('regionalism_id').notEmpty().isInt();
    req.checkBody('ranking').notEmptyArray();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let regionalism_id = req.body.regionalism_id;
    let data = req.body.ranking.map(rank => {
        return {
            regionalism_id: regionalism_id,
            category_id: rank.category_id,
            sort: rank.sort
        };
    });
    let promise = categoryDao.updateSort(req, data)
        .then(() => {
            res.api();
        });
    systemUtils.wrapService(res,next,promise);
};

/**
 * 删除指定分类，并移动分类下产品到指定分类
 * @param req
 * @param res
 * @param next
 */
CategoryService.prototype.deleteCategory = (req, res, next)=>{
    req.checkQuery('new_category').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let new_category = req.query.new_category;
    let delete_category = req.params.id;
    let promise = categoryDao.deleteCategoryById(req, delete_category, new_category)
        .then(() => {
            res.api();
        });
    systemUtils.wrapService(res, next, promise);
};

module.exports = new CategoryService();