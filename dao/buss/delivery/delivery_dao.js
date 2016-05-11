/**
 * @des    : the dao module of the delivery
 * @author : pigo.can
 * @date   : 15/12/17 上午9:31
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var baseDao = require('../../base_dao'),
    del_flag = baseDao.del_flag,
    tables = require('../../../config').tables,
    toolUtils = require('../../../common/ToolUtils'),
    dbHelper = require('../../../common/DBHelper'),
    constant = require('../../../common/Constant'),
    systemUtils = require('../../../common/SystemUtils'),
    co = require('co'),
    util = require('util');
function DeliveryDao(){
    this.baseColumns = ['id','name'];
    this.base_insert_sql = "insert into ?? set ?";
    this.base_update_sql = "update ?? set ?";
}
/**
 * query for stations
 */
DeliveryDao.prototype.findAllStations = function(query_data){
    let sql = "select bds.* from ?? bds";
    let params = [];
    params.push(tables.buss_delivery_station);
    if(query_data && query_data.city_id){
        sql += " inner join ?? dr on dr.id = bds.regionalism_id and (dr.parent_id = ? or bds.is_national > 0)";
        params.push(tables.dict_regionalism);
        params.push(query_data.city_id);
    }
    if(query_data && query_data.city_ids){
        sql += " inner join ?? dr on dr.id = bds.regionalism_id and (dr.parent_id in "+dbHelper.genInSql(query_data.city_ids)+"  or bds.is_national > 0)";
        params.push(tables.dict_regionalism);
    }
    sql += " where bds.del_flag = ?";
    // data filter begin
    // 添加用户时只展示该用户所属的配送站供选择
    if(query_data && query_data.signal && query_data.user.is_national == 0){
        sql += " and bds.id in " + dbHelper.genInSql(query_data.user.station_ids);
    }
    // data filter end
    params.push(del_flag.SHOW);
    if(query_data && query_data.station_ids){
        sql += " and bds.id in"+dbHelper.genInSql(query_data.station_ids);
    }
    return baseDao.select(sql,params);
};
/**
 * update the special orders status
 * @param order_ids
 */
DeliveryDao.prototype.updateOrderStatus = function(order_ids){
    let sql = this.base_update_sql + " where id in " + dbHelper.genInSql(order_ids);
    let params = [];
    params.push(tables.buss_order);
    params.push({status:constant.OS.CONVERT,exchange_time : new Date()});
    return baseDao.update(sql,params);
};
/**
 * insert a record for order print apply
 * @param print_apply_obj
 */
DeliveryDao.prototype.insertPrintApply = function(print_apply_obj){
    return baseDao.insert(this.base_insert_sql,[tables.buss_print_apply,print_apply_obj]);
};
/**
 * find the reprint apply list by terms
 * @param query_obj
 */
DeliveryDao.prototype.findReprintApplies = function(query_obj){
    let columns = [
        'bpa.id as apply_id',
        'su1.`name` as applicant_name',
        'bpa.applicant_mobile',
        'bpa.reason as apply_reason',
        'bpa.created_time as apply_time',
        'bpa.audit_opinion',
        'bpa.updated_time as audit_time',
        'su2.name as auditor',
        'bpa.is_reprint',
        'bpa.show_order_id as order_id',
        'bpa.reprint_time',
        'bpa.`status`',
        'bpa.validate_code'
    ].join(','),params = [];
    let sql = "select "+ columns + " from ?? bpa";
    params.push(tables.buss_print_apply);
    sql += " left join ?? su1 on su1.id = bpa.created_by";
    sql += " left join ?? su2 on su2.id = bpa.updated_by";
    params.push(tables.sys_user);
    params.push(tables.sys_user);
    sql += " inner join buss_order bo on bo.id = bpa.order_id";
    sql += " inner join buss_delivery_station bds on bds.id = bo.delivery_id";
    sql += " inner join dict_regionalism dr on dr.id = bds.regionalism_id";
    sql += " where 1=1 ";
    if(query_obj.begin_time){
        sql += " and bpa.created_time >= ?";
        params.push(query_obj.begin_time + ' 00:00:00');
    }
    if(query_obj.end_time){
        sql += " and bpa.created_time <= ?";
        params.push(query_obj.end_time + ' 23:59:59');
    }
    if(toolUtils.isInt(query_obj.is_reprint)){
        sql += " and bpa.is_reprint = ?";
        params.push(query_obj.is_reprint);

    }
    if(query_obj.keywords){
        const keywords = query_obj.keywords;
        sql += " and (bpa.show_order_id like ? or su1.name like ?)";
        params.push('%' + keywords + '%');
        params.push('%' + keywords + '%');
    }
    if(query_obj.status){
        sql += " and bpa.status = ?";
        params.push(query_obj.status);
    }
    if(query_obj.city_id && !query_obj.is_admin){
        sql += " and dr.parent_id = ?";
        params.push(query_obj.city_id);
    }
    sql += " order by bpa.created_time desc";
    let countSql = dbHelper.countSql(sql),pagination_sql = dbHelper.paginate(sql,query_obj.page_no,query_obj.page_size);
    return baseDao.select(countSql,params).then((results)=>{
        return baseDao.select(pagination_sql,params).then((_results)=>{
            return {
                results,_results
            }
        });
    });
};
/**
 * update the reprint apply record
 * @param update_obj
 */
DeliveryDao.prototype.updateReprintApply = function(update_obj,apply_id,is_reprint,order_id){
    let sql = this.base_update_sql + " where 1=1 ";    //avoid concurrency to update twice
    let params = [tables.buss_print_apply,update_obj];
    if(is_reprint){
        sql += " and is_reprint = 0 and order_id = ? and status = ?";
        params.push(order_id);
        params.push(constant.OPS.AUDITED);
    }else{
        sql += " and id = ? and status = ?";
        params.push(apply_id);
        params.push(constant.OPS.UNAUDIT);
    }
    return baseDao.update(sql,params);
};
/**
 * find the record of apply for reprint by order id
 * @param order_id
 */
DeliveryDao.prototype.findReprintApplyByOrderId = function(order_id){
    let sql = "select * from ?? where order_id = ? and status = ? and is_reprint = 0 order by created_time desc limit 1";
    let params = [tables.buss_print_apply,order_id,constant.OPS.AUDITED];
    return baseDao.select(sql,params);
};
/**
 * update the order record to allocated deliveryman
 * @param order_ids
 * @param update_obj
 * @returns {Promise}
 */
DeliveryDao.prototype.updateOrderWithDeliveryman = function(order_ids,update_obj){

    let sql = this.base_update_sql + " where id in " + dbHelper.genInSql(order_ids);
    return baseDao.update(sql,[tables.buss_order,update_obj]);
};
/**
 * find the deliverymans list by the login user of the station
 * @param userId
 */
DeliveryDao.prototype.findDeliverymansByStation = function(city_id,currentUser){
    let columns = [
        'su.id as deliveryman_id',
        'su.name as deliveryman_name',
        'su.mobile as deliveryman_mobile'
    ].join(','),params = [];
    let sql = "select "+columns+" from ?? su";
    params.push(tables.sys_user);
    //sql += " inner join ?? bds on su.station_id = bds.id";
    //params.push(tables.buss_delivery_station);
    sql += " inner join ?? sur on sur.user_id = su.id and sur.role_id = ?";
    params.push(tables.sys_user_role);
    params.push(constant.DELIVERYMAN_ID);
    //sql += " inner join ?? dr on bds.regionalism_id = dr.id and dr.parent_id = ?";
    if(city_id && systemUtils.isToFilterDeliverymans(currentUser)){
        sql += " inner join ?? dr on dr.id = su.city_id and dr.id = ?";
        params.push(tables.dict_regionalism);
        params.push(city_id);
    }
    return baseDao.select(sql,params);

};
/**
 * find the deliverymans list by city
 * @param city_id
 */
DeliveryDao.prototype.findDeliverymansByCity = function(city_id){
    let columns = [
        'su.id as deliveryman_id',
        'su.name as deliveryman_name',
        'su.mobile as deliveryman_mobile'
    ].join(','),params = [];
    let sql = "select "+columns+" from ?? su";
    params.push(tables.sys_user);
    sql += " inner join ?? sur on sur.user_id = su.id and sur.role_id = ?";
    params.push(tables.sys_user_role);
    params.push(constant.DELIVERYMAN_ID);
    if(city_id){
        sql += " inner join ?? dr on FIND_IN_SET(dr.id, su.city_ids) and dr.id = ?";
        params.push(tables.dict_regionalism);
        params.push(city_id);
    }
    return baseDao.select(sql,params);

};
/**
 * find the deliverymans list by order
 * @param order_id
 * @returns {Promise}
 */
DeliveryDao.prototype.findDeliverymansByOrder = function(order_id){
    let columns = [
        'su.id as deliveryman_id',
        'su.name as deliveryman_name',
        'su.mobile as deliveryman_mobile'
    ].join(','),params = [];
    let sql = "select "+columns+" from ?? su";
    params.push(tables.sys_user);
    sql += " inner join ?? sur on sur.user_id = su.id and sur.role_id = ?";
    params.push(tables.sys_user_role);
    params.push(constant.DELIVERYMAN_ID);
    sql += " inner join ?? bo on bo.id = ? and FIND_IN_SET(bo.delivery_id, su.station_ids)";
    params.push(tables.buss_order);
    params.push(order_id);
    return baseDao.select(sql,params);
};
/**
 * find the station info by the id
 * @param station_id
 * @returns {Promise}
 */
DeliveryDao.prototype.findStationById = function(station_id){
    let sql = util.format("select b.id 'station_id',b.name 'name',b.address 'address',b.coords 'coords'," +
        "b.remarks 'remarks',b.capacity 'capacity',b.phone 'phone',b.is_national 'is_national'," +
        "a.id 'regionalism_id',a.name 'regionalism_name'," +
        "c.id 'city_id',c.name 'city_name'," +
        "d.id 'province_id',d.name 'province_name' " +
        "from %s a join %s c on a.parent_id = c.id " +
        "join %s d on c.parent_id = d.id " +
        "join %s b on a.id = b.regionalism_id " +
        "where a.level_type = ? and b.del_flag = ? and b.id = ?", tables.dict_regionalism, tables.dict_regionalism, tables.dict_regionalism, tables.buss_delivery_station);
    let params = [3, del_flag.SHOW, station_id];
    return baseDao.select(sql,params);
};
DeliveryDao.prototype.findDeliveryRecord = function (begin_time, end_time, deliveryman_id, is_COD) {
    let columns = [
        'bo.id AS order_id',
        'bo.delivery_time',
        'bpm.name AS pay_modes',
        'bo.pay_status',
        'bo.total_original_price',
        'bo.total_discount_price',
        'bo.total_amount',
        'bo.COD_amount',
        'bo.late_minutes',
        'bo.payfor_amount',
        'bo.payfor_reason',
        'bo.payfor_type',
        'bo.signin_time',
        'bo.updated_time',

        'br.delivery_type',
        'br.name AS recipient_name',
        'br.mobile AS recipient_mobile',
        'br.address',
        'br.landmark',

        'bdr.delivery_pay',
        'bdr.delivery_count',
        'bdr.is_review',
        'bdr.remark'
    ];
    let sql = `SELECT ${columns.join(',')} FROM ?? bo `;
    let params = [];
    params.push(tables.buss_order);
    if(begin_time || end_time)
    sql += `force index(IDX_DELIVERY_TIME) `;
    sql += `LEFT JOIN ?? br ON bo.recipient_id = br.id `;
    params.push(tables.buss_recipient);
    sql += `LEFT JOIN ?? bdr ON bo.id = bdr.order_id `;
    params.push(tables.buss_delivery_record);
    sql += `LEFT JOIN ?? bpm ON bo.pay_modes_id = bpm.id `;
    params.push(tables.buss_pay_modes);
    sql += `WHERE bo.status IN ('${constant.OS.COMPLETED}', '${constant.OS.EXCEPTION}') `;
    if(begin_time){
        sql += `AND bo.delivery_time >= ? `;
        params.push(begin_time + ' 00:00~00:00');
    }
    if(end_time){
        sql += `AND bo.delivery_time <= ? `;
        params.push(end_time + ' 24:00~24:00');
    }
    if(deliveryman_id){
        sql += `AND bo.deliveryman_id = ? `;
        params.push(deliveryman_id);
    }
    if(is_COD){
        sql += `AND bo.total_amount > 0 `;
    }

    return baseDao.select(sql, params);
};
DeliveryDao.prototype.updateDeliveryRecord = function (order_id, order_obj, record_obj) {
    let trans;
    return co(function *() {
        trans = yield baseDao.trans();
        baseDao.transWrapPromise(trans);

        if(order_obj){
            let sql = `UPDATE ?? SET ? WHERE id = ? `;
            let params = [tables.buss_order, order_obj, order_id];
            yield trans.queryPromise(sql, params);
        }
        if(record_obj){
            let sql = `UPDATE ?? SET ? WHERE order_id = ? `;
            let params = [tables.buss_delivery_record, record_obj, order_id];
            yield trans.queryPromise(sql, params);
        }

        yield trans.commitPromise();
    }).catch(err=> {
        if(trans && typeof trans.rollbackPromise == 'function') trans.rollbackPromise();
        return Promise.reject(err);
    });
};
DeliveryDao.prototype.findDeliveryProof = function (order_id, deliveryman_id, delivery_count) {
    let columns = [
        'bdp.picture_type',
        'bdp.picture_url'
    ];
    let sql = `SELECT ${columns.join(',')} FROM ?? bdp `;
    let params = [];
    params.push(tables.buss_delivery_picture);
    sql += `WHERE 1 = 1 `;
    if(order_id){
        sql += `AND bdp.order_id = ? `;
        params.push(order_id);
    }
    if(delivery_count){
        sql += `AND bdp.delivery_count = ? `;
        params.push(delivery_count);
    }
    if(deliveryman_id){
        sql += `AND bdp.deliveryman_id = ? `;
        params.push(deliveryman_id);
    }
    return baseDao.select(sql, params);
};
module.exports = DeliveryDao;