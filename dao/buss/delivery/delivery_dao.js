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
    ONLY_ADMIN = baseDao.ONLY_ADMIN,
    tables = require('../../../config').tables,
    toolUtils = require('../../../common/ToolUtils'),
    dbHelper = require('../../../common/DBHelper'),
    constant = require('../../../common/Constant'),
    systemUtils = require('../../../common/SystemUtils'),
    mysql = require('mysql'),
    _ = require('lodash'),
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
    if (!query_data) query_data = {};
    let sql = `SELECT bds.* FROM ?? bds `;
    let params = [];
    params.push(tables.buss_delivery_station);
    sql += `INNER JOIN ?? dr ON dr.id = bds.regionalism_id `;  // 区
    params.push(tables.dict_regionalism);
    sql += `INNER JOIN ?? sc ON sc.regionalism_id = dr.id `;
    params.push(tables.sys_city);
    if(query_data && query_data.city_id){
        if (query_data.is_standard_area == '1') {
            sql += `AND (dr.parent_id = ? OR bds.is_national > 0) `;
            params.push(query_data.city_id);
        } else {
            sql += `AND ( (dr.id = ? AND sc.is_city = 1 ) OR (dr.parent_id = ? AND sc.is_city = 0 ) OR bds.is_national > 0 ) `;
            params.push(query_data.city_id);
            params.push(query_data.city_id);
        }
    }
    if(query_data && query_data.city_ids){
        let city_ids_str = dbHelper.genInSql(query_data.city_ids);
        if (query_data.is_standard_area == '1') {
            sql += `AND (dr.parent_id IN ${city_ids_str} OR bds.is_national > 0) `;
        } else {
            sql += `AND ( (dr.id IN ${city_ids_str} AND sc.is_city = 1 ) OR (dr.parent_id IN ${city_ids_str} AND sc.is_city = 0 ) OR bds.is_national > 0 ) `;
        }
    }
    sql += `WHERE bds.del_flag = ? `;
    params.push(del_flag.SHOW);
    if (query_data.is_national !== undefined) {
        sql += `AND bds.is_national = ? `;
        params.push(query_data.is_national);
    }
    // data filter begin
    // 添加用户时只展示该用户所属的配送站供选择
    if(query_data && query_data.signal && query_data.user && query_data.user.is_national == 0){
        sql += " and bds.id in " + dbHelper.genInSql(query_data.user.station_ids);
    }
    // data filter end
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
DeliveryDao.prototype.findDeliverymansByStation = function(city_ids,currentUser){
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
    if(city_ids && systemUtils.isToFilterDeliverymans(currentUser)){
        sql += " inner join ?? dr on FIND_IN_SET(dr.id, su.city_ids) and FIND_IN_SET(dr.id, ?)";
        params.push(tables.dict_regionalism);
        params.push(city_ids.join());
    }
    sql += ` WHERE su.del_flag = ? AND sur.only_admin = ? `;
    params.push(del_flag.SHOW);
    params.push(ONLY_ADMIN.NO);
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
    sql += ` WHERE su.del_flag = ? AND sur.only_admin = ? `;
    params.push(del_flag.SHOW);
    params.push(ONLY_ADMIN.NO);
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
    sql += " inner join ?? bo on bo.id = ? ";
    params.push(tables.buss_order);
    params.push(order_id);
    sql += ` INNER JOIN ?? bds on bds.id = bo.delivery_id `;
    params.push(tables.buss_delivery_station);
    sql += ` INNER JOIN ?? dr on dr.id = bds.regionalism_id AND FIND_IN_SET(dr.parent_id, su.city_ids) `;
    params.push(tables.dict_regionalism);

    sql += ` WHERE su.del_flag = ? AND sur.only_admin = ? `;
    params.push(del_flag.SHOW);
    params.push(ONLY_ADMIN.NO);
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

function joinDeliveryRecordSql(query, need_city_name) {
    if (!query) query = {};
    let sql = `FROM ?? bo `;
    let params = [tables.buss_order];
    let need_ds_flag = systemUtils.isDoOrderDataFilter(query);
    if (query.begin_time || query.end_time)
        sql += `force index(IDX_DELIVERY_TIME) `;
    if (query.keywords) {
        let match = '';
        sql += `INNER JOIN ?? bof on match(bof.owner_name,bof.owner_mobile,bof.recipient_name,bof.recipient_mobile,bof.recipient_address,bof.landmark,bof.show_order_id,bof.merchant_id,bof.coupon,bof.recipient_mobile_suffix,bof.owner_mobile_suffix) against(? IN BOOLEAN MODE) and bof.order_id = bo.id `;
        params.push(tables.buss_order_fulltext);
        query.keywords.split(' ').forEach((curr) => {
            if (curr) {
                match += '+' + curr + ' ';
            }
        });
        params.push(match + '*');
    }
    // 配送地址
    sql += `INNER JOIN ?? br ON br.id = bo.recipient_id `;
    params.push(tables.buss_recipient);
    sql += `INNER JOIN ?? dr ON dr.id = br.regionalism_id `;
    params.push(tables.dict_regionalism);
    // 配送站
    sql += `INNER JOIN ?? bds ON bds.id = bo.delivery_id `;
    params.push(tables.buss_delivery_station);
    if (query.province_id || query.city_id || need_ds_flag || need_city_name) {
        sql += `INNER JOIN ?? dr2 ON dr2.id = bds.regionalism_id `;
        params.push(tables.dict_regionalism);
        if (query.city_id || need_ds_flag || need_city_name) {
            sql += `INNER JOIN ?? sc ON sc.regionalism_id = dr2.id `;
            params.push(tables.sys_city);
        }
    }
    if (query.province_id || need_city_name) {
        sql += `INNER JOIN ?? dr3 ON dr3.id = dr2.parent_id `;
        params.push(tables.dict_regionalism);
        if (query.province_id) {
            sql += `AND dr3.parent_id = ? `;
            params.push(query.province_id);
        }
    }
    // 配送员
    sql += `INNER JOIN ?? su ON su.id = bo.deliveryman_id `;
    params.push(tables.sys_user);
    sql += `LEFT JOIN ?? bdr ON bdr.order_id = bo.id `;
    params.push(tables.buss_delivery_record);

    sql += `WHERE bo.status IN ('${constant.OS.COMPLETED}', '${constant.OS.EXCEPTION}') `;
    if (need_ds_flag) {
        let tmp_sql = '';
        query.user.data_scopes.forEach(curr=> {
            if (curr == constant.DS.STATION.id) {
                tmp_sql += `OR bo.delivery_id in ${dbHelper.genInSql(query.user.station_ids)} `;
            } else if (curr == constant.DS.CITY.id) {
                tmp_sql += `OR sc.regionalism_id in ${dbHelper.genInSql(query.user.city_ids)} `;
            } else if (curr == constant.DS.SELF_DELIVERY.id) {
                tmp_sql += `OR bo.deliveryman_id = ? `;
                params.push(query.user.id);
            } else if (curr == constant.DS.SELF_CHANNEL.id) {
                tmp_sql += `OR bo.src_id in ${dbHelper.genInSql(query.user.src_ids)} `;
            }
        });
        if (tmp_sql !== '') {
            sql += `AND ( ${tmp_sql.replace(/^OR/, '')} )`;
        } else {
            sql += `AND 1 = 0 `;
        }
    }
    if (query.begin_time) {
        sql += `AND bo.delivery_time >= ? `;
        params.push(query.begin_time + ' 00:00~00:00');
    }
    if(query.end_time){
        sql += `AND bo.delivery_time <= ? `;
        params.push(query.end_time + ' 24:00~24:00');
    }
    if (query.city_id) {
        if (query.is_standard_area == '1') {
            sql += " and dr2.parent_id = ?";
            params.push(query.city_id);
        }else {
            sql += " and ((sc.is_city = 1 and dr2.id = ? ) or (sc.is_city = 0 and dr2.parent_id = ? ))";
            params.push(query.city_id);
            params.push(query.city_id);
        }
    }
    if (query.delivery_id) {
        sql += `AND bo.delivery_id = ? `;
        params.push(query.delivery_id);
    }
    if (query.deliveryman_id) {
        sql += `AND bo.deliveryman_id = ? `;
        params.push(query.deliveryman_id);
    }
    if (query.is_COD !== undefined && query.is_COD !== null) {
        if (query.is_COD)
            sql += `AND bo.total_amount > 0 `;
        else
            sql += `AND bo.total_amount = 0 `;
    }
    // if (!doFt) {
    //     sql += `AND bo.id LIKE ? `;
    //     params.push(`%${query.keywords}%`);
    // }

    return mysql.format(sql, params);
}

DeliveryDao.prototype.findDeliveryRecordCount = function (query) {
    if (!query) query = {};
    let count_columns = [
        'COUNT(*) AS total',
        'SUM(bo.total_amount) AS total_amount',
        'SUM(bdr.delivery_pay) AS delivery_pay',
        'SUM(IF(bo.COD_amount IS NUll, bo.total_amount, bo.COD_amount)) AS COD_amount',
        'SUM(IF(bo.is_pos_pay = 1, IF(bo.COD_amount IS NUll, bo.total_amount, bo.COD_amount), 0)) AS POS_amount'
    ];
    let sql = joinDeliveryRecordSql(query);
    return co(function *() {
        let page_no = query.page_no || 0;
        let page_size = query.page_size || 10;
        let count_sql = `SELECT ${count_columns.join()} ` + sql;
        let id_sql = `SELECT bo.id ` + sql + `LIMIT ${page_no * page_size},${page_size} `;
        let count = yield baseDao.select(count_sql);
        let result = Object.assign({}, count[0]);

        let order_ids = yield baseDao.select(id_sql);
        result.order_ids = [];
        order_ids.forEach(curr=> {
            result.order_ids.push(curr.id);
        });

        return result;
    });
};
DeliveryDao.prototype.findDeliveryRecordById = function (order_ids) {
    let columns = [
        'bo.id AS order_id',
        'bo.delivery_time',
        'bo.pay_modes_id',
        'bpm.name AS pay_modes_name',
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
        'bo.created_time',
        'bo.status AS order_status',
        'bo.is_pos_pay AS is_POS',

        'br.delivery_type',
        'br.name AS recipient_name',
        'br.mobile AS recipient_mobile',
        'dr.merger_name',
        'br.address',
        'br.landmark',

        'su.name AS deliveryman_name',
        'su.mobile AS deliveryman_mobile',

        'bdr.delivery_pay',
        'bdr.delivery_count',
        'bdr.is_review',
        'bdr.remark'
    ];
    let sql = `SELECT ${columns.join(',')} FROM ?? bo `;
    let params = [tables.buss_order];
    sql += `INNER JOIN ?? br ON bo.recipient_id = br.id `;
    params.push(tables.buss_recipient);
    sql += `INNER JOIN ?? su ON su.id = bo.deliveryman_id `;
    params.push(tables.sys_user);
    sql += `INNER JOIN ?? bdr ON bo.id = bdr.order_id `;
    params.push(tables.buss_delivery_record);
    sql += `LEFT JOIN ?? bpm ON bo.pay_modes_id = bpm.id `;
    params.push(tables.buss_pay_modes);
    sql += `INNER JOIN ?? dr on dr.id = br.regionalism_id `;
    params.push(tables.dict_regionalism);
    if (_.isArray(order_ids)) {
        sql += `WHERE FIND_IN_SET(bo.id, ? ) `;
        params.push(order_ids.join());
    } else {
        sql += `WHERE bo.id = ?  `;
        params.push(order_ids);
    }

    return baseDao.select(sql, params);
};
DeliveryDao.prototype.findHistoryRecord = function (order_id) {
    let columns = [
        'boh.order_id',
        'boh.`option`',
        'boh.created_time',
        'su.`name` as created_by'
    ];
    let sql = `SELECT ${columns.join(',')} FROM ?? boh `;
    let params = [];
    params.push(tables.buss_order_history);
    sql += `LEFT JOIN ?? su on su.id = boh.created_by `;
    params.push(tables.sys_user);
    sql += `WHERE boh.del_flag = ? `;
    params.push(del_flag.SHOW);
    if (order_id) {
        sql += `AND boh.order_id = ? `;
        params.push(order_id);
    }
    let keys = ['实收金额', '配送工资', '配送工资审核备注'];
    sql += `AND boh.\`option\` REGEXP '.*\{(${keys.join('|')})\}.*' `;
    return baseDao.select(sql, params);
};
DeliveryDao.prototype.updateDeliveryRecord = function (order_id, order_obj, record_obj) {
    if (!order_id) return Promise.reject('order_id = ', order_id);
    let trans;
    return co(function *() {
        trans = yield baseDao.trans();
        baseDao.transWrapPromise(trans);

        if (order_obj) {
            let sql = `UPDATE ?? SET ? WHERE id = ? `;
            let params = [tables.buss_order, order_obj, order_id];
            yield trans.queryPromise(sql, params);
        }
        if (record_obj) {
            let tmp_obj = Object.assign({order_id: order_id}, record_obj);
            // TODO: 在没有计算配送工资前的订单，在此表中没有数据，需要插入
            let sql = `INSERT INTO ?? SET ? ON DUPLICATE KEY UPDATE ? `;
            let params = [tables.buss_delivery_record, tmp_obj, tmp_obj];
            yield trans.queryPromise(sql, params);
        }

        yield trans.commitPromise();
    }).catch(err=> {
        if (trans && typeof trans.rollbackPromise == 'function') trans.rollbackPromise();
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
DeliveryDao.prototype.joinPaySQL = function (query) {
    if (!query) query = {};
    let columns = [
        'bo.id AS order_id',
        'bo.created_time',
        'bo.delivery_time',
        'bo.total_amount',
        'IF(bo.COD_amount IS NULL, bo.total_amount, bo.COD_amount) AS COD_amount',
        'bo.owner_name',
        'bo.owner_mobile',
        'bo.signin_time',

        'br.name AS recipient_name',
        'br.mobile AS recipient_mobile',
        'br.address',
        'dr.merger_name',

        'IF(sc.is_city = 1, dr2.name, dr3.name) AS city_name',
        'bds.name AS delivery_name',

        'su.name AS deliveryman_name',
        'su.mobile AS deliveryman_mobile',

        'bdr.delivery_pay',
        'bdr.is_review',

        'bos.num AS num',
        'bp.name AS product_name',
        'bps.size AS size'
    ];
    let inner_sql = '';
    inner_sql += `INNER JOIN ${tables.buss_order_sku} bos ON bos.order_id = bo.id `;
    inner_sql += `INNER JOIN ${tables.buss_product_sku} bps ON bps.id = bos.sku_id `;
    inner_sql += `INNER JOIN ${tables.buss_product} bp ON bp.id = bps.product_id `;
    inner_sql += `WHERE`;
    return `SELECT ${columns.join(',')} ` + joinDeliveryRecordSql(query, true).replace('WHERE', inner_sql);
};
DeliveryDao.prototype.joinCODSQL = function (query) {
    if (!query) query = {};
    let columns = [
        'bo.id AS order_id',
        'bo.created_time',
        'bo.delivery_time',
        'bo.total_amount',
        'if(bo.COD_amount IS NULL, bo.total_amount, bo.COD_amount) AS COD_amount',
        'if(bo.is_pos_pay = 1, "POS", "现金") AS pay_modes_name',
        'bdr.remark',

        'IF(sc.is_city = 1, dr2.name, dr3.name) AS city_name',
        'bds.name AS delivery_name',

        'su.name AS deliveryman_name',
        'su.mobile AS deliveryman_mobile'
    ];
    return `SELECT ${columns.join(',')} ` + joinDeliveryRecordSql(query, true);
};


function doFullText(query_data) {
    let keywords = query_data.keywords;
    if (keywords && toolUtils.isInt(parseInt(keywords))
        && keywords.toString().length !== 5
        && !toolUtils.isMobilePhone(keywords, 'zh-CN')
        && !toolUtils.exp_validator_custom.customValidators.isOrderId(keywords)) {
        return false;
    } else {
        return true;
    }
}

module.exports = DeliveryDao;
