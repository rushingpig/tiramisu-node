/**
 * @des    : the service module for delivery admin
 * @author : pigo.can
 * @date   : 15/12/17 上午9:39
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var dao = require('../../../dao'),
    DeliveryDao = dao.delivery,
    OrderDao = dao.order,
    deliveryDao = new DeliveryDao(),
    orderDao = new OrderDao(),
    addressDao = new dao.address(),
    Constant = require('../../../common/Constant'),
    res_obj = require('../../../util/res_obj'),
    systemUtils = require('../../../common/SystemUtils'),
    dateUtils = require('../../../common/DateUtils'),
    TiramisuError = require('../../../error/tiramisu_error'),
    toolUtils = require('../../../common/ToolUtils'),
    schema = require('../../../schema'),
    request = require('request'),
    config = require('../../../config'),
    logger = require('../../../common/LogHelper').systemLog(),
    co = require('co'),
    _ = require('lodash'),
    xlsx = require('node-xlsx'),
    tartetatin = require('../../../api/tartetatin'),
    calculator = require('../../../api/calculator'),
    async = require('async');

var refundDao = dao.refund;
const REFUND_TYPE = Constant.REFUND.TYPE;
const RS = Constant.REFUND.STATUS;
const REASON_TYPE = Constant.REFUND.REASON_TYPE;
const sms = require('../../../api/sms');
const img_host = config.img_host;

function DeliveryService(){

}
/**
 * get all delivery station list
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.getDeliveryStationList = (req,res,next)=>{
    req.checkQuery('city_id').optional().isInt();
    if (req.query.is_national === undefined)
        req.checkQuery('city_ids').optional().notEmpty();
    req.checkQuery('is_national').optional().isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let query_data = {
        city_id : req.query.city_id,
        city_ids : req.query.city_ids ? req.query.city_ids.split(',') : null,
        is_national: req.query.is_national,
        signal : req.query.signal,
        user : req.session.user
    };
    async.series([
        // function(cb){
        //     if(parseInt(req.query.is_national) === 1){
        //         let city_ids = [];
        //         addressDao.findAllCities().then(cities => {
        //             cities.forEach(curr => {
        //                 city_ids.push(curr.id);
        //             });
        //         });
        //         query_data.city_ids = city_ids;
        //         cb(null);
        //     }else{
        //         cb(null);
        //     }
        // },
        function(cb){
            let promise = deliveryDao.findAllStations(query_data).then(results=>{
                if(toolUtils.isEmptyArray(results)){
                    throw new TiramisuError(res_obj.NO_MORE_RESULTS,'该条件下没有可选的配送站...');
                }
                let data = {};
                results.forEach((curr)=>{
                    data[curr.id] = curr.name;
                });
                res.api(data);
                cb(null);
            });
            systemUtils.wrapService(res,next,promise,cb);
        }
    ]);
};

/**
 * exchange the status for the choosed orders
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.exchageOrders = (req,res,next)=>{
    req.checkBody(schema.exchangeOrder);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let orderIds = [],order_history_params = [];
    req.body.order_ids.forEach((curr)=>{
        orderIds.push(systemUtils.getDBOrderId(curr));
        let param = [systemUtils.getDBOrderId(curr),'转换订单',req.session.user.id,new Date()];
        order_history_params.push(param);
    });
    let order_promise = orderDao.findOrdersByIds(orderIds).then((results)=>{
        if(toolUtils.isEmptyArray(results)){
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID,'待转换的订单列表无效');
        }
        for(let i = 0;i < results.length;i++){
            let curr = results[i];
            if (!systemUtils.checkOrderDataScopes(req.session.user, curr)) {
                throw new TiramisuError(res_obj.OPTION_EXPIRED, '待转换的订单号[' + curr.id + ']没有权限操作');
            }
            if(curr.status !== Constant.OS.STATION){
                throw new TiramisuError(res_obj.ORDER_NO_STATION,'待转换的订单号['+curr.id+']状态为['+curr.status+'],不能被转换...');
            }
        }
        return deliveryDao.updateOrderStatus(orderIds);
    }).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        }
    });

    let history_promise = orderDao.batchInsertOrderHistory(order_history_params).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.FAIL);
        }
    });
    let promise = Promise.all([order_promise,history_promise]).then(()=>{
        res.api();
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * apply for print the order once again
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.applyForRePrint = (req,res,next) => {
    req.checkBody(schema.printApply);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let print_apply_obj = {
        applicant_mobile : req.body.applicant_mobile,
        director_mobile : req.body.director_mobile,
        order_id : systemUtils.getDBOrderId(req.body.order_id),
        show_order_id : req.body.order_id,
        reason : req.body.reason
    };
    let order_update_obj = {
        print_status : Constant.PS.AUDITING
    };
    let print_apply_promise = deliveryDao.insertPrintApply(systemUtils.assembleInsertObj(req,print_apply_obj)).then((result)=>{
        if(!Number.isInteger(result) || parseInt(result) === 0){
            throw new TiramisuError(res_obj.FAIL);
        }
    }).then(()=>{

        let body = {
            "timestamp" : Date.now(),
            "method" : "order.print.apply",
            "phone" : req.body.director_mobile,
            "params" : {
                "order_id" : req.body.order_id,
                "applicant" : req.session.user.name + " 电话:" + req.body.applicant_mobile
            }
        };
        request.post({
            url : config.sms_host,
            body : body,
            json : true
        },(err,res,body)=>{
            if(err || res.statusCode !== 200){
                logger.error('给用户['+req.body.director_mobile+']发送申请打印短信异常====>['+err+']');
            }
        });
    });
    let print_status_promise = orderDao.updateOrder(systemUtils.assembleUpdateObj(req,order_update_obj),print_apply_obj.order_id).then((result)=>{
        if(!Number.isInteger(result) || parseInt(result) === 0){
            throw new TiramisuError(res_obj.FAIL);
        }
    });
    let promise = Promise.all([print_apply_promise,print_status_promise]).then(()=>{
        res.api();
    });

    systemUtils.wrapService(res,next,promise);
};
/**
 * get the reprint applies
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.listReprintApplies = (req,res,next)=>{
    req.checkQuery(schema.reprintApplies);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let query_obj = {
        begin_time : req.query.begin_time,
        end_time : req.query.end_time,
        is_reprint : req.query.is_reprint,
        // @Deprecated
        // order_id : req.query.order_id ? systemUtils.getDBOrderId(req.query.order_id) : null,
        status : req.query.status,
        keywords : req.query.keywords
    };
    if(req.session.user){
        query_obj.city_id = req.session.user.city_id;
        query_obj.is_admin = req.session.user.is_admin;
    }
    let promise = deliveryDao.findReprintApplies(systemUtils.assemblePaginationObj(req,query_obj)).then((_res)=>{
        if(toolUtils.isEmptyArray(_res._results) || toolUtils.isEmptyArray(_res.results)){
            throw new TiramisuError(res_obj.NO_MORE_PAGE_RESULTS);
        }
        let res_data = {
            total : _res.results[0].total,
            page_no : req.query.page_no,
            list : _res._results
        };
        res.api(res_data);

    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * audit the reprint apply
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.auditReprintApply = (req,res,next)=>{
    req.checkParams('apply_id').notEmpty().isInt();
    req.checkBody(schema.auditApply);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    const validate_code = systemUtils.genValidateCode(),
          order_id = req.body.order_id,
          applicant_mobile = req.body.applicant_mobile,
          order_update_obj = {};
    let update_obj = {
        validate_code : validate_code,
        audit_opinion : req.body.audit_opinion,
        status : req.body.status
    };

    let audit_promise = deliveryDao.updateReprintApply(systemUtils.assembleUpdateObj(req,update_obj),req.params.apply_id).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        }
    }).then(()=>{

        let body = {
            "timestamp" : Date.now(),
            "method" : "order.print.approved",
            "phone" : applicant_mobile,
            "params" : {
                "order_id" : order_id,
                "code" : validate_code
            }
        };
        request.post({
            url : config.sms_host,
            body : body,
            json : true
        },(err,res,body)=>{
            if(err || res.statusCode !== 200){
                logger.error('给用户['+applicant_mobile+']发送审核打印短信异常====>['+err+']');
            }
        });
    });
    if(req.body.status == Constant.OPS.AUDITED){
        order_update_obj.print_status = Constant.PS.REPRINTABLE;
    }else if(req.body.status == Constant.OPS.AUDITFAILED){
        order_update_obj.print_status = Constant.PS.UNPRINTABLE;
    }
    let print_status_promise = orderDao.updateOrder(systemUtils.assembleUpdateObj(req,order_update_obj) ,systemUtils.getDBOrderId(order_id));

    let promise = Promise.all([audit_promise,print_status_promise]).then(()=>{
        res.api();
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * sign in the order
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.signinOrder = (req,res,next)=>{
    req.checkParams('orderId').notEmpty().isOrderId();
    req.checkBody(schema.signinOrder);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let orderId = systemUtils.getDBOrderId(req.params.orderId);
    let updated_time = req.body.updated_time;
    let order = req.body.order;
    let deliveryman = req.body.deliveryman;
    let products, refund_amount = 0, change_amount = 0;

    let order_obj = {
        late_minutes : req.body.late_minutes,
        payfor_amount : req.body.payfor_amount,
        payfor_reason : req.body.payfor_reason,
        payfor_type : req.body.payfor_type,
        signin_time : req.body.signin_time || new Date(),
        status : Constant.OS.COMPLETED
    };
    if(req.body.is_POS !== undefined){
        order_obj.is_pos_pay = req.body.is_POS ? 1 : 0;
    }
    let order_sign_history_obj = {
        order_id: orderId
    };
    if([Constant.PFT.CASH, Constant.PFT.FULL_REFUND].indexOf(order_obj.payfor_type) == -1){
        order_sign_history_obj.option = '用户签收时间:{'+order_obj.signin_time+'}\n准点送达';
    }else if(order_obj.payfor_type === Constant.PFT.CASH){
        order_sign_history_obj.option = '用户签收时间:{'+order_obj.signin_time+'}\n{现金赔偿}:{'+ (order_obj.payfor_amount / 100) +'}\n{迟到时长}:{'+order_obj.late_minutes+'分钟}';
    }else if(order_obj.payfor_type === Constant.PFT.FULL_REFUND){
        order_sign_history_obj.option = '用户签收时间:{'+order_obj.signin_time+'}\n{全额退款--原因}:{'+order_obj.payfor_reason+'}';
    }

    let promise = orderDao.findOrderById(orderId).then((_res) => {
        if (toolUtils.isEmptyArray(_res)) {
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        } else if (updated_time !== _res[0].updated_time) {
            throw new TiramisuError(res_obj.OPTION_EXPIRED);
        } else if (_res[0].status === Constant.OS.COMPLETED) {
            throw new TiramisuError(res_obj.ORDER_COMPLETED);
        } else if (_res[0].status === Constant.OS.EXCEPTION) {
            throw new TiramisuError(res_obj.ORDER_EXCEPTION);
        }
        if (!systemUtils.checkOrderDataScopes(req.session.user, _res[0]) || !systemUtils.isOrderCanUpdateStatus(_res[0].status, order_obj.status)) {
            throw new TiramisuError(res_obj.OPTION_EXPIRED);
        }
        //===========for history begin=============
        let is_change = false;
        let current_order = _res[0],
            order_history_obj = {
                order_id: orderId
            },
            add_skus = [], delete_skuIds = [], update_skus = [];
        let option = '';
        if(deliveryman && deliveryman.id && deliveryman.id != current_order.deliveryman_id){
            order_obj.deliveryman_id = deliveryman.id;
            option += '修改{配送员}为{' + deliveryman.name + '('+deliveryman.mobile+')}\n';
        }
        if(order) {
            let remarks = '';
            products = order.products || [];
            order_obj.total_amount = current_order.total_amount;
            order_obj.total_original_price = 0;
            // order_obj.total_discount_price = 0;
            for (let i = 0; i < products.length; i++) {
                order_obj.total_original_price += products[i].original_price * products[i].num;
                // order_obj.total_discount_price += products[i].discount_price;
                let isAdd = true;
                for (let j = 0; j < _res.length; j++) {
                    if (products[i].sku_id == _res[j].sku_id) {
                        isAdd = false;
                        let curr = products[i];
                        let change = products[i].num - _res[j].num;
                        let tmp_one_price = parseInt(_res[j].discount_price / _res[j].num);
                        let tmp_change_amount = tmp_one_price * change;
                        let order_sku_obj = {
                            order_id: orderId,
                            sku_id: curr.sku_id,
                            num: curr.num,
                            // choco_board: curr.choco_board,
                            // greeting_card: curr.greeting_card,
                            // atlas: curr.atlas,
                            // custom_name: curr.custom_name,
                            // custom_desc: curr.custom_desc,
                            discount_price: _res[j].discount_price + tmp_change_amount,
                            amount: _res[j].amount + tmp_change_amount
                        };
                        if (change > 0) {
                            is_change = true;
                            remarks += '增加{' + curr.name + '}数量{' + change + '},';
                            remarks += '金额由{' + (_res[j].discount_price / 100) + '}变为{' + (order_sku_obj.discount_price / 100) + '}\n';
                        } else if (change < 0) {
                            is_change = true;
                            remarks += '减少{' + curr.name + '}数量{' + (-change) + '},';
                            remarks += '金额由{' + (_res[j].discount_price / 100) + '}变为{' + (order_sku_obj.discount_price / 100) + '}\n';
                        }
                        order_obj.total_amount += tmp_change_amount;
                        if (order_sku_obj.amount < 0) {
                            change_amount += order_sku_obj.amount;
                            order_sku_obj.amount = 0;
                        }
                        update_skus.push(systemUtils.assembleUpdateObj(req, order_sku_obj));
                    }
                }
                if (isAdd) {
                    let curr = products[i];
                    is_change = true;
                    let order_sku_obj = {
                        order_id: orderId,
                        sku_id: curr.sku_id,
                        num: curr.num,
                        choco_board: curr.choco_board,
                        greeting_card: curr.greeting_card,
                        atlas: curr.atlas,
                        custom_name: curr.custom_name,
                        custom_desc: curr.custom_desc,
                        discount_price: curr.discount_price,
                        amount: 0
                    };
                    remarks += '增加{' + curr.name + '}数量{' + curr.num + '},金额{' + (order_sku_obj.discount_price / 100) + '}\n';
                    order_obj.total_amount += curr.discount_price;
                    change_amount += curr.discount_price;
                    add_skus.push(systemUtils.assembleInsertObj(req, order_sku_obj));
                }
            }
            for (let i = 0; i < _res.length; i++) {
                let isDelete = true;
                for (let j = 0; j < products.length; j++) {
                    if (_res[i].sku_id == products[j].sku_id) {
                        isDelete = false;
                    }
                }
                if (isDelete && _res[i].sku_id) {
                    let curr = _res[i];
                    is_change = true;
                    remarks += '删除{' + curr.product_name + '}数量{' + curr.num + '},金额{' + (curr.discount_price / 100) + '}\n';
                    order_obj.total_amount -= _res[i].discount_price;
                    change_amount += _res[i].amount - _res[i].discount_price;
                    delete_skuIds.push(curr.sku_id);
                }
            }

            if (order_obj.total_amount != _res[0].total_amount) {
                remarks += '订单总应收金额由{' + (_res[0].total_amount / 100) + '}变为{' + (order_obj.total_amount / 100) + '}';
            }

            if (remarks != '') {
                option += remarks;
                order_obj.remarks = '';
                if (_res[0].remarks) {
                    order_obj.remarks += _res[0].remarks + '\n';
                }
                order_obj.remarks += remarks;
            }

            if (is_change) {
                if (order_obj.total_amount < 0) {
                    refund_amount = -order_obj.total_amount;
                    order_obj.total_amount = 0;
                    order_obj.refund_amount = refund_amount;
                }
                if (change_amount > 0) {
                    if (add_skus.length > 0) {
                        add_skus[0].amount += change_amount;
                    } else if (update_skus.length > 0) {
                        update_skus[0].amount += change_amount;
                    }
                    change_amount = 0;
                }
                if (change_amount < 0) {
                    for (let i = 0; i < add_skus.length; i++) {
                        if (add_skus[i].amount <= 0) continue;
                        change_amount += add_skus[i].amount;
                        if (change_amount < 0) {
                            add_skus[i].amount = 0;
                        } else {
                            add_skus[i].amount = change_amount;
                            break;
                        }
                    }
                }
                if (change_amount < 0) {
                    for (let i = 0; i < update_skus.length; i++) {
                        if (update_skus[i].amount <= 0) continue;
                        change_amount += update_skus[i].amount;
                        if (change_amount < 0) {
                            update_skus[i].amount = 0;
                        } else {
                            update_skus[i].amount = change_amount;
                            break;
                        }
                    }
                }
            }
        }
        order_history_obj.option = option;
        //===========for history end=============

        systemUtils.addLastOptCs(order_obj, req);
        let user_id = req.session.user.id;
        return co(function*() {
            let delivery_pay_obj = {
                deliveryman_id: order_obj.deliveryman_id || current_order.deliveryman_id
            };
            delivery_pay_obj.delivery_pay = yield calculator.deliveryPay(_res);
            let delivery_pay_history_obj = {
                order_id: orderId,
                option: '自动计算{配送工资}为{' + (delivery_pay_obj.delivery_pay / 100) + '}元\n'
            };

            if (order_obj.total_amount > 0) {
                order_obj.payment_amount = (order_obj.payment_amount || 0) + order_obj.total_amount;
            }
            if (!is_change) {
                add_skus = null;
                delete_skuIds = null;
                update_skus = null;
                delete order_obj.total_amount;
                delete order_obj.refund_amount;
                delete order_obj.total_discount_price;
                delete order_obj.total_original_price;
            }
            yield orderDao.editOrder(systemUtils.assembleUpdateObj(req, order_obj), orderId, null, null, products, add_skus, delete_skuIds, update_skus);
            yield deliveryDao.updateDeliveryRecord(orderId, null, systemUtils.assembleUpdateObj(req, delivery_pay_obj));

            let historyArr = [];
            historyArr.push([orderId, order_sign_history_obj.option, user_id, new Date()]);
            historyArr.push([orderId, delivery_pay_history_obj.option, user_id, new Date()]);
            if (order_history_obj.option != '') {
                historyArr.push([orderId, order_history_obj.option, user_id, new Date()]);
            }
            yield orderDao.batchInsertOrderHistory(historyArr);

            if (refund_amount > 0) {
                let refund_obj = {};
                let refund_history = {option: ''};
                let refund_info = yield refundDao.findLastRefundByOrderId(orderId);
                if (refund_info && [RS.CANCEL, RS.COMPLETED].indexOf(refund_info.status) == -1) {
                    refund_obj.amount = refund_info.amount + refund_amount;
                    refund_obj.status = RS.TREATED;
                    refund_history.option = `因减少配件修改退款金额为{${refund_obj.amount / 100}}`;
                    refund_history.bind_id = refund_info.id;
                    yield refundDao.updateRefund(refund_info.id, systemUtils.assembleInsertObj(req, refund_obj));
                } else {
                    refund_obj = {
                        order_id: orderId,
                        status: RS.TREATED,
                        type: REFUND_TYPE.PART,
                        amount: refund_amount,
                        reason_type: 4,
                        reason: REASON_TYPE['4'],
                        linkman: 0,
                        linkman_name: _res[0].owner_name,
                        linkman_mobile: _res[0].owner_mobile
                    };
                    if ([1, 2].indexOf(current_order.src_id) == -1) {  // 外部渠道
                        refund_obj.way = 'THIRD_PARTY';
                    } else {
                        refund_obj.way = 'FINANCE';
                        if (current_order.pay_modes_id == 13) { // 13微信支付
                            refund_obj.account_type = 'WECHAT';
                        } else {
                            refund_obj.account_type = 'ALIPAY';
                        }
                    }
                    refund_history.option = `因减少配件自动生成退款\n退款金额为{${refund_obj.amount / 100}}\n`;
                    let order_history = {option: ''};
                    order_history.order_id = orderId;
                    order_history.option += refund_history.option;
                    refund_history.bind_id = yield refundDao.insertRefund(systemUtils.assembleInsertObj(req, refund_obj));
                    yield orderDao.insertOrderHistory(systemUtils.assembleInsertObj(req, order_history, true));
                }
                yield refundDao.insertHistory(systemUtils.assembleInsertObj(req, refund_history, true));
            }
        });
    }).then(refund_result => {
        if (refund_result) return res.api({refund_result: refund_result});
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * unsign in the order
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.unsigninOrder = (req,res,next) => {
    req.checkParams('orderId').isOrderId();
    req.checkBody(schema.unsigninOrder);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let is_blacklist = req.body.is_blacklist;
    let update_obj = {
        COD_amount : req.body.COD_amount,
        unsignin_reason : req.body.unsignin_reason,
        status : Constant.OS.EXCEPTION
    };

    let order_id = systemUtils.getDBOrderId(req.params.orderId);
    let order_history_obj = {
        order_id : order_id,
        option : '订单无人签收,未签收原因为:\n{'+update_obj.unsignin_reason+'}'
    };
    //TODO the detail demand of the blacklist of user
    let promise = orderDao.findOrderById(order_id).then((_res)=>{
        if(toolUtils.isEmptyArray(_res)){
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        }else if(_res[0].status === Constant.OS.COMPLETED ){
            throw new TiramisuError(res_obj.ORDER_COMPLETED);
        }else if(_res[0].status === Constant.OS.EXCEPTION){
            throw new TiramisuError(res_obj.ORDER_EXCEPTION);
        }
        if (!systemUtils.checkOrderDataScopes(req.session.user, _res[0]) || !systemUtils.isOrderCanUpdateStatus(_res[0].status, update_obj.status)) {
            throw new TiramisuError(res_obj.OPTION_EXPIRED);
        }
        return orderDao.updateOrder(systemUtils.assembleUpdateObj(req,update_obj),order_id);
    }).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        }
        return orderDao.insertOrderHistory(systemUtils.assembleInsertObj(req,order_history_obj,true));
    }).then((insertResult)=>{
        if(parseInt(insertResult) <= 0){
            throw new TiramisuError(res_obj.FAIL,'新增订单未签收历史记录时异常');
        }
        res.api();
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * allocate deliverymans
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.allocateDeliveryman = (req,res,next)=>{
    req.checkBody(schema.deliveryman);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let update_obj = {
        status : Constant.OS.DELIVERY,
        deliveryman_id : req.body.deliveryman_id
    };

    let orderIds = [],order_history_params = [],deliveryman_name = req.body.deliveryman_name,deliveryman_mobile = req.body.deliveryman_mobile;
    let order_fulltext_obj = {
        deliveryman_name : systemUtils.encodeForFulltext(deliveryman_name),
        deliveryman_mobile : deliveryman_mobile
    };
    let promise = co(function *() {
        for (let i = 0; i < req.body.order_ids.length; i++) {
            let curr = req.body.order_ids[i];
            let order_id = systemUtils.getDBOrderId(curr);
            let order_info = yield orderDao.findOrderById(order_id);
            if (order_info && order_info.length > 0 && order_info[0].status == Constant.OS.INLINE) {
                order_info = order_info[0];
                orderIds.push(order_id);
                let param = [order_id, '分配配送员:\n' + deliveryman_name + "     " + deliveryman_mobile, req.session.user.id, new Date()];
                order_history_params.push(param);
                let sms_body = {
                    timestamp: Date.now(),
                    method: 'order.notify.delivery_man',
                    phone: order_info.recipient_mobile,
                    params: {
                        order_id: curr,
                        name: deliveryman_name,
                        phone: deliveryman_mobile
                    }
                };
                sms.send(sms_body).catch(err=> {
                    logger.error(`[${curr}] 给用户[${sms_body.phone}]发送短信[${sms_body.method}]异常====>[${err}]`);
                });
            } else {
                // return Promise.reject(new TiramisuError(res_obj.INVALID_UPDATE_ID, "指定的订单号无效..."));
            }
        }

        if (orderIds.length == 0) {
            return Promise.reject(new TiramisuError(res_obj.INVALID_UPDATE_ID, "指定的订单号无效..."));
        }

        yield deliveryDao.updateOrderWithDeliveryman(orderIds, systemUtils.assembleUpdateObj(req, update_obj)).then((result)=> {
            if (parseInt(result) <= 0) {
                return Promise.reject(new TiramisuError(res_obj.INVALID_UPDATE_ID, "指定的订单号无效..."));
            }
            return orderDao.batchInsertOrderHistory(order_history_params);
        }).then((result)=> {
            if (parseInt(result) <= 0) {
                return Promise.reject(new TiramisuError(res_obj.FAIL, '批量记录订单操作历史记录异常...'));
            }
        });
        yield orderDao.batchUpdateOrderFulltext(orderIds, order_fulltext_obj).then((result)=> {
            if (parseInt(result) <= 0) {
                return Promise.reject(new TiramisuError(res_obj.FAIL, '批量更新订单全文检索配送员信息异常...'));
            }
        });
    }).then(()=> {
        res.api();
    }).catch(err=> {
        throw err;
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * get the deliverymans of the station
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.listDeliverymans = (req,res,next)=>{
    let currentUser = req.session.user;
    if(!currentUser){
        res.api(res_obj.SESSION_TIME_OUT,null);
        return;
    }
    let city_ids = currentUser.city_ids;
    let promise = deliveryDao.findDeliverymansByStation(city_ids,currentUser).then((results)=>{
        if(toolUtils.isEmptyArray(results)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS_ARR,'该条件下没有可选的配送员...');
        }
        res.api(results);
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * get the deliverymans of the city
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.listDeliverymansByCity = (req,res,next)=>{
    let city_id = req.params.cityId;
    let promise = deliveryDao.findDeliverymansByCity(city_id).then((results)=>{
        if(toolUtils.isEmptyArray(results)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS_ARR,'该条件下没有可选的配送员...');
        }
        res.api(results);
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * get the deliverymans of the order
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.listDeliverymansByOrder = (req,res,next)=>{
    req.checkParams('orderId').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let currentUser = req.session.user;
    if(!currentUser){
        res.api(res_obj.SESSION_TIME_OUT,null);
        return;
    }
    let order_id = systemUtils.getDBOrderId(req.params.orderId);

    let promise = co(function*() {
        let orders = yield orderDao.findOrderById(order_id);
        if (toolUtils.isEmptyArray(orders)) {
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        }
        let current_order = orders[0];

        let deliverymans = yield deliveryDao.findDeliverymansByOrder(order_id);
        if(toolUtils.isEmptyArray(deliverymans)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS_ARR,'该条件下没有可选的配送员...');
        }

        return {
            current_id: current_order.deliveryman_id,
            list: deliverymans
        }
    }).then(result=> {
        res.api(result);
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * reprint the order
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.reprint = (req,res,next)=>{
    req.checkParams('orderId').isOrderId();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }

    let order_id = systemUtils.getDBOrderId(req.params.orderId),
        order_history_obj = {
        order_id : order_id,
        option : '重新打印订单'
    };

    let reprint_apply_update_obj = {
        is_reprint : 1,
        reprint_time : new Date()
    };
    let promise = deliveryDao.updateReprintApply(reprint_apply_update_obj,null,true,order_id).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        }
        let print_status_update_obj = {
            print_status : Constant.PS.UNPRINTABLE,
            status : Constant.OS.INLINE
        };
        return orderDao.updateOrder(systemUtils.assembleUpdateObj(req,print_status_update_obj),order_id);
    }).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        }
        return orderDao.insertOrderHistory(systemUtils.assembleInsertObj(req,order_history_obj,true));
    }).then((insertResult)=>{
        if(parseInt(insertResult)<=0){
            throw new TiramisuError(res_obj.FAIL);
        }
        return orderDao.findOrderById(order_id);
    }).then((results)=>{
        if(toolUtils.isEmptyArray(results)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let res_data = {},map = new Map();

        results.forEach((curr, index)=>{

            if(!map.has(curr.id)){
                let data = {
                    products : []
                };
                data.order_id = systemUtils.getShowOrderId(curr.id,curr.created_time);
                data.created_time = dateUtils.format(curr.created_time);
                data.delivery_id = curr.delivery_id;
                data.delivery_name = curr.delivery_name;
                data.delivery_time = curr.delivery_time;
                data.delivery_type = curr.delivery_type;
                data.owner_mobile = curr.owner_mobile;
                data.owner_name = curr.owner_name;
                data.pay_modes_id = curr.pay_modes_id;
                data.pay_name = curr.pay_name;
                data.recipient_address = curr.recipient_address;
                data.recipient_name = curr.recipient_name;
                data.remarks = curr.remarks;
                data.coupon = curr.coupon;
                data.src_id = curr.src_id;
                data.merge_name = curr.merge_name;
                data.province_id = curr.province_id;
                // 如果是HK,显示不同的样式打印风格页面
                if(index === 0){
                    res_data.region = curr.province_id === Constant.HK_PROVINCE_ID ? 'HK' : 'CN';
                }
                data.province_name = curr.province_name;
                data.city_id = curr.city_id;
                data.city_name = curr.city_name;
                data.regionalism_id = curr.regionalism_id;
                data.regionalism_name = curr.regionalism_name;
                data.pay_status = curr.pay_status;
                data.recipient_mobile = curr.recipient_mobile;
                data.recipient_landmark = curr.landmark;
                data.deliveryman_name = curr.deliveryman_name;
                data.total_amount = curr.total_amount/100; // 总应收金额
                data.last_op_cs_name = curr.last_op_cs_name;
                data.greeting_card = curr.greeting_card_order;
                data.custom_name = '';
                data.custom_desc = '';
                if(curr.sku_id){
                    let product_obj = {
                        sku_id : curr.sku_id,
                        choco_board : curr.choco_board,
                        custom_desc : curr.custom_desc,
                        discount_price : curr.discount_price/100,
                        // greeting_card : curr.greeting_card,
                        num : curr.num,
                        // original_price : curr.original_price/100,
                        product_name : curr.product_name,
                        size : curr.size,
                        amount : curr.amount/100
                    };
                    if(curr.custom_name || curr.custom_desc){
                        data.custom_name += '【' + curr.custom_name + ';' + curr.custom_desc +'】';
                    }
                    data.atlas = curr.atlas ? '【√产品图册】' : '【无】';
                    data.products.push(product_obj);
                }
                map.set(curr.id,data);
            }else{
                if(curr.sku_id) {
                    let curr_order = map.get(curr.id);
                    let product_obj = {
                        sku_id: curr.sku_id,
                        choco_board: curr.choco_board,
                        custom_desc: curr.custom_desc,
                        discount_price: curr.discount_price/100,
                        // greeting_card: curr.greeting_card ? curr.greeting_card : '不需要',
                        num: curr.num,
                        original_price: curr.original_price/100,
                        product_name: curr.product_name,
                        size: curr.size,
                        amount : curr.amount/100
                    };
                    if(curr.atlas){
                        curr_order.atlas = '【√产品图册】';
                    }
                    if(curr.custom_name || curr.custom_desc){
                        curr_order.custom_name += '【' + curr.custom_name + ';' + curr.custom_desc +'】';
                    }
                    curr_order.products.push(product_obj);
                }
            }
        });
        res_data.list = Array.from(map.values());
        res_data.baseHref = req.protocol + '://' + req.headers.host;
        res.render('print',res_data);
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * to print the order for inline
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.print = (req,res,next)=>{
    req.checkQuery('order_ids').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let order_history_params = [];
    let order_ids = req.query.order_ids.split(',').map((curr)=>{
        let param = [systemUtils.getDBOrderId(curr),'打印订单',req.session.user.id,new Date()];
        order_history_params.push(param);
        return systemUtils.getDBOrderId(curr);
    });

    let promise = orderDao.findOrdersByIds(order_ids).then((result)=>{
        if(toolUtils.isEmptyArray(result)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        result.forEach((curr)=>{
            //注释掉以下代码，即可直接打印
            let print_status = curr.print_status;
            if(print_status === Constant.PS.UNPRINTABLE){
                throw new TiramisuError(res_obj.ORDER_NO_PRINT);
            }else if (print_status === Constant.PS.AUDITING){
                throw new TiramisuError(res_obj.ORDER_AUDITING);
            }
             if (!systemUtils.checkOrderDataScopes(req.session.user, curr) || !systemUtils.isOrderCanUpdateStatus(curr.status, Constant.OS.INLINE)) {
                throw new TiramisuError(res_obj.OPTION_EXPIRED);
            }
        });
        let print_status_update_obj = {
            print_status : Constant.PS.UNPRINTABLE,
            status : Constant.OS.INLINE,
            print_time : new Date()
        };
        return orderDao.updateOrders(systemUtils.assembleUpdateObj(req,print_status_update_obj),order_ids);
    }).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        }
        return orderDao.batchInsertOrderHistory(order_history_params);
    }).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.FAIL);
        }
        return orderDao.findOrderById(order_ids);
    }).then((results)=>{
        if(toolUtils.isEmptyArray(results)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let res_data = {},map = new Map();

        results.forEach((curr,index)=>{

            if(!map.has(curr.id)){
                let data = {
                    products : []
                };
                data.order_id = systemUtils.getShowOrderId(curr.id,curr.created_time);
                data.created_time = dateUtils.format(curr.created_time);
                data.delivery_id = curr.delivery_id;
                data.delivery_name = curr.delivery_name;
                data.delivery_time = curr.delivery_time;
                data.delivery_type = curr.delivery_type;
                data.owner_mobile = curr.owner_mobile;
                data.owner_name = curr.owner_name;
                data.pay_modes_id = curr.pay_modes_id;
                data.pay_name = curr.pay_name;
                data.recipient_address = curr.recipient_address;
                data.recipient_name = curr.recipient_name;
                data.remarks = curr.remarks;
                data.coupon = curr.coupon;
                data.src_id = curr.src_id;
                data.merge_name = curr.merge_name;
                data.province_id = curr.province_id;
                // 如果是HK,显示不同的样式打印风格页面
                if(index === 0){
                    res_data.region = curr.province_id === Constant.HK_PROVINCE_ID ? 'HK' : 'CN';
                }
                data.province_name = curr.province_name;
                data.city_id = curr.city_id;
                data.city_name = curr.city_name;
                data.regionalism_id = curr.regionalism_id;
                data.regionalism_name = curr.regionalism_name;
                data.pay_status = curr.pay_status;
                data.recipient_mobile = curr.recipient_mobile;
                data.recipient_landmark = curr.landmark;
                data.deliveryman_name = curr.deliveryman_name;
                data.total_amount = curr.total_amount/100; // 总应收金额
                data.last_op_cs_name = curr.last_op_cs_name;
                data.greeting_card = curr.greeting_card_order;
                data.custom_name = '';
                data.custom_desc = '';
                if(curr.sku_id){
                    let product_obj = {
                        sku_id : curr.sku_id,
                        choco_board : curr.choco_board,
                        custom_desc : curr.custom_desc,
                        discount_price : curr.discount_price/100,
                        // greeting_card : curr.greeting_card,
                        num : curr.num,
                        // original_price : curr.original_price/100,
                        product_name : curr.product_name,
                        size : curr.size,
                        amount : curr.amount/100
                    };
                    if(curr.custom_name || curr.custom_desc){
                        data.custom_name += '【' + curr.custom_name + ';' + curr.custom_desc +'】';
                    }
                    data.atlas = curr.atlas ? '【√产品图册】' : '【无】';
                    data.products.push(product_obj);
                }
                map.set(curr.id,data);
            }else{
                if(curr.sku_id) {
                    let curr_order = map.get(curr.id);
                    let product_obj = {
                        sku_id: curr.sku_id,
                        choco_board: curr.choco_board,
                        custom_desc: curr.custom_desc,
                        discount_price: curr.discount_price/100,
                        // greeting_card: curr.greeting_card ? curr.greeting_card : '不需要',
                        num: curr.num,
                        original_price: curr.original_price/100,
                        product_name: curr.product_name,
                        size: curr.size,
                        amount : curr.amount/100
                    };
                    if(curr.atlas){
                        curr_order.atlas = '【√产品图册】';
                    }
                    if(curr.custom_name || curr.custom_desc){
                        curr_order.custom_name += '【' + curr.custom_name + ';' + curr.custom_desc +'】';
                    }
                    curr_order.products.push(product_obj);
                }
            }
        });
        res_data.list = Array.from(map.values());
        res_data.baseHref = req.protocol + '://' + req.headers.host;

        res.render('print',res_data);
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * validate the code about reprint
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.validate = (req,res,next)=>{
    req.checkParams('orderId').isOrderId();
    req.checkBody('validate_code').notEmpty().isLength(6);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let order_id = systemUtils.getDBOrderId(req.params.orderId);
    let promise = deliveryDao.findReprintApplyByOrderId(order_id).then((_res)=> {
        if (toolUtils.isEmptyArray(_res)) {
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        }
        let validateCode = _res[0].validate_code;
        if (req.body.validate_code !== validateCode) {
            throw new TiramisuError(res_obj.ERROR_VALIDATE_CODE);
        }
        res.api();
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * auto allocate station by the lng and lat
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.autoAllocateStation = (req,res,next)=>{
    req.checkBody('lng','请传入有效的经度...').notEmpty();
    req.checkBody('lat','请传入有效的纬度...').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let lng = req.body.lng,lat = req.body.lat;
    let promise = deliveryDao.findAllStations().then((result)=>{
        if(toolUtils.isEmptyArray(result)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let res_data = {};
        try{
            for(let i = 0;i < result.length;i++){
                if(systemUtils.isInDeliveryScope(lng,lat,JSON.parse(result[i].coords))){
                    res_data.delivery_id = result[i].id;
                    res_data.delivery_name = result[i].name;
                    break;
                }
            }
        }catch(e){
            throw new TiramisuError(res_obj.FAIL,'数据库表里配送站配送范围坐标异常...');
        }

        if(!res_data.delivery_id){
            throw new TiramisuError(res_obj.NO_OPTIONAL_STATION);
        }
        res.api(res_data);

    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * get the appointed station info
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.getStationInfo = (req,res,next) => {
    req.checkQuery('id','请输入有效的配送站ID...').isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let promise = deliveryDao.findStationById(req.query.id).then((result)=>{
        if(toolUtils.isEmptyArray(result)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        res.api(result);
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * get delivery record
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.getRecord = (req, res, next)=>{
    req.checkParams(schema.getDeliveryRecord);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }

    let query = Object.assign({user: req.session.user}, req.query);
    if (query.isCOD !== undefined) query.is_COD = (query.isCOD == '1');
    if (req.query.keywords && isNaN(parseInt(req.query.keywords))) {
        query.keywords = systemUtils.encodeForFulltext(req.query.keywords);
    } else {
        query.keywords = req.query.keywords;
    }
    let promise = co(function *() {
        let count = yield deliveryDao.findDeliveryRecordCount(query);
        let result = Object.assign({}, _.omit(count, ['order_ids']));
        if (result.total == null) result.total = 0;
        if (result.total_amount == null) result.total_amount = 0;
        if (result.COD_amount == null) result.COD_amount = 0;
        if (result.POS_amount == null) result.POS_amount = 0;
        if (result.delivery_pay == null) result.delivery_pay = 0;
        result.cash_amount = result.COD_amount - result.POS_amount;
        let list = yield deliveryDao.findDeliveryRecordById(count.order_ids);
        list.sort((a, b)=> {
            return (a.delivery_time <= b.delivery_time) ? -1 : 1;
        });
        list.map(r=> {
            r.order_id = systemUtils.getShowOrderId(r.order_id, r.created_time);
            if (r.COD_amount === null) r.COD_amount = r.total_amount;
            if (r.delivery_count === null) r.delivery_count = 1;
            let delivery_adds = [], city_name = '';
            if (r.merger_name) {
                delivery_adds = r.merger_name.split(',');
                city_name = delivery_adds[2];
            }
            delivery_adds.shift();
            r.city = city_name;
            r.recipient_address = delivery_adds.join(',') + '  ' + r.address;
        });
        result.list = list;
        res.api(result);
    });
    systemUtils.wrapService(res, next, promise);
};
DeliveryService.prototype.getHistoryRecord = (req, res, next)=> {
    req.checkParams('orderId').isOrderId();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let order_id = systemUtils.getDBOrderId(req.params.orderId);
    let promise = deliveryDao.findHistoryRecord(order_id).then((result)=> {
        if (toolUtils.isEmptyArray(result)) {
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        if(req.query.sort_type == 'ASC' || req.query.sort_type == 'DESC'){
            result.sort((a, b)=> {
                return ((a.created_time <= b.created_time) && req.query.sort_type == 'ASC') ? -1 : 1;
            });
        }
        let data = {
            list: result,
            total: result.length
        };
        res.api(data);
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * update delivery record
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.editRecord = (req, res, next)=> {
    req.checkParams('orderId').isOrderId();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let order_id = systemUtils.getDBOrderId(req.params.orderId);
    let order_obj = {};
    let record_obj = {
        is_review: 1
    };
    let order_history_obj = {
        order_id: order_id,
        option: ''
    };
    if (req.body.COD_amount !== undefined) {
        order_obj.COD_amount = req.body.COD_amount;
        order_history_obj.option += '修改{实收金额}为{' + (order_obj.COD_amount / 100) + '}元\n';
    }
    if (req.body.delivery_pay !== undefined) {
        record_obj.delivery_pay = req.body.delivery_pay;
        order_history_obj.option += '修改{配送工资}为{' + (record_obj.delivery_pay / 100) + '}元\n';
    }
    if (req.body.remark) {
        record_obj.remark = req.body.remark;
        order_history_obj.option += '修改{配送工资审核备注}为{' + record_obj.remark + '}\n';
    }
    let promise = co(function *() {
        if (order_history_obj.option == '') return Promise.reject(new TiramisuError(res_obj.INVALID_PARAMS));
        let _res = yield orderDao.findOrderById(order_id);
        if (toolUtils.isEmptyArray(_res)) {
            return Promise.reject(new TiramisuError(res_obj.INVALID_UPDATE_ID));
        }
        yield deliveryDao.updateDeliveryRecord(order_id, systemUtils.assembleUpdateObj(req, order_obj), systemUtils.assembleUpdateObj(req, record_obj));
        yield orderDao.insertOrderHistory(systemUtils.assembleInsertObj(req, order_history_obj, true));
    }).then(result=> {
        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * get delivery proof
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.getProof = (req, res, next)=> {
    req.checkParams('orderId').isOrderId();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let order_id = systemUtils.getDBOrderId(req.params.orderId);
    let deliveryman_id = req.query.deliveryman_id;
    let delivery_count = 1;

    let promise = deliveryDao.findDeliveryProof(order_id, deliveryman_id, delivery_count).then(result=> {
        if (toolUtils.isEmptyArray(result)) {
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let data = {};
        result.forEach(r=> {
            if (r.picture_type == Constant.BDPT.RECEIPT) data.receipt_picture_url = img_host + r.picture_url;
            if (r.picture_type == Constant.BDPT.DOOR) data.door_picture_url = img_host + r.picture_url;
            if (r.picture_type == Constant.BDPT.CALL) data.call_picture_url = img_host + r.picture_url;
            if (r.picture_type == Constant.BDPT.SMS) data.sms_picture_url = img_host + r.picture_url;
        });
        if (_.isEqual(data, {})) {
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        res.api(data);
    });
    systemUtils.wrapService(res, next, promise);
};
/**
 * export delivery record
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.exportRecordExcel = (req, res)=> {
    req.checkParams(schema.getDeliveryRecord);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let query = Object.assign({user: req.session.user}, req.query);
    let sql;
    let uri = config.excel_export_host;

    if (query.deliveryman_id == 0) delete query.deliveryman_id;

    if (req.query.isCOD == '1') {
        uri += 'COD';
        query.is_COD = true;
        sql = deliveryDao.joinCODSQL(query);
    } else {
        uri += 'salary';
        if(req.query.isCOD == '0') query.is_COD = false;
        sql = deliveryDao.joinPaySQL(query);
    }

    // 请求导出excel服务
    request({
        uri: uri,
        method: 'post',
        timeout: 120000, // 30s超时
        json: true,
        body: {sql: sql}
    }).on('error', (err) => {
        return res.api(res_obj.FAIL, err);
    }).pipe(res || null);
};
DeliveryService.prototype.signRecord = (req, res, next)=> {
    req.checkParams('orderId').notEmpty().isOrderId();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
    }
    let promise = co(function *() {
        let order_id = systemUtils.getDBOrderId(req.params.orderId);
        let _res = yield orderDao.findOrderById(order_id);
        if (toolUtils.isEmptyArray(_res)) {
            return Promise.reject(new TiramisuError(res_obj.INVALID_UPDATE_ID));
        } else if ([Constant.OS.COMPLETED, Constant.OS.EXCEPTION].indexOf(_res[0].status) == -1) {
            return Promise.reject(new TiramisuError(res_obj.INVALID_UPDATE_ID));
        }

        if (req.body.deliveryman_id === undefined && req.body.is_POS === undefined) {
            return Promise.reject(new TiramisuError(res_obj.INVALID_UPDATE_ID));
        }

        let deliveryman_id = req.body.deliveryman_id;
        let deliveryman_name = req.body.deliveryman_name;
        let deliveryman_mobile = req.body.deliveryman_mobile;
        let is_pos_pay = req.body.is_POS;
        let order_obj = null;
        let record_obj = null;
        let order_history_obj = {
            order_id: order_id,
            option: ''
        };
        if (deliveryman_id !== undefined && deliveryman_id != _res[0].deliveryman_id) {
            order_obj = {};
            record_obj = {};
            order_obj.deliveryman_id = deliveryman_id;
            record_obj.deliveryman_id = deliveryman_id;
            order_history_obj.option += '修改{配送员}为{' + deliveryman_name + '(' + deliveryman_mobile + ')}\n';
        }
        if (is_pos_pay !== undefined && is_pos_pay != _res[0].is_pos_pay) {
            if (!order_obj) order_obj = {};
            order_obj.is_pos_pay = is_pos_pay ? 1 : 0;
            order_history_obj.option += '修改{收款方式}为{' + (order_obj.is_pos_pay ? 'POS' : '现金') + '}\n';
        }

        if (order_obj) order_obj = systemUtils.assembleUpdateObj(req, order_obj);
        if (record_obj) record_obj = systemUtils.assembleUpdateObj(req, record_obj);

        if (order_obj || record_obj) {
            yield deliveryDao.updateDeliveryRecord(order_id, order_obj, record_obj);
            yield orderDao.insertOrderHistory(systemUtils.assembleInsertObj(req, order_history_obj, true));
        }

        res.api();
    });
    systemUtils.wrapService(res, next, promise);
};
module.exports = new DeliveryService();
