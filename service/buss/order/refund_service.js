"use strict";

var _ = require('lodash');
var co = require('co');

var Constant = require('../../../common/Constant');
var dao = require('../../../dao');
var refundDao = dao.refund;
var orderDao = new dao.order();

const schema = require('../../../schema');
const systemUtils = require('../../../common/SystemUtils');
const toolUtils = require('../../../common/ToolUtils');
const TiramisuError = require('../../../error/tiramisu_error');
const res_obj = require('../../../util/res_obj');

const REFUND_TYPE = Constant.REFUND.TYPE;
const RS = Constant.REFUND.STATUS;
const REASON_TYPE = Constant.REFUND.REASON_TYPE;

function isRefundCanUpdateStatus(curr_status, new_status) {
    let result;
    switch (curr_status) {
        case RS.UNTREATED:  // 未处理
            result = [RS.CANCEL, RS.UNTREATED, RS.TREATED].indexOf(new_status);
            break;
        case RS.TREATED:  // 已处理
            result = [RS.CANCEL, RS.TREATED, RS.REVIEWED].indexOf(new_status);
            break;
        case RS.REVIEWED:  // 已审核
            result = [RS.CANCEL, RS.TREATED, RS.COMPLETED].indexOf(new_status);
            break;
        case RS.CANCEL:
        case RS.COMPLETED:
            return false;
            break;
    }
    return (result !== undefined && result !== -1);
}

const REFUND_TYPE_CH = {
    PART: '部分退款',
    FULL: '全额退款',
    OVERFULL: '超额退款'
};

const WAY_CH = {
    THIRD_PARTY: '第三方平台原返',
    FINANCE: '财务部退款',
    CS: '客服部退款'
};

const ACCOUNT_TYPE_CH = {
    BANK_CARD: '银行卡',
    ALIPAY: '支付宝',
    WECHAT: '微信'
};

function joinHistory(curr_obj, new_obj, history) {
    if (new_obj.type !== undefined && curr_obj.type != new_obj.type) {
        history.option = `修改退款方式为{${REFUND_TYPE_CH[new_obj.type]}}\n`;
    }
    if (new_obj.way !== undefined && curr_obj.way != new_obj.way) {
        history.option = `修改退款渠道为{${WAY_CH[new_obj.way]}}\n`;
    }
    if (new_obj.account_type !== undefined && curr_obj.account_type != new_obj.account_type) {
        history.option = `修改退款账户类型为{${ACCOUNT_TYPE_CH[new_obj.account_type]}}\n`;
    }
    if (new_obj.account !== undefined && curr_obj.account != new_obj.account) {
        history.option = `修改退款账户为{${new_obj.account}}\n`;
    }
    if (new_obj.account_name !== undefined && curr_obj.account_name != new_obj.account_name) {
        history.option = `修改退款账户用户名为{${new_obj.account_name}}\n`;
    }
    if (new_obj.amount !== undefined && curr_obj.amount != new_obj.amount) {
        history.option = `修改退款金额为{${new_obj.amount / 100}}\n`;
    }
    if (new_obj.reason_type !== undefined && curr_obj.reason_type != new_obj.reason_type) {
        history.option = `修改退款原因为{${new_obj.reason}}\n`;
    }
    if (new_obj.linkman_name !== undefined && curr_obj.linkman_name != new_obj.linkman_name) {
        history.option = `修改联系人姓名为{${new_obj.linkman_name}}\n`;
    }
    if (new_obj.linkman_mobile !== undefined && curr_obj.linkman_mobile != new_obj.linkman_mobile) {
        history.option = `修改联系人电话为{${new_obj.linkman_mobile}}\n`;
    }
}

// 获取可选的退款原因
module.exports.getReasonType = function (req, res) {
    res.api(REASON_TYPE);
};

module.exports.getRelateList = function (req, res, next) {
    let promise = co(function *() {
        let order_id = systemUtils.getDBOrderId(req.params.orderId);
        let order_info = yield orderDao.findOrderById(order_id);
        if (!order_info || order_info.length == 0) return Promise.reject(new TiramisuError(res_obj.NO_MORE_RESULTS));
        order_info = order_info[0];
        let origin_order_id = order_info.origin_order_id;
        if (origin_order_id == '0') {
            origin_order_id = order_id;
        }
        let results = yield orderDao.findRelateListById(Object.assign({order_id: origin_order_id}, req.query));
        results.list.forEach(curr=> {
            curr.order_id = systemUtils.getShowOrderId(curr.id, curr.created_time);
            delete curr.id;
        });
        return results;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getRefundOption = function (req, res, next) {
    let promise = co(function *() {
        let order_id = systemUtils.getDBOrderId(req.params.orderId);
        let option = yield refundDao.findOptionByOrderId(order_id);
        if (!option) return Promise.reject(new TiramisuError(res_obj.NO_MORE_RESULTS));
        if (option.bind_order_id) {
            option.bind_order_id = yield orderDao.joinOrderId(option.bind_order_id);
        }
        delete option.order_created_time;
        delete option.refund_status;
        return option;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getRefundList = function (req, res, next) {
    let promise = co(function *() {
        let query = Object.assign({}, req.query);
        let results = yield refundDao.findRefund(query);
        results.list.forEach(curr=> {
            curr.order_id = systemUtils.getShowOrderId(curr.order_id, curr.order_created_time);
            if (curr.bind_order_id) {
                curr.bind_order_id = systemUtils.getShowOrderId(curr.bind_order_id, curr.bind_created_time);
            }
        });
        return results;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getRefundInfo = function (req, res, next) {
    let promise = co(function *() {
        let info = yield refundDao.findRefundById(req.params.refundId);
        if (!info || info.length == 0) return Promise.reject(new TiramisuError(res_obj.NO_MORE_RESULTS));
        info = info[0];

        let option = yield refundDao.findOptionByOrderId(info.order_id);
        if (!option) return Promise.reject(new TiramisuError(res_obj.NO_MORE_RESULTS));
        if (option.bind_order_id) {
            option.bind_order_id = yield orderDao.joinOrderId(option.bind_order_id);
        }
        delete option.order_created_time;
        delete option.refund_status;
        info.option = option;
        info.order_id = systemUtils.getShowOrderId(info.order_id, info.order_created_time);
        return info;
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.getRefundHistory = function (req, res, next) {
    let promise = co(function *() {
        let query = Object.assign({}, req.query);
        query.refund_id = req.params.refundId;
        return yield refundDao.findHistory(query);
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.addRefund = function (req, res, next) {
    let promise = co(function *() {
        let b = req.body;
        let refund_obj = _.pick(b, [
            'status',
            'type',
            'amount',
            'way',
            'account_type',
            'account',
            'account_name',
            'reason_type',
            'reason',
            'linkman',
            'linkman_name',
            'linkman_mobile',
            'is_urgent'
        ]);
        let order_id = systemUtils.getDBOrderId(b.order_id);
        let option = yield refundDao.findOptionByOrderId(order_id);
        if (!option) return Promise.reject(new TiramisuError(res_obj.OPTION_EXPIRED));
        if (option.refund_status) return Promise.reject(new TiramisuError(res_obj.OPTION_EXPIRED, '订单处于退款中'));
        if ((refund_obj.type == REFUND_TYPE.PART && refund_obj.amount >= option.payment_amount)
            || (refund_obj.type == REFUND_TYPE.FULL && refund_obj.amount != option.payment_amount)) {
            return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS, '退款金额输入有误'));
        }

        refund_obj.status = RS.TREATED;
        refund_obj.order_id = order_id;
        if (refund_obj.reason_type != 0) refund_obj.reason = REASON_TYPE[refund_obj.reason_type];
        let refund_id = yield refundDao.insertRefund(systemUtils.assembleInsertObj(req, refund_obj));
        if (!refund_id) return Promise.reject(new TiramisuError(res_obj.FAIL, '添加退款纪录失败...'));
        let refund_history = {option: ''};
        let order_history = {option: ''};
        order_history.order_id = order_id;
        order_history.option += `{退款金额}为{${refund_obj.amount / 100}}\n`;
        order_history.option += `{退款原因}为{${refund_obj.reason}}\n`;
        order_history.option += `提交退款申请\n`;
        refund_history.bind_id = refund_id;
        refund_history.option += `提交退款申请\n`;
        yield refundDao.insertHistory(systemUtils.assembleInsertObj(req, refund_history, true));
        yield orderDao.insertOrderHistory(systemUtils.assembleInsertObj(req, order_history, true));
    }).then(()=> {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.editRefund = function (req, res, next) {
    let promise = co(function *() {
        let b = req.body;
        let refund_id = req.params.refundId;
        let info = yield refundDao.findRefundById(refund_id);
        if (!info || info.length == 0) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS));
        info = info[0];
        let refund_obj = Object.assign({}, b);
        if (!refund_obj.status) {
            refund_obj = _.pick(b, [
                'status',
                'type',
                'amount',
                'way',
                'account_type',
                'account',
                'account_name',
                'reason_type',
                'reason',
                'linkman',
                'linkman_name',
                'linkman_mobile',
                'is_urgent'
            ]);
            refund_obj.status = RS.TREATED;
        }
        if (!isRefundCanUpdateStatus(info.status, refund_obj.status)) return Promise.reject(new TiramisuError(res_obj.OPTION_EXPIRED));

        let order_obj;
        let refund_history = {option: ''};
        let order_history = {option: ''};
        order_history.order_id = info.order_id;
        refund_history.bind_id = refund_id;
        if (refund_obj.status == RS.CANCEL) {
            refund_obj = {status: RS.CANCEL};
            order_history.option += `取消退款申请\n`;
            refund_history.option += `取消退款申请\n`;
        } else if (refund_obj.status == RS.COMPLETED) {
            refund_obj = {status: RS.COMPLETED};
            if (b.merchant_id) {
                refund_obj.merchant_id = b.merchant_id;
                refund_history.option += `商户订单号为{${refund_obj.merchant_id}}\n`;
            }
            if (b.pay_id) {
                refund_obj.pay_id = b.pay_id;
                refund_history.option += `支付流水号为{${refund_obj.pay_id}}\n`;
            }
            order_history.option += `退款完成\n退款金额为${info.amount / 100}`;
            refund_history.option += `退款完成\n`;
            let option = yield refundDao.findOptionByOrderId(info.order_id);
            if (!option) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS));
            order_obj = {id: info.order_id, payment_amount: option.payment_amount - info.amount};
        } else if (refund_obj.status == RS.REVIEWED) {
            refund_history.option += `退款审核通过\n`;
        } else {
            if (refund_obj.reason_type != 0) refund_obj.reason = REASON_TYPE[refund_obj.reason_type];
            joinHistory(info, refund_obj, refund_history);
            if (refund_history.option == '') return;
            refund_history.option += `编辑退款信息\n`;
        }

        if (order_obj) {
            yield orderDao.updateOrder(systemUtils.assembleUpdateObj(req, order_obj), info.order_id);
        }
        yield refundDao.updateRefund(refund_id, systemUtils.assembleUpdateObj(req, refund_obj));
        yield refundDao.insertHistory(systemUtils.assembleInsertObj(req, refund_history, true));
        if (order_history.option != '') {
            yield orderDao.insertOrderHistory(systemUtils.assembleInsertObj(req, order_history, true));
        }
    }).then(()=> {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.editRefundRemarks = function (req, res, next) {
    let promise = co(function *() {
        let remarks = req.body.remarks;
        let refund_id = req.params.refundId;
        let info = yield refundDao.findRefundById(refund_id);
        if (!info || info.length == 0) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS));
        let refund_history = {
            bind_id: refund_id,
            option: `修改备注为{${remarks}}`
        };
        yield refundDao.updateRefund(refund_id, systemUtils.assembleUpdateObj(req, {remarks: remarks}));
        yield refundDao.insertHistory(systemUtils.assembleInsertObj(req, refund_history, true));
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};

module.exports.delRefund = function (req, res, next) {
    let promise = co(function *() {
        let refund_id = req.params.refundId;
        let info = yield refundDao.findRefundById(refund_id);
        if (!info || info.length == 0) return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS));
        info = info[0];
        if (isRefundCanUpdateStatus(info.status, RS.CANCEL)) return Promise.reject(new TiramisuError(res_obj.OPTION_EXPIRED));
        let refund_history = {
            bind_id: refund_id,
            option: `取消退款`
        };
        let order_history = {
            order_id: info.order_id,
            option: `取消退款`
        };
        yield refundDao.updateRefund(refund_id, systemUtils.assembleUpdateObj(req, {status: RS.CANCEL}));
        yield refundDao.insertHistory(systemUtils.assembleInsertObj(req, refund_history, true));
        yield orderDao.insertOrderHistory(systemUtils.assembleInsertObj(req, order_history, true));
    }).then(()=> {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
