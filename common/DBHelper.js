/**
 * @des    : the helper for db operation
 * @author : pigo.can
 * @date   : 15/12/24 上午10:41
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var logger = require('./LogHelper').systemLog();

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
        logger.info('the input param page_no ['+page_no+'],page_size ['+page_size +'] is not available...');
        return '';
    }
    page_no = page_no - 1;
    return sql + ' limit '+page_no+','+page_size;
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

module.exports = DBHelper;
