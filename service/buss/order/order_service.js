/* global , */
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
  allocateStation = schema.allocateStation,
  del_flag = require('../../../dao/base_dao').del_flag,
  baseDao = require('../../../dao/base_dao'),
  dao = require('../../../dao'),
  OrderDao = dao.order,
  orderDao = new OrderDao(),
  util = require('util'),
  config = require('../../../config'),
  order_excel_caption = require('../../../config/excel/OrderTpl'),
  xlsx = require('node-xlsx');
var toolUtils = require('../../../common/ToolUtils');
function OrderService() {
}
/**
 * get all delivery station list
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.getOrderSrcList = (req, res, next) => {
  systemUtils.wrapService(res, next, orderDao.findAllOrderSrc().then(results=> {
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
    return res.api(res_obj.INVALID_PARAMS, errors);
  }
  let promise = orderDao.insertOrderInTransaction(req).then(()=>{res.api()});
  systemUtils.wrapService(res, next, promise);
};

OrderService.prototype.addExternalOrder = (req, res, next) => {
  req.checkBody(schema.addExternalOrder);
  const errors = req.validationErrors();
  if (errors) {
    return res.api(res_obj.INVALID_PARAMS, errors);
  }
  // TODO: choose user base on token, 19: internal 20 zhijie
  req.session.user = {
    id: 20
  };
  if (['127.0.0.1', '1'].indexOf(toolUtils.getClientIP(req).split(':').pop()) !== -1) {
    req.session.user.id = 19;
  }
  const promise = orderDao
    .insertExternalOrderInTransaction(req)
    .then(() => {
      res.api();
    });
  systemUtils.wrapService(res, next, promise);
};

OrderService.prototype.addOrderError = (req, res, next) => {
  req.checkBody(schema.addOrderError);
  const errors = req.validationErrors();
  if (errors) {
    return res.api(res_obj.INVALID_PARAMS, errors);
  }
  const params = req.body;
  const promise = orderDao
    .addOrderError(params)
    .then(result => {
      res.api({});
    });
  systemUtils.wrapService(res, next, promise);
};

OrderService.prototype.editOrderError = (req, res, next) => {
  req.checkBody(schema.editOrderError);
  const errors = req.validationErrors();
  if (errors) {
    return res.api(res_obj.INVALID_PARAMS, errors);
  }
  const params = req.body;
  const promise = orderDao
    .editOrderError({status: params.status}, params.merchant_id, params.src_id)
    .then(affectedRows => {
      if (affectedRows !== 1) {
        res.api(res_obj.INVALID_UPDATE_ID, {affectedRows: affectedRows}, null);
      } else {
        res.api({});
      }
    });
  systemUtils.wrapService(res, next, promise);
};
/**
 * get the order detail info
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.getOrderDetail = (req, res, next) => {
  req.checkParams(getOrder);
  let errors = req.validationErrors();
  if (errors) {
    res.api(res_obj.INVALID_PARAMS, errors);
    return;
  }

  let orderId = systemUtils.getDBOrderId(req.params.orderId);
  let promise = orderDao.findOrderById(orderId).then((results) => {
    if (toolUtils.isEmptyArray(results)) {
      throw new TiramisuError(res_obj.NO_MORE_RESULTS);
    }
    let data = {
      products: []
    };
    for (let curr of results) {
      data.order_id = req.params.orderId;
      data.delivery_id = curr.delivery_id;
      data.delivery_name = curr.delivery_name;
      data.delivery_time = curr.delivery_time;
      data.delivery_type = curr.delivery_type;
      data.owner_mobile = curr.owner_mobile;
      data.owner_name = curr.owner_name;
      data.pay_modes_id = curr.pay_modes_id;
      data.pay_name = curr.pay_name;
      data.coupon = curr.coupon;
      data.invoice = curr.invoice;
      data.recipient_address = curr.recipient_address;
      data.recipient_name = curr.recipient_name;
      data.recipient_id = curr.recipient_id;
      data.remarks = curr.remarks;
      data.src_id = curr.src_id;
      data.src_name = curr.merge_name;
      data.province_id = curr.province_id;
      data.province_name = curr.province_name;
      data.city_id = curr.city_id;
      data.city_name = curr.city_name;
      data.regionalism_id = curr.regionalism_id;
      data.regionalism_name = curr.regionalism_name;
      data.pay_status = curr.pay_status;
      data.recipient_mobile = curr.recipient_mobile;
      data.recipient_landmark = curr.landmark;
      data.updated_time = curr.updated_time;
      data.status = curr.status;
      data.merchant_id = curr.merchant_id;
      data.total_amount = curr.total_amount;  // 总应收金额
      data.total_discount_price = curr.total_discount_price;  // 总实际售价
      data.total_original_price = curr.total_original_price;  // 总原价

      if (curr.sku_id) {
        let product_obj = {
          sku_id: curr.sku_id,
          choco_board: curr.choco_board,
          custom_desc: curr.custom_desc,
          custom_name: curr.custom_name,
          discount_price: curr.discount_price,
          greeting_card: curr.greeting_card,
          num: curr.num,
          original_price: curr.original_price,
          name: curr.product_name,
          atlas: curr.atlas,
          size: curr.size,
          amount: curr.amount
        };
        data.products.push(product_obj);
      }
    }
    res.api(data);
  });
  systemUtils.wrapService(res, next, promise);

};
/**
 * edit the order
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.editOrder = function (is_submit) {
  return (req, res, next) => {
    req.checkParams('orderId').notEmpty().isOrderId();
    req.checkBody(editOrder);
    let errors = req.validationErrors();
    if (errors) {
      res.api(res_obj.INVALID_PARAMS, errors);
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
      delivery_name = req.body.delivery_name,
      greeting_card = req.body.greeting_card,
      prefix_address = req.body.prefix_address;

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
      owner_name: owner_name,
      owner_mobile: owner_mobile,
      remarks: remarks,
      invoice: invoice,
      delivery_time: delivery_time,
      total_amount: total_amount,
      total_original_price: total_original_price,
      total_discount_price: total_discount_price,
      is_deal: 1,
      greeting_card: greeting_card,
      last_opt_cs : req.session.user.id
    };
    if (is_submit) {
      order_obj.is_submit = 1;
      order_obj.status = Constant.OS.STATION;
      order_obj.submit_time = new Date();
    } else {
      order_obj.status = Constant.OS.TREATED;
    }
    let promise = orderDao.findOrderById(orderId).then((_res) => {
      if (toolUtils.isEmptyArray(_res)) {
        throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
      } else if (updated_time !== _res[0].updated_time) {
        throw new TiramisuError(res_obj.OPTION_EXPIRED);
      }
      console.log(_res);
      //===========for history begin=============
      let current_order = _res[0],
        order_history_obj = {
          order_id: orderId
        },
        add_skus = [], delete_skuIds = [], update_skus = [];
      let option = '';
      if (delivery_type != current_order.delivery_type) {
        option += '修改{配送方式}为{' + Constant.DTD[delivery_name] + '}\n';
      }
      if (delivery_id != current_order.delivery_id) {
        option += '修改{配送站}为{' + delivery_name + '}\n';
      }
      if (delivery_time != current_order.delivery_time) {
        option += '修改{配送时间}为{' + delivery_time + '}\n';
      }
      if (regionalism_id != current_order.regionalism_id || recipient_address != current_order.recipient_address) {
        option += '修改收货地址\n';
      }
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
      if (is_submit) {
        option += '提交订单';
      } else {
        option += '保存订单';
      }
      order_history_obj.option = option;
      //===========for history end=============
      let order_fulltext_obj = {
        order_id: orderId,
        show_order_id: req.params.orderId,
        owner_name: systemUtils.encodeForFulltext(owner_name),
        owner_mobile: owner_mobile,
        recipient_name: systemUtils.encodeForFulltext(recipient_name),
        recipient_mobile: recipient_mobile,
        recipient_address: systemUtils.encodeForFulltext(prefix_address + recipient_address),
        landmark: systemUtils.encodeForFulltext(recipient_landmark)
      };
      let orderPromise = orderDao.editOrder(systemUtils.assembleUpdateObj(req, order_obj), orderId, systemUtils.assembleUpdateObj(req, recipient_obj), recipient_id, products, add_skus, delete_skuIds, update_skus);
      let orderHistoryPromise = orderDao.insertOrderHistory(systemUtils.assembleInsertObj(req, order_history_obj, true));
      let orderFulltextPromise = orderDao.updateOrderFulltext(order_fulltext_obj, orderId);
      return Promise.all([orderPromise, orderHistoryPromise, orderFulltextPromise]);
    }).then(() => {
      res.api();
    });
    systemUtils.wrapService(res, next, promise);
  };
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
OrderService.prototype.addRecipient = function (req, regionalism_id, name, mobile, landmark, delivery_type, address, created_by) {
  let recipientObj = {
    regionalism_id: regionalism_id,
    name: name,
    mobile: mobile,
    landmark: landmark,
    delivery_type: delivery_type,
    address: address,
    del_flag: del_flag.SHOW
  };
  recipientObj = systemUtils.assembleInsertObj(req, recipientObj);
  return orderDao.insertRecipient(recipientObj);
};
/**
 * get the all pay modes
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.getPayModeList = (req, res, next) => {
  let promise = orderDao.findAllPayModes().then((results) => {
    if (toolUtils.isEmptyArray(results)) {
      throw new TiramisuError(res_obj.NO_MORE_RESULTS);
    }
    let data = {};
    results.forEach((curr) => {
      data[curr.id] = curr.name;
    });
    res.api(data);
  });
  systemUtils.wrapService(res, next, promise);
};
/**
 * get the shop list by regionalism id
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.getShopList = (req, res, next) => {
  req.checkParams('districtId').notEmpty().isInt();
  let errors = req.validationErrors();
  if (errors) {
    res.api(res_obj.INVALID_PARAMS, errors);
    return;
  }
  let districtId = req.params.districtId;
  let promise = orderDao.findShopByRegionId(districtId).then((results) => {
    if (toolUtils.isEmptyArray(results)) {
      throw new TiramisuError(res_obj.NO_MORE_RESULTS);
    }
    let data = {};
    results.forEach((curr) => {
      data[curr.id] = curr.name;
    });
    res.api(data);
  });
  systemUtils.wrapService(res, next, promise);
};
/**
 * get the order list by terms
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.listOrders = (entrance, isBatchScan) => {
  return (req, res, next) => {
    let query_data = null;
    if (isBatchScan) {
      req.checkBody('order_ids', '订单列表有订单号无效...').isOrderIds();
      let errors = req.validationErrors();
      if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
      }
      query_data = {
        order_ids: req.body.order_ids.map((curr) => {
          return systemUtils.getDBOrderId(curr);
        }),
        user : req.session.user
      };
    } else {
      req.checkQuery(listOrder);
      let errors = req.validationErrors();
      if (errors) {
        res.api(res_obj.INVALID_PARAMS, errors);
        return;
      }
      query_data = {
        delivery_type : req.query.delivery_type,
        begin_time: req.query.begin_time,
        end_time: req.query.end_time,
        is_deal: req.query.is_deal,
        is_submit: req.query.is_submit,
        src_id: req.query.src_id,
        status: req.query.status,
        city_id: req.query.city_id,
        owner_mobile: req.query.owner_mobile,
        delivery_id: req.query.delivery_id,
        deliveryman_id: req.query.deliveryman_id,
        print_status: req.query.print_status,
        is_greeting_card: req.query.is_greeting_card,
        user : req.session.user,
      };
    }


    if (req.query.keywords && isNaN(parseInt(req.query.keywords))) {
      query_data.keywords = systemUtils.encodeForFulltext(req.query.keywords);
    } else {
      query_data.keywords = req.query.keywords;
    }
    query_data.order_sorted_rules = entrance;
    if (entrance === Constant.OSR.LIST) {
      // do nothing to add sort rules
    } else if (entrance === Constant.OSR.DELIVERY_EXCHANGE) {
      query_data.status = Constant.OS.STATION;
    } else if (entrance === Constant.OSR.DELIVER_LIST) {
      let sts = [Constant.OS.CONVERT, Constant.OS.INLINE];
      if(query_data.status && sts.indexOf(query_data.status) === -1){
        return res.api(res_obj.NO_MORE_PAGE_RESULTS,'can not find the order status not beyond this scope...');
      }
      query_data.status = query_data.status || sts;
    } else if (entrance === Constant.OSR.RECEIVE_LIST) {
      let sts = [Constant.OS.DELIVERY, Constant.OS.COMPLETED, Constant.OS.EXCEPTION];
      if(query_data.status && sts.indexOf(query_data.status) === -1){
        return res.api(res_obj.NO_MORE_PAGE_RESULTS,'can not find the order status not beyond this scope...');
      }
      query_data.status = query_data.status || sts;
    }else{
      delete query_data.order_sorted_rules;
    }

    let promise = orderDao.findOrderList(systemUtils.assemblePaginationObj(req, query_data)).then((resObj) => {
      if (!(resObj.result && resObj._result)) {
        throw new TiramisuError(res_obj.FAIL);
      } else if (toolUtils.isEmptyArray(resObj._result)) {
        throw new TiramisuError(res_obj.NO_MORE_PAGE_RESULTS);
      }
      let data = {
        list: [],
        total: resObj.result[0].total,
        page_no: req.query.page_no
      };
      for (let curr of resObj._result) {
        let delivery_adds = [],city_name = '';
        if(curr.merger_name){
          delivery_adds = curr.merger_name.split(',');
          city_name = delivery_adds[2];
        }

        delivery_adds.shift();

        let list_obj = {
          cancel_reason: curr.cancel_reason,
          recipient_landmark: curr.landmark,
          city: city_name,
          created_by: curr.created_by,
          created_time: curr.created_time,
          delivery_time: curr.delivery_time,
          delivery_type: Constant.DTD[curr.delivery_type],
          delivery_name: curr.delivery_name,
          total_discount_price: curr.total_discount_price,
          is_deal: curr.is_deal,
          is_submit: curr.is_submit,
          merchant_id: curr.merchant_id,
          coupon: curr.coupon,
          print_status: curr.print_status,
          order_id: systemUtils.getShowOrderId(curr.id, curr.created_time),
          total_original_price: curr.total_original_price,
          total_amount: curr.total_amount,
          owner_mobile: curr.owner_mobile,
          owner_name: curr.owner_name,
          pay_status: Constant.PSD[curr.pay_status],
          recipient_address: delivery_adds.join(',') + '  '+curr.address,
          recipient_mobile: curr.recipient_mobile,
          recipient_name: curr.recipient_name,
          remarks: curr.remarks,
          src_name: curr.src_name,
          //status : Constant.OSD[curr.status],
          status: curr.status,
          updated_by: curr.updated_by,
          updated_time: curr.updated_time,
          submit_time: curr.submit_time,
          deliveryman_name: curr.deliveryman_name,
          deliveryman_mobile: curr.deliveryman_mobile,
          exchange_time: curr.exchange_time,
          print_time: curr.print_time,
          signin_time: curr.signin_time,
          greeting_card: curr.greeting_card
        };

        data.list.push(list_obj);
      }
      res.api(data);
    });
    systemUtils.wrapService(res, next, promise);
  };
};

/**
 * get the history of the special order id
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.history = (req, res, next) => {
  req.checkParams('orderId').isOrderId();
  req.checkQuery('sort_type').notEmpty();
  req.checkQuery('page_no').isInt();
  req.checkQuery('page_size').isInt();
  let errors = req.validationErrors();
  if (errors) {
    res.api(res_obj.INVALID_PARAMS, errors);
    return;
  }
  let query_data = {
    order_id: systemUtils.getDBOrderId(req.params.orderId),
    sort_type: req.query.sort_type
  };
  let promise = orderDao.findOrderHistory(systemUtils.assemblePaginationObj(req, query_data)).then((_res) => {
    if (toolUtils.isEmptyArray(_res.result) || toolUtils.isEmptyArray(_res._result)) {
      throw new TiramisuError(res_obj.NO_MORE_PAGE_RESULTS);
    }
    let res_data = {
      total: _res.result[0].total,
      list: _res._result,
      page_no: req.query.page_no,
      page_size: req.query.page_size
    };
    res.api(res_data);
  });
  systemUtils.wrapService(res, next, promise);
};
/**
 * cancel the order
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.cancelOrder = (req, res, next) => {
  req.checkParams('orderId').isOrderId();
  req.checkBody('cancel_reason').notEmpty();
  req.checkBody('updated_time','请带上订单的最后更新时间').isDate();
  let errors = req.validationErrors();
  if (errors) {
    res.api(res_obj.INVALID_PARAMS, errors);
    return;
  }
  let orderId = systemUtils.getDBOrderId(req.params.orderId),updated_time = req.body.updated_time;
  let promise = orderDao.findOrderById(orderId).then((_res) => {
    if (toolUtils.isEmptyArray(_res)) {
      throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
    } else if (updated_time !== _res[0].updated_time) {
      throw new TiramisuError(res_obj.OPTION_EXPIRED);
    } else if (!systemUtils.isOrderCanCancel(_res[0].status)) {
      throw new TiramisuError(res_obj.ORDER_CANNOT_CANCEL);
    }

    let order_update_obj = {
      status: Constant.OS.CANCEL,
      cancel_reason: req.body.cancel_reason,
      last_opt_cs : req.session.user.id
    };
    return orderDao.updateOrder(systemUtils.assembleUpdateObj(req, order_update_obj), orderId);
  }).then((result) => {
    if (parseInt(result) <= 0) {
      throw new TiramisuError(res_obj.FAIL);
    }
    res.api();
  });
  systemUtils.wrapService(res,next,promise);
};

/**
 * allocate station of the order
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.allocateStation = (req,res,next)=>{
    req.checkParams('orderId').notEmpty().isOrderId();
    req.checkBody('delivery_id').isInt();
    req.checkBody('delivery_name').notEmpty();
    req.checkBody('updated_time').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let order_id = systemUtils.getDBOrderId(req.params.orderId),
        delivery_id = req.body.delivery_id,
        delivery_name = req.body.delivery_name,
        updated_time = req.body.updated_time,
        last_opt_cs = req.session.user.id;

    let order_obj = {delivery_id,last_opt_cs};
    let promise = orderDao.findOrderById(order_id).then((_res)=> {
        if (toolUtils.isEmptyArray(_res)) {
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        } else if (updated_time !== _res[0].updated_time) {
            throw new TiramisuError(res_obj.OPTION_EXPIRED);
        }
        //===========for history begin=============
        let current_order = _res[0],
            order_history_obj = {order_id};
        let option = '';

        if (delivery_id != current_order.delivery_id) {
            option += '修改{配送站}为{' + delivery_name + '}\n';
        }

        order_history_obj.option = option;
        //===========for history end=============
        let orderPromise = orderDao.updateOrder(systemUtils.assembleUpdateObj(req,order_obj),order_id);
        let orderHistoryPromise = null;
        if(option){
          orderDao.insertOrderHistory(systemUtils.assembleInsertObj(req,order_history_obj,true));
        }
        return Promise.all([orderPromise,orderHistoryPromise]);
    }).then(()=>{
        res.api();
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * modify the info of the order about delivery
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.changeDelivery = (req,res,next)=>{
    req.checkParams('orderId').notEmpty().isOrderId();
    req.checkBody(allocateStation);
    let errors = req.validationErrors();
    if (errors) {
        res.api(res_obj.INVALID_PARAMS,errors);
        return;
    }
    let order_id = systemUtils.getDBOrderId(req.params.orderId),
        delivery_id = req.body.delivery_id,
        delivery_name = req.body.delivery_name,
        regionalism_id = req.body.regionalism_id,
        delivery_type = req.body.delivery_type,
        delivery_time = req.body.delivery_time,
        address = req.body.recipient_address,
        prefix_address = req.body.prefix_address,
        updated_time = req.body.updated_time,
        last_opt_cs = req.session.user.id;

    let recipient_obj = {regionalism_id, delivery_type,address};
    let order_obj = {delivery_id, delivery_time,last_opt_cs};
    let promise = orderDao.findOrderById(order_id).then((_res)=> {
        if (toolUtils.isEmptyArray(_res)) {
            throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
        } else if (updated_time !== _res[0].updated_time) {
            throw new TiramisuError(res_obj.OPTION_EXPIRED);
        }
        //===========for history begin=============
        let current_order = _res[0],
            order_history_obj = {order_id};
        let option = '';
        if(delivery_type != current_order.delivery_type){
            option += '修改{配送方式}为{' + Constant.DTD[delivery_type] + '}\n';
        }
        if (delivery_id != current_order.delivery_id) {
            option += '修改{配送站}为{' + delivery_name + '}\n';
        }
        if (delivery_time != current_order.delivery_time) {
            option += '修改{配送时间}为{' + delivery_time + '}\n';
        }
        if (regionalism_id != current_order.regionalism_id || address != current_order.recipient_address) {
            option += '修改收货地址\n';
        }
        order_history_obj.option = option;
        //===========for history end=============
        let order_fulltext_obj = {
            order_id : order_id,
            recipient_address : systemUtils.encodeForFulltext(prefix_address + address)
        };
        let orderPromise = orderDao.updateOrder(systemUtils.assembleUpdateObj(req,order_obj),order_id);
        let recipientPromise = orderDao.updateRecipient(systemUtils.assembleUpdateObj(req,recipient_obj),current_order.recipient_id);
        let orderHistoryPromise = orderDao.insertOrderHistory(systemUtils.assembleInsertObj(req,order_history_obj,true));
        let orderFulltextPromise = orderDao.updateOrderFulltext(order_fulltext_obj,order_id);
        return Promise.all([orderPromise,orderHistoryPromise,orderFulltextPromise,recipientPromise]);
    }).then(()=>{
        res.api();
    });
    systemUtils.wrapService(res,next,promise);
};
/**
 * validate the coupon
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.validateCoupon = (req,res,next)=>{
  req.checkBody('coupon','请确认券号是否填写正确...').notEmpty();
  req.checkBody('city_name','请填写有效的城市名...').notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    res.api(res_obj.INVALID_PARAMS,errors);
    return;
  }
  let city_name = req.body.city_name,coupon = req.body.coupon;
  res.redirect(util.format(config.coupon_host+'/v1/coupon?city_name=%s&coupon=%s',encodeURIComponent(city_name),coupon));
};
/**
 * update the order status into exception
 * @param req
 * @param rex
 * @param next
 */
OrderService.prototype.exceptionOrder = (req,res,next)=>{
  req.checkParams('orderId').isOrderId();
  req.checkBody('cancel_reason').notEmpty();
  req.checkBody('updated_time','请带上订单的最后更新时间').isDate();
  let errors = req.validationErrors();
  if (errors) {
    res.api(res_obj.INVALID_PARAMS, errors);
    return;
  }
  let orderId = systemUtils.getDBOrderId(req.params.orderId),updated_time = req.body.updated_time;
  let promise = orderDao.findOrderById(orderId).then((_res) => {
    if (toolUtils.isEmptyArray(_res)) {
      throw new TiramisuError(res_obj.INVALID_UPDATE_ID);
    } else if (updated_time !== _res[0].updated_time) {
      throw new TiramisuError(res_obj.OPTION_EXPIRED);
    } else if (!systemUtils.isOrderCanException(_res[0].status)) {
      throw new TiramisuError(res_obj.ORDER_CANNOT_EXCEPTION);
    }

    let order_update_obj = {
      status: Constant.OS.EXCEPTION,
      cancel_reason: req.body.cancel_reason,
      last_opt_cs : req.session.user.id
    };
    return orderDao.updateOrder(systemUtils.assembleUpdateObj(req, order_update_obj), orderId);
  }).then((result) => {
    if (parseInt(result) <= 0) {
      throw new TiramisuError(res_obj.FAIL);
    }
    res.api();
  });
  systemUtils.wrapService(res,next,promise);
};
/**
 * exprot the order list
 * @param req
 * @param res
 * @param next
 */
OrderService.prototype.exportExcel = (req,res,next) => {
  req.checkQuery('entrance','请确认要导出订单的来源...').notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    res.api(res_obj.INVALID_PARAMS, errors);
    return;
  }
  if(!(req.query.begin_time || req.query.end_time)){
    req.query.begin_time = new Date();
    req.query.end_time = new Date();
  }
  let entrance = req.query.entrance,data = [],fileName = '',isList = false,isReceiveList = false;
  let query_data = {
    delivery_type : req.query.delivery_type,
    begin_time: req.query.begin_time,
    end_time: req.query.end_time,
    is_deal: req.query.is_deal,
    is_submit: req.query.is_submit,
    src_id: req.query.src_id,
    status: req.query.status,
    city_id: req.query.city_id,
    owner_mobile: req.query.owner_mobile,
    delivery_id: req.query.delivery_id,
    deliveryman_id: req.query.deliveryman_id,
    print_status: req.query.print_status,
    is_greeting_card: req.query.is_greeting_card,
    user : req.session.user,
    page_no : 0,
    page_size : 1000000,   // safe Threshold
    list_products : true
  };
  if (req.query.keywords && isNaN(parseInt(req.query.keywords))) {
    query_data.keywords = systemUtils.encodeForFulltext(req.query.keywords);
  } else {
    query_data.keywords = req.query.keywords;
  }
  query_data.order_sorted_rules = entrance;
  if (entrance === Constant.OSR.LIST) {
    data.push(order_excel_caption.order_caption);
    fileName = '订单列表_'+dateUtils.format(new Date())+'.xlsx';
    isList = true;
  } else if (entrance === Constant.OSR.DELIVERY_EXCHANGE) {
    query_data.status = Constant.OS.STATION;
  } else if (entrance === Constant.OSR.DELIVER_LIST) {
    let sts = [Constant.OS.CONVERT, Constant.OS.INLINE];
    if(query_data.status && sts.indexOf(query_data.status) === -1){
      return res.api(res_obj.NO_MORE_PAGE_RESULTS,'can not find the order status not beyond this scope...');
    }
    query_data.status = query_data.status || sts;
  } else if (entrance === Constant.OSR.RECEIVE_LIST) {
    data.push(order_excel_caption.delivery_caption);
    fileName = '配送单列表_'+dateUtils.format(new Date())+'.xlsx';
    isReceiveList = true;
    let sts = [Constant.OS.DELIVERY, Constant.OS.COMPLETED, Constant.OS.EXCEPTION];
    if(query_data.status && sts.indexOf(query_data.status) === -1){
      return res.api(res_obj.NO_MORE_PAGE_RESULTS,'can not find the order status not beyond this scope...');
    }
    query_data.status = query_data.status || sts;
  }else{
    delete query_data.order_sorted_rules;
  }
  let promise = orderDao.findOrderList(query_data).then((resObj) => {
    if (!(resObj.result && resObj._result)) {
      throw new TiramisuError(res_obj.FAIL);
    } else if (toolUtils.isEmptyArray(resObj._result)) {
      throw new TiramisuError(res_obj.NO_MORE_PAGE_RESULTS);
    }
    for (let curr of resObj._result) {
      let delivery_adds = [],city_name = '';
      if(curr.merger_name){
        delivery_adds = curr.merger_name.split(',');
        city_name = delivery_adds[2];
      }

      delivery_adds.shift();
//  do not change the order in the object
      let list_obj = null;
      if(isList){
        data.push([
          systemUtils.getShowOrderId(curr.id, curr.created_time),
          curr.src_name,
          curr.created_by,
          curr.created_time,
          curr.last_opt_cs,
          curr.owner_name,
          curr.owner_mobile,
          curr.created_time,
          curr.recipient_name,
          curr.recipient_mobile,
          delivery_adds.join(',') + '  '+curr.address,
          Constant.DTD[curr.delivery_type],
          curr.delivery_type == Constant.DT.COLLECT ? curr.address : '',
          curr.pay_modes_name,
          Constant.PSD[curr.print_status],
          curr.total_original_price/100,
          curr.total_discount_price/100,
          '',
          Constant.OSD[curr.status],
          curr.delivery_time,
          curr.delivery_name,
          curr.invoice,
          curr.coupon,
          city_name,
          curr.cancel_reason,
          curr.remarks,
//  the products properties
          curr.product_name ? curr.product_name : '',
          curr.size ? curr.size : '',
          curr.num ? curr.num : '',
          curr.discount_price ? curr.discount_price/100 : '',
          curr.amount ? curr.amount/100 : '',
           curr.greeting_card ? curr.greeting_card : '',
          curr.choco_board ? curr.choco_board : '',
          curr.atlas ? '需要' : '不需要'
        ]);
      }else if(isReceiveList){
        data.push([
          systemUtils.getShowOrderId(curr.id, curr.created_time),
          curr.owner_name,
          curr.owner_mobile,
          curr.created_time,
          curr.src_name,
          curr.recipient_name,
          curr.recipient_mobile,
          delivery_adds.join(',') + '  '+curr.address,
          curr.delivery_time,
          curr.pay_modes_name,
          curr.delivery_name,
          curr.created_by,
          Constant.OSD[curr.status],
          curr.deliveryman_name,
          curr.signin_time,
          '',
          curr.total_discount_price/100,
//  the products properties
          curr.num ? curr.num : '',
          curr.product_name ? curr.product_name : '',
          curr.size ? curr.size : '',
          curr.discount_price ? curr.discount_price/100 : '',
          curr.amount ? curr.amount/100 : ''
        ]);
      }
    }
  }).then(()=>{
      let buffer = xlsx.build([{name: "订单列表", data: data}]); // returns a buffer
      res.set({
        'Content-Type': 'application/vnd.ms-excel',
        'Content-Disposition':  "attachment;filename="+encodeURIComponent(fileName) ,
        'Pragma':'no-cache',
        'Expires': 0
      });
      res.send(buffer);
  }).catch((err)=>{
      console.error(err);
      res.render('error',{err:'亲,该条件下没有可选订单,请重新筛选...'});
  });

};
module.exports = new OrderService();