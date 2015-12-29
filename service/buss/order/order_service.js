/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/17 上午9:39
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var res_obj = require('../../../util/res_obj'),
    systemUtils = require('../../../common/SystemUtils'),
    toolUils = require('../../../common/ToolUtils'),
    TiramisuError = require('../../../error/tiramisu_error'),
    schema = require('../../../schema'),
    addOrder = schema.addOrder,
    getOrder = schema.getOrder,
    listOrder = schema.listOrder,
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
        if (toolUils.isEmptyArray(results)) {
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
        total_amount = req.body.total_amount;


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
                created_date: new Date(),
                total_amount : total_amount,
                // TODO: the 1 hack should be removed before going into production
                created_by: req.userId || 1,
            };
            return orderDao.insertOrder(orderObj);
        }).then((orderId) => {
            if (!orderId) {
                throw new TiramisuError(res_obj.FAIL);
            }
            let products = req.body.products,params = [];
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
            return orderDao.batchInsertOrderSku(params);
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

    let orderId = req.params.orderId;
    let promise = orderDao.findOrderById(orderId).then((results)=>{
        if(toolUils.isEmptyArray(results)){
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

            let product_obj = {
                choco_board : curr.choco_board,
                custom_desc : curr.custom_desc,
                custom_name : curr.custom_name,
                discount_price : curr.discount_price,
                greeting_card : curr.greeting_card,
                num : curr.num,
                original_price : curr.original_price,
                product_name : curr.product_name
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
OrderService.prototype.editOrder = (req, res, next)=> {

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
        if (toolUils.isEmptyArray(results)) {
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
        if (toolUils.isEmptyArray(results)) {
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
    let begin_time = req.query.begin_time,
        end_time = req.query.end_time,
        is_deal = req.query.is_deal,
        is_submit = req.query.is_submit,
        keywords = req.query.keywords,
        src_id = req.query.src_id,
        status = req.query.status;
};

module.exports = new OrderService();