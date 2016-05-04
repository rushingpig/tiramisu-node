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
    tartetatin = require('../../../api/tartetatin'),
    async = require('async');
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
        order_id : req.query.order_id ? systemUtils.getDBOrderId(req.query.order_id) : null,
        status : req.query.status
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
    let products, refund_amount;

    let order_obj = {
        late_minutes : req.body.late_minutes,
        payfor_amount : req.body.payfor_amount * 100,
        payfor_reason : req.body.payfor_reason,
        payfor_type : req.body.payfor_type,
        signin_time : req.body.signin_time || new Date(),
        status : Constant.OS.COMPLETED
    };
    let order_sign_history_obj = {
        order_id: orderId
    };
    if(order_obj.payfor_amount == 0){
        order_sign_history_obj.option = '用户签收时间:{'+order_obj.signin_time+'}\n准点送达';
    }else if(order_obj.payfor_type === Constant.PFT.CASH){
        order_sign_history_obj.option = '用户签收时间:{'+order_obj.signin_time+'}\n{现金赔偿}:{'+order_obj.payfor_amount+'}\n{迟到时长}:{'+order_obj.late_minutes+'分钟}';
    }else if(order_obj.payfor_type === Constant.PFT.FULL_REFUND){
        order_sign_history_obj.option = '用户签收时间:{'+order_obj.signin_time+'}\n{全额退款--原因}:{'+order_obj.payfor_reason+'}';
    }

    if(order){
        products = order.products || [];
        refund_amount = order.refund_amount * 100;
        if(order.total_amount !== undefined) order_obj.total_amount = order.total_amount;
        if(order.total_original_price !== undefined) order_obj.total_original_price = order.total_original_price;
        if(order.total_discount_price !== undefined) order_obj.total_discount_price = order.total_discount_price;
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
        //===========for history begin=============
        let current_order = _res[0],
            order_history_obj = {
                order_id: orderId
            },
            add_skus = [], delete_skuIds = [], update_skus = [];
        let option = '';
        if(deliveryman && deliveryman.id && deliveryman.id != current_order.deliveryman_id){
            order_obj.deliveryman_id = deliveryman.id;
            order_obj.last_opt_cs = req.session.user.id;
            option += '修改{配送员}为{' + deliveryman.name + '('+deliveryman.mobile+')}\n';
        }
        if(order) {
            order_obj.last_opt_cs = req.session.user.id;
            for (let i = 0; i < products.length; i++) {
                let isAdd = true;
                for (let j = 0; j < _res.length; j++) {
                    if (products[i].sku_id == _res[j].sku_id) {
                        isAdd = false;
                        let curr = products[i];
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
                            amount: curr.amount
                        };
                        update_skus.push(systemUtils.assembleUpdateObj(req, order_sku_obj));
                    }
                }
                if (isAdd) {
                    let curr = products[i];
                    option += '增加{' + curr.product_name + '}\n';
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
                        amount: curr.amount
                    };
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
                    option += '删除{' + curr.product_name + '}\n';
                    delete_skuIds.push(curr.sku_id);
                }
            }
        }
        order_history_obj.option = option;
        //===========for history end=============

        return co(function*() {
            let recipient_id = current_order.regionalism_id;
            let recipient_obj = {};
            yield orderDao.editOrder(systemUtils.assembleUpdateObj(req, order_obj), orderId, systemUtils.assembleUpdateObj(req, recipient_obj), recipient_id, products, add_skus, delete_skuIds, update_skus);

            if (order_history_obj != '') {
                yield orderDao.insertOrderHistory(systemUtils.assembleInsertObj(req, order_history_obj, true));
            }
            yield orderDao.insertOrderHistory(systemUtils.assembleInsertObj(req, order_sign_history_obj, true));

            if (refund_amount > 0) {
                return yield tartetatin.refund(refund_amount, current_order.id, current_order.id)
                    .catch(err=> {
                        return Promise.resolve(err);
                    });
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
    req.body.order_ids.forEach((curr)=>{
        orderIds.push(systemUtils.getDBOrderId(curr));
        let param = [systemUtils.getDBOrderId(curr),'分配配送员:\n'+deliveryman_name + "     "+deliveryman_mobile,req.session.user.id,new Date()];
        order_history_params.push(param);

    });
    let order_promise = deliveryDao.updateOrderWithDeliveryman(orderIds,systemUtils.assembleUpdateObj(req,update_obj)).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID,"指定的订单号无效...");
        }
        return orderDao.batchInsertOrderHistory(order_history_params);
    }).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.FAIL,'批量记录订单操作历史记录异常...');
        }
    });
    let order_fulltext_promise = orderDao.batchUpdateOrderFulltext(orderIds,order_fulltext_obj).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.FAIL,'批量更新订单全文检索配送员信息异常...');
        }
    });
    let promise = Promise.all([order_promise,order_fulltext_promise]).then(()=>{res.api()});
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
    let city_id = currentUser.city_id;
    let promise = deliveryDao.findDeliverymansByStation(city_id,currentUser).then((results)=>{
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
            current_id: current_order.delivery_id,
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
    let promise = deliveryDao.updateReprintApply(systemUtils.assembleUpdateObj(req,reprint_apply_update_obj),null,true,order_id).then((result)=>{
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

        results.forEach((curr)=>{

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
                data.province_id = curr.province_id;
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
                if(curr.sku_id){
                    let product_obj = {
                        sku_id : curr.sku_id,
                        choco_board : curr.choco_board,
                        custom_desc : curr.custom_desc,
                        custom_name : curr.custom_name,
                        discount_price : curr.discount_price/100,   // 总的实际售价
                        greeting_card : curr.greeting_card,
                        num : curr.num,
                        original_price : curr.discount_price/curr.num/100,  // 单价显示为实际售价
                        product_name : curr.product_name,
                        atlas : curr.atlas,
                        size : curr.size,
                        amount : curr.amount/100
                    };
                    data.products.push(product_obj);
                }
                map.set(curr.id,data);
            }else{
                if(curr.sku_id) {
                    let product_obj = {
                        sku_id: curr.sku_id,
                        choco_board: curr.choco_board,
                        custom_desc: curr.custom_desc,
                        custom_name: curr.custom_name,
                        discount_price: curr.discount_price/100,
                        greeting_card: curr.greeting_card ? curr.greeting_card : '不需要',
                        num: curr.num,
                        original_price: curr.original_price/100,
                        product_name: curr.product_name,
                        atlas: curr.atlas,
                        size: curr.size,
                        amount : curr.amount/100
                    };
                    map.get(curr.id).products.push(product_obj);
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

        results.forEach((curr)=>{

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
                if(curr.sku_id){
                    let product_obj = {
                        sku_id : curr.sku_id,
                        choco_board : curr.choco_board,
                        custom_desc : curr.custom_desc,
                        custom_name : curr.custom_name,
                        discount_price : curr.discount_price/100,
                        greeting_card : curr.greeting_card,
                        num : curr.num,
                        original_price : curr.original_price/100,
                        product_name : curr.product_name,
                        atlas : curr.atlas,
                        size : curr.size,
                        amount : curr.amount/100
                    };
                    data.products.push(product_obj);
                }
                map.set(curr.id,data);
            }else{
                if(curr.sku_id) {
                    let product_obj = {
                        sku_id: curr.sku_id,
                        choco_board: curr.choco_board,
                        custom_desc: curr.custom_desc,
                        custom_name: curr.custom_name,
                        discount_price: curr.discount_price/100,
                        greeting_card: curr.greeting_card ? curr.greeting_card : '不需要',
                        num: curr.num,
                        original_price: curr.original_price/100,
                        product_name: curr.product_name,
                        atlas: curr.atlas,
                        size: curr.size,
                        amount : curr.amount/100
                    };
                    map.get(curr.id).products.push(product_obj);
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
module.exports = new DeliveryService();
