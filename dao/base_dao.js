/**
 * @des    : the base dao for the all dao modules
 * @author : pigo.can
 * @date   : 15/12/9 下午5:31
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var config = require('../config');
var mysql = require('mysql');
var pool = mysql.createPool(config.mysql_options);
function BaseDao(){
    pool.on('connecton', function () {
        pool.query('SET SESSION auto_increment_increment = 1');
        console.log('﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀');
        console.log('=== the pool is establishing connection ===');
        console.log('︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿');
    });
    pool.on('enqueue',function(){
        console.log('Waiting for available connection slot');
    });
}

BaseDao.select = function(sql,params){
    return new Promise((resolve,reject) => {
        pool.query(sql,params,(err,results,fields) => {
            if(err){
                reject(err);
            }else{
                resolve(results,fields);
            }
        });
    });
};
BaseDao.update = function(sql,params){
    return new Promise((resolve,reject) => {
        pool.query(sql,params,(err,results,fields) => {
            if(err){
                reject(err);
            }else{
                resolve(results.affectedRows);
            }
        });
    });
};
BaseDao.insert = (sql,params) => {
    return new Promise((resolve,reject) => {
        pool.query(sql,params,(err,results,fields) => {
            if(err){
                reject(err);
            }else{
                resolve(results.insertId);
            }
        });
    });
};
BaseDao.delete = function(sql,params){
    return BaseDao.insert(sql,params);
};

BaseDao.del_flag = {
    SHOW : 1,
    HIDE : 0
};


module.exports = BaseDao;
module.exports.instance = new BaseDao();
module.exports.pool = pool;

