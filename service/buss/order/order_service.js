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
    OrderDao = dao.order,
    orderDao = new OrderDao();

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
};
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
        res.api(res_obj.INVALID_PARAMS,errors);
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
                pay_modes_id : pay_modes_id,
                pay_status: pay_status,
                owner_name : owner_name,
                owner_mobile : owner_mobile,
                is_submit: 0,
                is_deal: 0,
                status : Constant.OS.STATION,
                remarks: remarks,
                invoice: invoice,
                delivery_time: delivery_time,
                total_amount : total_amount,
                total_original_price : total_original_price,
                total_discount_price : total_discount_price,
                submit_time : new Date()
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
                show_order_id : systemUtils.getShowOrderId(orderId,new Date()),
                owner_name : systemUtils.encodeForFulltext(owner_name),
                owner_mobile : owner_mobile,
                recipient_name : systemUtils.encodeForFulltext(recipient_name),
                recipient_mobile : recipient_mobile,
                recipient_address : systemUtils.encodeForFulltext(recipient_address),
                landmark : systemUtils.encodeForFulltext(recipient_landmark)
            };
            let order_history_obj = {
                order_id : orderId,
                owner_name : owner_name,
                owner_mobile : owner_mobile,
                option : '添加订单'
            };
            return orderDao.insertOrderFulltext(order_fulltext_obj)
                .then(()=>{
                    return orderDao.insertOrderHistory(systemUtils.assembleInsertObj(req,order_history_obj));
                })
                .then(()=>{
                return orderDao.batchInsertOrderSku(params);
            });
        }).then((_re)=>{
            if(!_re){
                throw new TiramisuError(res_obj.FAIL);
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
        res.api(res_obj.INVALID_PARAMS,errors);
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
            data.order_id = req.params.orderId;
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
            data.regionalism_id = curr.regionalism_id;
            data.regionalism_name = curr.regionalism_name;
            data.pay_status = curr.pay_status;
            data.recipient_mobile = curr.recipient_mobile;
            data.recipient_landmark = curr.landmark;
            if(curr.sku_id){
                let product_obj = {
                    sku_id : curr.sku_id,
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
            res.api(res_obj.INVALID_PARAMS,errors);
            return;
        }
        let orderId = systemUtils.getDBOrderId(req.params.orderId),
            updated_time = req.body.updated_time,
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
            products = req.body.products,
            delivery_name = req.body.delivery_name;

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
            order_obj.submit_time = new Date();
        }else{
            order_obj.status = Constant.OS.UNTREATED;
        }
        let promise = orderDao.findOrderById(orderId).then((_res)=>{
            if(toolUtils.isEmptyArray(_res)){
                throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
            }else if(updated_time !== _res[0].updated_time){
                throw new TiramisuError(res_obj.OPTION_EXPIRED);
            }
            //===========for history begin=============
            let current_order = _res[0],
                order_history_obj = {
                    order_id : orderId,
                    owner_name : owner_name,
                    owner_mobile : owner_mobile
                },
                add_skus = [],delete_skuIds = [],update_skus = [];
            let option = '';
            if(delivery_id != current_order.delivery_id){
                option += '修改{配送站}为{'+delivery_name+'}\n';
            }
            if(delivery_time!=current_order.delivery_time){
                option += '修改{配送时间}为{'+delivery_time+'}\n';
            }
            if(regionalism_id!=current_order.regionalism_id || recipient_address!=current_order.recipient_address){
                option += '修改收货地址\n';
            }
            for(let i = 0;i < products.length;i++){
                let isAdd = true;
                for(let j = 0;j < _res.length;j++){
                    if(products[i].sku_id == _res[j].sku_id){
                        isAdd = false;
                        let curr = products[i];
                        let order_sku_obj = {
                            order_id : orderId,
                            sku_id :curr.sku_id,
                            num : curr.num,
                            choco_board : curr.choco_board,
                            greeting_card : curr.greeting_card,
                            atlas : curr.atlas,
                            custom_name : curr.custom_name,
                            custom_desc : curr.custom_desc,
                            discount_price : curr.discount_price
                        };
                        update_skus.push(systemUtils.assembleUpdateObj(req,order_sku_obj));
                    }
                }
                if(isAdd){
                    let curr = products[i];
                    option += '增加{'+curr.product_name+'}\n';
                    let order_sku_obj = {
                        order_id : orderId,
                        sku_id :curr.sku_id,
                        num : curr.num,
                        choco_board : curr.choco_board,
                        greeting_card : curr.greeting_card,
                        atlas : curr.atlas,
                        custom_name : curr.custom_name,
                        custom_desc : curr.custom_desc,
                        discount_price : curr.discount_price
                    };
                    add_skus.push(systemUtils.assembleInsertObj(req,order_sku_obj));
                }
            }
            for(let i = 0;i < _res.length;i++){
                let isDelete = true;
                for(let j = 0;j < products.length;j++){
                    if(_res[i].sku_id == products[j].sku_id){
                        isDelete = false;
                    }
                }
                if(isDelete){
                    let curr = _res[i];
                    option += '删除{'+curr.product_name+'}\n';
                    delete_skuIds.push(curr.sku_id);
                }
            }
            if(is_submit){
                option += '提交订单';
            }else{
                option += '保存订单'
            }
            order_history_obj.option = option;
            //===========for history end=============
            let order_fulltext_obj = {
                order_id : orderId,
                show_order_id : req.params.orderId,
                owner_name : systemUtils.encodeForFulltext(owner_name),
                owner_mobile : owner_mobile,
                recipient_name : systemUtils.encodeForFulltext(recipient_name),
                recipient_mobile : recipient_mobile,
                recipient_address : systemUtils.encodeForFulltext(recipient_address),
                landmark : systemUtils.encodeForFulltext(recipient_landmark)
            };
            let orderPromise = orderDao.editOrder(systemUtils.assembleUpdateObj(req,order_obj),orderId,systemUtils.assembleUpdateObj(req,recipient_obj),recipient_id,products,add_skus,delete_skuIds,update_skus);
            let orderHistoryPromise = orderDao.insertOrderHistory(systemUtils.assembleInsertObj(req,order_history_obj));
            let orderFulltextPromise = orderDao.updateOrderFulltext(order_fulltext_obj,orderId);
            return Promise.all([orderPromise,orderHistoryPromise,orderFulltextPromise]);
        }).then(()=>{
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
        res.api(res_obj.INVALID_PARAMS,errors);
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
OrderService.prototype.listOrders = (entrance)=>{
    return  (req,res,next) => {
        req.checkQuery(listOrder);
        let errors = req.validationErrors();
        if (errors) {
            res.api(res_obj.INVALID_PARAMS,errors);
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
            owner_mobile : req.query.owner_mobile
        };
        if(entrance === Constant.OSR.LIST){
            query_data.order_sorted_rules = entrance;
        }else if (entrance === Constant.OSR.DELIVERY_EXCHANGE){
            query_data.order_sorted_rules = entrance;
            query_data.status = Constant.OS.STATION;
        }else if (entrance === Constant.OSR.DELIVER_LIST){
            query_data.order_sorted_rules = entrance;
            query_data.status = Constant.OS.CONVERT;
        }else if (entrance === Constant.OSR.RECEIVE_LIST){
            query_data.order_sorted_rules = entrance;
            query_data.status = Constant.OS.DELIVERY;
        }

        let promise = orderDao.findOrderList(systemUtils.assemblePaginationObj(req,query_data)).then((resObj)=>{
            if(!(resObj.result && resObj._result)){
                throw new TiramisuError(res_obj.FAIL);
            }else if(toolUtils.isEmptyArray(resObj._result)){
                throw new TiramisuError(res_obj.NO_MORE_RESULTS);
            }
            let data = {
                list : [],
                total : resObj.result[0].total,
                page_no : req.query.page_no
            };
            for(let curr of resObj._result){
                let delivery_adds = curr.merger_name.split(',');
                delivery_adds.shift();

                let list_obj = {
                    cancel_reason : curr.cancel_reason,
                    city : curr.merger_name.split(',')[2],
                    created_by : curr.created_by,
                    created_time : curr.created_time,
                    delivery_name : delivery_adds.join(',') +  curr.address,
                    delivery_time : curr.delivery_time,
                    delivery_type : Constant.DTD[curr.delivery_type],
                    discount_price : curr.discount_price,
                    is_deal : Constant.YESORNOD[curr.is_deal],
                    is_submit : Constant.YESORNOD[curr.is_submit],
                    merchant_id : curr.merchant_id,
                    coupon : curr.coupon,
                    print_status : curr.print_status,
                    order_id : systemUtils.getShowOrderId(curr.id,curr.created_time),
                    original_price : curr.original_price,
                    owner_mobile : curr.owner_mobile,
                    owner_name : curr.owner_name,
                    pay_status : Constant.PSD[curr.pay_status],
                    recipient_address :delivery_adds.join(',') +  curr.address,
                    recipient_mobile : curr.recipient_mobile,
                    recipient_name : curr.recipient_name,
                    remarks : curr.remarks,
                    src_name : curr.src_name,
                    status : Constant.OSD[curr.status],
                    updated_by : curr.updated_by,
                    updated_time : curr.updated_time,
                    submit_time : curr.submit_time,
                    deliveryman_name : curr.deliveryman_name,
                    deliveryman_mobile : curr.deliveryman_mobile
                };
                if(curr.delivery_type == Constant.DT.TAKETHEIR){
                    delete list_obj.recipient_address;
                }else if(curr.delivery_type == Constant.DT.DELIVERY){
                    delete list_obj.delivery_name;
                }
                data.list.push(list_obj);
            }
            res.api(data);
        });
        systemUtils.wrapService(res,next,promise);
    };
};

/**
 * get the history of the special order id
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.history = (req,res,next)=>{
    req.checkParams('orderId').isOrderId();
    req.checkQuery('sort_type').notEmpty();
    req.checkQuery('page_no').isInt();
    req.checkQuery('page_size').isInt();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let query_data = {
        order_id : systemUtils.getDBOrderId(req.params.orderId),
        sort_type : req.query.sort_type
    };
    let promise = orderDao.findOrderHistory(systemUtils.assemblePaginationObj(req,query_data)).then((_res)=>{
        if(toolUtils.isEmptyArray(_res.result) || toolUtils.isEmptyArray(_res._result)){
            throw new TiramisuError(res_obj.NO_MORE_RESULTS);
        }
        let res_data = {
            total : _res.result[0].total,
            list : _res._result,
            page_no : req.query.page_no,
            page_size : req.query.page_size
        };
        res.api(res_data);
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * cancel the order
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.cancelOrder = (req,res,next)=>{
    req.checkParams('orderId').notEmpty().isLength(16);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let orderId = systemUtils.getDBOrderId(req.params.orderId);
    let promise = orderDao.findOrderById(orderId).then((_res)=> {
        if (toolUtils.isEmptyArray(_res)) {
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        } else if (updated_time !== _res[0].updated_time) {
            throw new TiramisuError(res_obj.OPTION_EXPIRED);
        }
        let order_update_obj = {
            status : Constant.OS.CANCEL
        };
        return orderDao.updateOrder(systemUtils.assembleUpdateObj(req,order_update_obj),orderId);
    }).then((result)=>{
        if(parseInt(result) <= 0){
            throw new TiramisuError(res_obj.FAIL);
        }
        res.api();
    });
};


module.exports = new OrderService();