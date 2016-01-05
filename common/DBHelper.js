/**
 * @des    : the helper for db operation
 * @author : pigo.can
 * @date   : 15/12/24 上午10:41
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var logger = require('./LogHelper').systemLog(),
    toolUtils = require('./ToolUtils');

function DBHelper(){
}
/**
 * get the count sql
 */
DBHelper.countSql = function(sql){
    if(!(sql && typeof sql === 'string')){
        return '';
    }
    return 'select count(1) as total from (' + DBHelper.removeOrders(sql) + ')temp';
};
/**
 * get the pagination sql
 * @param sql
 * @param page_no
 * @param page_size
 * @returns {string}
 */
DBHelper.paginate = function(sql,page_no,page_size){
    if(!(Number.isInteger(parseInt(page_no)) && Number.isInteger(parseInt(page_size)))){
        logger.warn('the input param page_no ['+page_no+'],page_size ['+page_size +'] is not available...');
        return sql+' limit 0,20';
    }
    if(parseInt(page_no) <= 0){
        page_no = 0;
    }
    if(parseInt(page_size) <= 0 || parseInt(page_size) >= Number.MAX_SAFE_INTEGER){
        page_size = 20;
    }
    return sql + ' limit '+(page_no*page_size+1)+','+page_size;
};
/**
 * remove the order by sub statement at the end of the sql
 * @param sql
 * @returns sql string
 */
DBHelper.removeOrders = function(sql){
    let reg_text = /order\s*by[\w|\W|\s|\S][^\)]*$/ig;
    return sql.replace(reg_text,'');
};
/**
 * gen the in sql statement
 * <li>
 *     [1,2,3] ==> ('1','2','3')
 * </li>
 * @param params
 * @returns {string}
 */
DBHelper.genInSql = function(params){
    let sql = "(";
    if(toolUtils.isEmptyArray(params)){
        logger.warn('the input params [',params,'] to be gen in sql is not valid ...');
    }else{
        params.forEach((curr)=>{
            sql += "'"+curr+"',";
        });
        sql = sql.substring(0,sql.length - 1);
    }
    sql += ")";
    return sql;
};
module.exports = DBHelper;
