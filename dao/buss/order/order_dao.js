/**
 * @des    : the data access function for order
 * @author : pigo.can
 * @date   : 15/12/17 上午9:31
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var baseDao = require('../../base_dao'),
    util = require('util'),
    toolUtils = require('../../../common/ToolUtils'),
    dbHelper = require('../../../common/DbHelper'),
    logger = require('../../../common/LogHelper').systemLog(),
    constant = require('../../../common/Constant'),
    del_flag = baseDao.del_flag,
    tables = require('../../../config').tables;
function OrderDao(){
    this.baseColumns = ['id','name'];
    this.base_insert_sql = 'insert into ?? set ?';
    this.base_select_sql = 'select ?? from ?? where 1=1 and del_flag = ? ';
    this.base_update_sql = 'update ?? set ?';
}
/**
 * get the order sources
 */
OrderDao.prototype.findAllOrderSrc = function(){
    let params = [['id','name','parent_id','level'],tables.buss_order_src,del_flag.SHOW];
    return baseDao.select(this.base_select_sql,params);
};
/**
 * new order
 */
OrderDao.prototype.insertOrder = function(orderObj){
    return baseDao.insert(this.base_insert_sql,[tables.buss_order,orderObj]);
};
/**
 * new recipient record
 */
OrderDao.prototype.insertRecipient = function(recipientObj){
    return baseDao.insert(this.base_insert_sql,[tables.buss_recipient,recipientObj]);
};
/**
 * get the pay modes
 * @type {OrderDao}
 */
OrderDao.prototype.findAllPayModes = function(){
    let params = [this.baseColumns,tables.buss_pay_modes,del_flag.SHOW];
    return baseDao.select(this.base_select_sql,params);
};
/**
 * get the shops by regionalismId
 * @param regionalismId
 */
OrderDao.prototype.findShopByRegionId = function(districtId){
    let sql = this.base_select_sql + ' and regionalism_id = ?';
    let params = [this.baseColumns,tables.buss_shop,del_flag.SHOW,districtId];
    return baseDao.select(sql,params);
};
/**
 * update the order info
 * @param orderObj
 */
OrderDao.prototype.updateOrder = function(orderObj){
    return baseDao.update(this.base_update_sql,[tables.buss_order,orderObj]);
};
/**
 * new order-sku record
 * @param order_sku_obj
 */
OrderDao.prototype.insertOrderSku = function(order_sku_obj){
    return baseDao.insert(this.base_insert_sql,[tables.buss_order_sku,order_sku_obj]);
};
OrderDao.prototype.batchInsertOrderSku = function(params){
    let sql = "insert into "+tables.buss_order_sku+"(order_id,sku_id,num,choco_board,greeting_card,atlas,custom_name,custom_desc,discount_price) values ?";
    return baseDao.batchInsert(sql,[params]);
};
OrderDao.prototype.insertOrderFulltext = function(order_fulltext_obj){
    return baseDao.insert(this.base_insert_sql,[tables.buss_order_fulltext,order_fulltext_obj]);
};
/**
 * find the order detail info by orderId
 * @param orderId
 */
OrderDao.prototype.findOrderById = function(orderId){
    let columns = ['br.delivery_type',
        'bo.owner_name',
        'bo.owner_mobile',
        'br.`name` as recipient_name',
        'br.mobile as recipient_mobile',
        'br.address as recipient_address',
        'br.landmark',
        'bds.id as delivery_id',
        'bds.name as delivery_name',
        'bpm.id as pay_modes_id',
        'bpm.name as pay_name',
        'bo.pay_status',
        'bo.delivery_time',
        'bo.src_id',
        'bo.remarks',
        'bo.status',
        'bp.`name` as product_name',
        'bp.original_price',
        'bos.num',
        'bps.size',
        'bps.price',
        'bos.sku_id',
        'bos.discount_price',
        'bos.choco_board',
        'bos.greeting_card',
        'bos.custom_name',
        'bos.custom_desc',
        'bos.atlas',
        'dr.name as regionalism_name',
        'dr.id as regionalism_id',
        'dr2.name as city_name',
        'dr2.id as city_id',
        'dr3.name as province_name',
        'dr3.id as province_id'
    ].join(',');
    let sql = "select "+columns+" from ?? bo";
    sql += " left join buss_recipient br on bo.recipient_id = br.id";
    sql += " left join buss_pay_modes bpm on bo.pay_modes_id = bpm.id";
    sql += " left join buss_delivery_station bds on bo.delivery_id = bds.id";
    sql += " left join dict_regionalism dr on br.regionalism_id = dr.id";
    sql += " inner join dict_regionalism dr2 on dr.parent_id = dr2.id";
    sql += " inner join dict_regionalism dr3 on dr2.parent_id = dr3.id";
    sql += " left join buss_order_sku bos on bo.id = bos.order_id";
    sql += " left join buss_product_sku bps on bos.sku_id = bps.id";
    sql += " left join buss_product bp on bps.product_id = bp.id";
    sql += " where 1=1 and bo.id = ?";
    let params = [tables.buss_order,orderId];
    return baseDao.select(sql,params);
};
/**
 * query for the order list by the given terms
 * @param begin_time
 * @param end_time
 * @param is_deal
 * @param is_submit
 * @param keywords
 * @param src_id
 * @param status
 */
OrderDao.prototype.findOrderList = function(query_data){
let columns = [
    'bo.id',
    'bo.merchant_id',
    'bo.owner_name',
    'bo.owner_mobile',
    'bo.created_date',
    'bo.pay_status',
    'bo.delivery_time',
    'bo.is_deal',
    'bo.is_submit',
    'bo.cancel_reason',
    'bo.remarks',
    'bo.total_original_price',
    'bo.total_discount_price',
    'bo.coupon',
    'bo.`status`',
    'br.delivery_type',
    'br.address',
    'br.landmark',
    'dr.merger_name',
    'bos.merge_name as src_name',
    'su1.name as created_by',
    'su2.name as updated_by',
    'bo.updated_date'
].join(',');
    let params = [];
    let sql = "select "+columns+" from ?? bo";
    params.push(tables.buss_order);
    if(query_data.keywords){
        sql += " inner join buss_order_fulltext bof on match(bof.show_order_id,bof.landmark,bof.owner_mobile,bof.owner_name,bof.recipient_name,bof.recipient_address,bof.recipient_mobile) against(? IN BOOLEAN MODE) and bof.order_id = bo.id"
        params.push('+'+query_data.keywords+'*');
    }
    sql += " left join buss_recipient br on bo.recipient_id = br.id";
    if(query_data.city_id){
        sql += " and br.regionalism_id = ?";
        params.push(query_data.city_id);
    }
    sql += " left join buss_order_src bos on bo.src_id = bos.id";
    sql += " left join dict_regionalism dr on br.regionalism_id = dr.id";
    sql += " left join sys_user su1 on su1.id = bo.created_by";
    sql += " left join sys_user su2 on su2.id = bo.updated_by";
    sql += " where 1=1";
    if(query_data.begin_time){
        sql += " and bo.created_date > ?";
        params.push(query_data.begin_time);
    }
    if(query_data.end_time){
        sql += " and bo.delivery_time < ?";
        params.push(query_data.end_time);
    }
    if(query_data.is_deal){
        sql += " and bo.is_deal > 0";
    }
    if(query_data.is_submit){
        sql += " and bo.is_submit > 0"
    }
    if(query_data.src_id){
        sql += " and src_id = ?";
        params.push(query_data.src_id);
    }
    if(query_data.status){
        sql += " and bo.status = ?";
        params.push(query_data.status);
    }
    switch (query_data.order_sorted_rules){
        case constant.OSR.LIST:
            sql += " order by bo.created_date desc";
            break;
        case constant.OSR.DELIVERY_EXCHANGE :
            sql += " order by bo.delivery_time asc";
            break;
        case constant.OSR.RECEIVE_LIST :
            sql += " order by bo.delivery_time acs,bo.`status` asc";
            break;
        case constant.OSR.DELIVER_LIST :
            sql += " order by bo.is_print asc,bo.delivery_time asc"
            break;
        default :
            // do nothing && order by with the db self
    }

    let countSql = dbHelper.countSql(sql);
    return baseDao.select(countSql,params).then((result)=>{
        return baseDao.select(dbHelper.paginate(sql,query_data.page_no,query_data.page_size),params).then((_result)=>{
            return {
                result : result,
                _result : _result
            };
        });
    });
};
/**
 * update the order by order id with transaction
 * @param order_obj
 * @param order_id
 * @param recipient_obj
 * @param recipient_id
 * @param products
 * @returns {Promise|Promise.<T>|MPromise}
 */
OrderDao.prototype.editOrder = function(order_obj,order_id,recipient_obj,recipient_id,products){
    let order_sql = this.base_update_sql + " where id = ?",recipent_sql = order_sql,
        recipient_params = [tables.buss_recipient,recipient_obj,recipient_id],
        order_params = [tables.buss_order,order_obj,order_id];
    return baseDao.trans().then((trans)=>{
        return new Promise((resolve,reject)=>{
            trans.query(recipent_sql,recipient_params,(err_recipient)=>{
                if(err_recipient){
                    trans.rollback();
                    logger.error('when update recipient with recipient_id:['+recipient_id+"] exception ==========>",err_recipient);
                    reject(err_recipient);
                    return;
                }
                trans.query(order_sql,order_params,(err_order)=>{
                    if(err_order){
                        trans.rollback();
                        logger.error('when update order with order_id:['+order_id+"] exception ============>",err_order);
                        reject(err_order);
                        return;
                    }
                    let cb = function(err_cb){
                        if(err_cb && trans.rollback){
                            trans.rollback();
                            reject(err_cb);
                        }
                    };
                    products.forEach((curr)=>{
                        let order_sku_obj = {
                            order_id : order_id,
                            sku_id :curr.sku_id,
                            num : curr.num,
                            choco_board : curr.choco_board,
                            greeting_card : curr.greeting_card,
                            atlas : curr.atlas,
                            custom_name : curr.custom_name,
                            custom_desc : curr.custom_desc,
                            discount_price : curr.discount_price
                        };
                        let order_sku_select_sql = this.base_select_sql + " and order_id = ? and sku_id = ?";
                        let order_sku_select_params = ['order_id',tables.buss_order_sku,del_flag.SHOW,order_id,curr.sku_id];

                        let order_sku_update_sql = this.base_update_sql + " where order_id = ? and sku_id = ?";
                        let order_sku_update_params = [tables.buss_order_sku,order_sku_obj,order_id,curr.sku_id];
                        trans.query(order_sku_select_sql,order_sku_select_params,(err_order_sku,_res)=>{
                            if(err_order_sku && trans.rollback){
                                trans.rollback();
                                reject(err_cb);
                                return;
                            }
                            if(toolUtils.isEmptyArray(_res)){
                                trans.query(this.base_insert_sql,[tables.buss_order_sku,order_sku_obj],cb);
                            }else{
                                trans.query(order_sku_update_sql,order_sku_update_params,cb);
                            }
                        });
                    });
                    trans.commit(()=>{
                        resolve();
                    });
                });
            });
        });

    });
};
/**
 * update the recipient info
 * @param recipient_obj
 * @param recipient_id
 * @returns {Promise|Promise.<T>|MPromise}
 */
OrderDao.prototype.updateRecipient = function(recipient_obj,recipient_id){
    let sql = this.base_update_sql + " where id = ?",
        params = [tables.buss_recipient,recipient_obj,recipient_id];
    return baseDao.trans().then((trans)=>{
        trans.query(sql,params,(err)=>{
            if(err){
                trans.rollback();
                throw new Error('when update recipient with recipient_id:['+recipient_id+"] exception");
            }
            return trans;
        });
    });
};
/**
 * update the special orders status
 * @param order_ids
 */
OrderDao.prototype.updateOrderStatus = function(order_ids){
    let sql = this.base_update_sql + " where id in " + dbHelper.genInSql(order_ids);
    let params = [];
    params.push(tables.buss_order);
    params.push({status:constant.OS.CONVERT});
    return baseDao.update(sql,params);
};
/**
 * insert a record for order print apply
 * @param print_apply_obj
 */
OrderDao.prototype.insertPrintApply = function(print_apply_obj){
    return baseDao.insert(this.base_insert_sql,[tables.buss_print_apply,print_apply_obj]);
};
module.exports = new OrderDao();

