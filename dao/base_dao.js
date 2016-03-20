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
var pool = mysql.createPool(config.mysql_options),
    queues = require('mysql-queues');

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
    return BaseDao.insert(sql, params);
};
/**
 * example:
 * <b>
 *BaseDao.transaction().then((trans)=> {
    trans.query("insert into table1 values(null,'zzl1')", null, function (err1, info1) {
        if (err1) {
            trans.rollback();
        } else {
            trans.query("insert into table2 values(null,'zzl2')", null, function (err2, info2) {
                if (err2) {
                    trans.rollback();
                } else {
                    trans.commit();
                }
            });
            console.log('.................end..................');
        }
    });
}, (error)=> {
    console.log(error);
});
 *
 * </b>
 * @returns {Promise}
 */
BaseDao.voidTrans = function (sqls,params) {

    return new Promise((resolve, reject)=> {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
            } else {
                queues(connection, config.mysql_options.debug);
                let trans = connection.startTransaction();
                let cb = function(err,results){
                    if(err && trans.rollback){
                        trans.rollback();
                        reject(err);
                    }
                };

                if(!(Array.isArray(sqls) && Array.isArray(params))){
                    reject(new Error('the parameters must all be instance of Array...'));
                }
                if(sqls.length !== params.length){
                    reject(new Error('the arguments\'s length should be the same...'));
                }
                for(let i = 0;i < sqls.length;i++){
                    trans.query(sqls[i],params[i],cb);
                }
                trans.commit();
                connection.release();
                resolve();
            }
        });
    });
};
/**
 * if the the sql you want to execute need results
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

BaseDao.del_flag = {
    SHOW: 1,
    HIDE: 0
};

module.exports = BaseDao;
module.exports.instance = new BaseDao();
module.exports.pool = pool;

