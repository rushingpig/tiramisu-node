/**
 * @des    : the service module of the order
 * @author : pigo.can
 * @date   : 15/12/17 上午9:39
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var res_obj = require('../../../util/res_obj'),
    systemUtils = require('../../../common/SystemUtils'),
    toolUtils = require('../../../common/ToolUtils'),
    dateUtils = require('../../../common/DateUtils'),
    TiramisuError = require('../../../error/tiramisu_error'),
    Constant = require('../../../common/Constant'),
    schema = require('../../../schema'),
    addOrder = schema.addOrder,
    getOrder = schema.getOrder,
    editOrder = schema.editOrder,
    listOrder = schema.listOrder,
    exchangeOrder = schema.exchangeOrder,
    printApply = schema.printApply,
    del_flag = require('../../../dao/base_dao').del_flag,
    dao = require('../../../dao'),
    orderDao = dao.order;

function OrderService() {

}
/**
 * get all delivery station list
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.getOrderSrcList = (req, res, next)=> {
    systemUtils.wrapService(res,next, orderDao.findAllOrderSrc().then(results=> {
        if (toolUtils.isEmptyArray(results)) {
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        res.api(results);
    }));
}
/**
 * add an order record in the table
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.addOrder = (req, res, next) => {
    req.checkBody(addOrder);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,null);
        return;
    }
    let delivery_type = req.body.delivery_type,
        owner_name = req.body.owner_name,
        owner_mobile = req.body.owner_mobile,
        recipient_name = req.body.recipient_name,
        recipient_mobile = req.body.recipient_mobile,
        regionalism_id = req.body.regionalism_id,
        recipient_address = req.body.recipient_address,
        recipient_landmark = req.body.recipient_landmark,
        delivery_id = req.body.delivery_id,
        src_id = req.body.src_id,
        pay_modes_id = req.body.pay_modes_id,
        pay_status = req.body.pay_status,
        delivery_time = req.body.delivery_time,
        invoice = req.body.invoice,
        remarks = req.body.remarks,
        total_amount = req.body.total_amount,
        total_original_price = req.body.total_original_price,
        total_discount_price = req.body.total_discount_price,
        products = req.body.products;



    let promise = OrderService.prototype.addRecipient(req,
        regionalism_id,
        recipient_name,
        recipient_mobile,
        recipient_landmark,
        delivery_type,
        recipient_address).then((recipientId)=> {
            if (!recipientId) {
                throw new TiramisuError(res_obj.FAIL);
            }
            let orderObj = {
                recipient_id: recipientId,
                delivery_id: delivery_id,
                src_id: src_id,
                pay_status: pay_status,
                owner_name : owner_name,
                owner_mobile : owner_mobile,
                is_submit: 0,
                is_deal: 0,
                remarks: remarks,
                invoice: invoice,
                delivery_time: delivery_time,
                total_amount : total_amount,
                total_original_price : total_original_price,
                total_discount_price : total_discount_price
            };
            orderObj = systemUtils.assembleInsertObj(req,orderObj);
            return orderDao.insertOrder(orderObj);
        }).then((orderId) => {
            if (!orderId) {
                throw new TiramisuError(res_obj.FAIL);
            }
            let params = [];
            products.forEach((curr)=>{
                let arr = [];
                arr.push(orderId);
                arr.push(curr.sku_id);
                arr.push(curr.num);
                arr.push(curr.choco_board || '');
                arr.push(curr.greeting_card || '');
                arr.push(curr.atlas);
                arr.push(curr.custom_name || '');
                arr.push(curr.custom_desc || '');
                arr.push(curr.discount_price);
                params.push(arr);
            });
            let order_fulltext_obj = {
                order_id : orderId,
                owner_name : systemUtils.encodeForFulltext(owner_name),
                owner_mobile : owner_mobile,
                recipient_name : systemUtils.encodeForFulltext(recipient_name),
                recipient_mobile : recipient_mobile,
                recipient_address : systemUtils.encodeForFulltext(recipient_address),
                landmark : systemUtils.encodeForFulltext(recipient_landmark)
            };
            return orderDao.insertOrderFulltext(order_fulltext_obj).then(()=>{
                return orderDao.batchInsertOrderSku(params);
            });
        }).then((_re)=>{
            if(!_re){
                throw new TiramisuError(res_obj.NO_MORE_RESULTS);
            }
            res.api();
        });
    systemUtils.wrapService(res,next, promise);
};
/**
 * get the order detail info
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.getOrderDetail = (req,res,next) =>{
    req.checkParams(getOrder);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,null);
        return;
    }

    let orderId = systemUtils.getDBOrderId(req.params.orderId);
    let promise = orderDao.findOrderById(orderId).then((results)=>{
        if(toolUtils.isEmptyArray(results)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let data = {
            products : []
        };
        for(let curr of results){
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
            data.src_id = curr.src_id;
            data.province_id = curr.province_id;
            data.province_name = curr.province_name;
            data.city_id = curr.city_id;
            data.city_name = curr.city_name;
            data.district_id = curr.district_id;
            data.district_name = curr.district_name;

            let product_obj = {
                choco_board : curr.choco_board,
                custom_desc : curr.custom_desc,
                custom_name : curr.custom_name,
                discount_price : curr.discount_price,
                greeting_card : curr.greeting_card,
                num : curr.num,
                original_price : curr.original_price,
                product_name : curr.product_name,
                atlas : curr.atlas,
                size : curr.size
            };
            data.products.push(product_obj);
        }
        res.api(data);
    });
    systemUtils.wrapService(res,next,promise);

};
/**
 * edit the order
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.editOrder = function(is_submit){
    return (req, res, next)=> {
        req.checkParams('orderId').notEmpty().isOrderId();
        req.checkBody(editOrder);
        let errors = req.validationErrors();
        if (errors) {
            res.api(res_obj.INVALID_PARAMS,null);
            return;
        }
        let orderId = systemUtils.getDBOrderId(req.params.orderId),
            recipient_id = req.body.recipient_id,
            delivery_type = req.body.delivery_type,
            owner_name = req.body.owner_name,
            owner_mobile = req.body.owner_mobile,
            recipient_name = req.body.recipient_name,
            recipient_mobile = req.body.recipient_mobile,
            regionalism_id = req.body.regionalism_id,
            recipient_address = req.body.recipient_address,
            recipient_landmark = req.body.recipient_landmark,
            delivery_id = req.body.delivery_id,
            src_id = req.body.src_id,
            pay_modes_id = req.body.pay_modes_id,
            pay_status = req.body.pay_status,
            delivery_time = req.body.delivery_time,
            invoice = req.body.invoice,
            remarks = req.body.remarks,
            total_amount = req.body.total_amount,
            total_original_price = req.body.total_original_price,
            total_discount_price = req.body.total_discount_price,
            products = req.body.products;

        let recipient_obj = {
            regionalism_id: regionalism_id,
            name: recipient_name,
            mobile: recipient_mobile,
            landmark: recipient_landmark,
            delivery_type: delivery_type,
            address: recipient_address,
            del_flag: del_flag.SHOW
        };
        let order_obj = {
            recipient_id: recipient_id,
            delivery_id: delivery_id,
            src_id: src_id,
            pay_status: pay_status,
            owner_name : owner_name,
            owner_mobile : owner_mobile,
            remarks: remarks,
            invoice: invoice,
            delivery_time: delivery_time,
            total_amount : total_amount,
            total_original_price : total_original_price,
            total_discount_price : total_discount_price
        };
        if(is_submit){
            order_obj.status = Constant.OS.STATION;
        }else{
            order_obj.status = Constant.OS.UNTREATED;
        }
        let promise = orderDao.editOrder(order_obj,orderId,recipient_obj,recipient_id,products).then(()=>{
            res.api();
        });
        systemUtils.wrapService(res,next,promise);
    }
};
/**
 * add a recipient record
 * @param regionalism_id
 * @param name
 * @param mobile
 * @param landmark
 * @param delivery_type
 * @param address
 * @param created_by
 */
OrderService.prototype.addRecipient = function (req,regionalism_id, name, mobile, landmark, delivery_type, address, created_by) {
    let recipientObj = {
        regionalism_id: regionalism_id,
        name: name,
        mobile: mobile,
        landmark: landmark,
        delivery_type: delivery_type,
        address: address,
        del_flag: del_flag.SHOW
    };
    recipientObj = systemUtils.assembleInsertObj(req,recipientObj);
    return orderDao.insertRecipient(recipientObj);
};
/**
 * get the all pay modes
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.getPayModeList = (req, res, next) => {
    let promise = orderDao.findAllPayModes().then((results)=> {
        if (toolUtils.isEmptyArray(results)) {
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let data = {};
        results.forEach((curr)=> {
            data[curr.id] = curr.name;
        });
        res.api(data);
    });
    systemUtils.wrapService(res,next, promise);
};
/**
 * get the shop list by regionalism id
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.getShopList = (req, res, next)=> {
    req.checkParams('districtId').notEmpty().isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,null);
        return;
    }
    let districtId = req.params.districtId;
    let promise = orderDao.findShopByRegionId(districtId).then((results)=> {
        if (toolUtils.isEmptyArray(results)) {
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let data = {};
        results.forEach((curr)=> {
            data[curr.id] = curr.name;
        });
        res.api(data);
    });
    systemUtils.wrapService(res,next, promise);
};
/**
 * get the order list by terms
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.listOrders = (req,res,next) => {
    req.checkQuery(listOrder);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,null);
        return;
    }
    let query_data = {
        begin_time : req.query.begin_time,
        end_time : req.query.end_time,
        is_deal : req.query.is_deal,
        is_submit : req.query.is_submit,
        keywords : systemUtils.encodeForFulltext(req.query.keywords || ''),
        src_id : req.query.src_id,
        status : req.query.status,
        city_id : req.query.city_id,
        page_no : req.query.page_no,
        page_size : req.query.page_size,
        order_sorted_rules : Constant.OSR.LIST
    };
    let promise = orderDao.findOrderList(query_data).then((resObj)=>{
        if(!(resObj.result && resObj._result)){
            throw new TiramisuError(res_obj.FAIL);
        }else if(toolUtils.isEmptyArray(resObj._result)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let data = {
            list : [],
            total : resObj.result[0].total,
            page_no : query_data.page_no
        };
        for(let curr of resObj._result){
            let delivery_adds = curr.merger_name.split(',');
            delivery_adds.shift();

            let list_obj = {
                cancel_reason : curr.cancel_reason,
                city : curr.merger_name.split(',')[2],
                created_by : curr.created_by,
                created_date : curr.created_date,
                delivery_name : delivery_adds.join(','),
                delivery_time : curr.delivery_time,
                delivery_type : Constant.DTD[curr.delivery_type],
                discount_price : curr.discount_price,
                is_deal : Constant.YESORNOD[curr.is_deal],
                is_submit : Constant.YESORNOD[curr.is_submit],
                merchant_id : curr.merchant_id,
                coupon : curr.coupon,
                is_print : curr.is_print,
                order_id : systemUtils.getShowOrderId(curr.id,curr.created_date),
                original_price : curr.original_price,
                owner_mobile : curr.owner_mobile,
                owner_name : curr.owner_name,
                pay_status : Constant.PSD[curr.pay_status],
                recipient_address : curr.address,
                recipient_mobile : curr.recipient_mobile,
                recipient_name : curr.recipient_name,
                remarks : curr.remarks,
                src_name : curr.src_name,
                status : Constant.OSD[curr.status],
                updated_by : curr.updated_by,
                updated_date : curr.updated_date
            };
            data.list.push(list_obj);
        }
        res.api(data);
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * exchange the status for the choosed orders
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.exchageOrders = (req,res,next)=>{
    req.checkBody(exchangeOrder);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,null);
        return;
    }
    let orderIds = [];
    req.body.order_ids.forEach((curr)=>{
        orderIds.push(systemUtils.getDBOrderId(curr));
    });
    let promise = orderDao.updateOrderStatus(orderIds).then((results)=>{
            if(!Number.isInteger(results)){
                throw new TiramisuError(res_obj.FAIL);
            }
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
OrderService.prototype.applyForRePrint = (req,res,next) => {
    req.checkBody(printApply);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,null);
        return;
    }
    let print_apply_obj = {
        applicant_mobile : req.body.applicant_mobile,
        director_mobile : req.body.director_mobile,
        order_id : req.body.order_id,
        reason : req.body.reason
    };
    let promise = orderDao.insertPrintApply(systemUtils.assembleInsertObj(req,print_apply_obj)).then((result)=>{
        if(!Number.isInteger(result) || parseInt(result) === 0){
            throw new TiramisuError(res_obj.FAIL);
        }
        res.api();
    });
    systemUtils.wrapService(res,next,promise);
};

module.exports = new OrderService();