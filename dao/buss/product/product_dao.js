/**
 * @des    : the data access function for product
 * @author : pigo.can
 * @date   : 15/12/17 上午9:31
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var baseDao = require('../../base_dao'),
    del_flag = baseDao.del_flag,
    tables = require('../../../config').tables,
    dbHelper = require('../../../common/DBHelper');
function ProductDao(){
    this.baseColumns = ['id','name'];
    this.base_insert_sql = 'insert into ?? set ?';
    this.base_select_sql = 'select ?? from ?? where 1=1 and del_flag = ? ';
    this.base_update_sql = 'update ?? set ?';
}
/**
 * query for product category list
 */
ProductDao.prototype.findAllCatetories = function(){
    let columns = Array.prototype.slice.apply(this.baseColumns);
    columns.push('parent_id');
    let params = [columns,tables.buss_product_category,del_flag.SHOW];
    return baseDao.select(this.base_select_sql,params);
};
/**
 * query for the product list
 */
ProductDao.prototype.findProductsCount = function(product_name,category_id,page_no,page_size){
    let sql = "",params = [];
    sql += "select bp.id,bps.size,bp.name,bp.original_price,bpc.name as category_name ";
    sql += " from ?? bp";
    sql += " left join ?? bpc on bp.category_id = bpc.id";
    sql += " left join ?? bps on bp.id = bps.product_id where 1=1";
    params.push(tables.buss_product);
    params.push(tables.buss_product_category);
    params.push(tables.buss_product_sku);
    if(product_name){
        sql += " and bp.name like ?";
        params.push('%'+product_name+'%');
    }
    if(category_id){
        sql += " and bp.category_id = ? ";
        params.push(category_id);
    }
    sql += ' group by bp.id,bps.size';
    return baseDao.select(dbHelper.countSql(sql),params).then((results)=>{
            let data = {
                results : results,
                sql : sql,
                params : params
            };
            return data;
        });
};
ProductDao.prototype.findProducts = function(preSql,preParams){
    let sql = "select t.name,t.category_name,t.original_price,bps2.* from (";
    sql += preSql;
    sql += ")t left join  buss_product_sku bps2 on t.id = bps2.product_id and t.size = bps2.size order by bps2.sort asc";
    return baseDao.select(sql,preParams);
};

module.exports = new ProductDao();