"use strict";

var _ = require('lodash');
var co = require('co');

var Constant = require('../../../common/Constant');
var dao = require('../../../dao');
var invoiceDao = dao.invoice;
var orderDao = new dao.order();

var request = require('request');
var logger = require('../../../common/LogHelper').systemLog();
var config = require('../../../config');
var toolUtils = require('../../../common/ToolUtils');

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
            result = [IS.CANCEL, IS.UNTREATED, IS.COMPLETED].indexOf(new_status);
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
        let query = Object.assign({bind_id: company_id}, req.query);
        return yield invoiceDao.findCompanyHistory(query);
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getInvoiceHistory = function (req, res, next) {
    let promise = co(function *() {
        let invoice_id = req.params.invoiceId;
        let query = Object.assign({bind_id: invoice_id}, req.query);
        return yield invoiceDao.findInvoiceHistory(query);
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
        if (!company_info || company_info.length == 0) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS, '公司信息不存在...'));
        let info = {
            del_flag: 0
        };
        yield invoiceDao.updateCompany(company_id, systemUtils.assembleUpdateObj(req, info));
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
        if (!company_info || company_info.length == 0) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS, '公司信息不存在...'));
        company_info = company_info[0];
        let invoice = yield invoiceDao.findInvoiceList({company_id: company_id});
        let tmp_flag = false;
        invoice.list.forEach(curr=> {
            if (['UNTREATED'].indexOf(curr.status) != -1) {
                tmp_flag = true;
            }
            if (tmp_flag) return false;
        });
        if (tmp_flag) return Promise.reject(new TiramisuError(res_obj.FAIL, '正在开具该公司发票中...'));
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
        info.is_review = 0;
        yield invoiceDao.updateCompany(company_id, systemUtils.assembleUpdateObj(req, info));
        let history = {option: ''};
        history.bind_id = company_id;
        history.option += `编辑公司信息\n`;
        if (info.name !== undefined && info.name != company_info.name) history.option += `修改名称为{${info.name}}\n`;
        if (info.code !== undefined && info.code != company_info.code) history.option += `修改纳税人识别号为{${info.code}}\n`;
        if (info.add !== undefined && info.add != company_info.add) history.option += `修改地址为{${info.add}}\n`;
        if (info.tel !== undefined && info.tel != company_info.tel) history.option += `修改电话为{${info.tel}}\n`;
        if (info.bank_name !== undefined && info.bank_name != company_info.bank_name) history.option += `修改账户名为{${info.bank_name}}\n`;
        if (info.bank_account !== undefined && info.bank_account != company_info.bank_account) history.option += `修改账户为{${info.bank_account}}\n`;
        if (info.img_1 !== undefined && info.img_1 != company_info.img_1) history.option += `修改营业执照\n`;
        if (info.img_2 !== undefined && info.img_2 != company_info.img_2) history.option += `修改税务登记证\n`;
        if (info.img_3 !== undefined && info.img_3 != company_info.img_3) history.option += `修改纳税人资格证\n`;
        if (info.img_4 !== undefined && info.img_4 != company_info.img_4) history.option += `修改银行开户许可证\n`;
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
        if (!company_info || company_info.length == 0) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS, '公司信息不存在...'));
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
        let _res = yield invoiceDao.findCompanyList(req.query);
        _res.list.forEach(curr=> {
            if (curr.order_id) {
                curr.order_id = systemUtils.getShowOrderId(curr.order_id, curr.order_created_time);
            }
        });
        return _res;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getCompanyInfo = function (req, res, next) {
    let promise = co(function *() {
        let company_id = req.params.companyId;
        let company_info = yield invoiceDao.findCompanyById(company_id);
        if (!company_info || company_info.length == 0) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS, '公司信息不存在...'));
        company_info = company_info[0];
        return company_info;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getCompanyInvoiceHistory = function (req, res, next) {
    let promise = co(function *() {
        let company_id = req.params.companyId;
        let _res = yield invoiceDao.findInvoiceList({company_id: company_id});
        _res.list.forEach(curr=> {
            if (curr.order_status != 'COMPLETED') {
                curr.status = IS.WAITING;
            }
            curr.order_id = systemUtils.getShowOrderId(curr.order_id, curr.order_created_time);
        });
        return _res;
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
            if (curr.order_status != 'COMPLETED') {
                curr.status = IS.WAITING;
            }
            let add = curr.merger_name.split(',');
            add.push(curr.address);
            add.shift();
            curr.address = add.join();
            curr.order_id = systemUtils.getShowOrderId(curr.order_id, curr.order_created_time);
        });
        return _res;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.addInvoice = function (req, res, next) {
    let promise = co(function *() {
        let order_id = systemUtils.getDBOrderId(req.body.order_id);
        let order_info = yield orderDao.findOrderById(order_id);
        if (!order_info || order_info.length == 0) return Promise.reject(new TiramisuError(res_obj.FAIL, '订单号不存在...'));
        order_info = order_info[0];
        if (['CANCEL', 'EXCEPTION'].indexOf(order_info.status) != -1) return Promise.reject(new TiramisuError(res_obj.FAIL, '订单已取消或异常...'));
        let tmp_list = yield invoiceDao.findInvoiceByOrderId(order_id);
        if (tmp_list && tmp_list.length != 0) return Promise.reject(new TiramisuError(res_obj.FAIL, '该订单已开发票或正在开发票...'));
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
        if (info.company_id) {
            let company_info = yield invoiceDao.findCompanyById(info.company_id);
            if (!company_info || company_info.length == 0) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS, '公司信息不存在...'));
            company_info = company_info[0];
            info.title = company_info.name;
        }
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
        if (!invoice_info || invoice_info.length == 0) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS, '发票信息不存在...'));
        invoice_info = invoice_info[0];
        let info;
        if (req.body.status == IS.COMPLETED) {
            info = {status: IS.COMPLETED};
        } else {
            info = _.pick(req.body, [
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
            info.status = IS.UNTREATED;
            if (info.type == '0') {
                info.company_id = 0;
            }
            if (info.company_id) {
                let company_info = yield invoiceDao.findCompanyById(info.company_id);
                if (!company_info || company_info.length == 0) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS, '公司信息不存在...'));
                company_info = company_info[0];
                info.title = company_info.name;
            }
        }
        if (!isInvoiceCanUpdateStatus(invoice_info.status, info.status)) return Promise.reject(new TiramisuError(res_obj.OPTION_EXPIRED));
        yield invoiceDao.updateInvoice(invoice_id, systemUtils.assembleUpdateObj(req, info));
        let history = {option: ''};
        history.bind_id = invoice_id;
        if (info.status == IS.UNTREATED) {
            history.option += `修改发票信息\n`;
            if (info.type !== undefined && info.type != invoice_info.type) history.option += `修改为{${(info.type == '1') ? '专用' : '普通'}}发票\n`;
            if (info.title !== undefined && info.title != invoice_info.title) history.option += `修改title为{${info.title}}\n`;
            if (info.amount !== undefined && info.amount != invoice_info.amount) history.option += `修改金额为{${info.amount}}\n`;
            if (info.address !== undefined && info.address != invoice_info.address) history.option += `修改地址为{${info.address}}\n`;
            if (info.recipient_name !== undefined && info.recipient_name != invoice_info.recipient_name) history.option += `修改收票人为{${info.recipient_name}\n`;
            if (info.recipient_mobile !== undefined && info.recipient_mobile != invoice_info.recipient_mobile) history.option += `修改收票人手机号为{${info.recipient_mobile}\n`;
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
        if (!invoice_info || invoice_info.length == 0) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS, '发票信息不存在...'));
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
        if (invoice_info.order_status != 'COMPLETED') {
            invoice_info.status = IS.WAITING;
        }
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
        if (!invoice_info || invoice_info.length == 0) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS, '发票信息不存在...'));
        invoice_info = invoice_info[0];
        let info = _.pick(req.body, [
            'express_type',
            'express_no'
        ]);
        info.status = IS.DELIVERY;
        // 要允许修改运单号,暂不做判断
        // if (!isInvoiceCanUpdateStatus(invoice_info.status, info.status)) return Promise.reject(new TiramisuError(res_obj.OPTION_EXPIRED));
        yield invoiceDao.updateInvoice(invoice_id, systemUtils.assembleUpdateObj(req, info));
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
        if (!invoice_info || invoice_info.length == 0) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS, '发票信息不存在...'));
        let info = {
            remarks: req.body.remarks
        };
        yield invoiceDao.updateInvoice(invoice_id, systemUtils.assembleUpdateObj(req, info));
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
        if (!invoice_info || invoice_info.length == 0) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS, '发票信息不存在...'));
        let info = {
            status: IS.CANCEL
        };
        yield invoiceDao.updateInvoice(invoice_id, systemUtils.assembleUpdateObj(req, info));
        let history = {option: ''};
        history.bind_id = invoice_id;
        history.option += `取消开发票\n`;
        yield invoiceDao.insertInvoiceHistory(systemUtils.assembleInsertObj(req, history, true));
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * 根据快递单号和快递公司代号后去快递信息
 * @param req
 * @param res
 * @param next
 */
module.exports.getExressInfo = function (req, response, next) {
    let express_obj = _.pick(req.query,['express_type', 'express_no']);
    let body = {
        expressno : [express_obj.express_no],
        expresscode : express_obj.express_type
    };
    request.post({
        url : config.express_host,
        body : body,
        json : true
    },(err,res,body)=>{
        if(err || res.statusCode !== 200){
            logger.error('获取快递单号[' + express_obj.express_no + ']时异常 -> ',err);
        }
        if (body.data && toolUtils.isArray && body.data.length > 0){
            response.api(JSON.parse(body.data[0].traces));
        }else{
            response.api(res_obj.NO_MORE_RESULTS);
        }
    });
};
