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
    dao = require('../../../dao'),
    orderDao = dao.order;

function OrderService(){

}
/**
 * get all delivery station list
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.getOrderSrcList = (req,res,next)=>{
    systemUtils.wrapService(next,orderDao.findAllOrderSrc().then(results=>{
        if(toolUils.isEmptyArray(results)){
            res.api(res_obj.NO_MORE_RESULTS);
            return;
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
OrderService.prototype.addOrder = (req,res,next) =>{
    req.checkBody('delivery_type','invalid delivery_type').notEmpty();
    req.checkBody('owner_name').notEmpty();
    req.checkBody('owner_mobile').notEmpty().isMobilePhone('zh-CN');
    req.checkBody('recipient_name').notEmpty();
    req.checkBody('recipient_mobile').notEmpty();
    req.checkBody('regionalism_id').notEmpty().isInt();
    req.checkBody('recipient_address').notEmpty();
    req.checkBody('delivery_id').notEmpty().isInt();
    req.checkBody('src_id').notEmpty().isInt();
    req.checkBody('pay_modes_id').notEmpty().isInt();
    req.checkBody('pay_status').notEmpty();
    req.checkBody('delivery_time').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
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
        remarks = req.body.remarks;
    let promise = OrderService.prototype.addRecipient(regionalism_id,recipient_name,recipient_mobile,recipient_landmark,delivery_type,recipient_address).then((recipientId)=>{
        if(!recipientId){
            res.api(res_obj.FAIL,null);
            return;
        }
        let orderObj = {
            recipient_id : recipientId,
            delivery_id : delivery_id,
            src_id : src_id,
            pay_status : pay_status,
            is_submit : 0,
            is_deal : 0,
            remarks : remarks,
            invoice : invoice,
            delivery_time : delivery_time,
            created_date : new Date(),
            // TODO: the 1 hack should be removed before going into production
            created_by : req.userId || 1,
        };
        return orderDao.insertOrder(orderObj);

    }).then((orderId)=>{
        if(!orderId){
            res.api(res_obj.FAIL,null);
            return;
        }else{
            res.api();
        }
    });
    systemUtils.wrapService(next,promise);

}
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
OrderService.prototype.addRecipient = function(regionalism_id,name,mobile,landmark,delivery_type,address,created_by){
    let recipientObj = {
        regionalism_id : regionalism_id,
        name : name,
        mobile : mobile,
        landmark : landmark,
        delivery_type : delivery_type,
        address : address,
        created_by : created_by,
        created_date : new Date(),
        del_flag : 1
    };
    return orderDao.insertRecipient(recipientObj);
};
/**
 * get the all pay modes
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.getPayModeList = (req,res,next) => {
    let promise = orderDao.findAllPayModes().then((results)=>{
        if(toolUils.isEmptyArray(results)){
            res.api(res_obj.NO_MORE_RESULTS,null);
            return;
        }
        let data = {};
        results.forEach((curr)=>{
            data[curr.id] = curr.name;
        });
        res.api(data);
    });
    systemUtils.wrapService(next,promise);
};
/**
 * get the shop list by regionalism id
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.getShopList = (req,res,next)=>{
    req.checkParams('districtId').notEmpty().isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,null);
        return;
    }
    let districtId = req.params.districtId;
    let promise = orderDao.findShopByRegionId(districtId).then((results)=>{
        if(toolUils.isEmptyArray(results)){
            res.api(res_obj.NO_MORE_RESULTS,null);
            return;
        }
        let data = {};
        results.forEach((curr)=>{
            data[curr.id] = curr.name;
        });
        res.api(data);
    });
    systemUtils.wrapService(next,promise);
};

module.exports = new OrderService();
