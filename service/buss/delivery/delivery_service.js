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
    Constant = require('../../../common/Constant'),
    res_obj = require('../../../util/res_obj'),
    systemUtils = require('../../../common/SystemUtils'),
    TiramisuError = require('../../../error/tiramisu_error'),
    toolUtils = require('../../../common/ToolUtils'),
    schema = require('../../../schema');
function DeliveryService(){
    
}
/**
 * get all delivery station list
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.getDeliveryStationList = (req,res,next)=>{

    systemUtils.wrapService(res,next,deliveryDao.findAllStations().then(results=>{
        if(toolUtils.isEmptyArray(results)){
            res.api(res_obj.NO_MORE_RESULTS);
            return;
        }
        let data = {};
        results.forEach((curr)=>{
            data[curr.id] = curr.name;
        });
        res.api(data);
    }));
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
    let order_promise = deliveryDao.updateOrderStatus(orderIds).then((results)=>{
        if(parseInt(results) <= 0){
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
    let promise = deliveryDao.findReprintApplies(systemUtils.assemblePaginationObj(req,query_obj)).then((_res)=>{
        if(toolUtils.isEmptyArray(_res._results) || toolUtils.isEmptyArray(_res.results)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
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

    let audit_promise = deliveryDao.updateReprintApply(update_obj,req.params.apply_id).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        }
    }).then(()=>{
        //  when update success then send sms
        //TODO send sms to the applicant
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
    req.checkParams('orderId').isOrderId();
    req.checkBody(schema.signinOrder);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let update_obj = {
        late_minutes : req.body.late_minutes,
        payfor_amount : req.body.payfor_amount,
        payfor_reason : req.body.payfor_reason,
        payfor_type : req.body.payfor_type,
        signin_time : req.body.signin_time,
        status : Constant.OS.COMPLETED
    };
    let promise = orderDao.updateOrder(systemUtils.assembleUpdateObj(req,update_obj),systemUtils.getDBOrderId(req.params.orderId)).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        }
        res.api();
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * unsign in the order
 * @param req
 * @param res
 * @param next
 */
DeliveryService.prototype.unsigninOrder = (req,res,next)=>{
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
    let promise = orderDao.findVersionInfoById(orderId).then((_res)=>{
        if(toolUtils.isEmptyArray(_res)){
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        }else if(updated_time !== _res[0].updated_time){
            throw new TiramisuError(res_obj.OPTION_EXPIRED);
        }
        return orderDao.updateOrder(systemUtils.assembleUpdateObj(req,update_obj),systemUtils.getDBOrderId(req.params.orderId));
    }).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
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
    req.body.order_ids.forEach((curr)=>{
        orderIds.push(systemUtils.getDBOrderId(curr));
        let param = [systemUtils.getDBOrderId(curr),'分配配送员:\n'+deliveryman_name + "     "+deliveryman_mobile,req.session.user.id,new Date()];
        order_history_params.push(param);

    });
    let promise = deliveryDao.updateOrderWithDeliveryman(orderIds,systemUtils.assembleUpdateObj(req,update_obj)).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID,"指定的订单号无效...");
        }
        return orderDao.batchInsertOrderHistory(order_history_params);
    }).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.FAIL,'批量记录订单操作历史记录异常...');
        }
        res.api();
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
    let currentUserId = req.session.user.id;
    if(!currentUserId){
        res.api(res_obj.SESSION_TIME_OUT,null);
        return;
    }
    let promise = deliveryDao.findDeliverymansByStation(currentUserId).then((results)=>{
        if(toolUtils.isEmptyArray(results)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        res.api(results);
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
    req.checkBody('validate_code').notEmpty().isLength(6);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let order_id = systemUtils.getDBOrderId(req.params.orderId),validate_code = req.body.validate_code;
    let promise = deliveryDao.findReprintApplyByOrderId(order_id).then((_res)=>{
        if(toolUtils.isEmptyArray(_res)){
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        }
        let validateCode = _res[0].validate_code;
        if(req.body.validate_code !== validateCode){
            throw new TiramisuError(res_obj.ERROR_VALIDATE_CODE);
        }
        let reprint_apply_update_obj = {
            is_reprint : 1,
            reprint_time : new Date()
        };
        return deliveryDao.updateReprintApply(systemUtils.assembleUpdateObj(req,reprint_apply_update_obj),_res[0].id,true);
    }).then((result)=>{
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
        res.api();
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
    req.checkBody('order_ids').isArray();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let order_history_params = [];
    let order_ids = req.body.order_ids.map((curr)=>{
        let param = [systemUtils.getDBOrderId(curr),'打印订单',req.session.user.id,new Date()];
        order_history_params.push(param);
        return systemUtils.getDBOrderId(curr);
    });

    let promise = orderDao.findOrdersByIds(order_ids).then((result)=>{
        if(toolUtils.isEmptyArray(result)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        result.forEach((curr)=>{

            let print_status = curr.print_status;
            if(print_status === Constant.PS.UNPRINTABLE){
                throw new TiramisuError(res_obj.ORDER_NO_PRINT);
            }else if (print_status === Constant.PS.AUDITING){
                throw new TiramisuError(res_obj.ORDER_AUDITING);
            }
        });
        let print_status_update_obj = {
            print_status : Constant.PS.UNPRINTABLE,
            status : Constant.OS.INLINE
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
        res.render('print');
    });
    systemUtils.wrapService(res,next,promise);
};
module.exports = new DeliveryService();