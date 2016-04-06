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
var _ = require('lodash');
var toolUtils = require('../common/ToolUtils');
var constant = require('../common/Constant');

function BaseDao() {
    pool.on('connecton', function () {
        pool.query('SET SESSION auto_increment_increment = 1');
        console.log('﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀﹀');
        console.log('=== the pool is establishing connection ===');
        console.log('︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿︿');
    });
    pool.on('enqueue', function () {
        console.log('Waiting for available connection slot');
    });
}
/**
 *
 * @param sql
 * @param params
 * @returns {Promise}
 */
BaseDao.select = function (sql, params) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results, fields) => {
            if (err) {
                reject(err);
            } else {
                resolve(results, fields);
            }
        });
    });
};
/**
 *
 * @param sql
 * @param params
 * @returns {Promise}
 */
BaseDao.update = function (sql, params) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results, fields) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.affectedRows);
            }
        });
    });
};
/**
 *
 * @param sql
 * @param params
 * @param noInsertId
 * @returns {Promise}
 */
BaseDao.insert = (sql, params,noInsertId) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results, fields) => {
            if (err) {
                reject(err);
            } else {
                if(noInsertId){
                    resolve(results.affectedRows);
                }else{
                    resolve(results.insertId);
                }
            }
        });
    });
};
/**
 * example:
 * <li>let sql = "insert into table_name(column1,column2) values ?"</li>
 * <li>let params = [['foo1','bar1'],['foo2','bar2']] ===> ('foo1','bar1'),('foo2','bar2')</li>
 * @param sql
 * @param params
 * @returns {Promise}
 */
BaseDao.batchInsert = (sql, params) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results, fields) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.affectedRows);
            }
        });
    });
};
BaseDao.delete = function (sql, params) {
    return BaseDao.insert(sql, params,true);
};

/**
 * Start a transaction promise, which resolve(connection) for use
 * Remember to commit/rollback and release the connection
 * @returns {Promise}
 */
BaseDao.trans = function(){
    return new Promise((resolve,reject)=>{
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
            } else {
              connection.beginTransaction(err => {
                if (err) {
                  connection.release();
                  return reject(err);
                }
                resolve(connection);
              });
            }
        });
    });
};

BaseDao.transWrapPromise = function (transaction) {
    transaction.queryPromise = function (sql, params) {
        console.log(sql);
        console.log(params);
        return new Promise((resolve, reject)=> {
            transaction.query(sql, params, function (err) {
                if (err) reject(err);
                else resolve.apply(this, _.drop(arguments));
            });
        });
    };
    transaction.commitPromise = function () {
        return new Promise((resolve, reject)=> {
            transaction.commit(err=> {
                transaction.release();
                if (err) reject(err);
                else resolve();
            });
        });
    };
    transaction.rollbackPromise = function () {
        return new Promise((resolve, reject)=> {
            transaction.rollback(err=> {
                transaction.release();
                if (err) reject(err);
                else resolve();
            });
        });
    }
};

BaseDao.del_flag = {
    SHOW: 1,
    HIDE: 0
};
BaseDao.is_usable = {
    enable : 1,
    disable : 0
};

module.exports = BaseDao;
module.exports.instance = new BaseDao();
module.exports.pool = pool;

