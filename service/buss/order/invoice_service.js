"use strict";

var _ = require('lodash');
var co = require('co');

var Constant = require('../../../common/Constant');
var dao = require('../../../dao');
var invoiceDao = dao.invoice;
var orderDao = new dao.order();

const schema = require('../../../schema');
const systemUtils = require('../../../common/SystemUtils');
const TiramisuError = require('../../../error/tiramisu_error');
const res_obj = require('../../../util/res_obj');

const IS = Constant.INVOICE.STATUS;
const EXPRESS = Constant.EXPRESS;

function isInvoiceCanUpdateStatus(curr_status, new_status) {
    let result;
    switch (curr_status) {
        case IS.WAITING:  // 等待订单完成
            result = [IS.CANCEL, IS.UNTREATED].indexOf(new_status);
            break;
        case IS.UNTREATED:  // 未开具
            result = [IS.CANCEL, IS.COMPLETED].indexOf(new_status);
            break;
        case IS.COMPLETED:  // 已开具
            result = [IS.CANCEL, IS.DELIVERY].indexOf(new_status);
            break;
        case IS.CANCEL:
        case IS.DELIVERY:
            return false;
            break;
    }
    return (result !== undefined && result !== -1);
}

// 获取可选的快递公司
module.exports.getExpressList = function (req, res) {
    res.api(EXPRESS);
};

module.exports.getCompanyHistory = function (req, res, next) {
    let promise = co(function *() {
        let company_id = req.params.companyId;
        let query = Object.assign({company_id: company_id}, req.query);
        let company_history = yield invoiceDao.findCompanyHistory(query);
        return company_history;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getInvoiceHistory = function (req, res, next) {
    let promise = co(function *() {
        let invoice_id = req.params.invoiceId;
        let query = Object.assign({invoice_id: invoice_id}, req.query);
        let invoice_history = yield invoiceDao.findInvoiceHistory(query);
        return invoice_history;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.addCompany = function (req, res, next) {
    let promise = co(function *() {
        let info = _.pick(req.body, [
            'name',
            'code',
            'add',
            'tel',
            'bank_name',
            'bank_account',
            'img_1',
            'img_2',
            'img_3',
            'img_4'
        ]);
        let company_id = yield invoiceDao.insertCompany(systemUtils.assembleInsertObj(req, info));
        if (!company_id) return Promise.reject(new TiramisuError(res_obj.FAIL, '添加失败...'));
        let history = {option: ''};
        history.bind_id = company_id;
        history.option += `添加公司信息\n`;
        yield invoiceDao.insertCompanyHistory(systemUtils.assembleInsertObj(req, history, true));
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.delCompany = function (req, res, next) {
    let promise = co(function *() {
        let company_id = req.params.companyId;
        let company_info = yield invoiceDao.findInvoiceById(company_id);
        if (!company_info || company_info.length == 0) return Promise.reject(new TiramisuError());
        let info = {
            del_flag: 0
        };
        yield invoiceDao.updateCompany(systemUtils.assembleInsertObj(req, info));
        let history = {option: ''};
        history.bind_id = company_id;
        history.option += `删除公司信息\n`;
        yield invoiceDao.insertCompanyHistory(systemUtils.assembleInsertObj(req, history, true));
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.editCompany = function (req, res, next) {
    let promise = co(function *() {
        let company_id = req.params.companyId;
        let company_info = yield invoiceDao.findCompanyById(company_id);
        if (!company_info || company_info.length == 0) return Promise.reject(new TiramisuError());
        company_info = company_info[0];
        let info = _.pick(req.body, [
            'name',
            'code',
            'add',
            'tel',
            'bank_name',
            'bank_account',
            'img_1',
            'img_2',
            'img_3',
            'img_4'
        ]);
        yield invoiceDao.updateCompany(company_id, systemUtils.assembleUpdateObj(req, info));
        let history = {option: ''};
        history.bind_id = company_id;
        history.option += `编辑公司信息\n`;
        yield invoiceDao.insertCompanyHistory(systemUtils.assembleInsertObj(req, history, true));
    }).then(()=> {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.reviewCompany = function (req, res, next) {
    let promise = co(function *() {
        let company_id = req.params.companyId;
        let company_info = yield invoiceDao.findCompanyById(company_id);
        if (!company_info || company_info.length == 0) return Promise.reject(new TiramisuError());
        let info = {is_review: 1};
        yield invoiceDao.updateCompany(company_id, systemUtils.assembleUpdateObj(req, info));
        let history = {option: ''};
        history.bind_id = company_id;
        history.option += `公司信息审核通过\n`;
        yield invoiceDao.insertCompanyHistory(systemUtils.assembleInsertObj(req, history, true));
    }).then(()=> {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getCompanyList = function (req, res, next) {
    let promise = co(function *() {
        return yield invoiceDao.findCompanyList(req.query);
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getCompanyInfo = function (req, res, next) {
    let promise = co(function *() {
        let company_id = req.params.companyId;
        let company_info = yield invoiceDao.findCompanyById(company_id);
        if (!company_info || company_info.length == 0) return Promise.reject(new TiramisuError());
        company_info = company_info[0];
        return company_info;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getInvoiceCompanyList = function (req, res, next) {
    let promise = co(function *() {
        let results = {};
        let company = yield invoiceDao.findCompanyList({page_size: 1000});
        company.list.forEach(curr=> {
            if (curr.is_review == 1) {
                results[curr.id] = curr.name;
            }
        });
        return results;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getInvoiceOption = function (req, res, next) {
    let promise = co(function *() {
        let order_id = systemUtils.getDBOrderId(req.params.orderId);
        let order_info = yield orderDao.findOrderById(order_id);
        if (!order_info || order_info.length == 0) return Promise.reject(new TiramisuError(res_obj.FAIL, '订单号不存在...'));
        order_info = order_info[0];
        let option = {
            owner_mobile: order_info.owner_mobile,
            owner_name: order_info.owner_name,
            recipient_name: order_info.recipient_name,
            recipient_mobile: order_info.recipient_mobile,
            province_id: order_info.province_id,
            province_name: order_info.province_name,
            city_id: order_info.city_id,
            city_name: order_info.city_name,
            regionalism_id: order_info.regionalism_id,
            regionalism_name: order_info.regionalism_name,
            address: order_info.recipient_address,
            amount: order_info.total_discount_price
        };
        return option;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getInvoiceList = function (req, res, next) {
    let promise = co(function *() {
        let _res = yield invoiceDao.findInvoiceList(req.query);
        _res.list.forEach(curr=> {
            if (curr.order_status == '') {
                curr.status = IS.WAITING;
            }
            curr.order_id = systemUtils.getShowOrderId(curr.order_id, curr.order_created_time);
        })
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.addInvoice = function (req, res, next) {
    let promise = co(function *() {
        let order_id = systemUtils.getDBOrderId(req.body.order_id);
        let option = yield invoiceDao.findOptionByOrderId(order_id);
        if (!option) return Promise.reject(new TiramisuError(res_obj.FAIL));
        let info = _.pick(req.body, [
            'type',
            'company_id',
            'title',
            'amount',
            'recipient',
            'recipient_name',
            'recipient_mobile',
            'regionalism_id',
            'address'
        ]);
        info.order_id = order_id;
        info.status = IS.UNTREATED;
        let invoice_id = yield invoiceDao.insertInvoice(systemUtils.assembleInsertObj(req, info));
        if (!invoice_id) return Promise.reject(new TiramisuError(res_obj.FAIL, '发票申请,提交失败...'));
        let history = {option: ''};
        history.bind_id = invoice_id;
        history.option += `发票申请\n`;
        yield invoiceDao.insertInvoiceHistory(systemUtils.assembleInsertObj(req, history, true));
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.editInvoice = function (req, res, next) {
    let promise = co(function *() {
        let invoice_id = req.params.invoiceId;
        let invoice_info = yield invoiceDao.findInvoiceById(invoice_id);
        if (!invoice_info || invoice_info.length == 0) return Promise.reject(new TiramisuError());
        invoice_info = invoice_info[0];
        let info = _.pick(req.body, [
            'status',
            'type',
            'company_id',
            'title',
            'amount',
            'recipient',
            'recipient_name',
            'recipient_mobile',
            'regionalism_id',
            'address'
        ]);
        if (!req.body.status) {
            info.status = IS.UNTREATED;
        }
        if (!isInvoiceCanUpdateStatus(invoice_info.status, info.status)) return Promise.reject(new TiramisuError(res_obj.OPTION_EXPIRED));
        yield invoiceDao.updateInvoice(systemUtils.assembleInsertObj(req, info));
        let history = {option: ''};
        history.bind_id = invoice_id;
        if (info.status == IS.UNTREATED) {
            history.option += `修改发票信息\n`;
        } else if (info.status == IS.COMPLETED) {
            history.option += `开具发票\n`;
        }
        yield invoiceDao.insertInvoiceHistory(systemUtils.assembleInsertObj(req, history, true));
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getInvoiceInfo = function (req, res, next) {
    let promise = co(function *() {
        let invoice_id = req.params.invoiceId;
        let invoice_info = yield invoiceDao.findInvoiceById(invoice_id);
        if (!invoice_info || invoice_info.length == 0) return Promise.reject(new TiramisuError());
        invoice_info = invoice_info[0];
        let order_info = yield orderDao.findOrderById(invoice_info.order_id);
        if (!order_info || order_info.length == 0) return Promise.reject(new TiramisuError(res_obj.FAIL, '订单号不存在...'));
        order_info = order_info[0];
        invoice_info.option = {
            owner_mobile: order_info.owner_mobile,
            owner_name: order_info.owner_name,
            recipient_name: order_info.recipient_name,
            recipient_mobile: order_info.recipient_mobile,
            province_id: order_info.province_id,
            province_name: order_info.province_name,
            city_id: order_info.city_id,
            city_name: order_info.city_name,
            regionalism_id: order_info.regionalism_id,
            regionalism_name: order_info.regionalism_name,
            address: order_info.recipient_address,
            amount: order_info.total_discount_price
        };
        invoice_info.order_id = systemUtils.getShowOrderId(invoice_info.order_id, invoice_info.order_created_time);
        return invoice_info;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.setInvoiceExpress = function (req, res, next) {
    let promise = co(function *() {
        let invoice_id = req.params.invoiceId;
        let invoice_info = yield invoiceDao.findInvoiceById(invoice_id);
        if (!invoice_info || invoice_info.length == 0) return Promise.reject(new TiramisuError());
        invoice_info = invoice_info[0];
        let info = _.pick(req.body, [
            'express_type',
            'express_no'
        ]);
        info.status = IS.DELIVERY;
        if (!isInvoiceCanUpdateStatus(invoice_info.status, info.status)) return Promise.reject(new TiramisuError(res_obj.OPTION_EXPIRED));
        yield invoiceDao.updateInvoice(systemUtils.assembleInsertObj(req, info));
        let history = {option: ''};
        history.bind_id = invoice_id;
        history.option += `发票寄出\n`;
        history.option += `{${EXPRESS[info.express_type] || ''}}:{${info.express_no || ''}}\n`;
        yield invoiceDao.insertInvoiceHistory(systemUtils.assembleInsertObj(req, history, true));
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.editInvoiceRemarks = function (req, res, next) {
    let promise = co(function *() {
        let invoice_id = req.params.invoiceId;
        let invoice_info = yield invoiceDao.findInvoiceById(invoice_id);
        if (!invoice_info || invoice_info.length == 0) return Promise.reject(new TiramisuError());
        let info = {
            remarks: req.body.remarks
        };
        yield invoiceDao.updateInvoice(systemUtils.assembleInsertObj(req, info));
        let history = {option: ''};
        history.bind_id = invoice_id;
        history.option += `修改备注为{${info.remarks}}\n`;
        yield invoiceDao.insertInvoiceHistory(systemUtils.assembleInsertObj(req, history, true));
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.delInvoice = function (req, res, next) {
    let promise = co(function *() {
        let invoice_id = req.params.invoiceId;
        let invoice_info = yield invoiceDao.findInvoiceById(invoice_id);
        if (!invoice_info || invoice_info.length == 0) return Promise.reject(new TiramisuError());
        let info = {
            status: IS.CANCEL
        };
        yield invoiceDao.updateInvoice(systemUtils.assembleInsertObj(req, info));
        let history = {option: ''};
        history.bind_id = invoice_id;
        history.option += `取消开发票\n`;
        yield invoiceDao.insertInvoiceHistory(systemUtils.assembleInsertObj(req, history, true));
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};
