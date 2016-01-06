/**
 * @des    :
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
    systemUtils = require('../../../common/SystemUtils');
function DeliveryDao(){
    this.baseColumns = ['id','name'];
    this.base_insert_sql = "insert into ?? set ?";
    this.base_update_sql = "update ?? set ?";
}
/**
 * query for stations
 */
DeliveryDao.prototype.findAllStations = function(){
    let sql = 'select ?? from ?? where 1=1 and del_flag = ?';
    let params = [this.baseColumns,tables.buss_delivery_station,del_flag.SHOW];
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
    params.push({status:constant.OS.CONVERT});
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
    sql += " left join sys_user su1 on su1.id = bpa.created_by";
    sql += " left join sys_user su2 on su2.id = bpa.updated_by";
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
        sql += " and bpa.is_repirnt = ?";
        params.push(query_obj.is_reprint);

    }
    if(query_obj.order_id){
        sql += " and bpa.order_id = ?";
        params.push(query_obj.order_id);
    }
    if(query_obj.status){
        sql += " and bpa.status = ?";
        params.push(query_obj.status);
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
DeliveryDao.prototype.updateReprintApply = function(update_obj,apply_id){
    let sql = this.base_update_sql + " where id = ? and status = 'UNAUDIT'";    //avoid concurrency to update twice
    return baseDao.update(sql,[tables.buss_print_apply,update_obj,apply_id]);
};
module.exports = new DeliveryDao();