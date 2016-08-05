"use strict";
var baseDao = require('../../base_dao'),
    del_flag = baseDao.del_flag,
    dbHelper = require('../../../common/DBHelper'),
    systemUtils = require('../../../common/SystemUtils'),
    config = require('../../../config');

function ImageDao() {
    this.base_insert_sql = 'insert into ?? set ?';
    this.base_select_sql = 'select ?? from ?? where 1=1 and del_flag = ? ';
    this.base_update_sql = 'update ?? set ?';
}
/**
 * insert new image
 */
ImageDao.prototype.insertImage = function(req, params) {
    let columns = [config.tables.buss_image, systemUtils.assembleInsertObj(req, params, true)];
    return baseDao.select(this.base_insert_sql, columns);
};
/**
 * insert new dir 
 */
ImageDao.prototype.insertDir = function(req, params) {
    let columns = [config.tables.buss_directory, systemUtils.assembleInsertObj(req, params, true)];
    return baseDao.select(this.base_insert_sql, columns);
};
/**
 * update dir 
 */
ImageDao.prototype.updateDirById = function(req, params, id, connection) {
    let sql = this.base_update_sql + ' where id = ?';
    let columns = [config.tables.buss_directory, systemUtils.assembleUpdateObj(req, params, true), id];
    if (connection) {
        return baseDao.execWithConnection(connection, sql, columns);
    } else {
        return baseDao.select(sql, columns);
    }
};
/**
 * delete dir in transaction 
 */
ImageDao.prototype.deleteDir = function(req, ids) {
    let self = this;
    return baseDao.trans().then(connection => {
        let promises = ids.map(id => {
            let params = {
                del_flag: del_flag.HIDE
            };
            return self.updateDirById(req, params, id, connection);
        });
        return Promise.all(promises)
            .then(() => {
                return new Promise((resolve, reject) => {
                    connection.commit(err => {
                        connection.release();
                        if (err) return reject(err);
                        resolve();
                    });
                });
            }).catch(err => {
                return new Promise((resolve, reject) => {
                    connection.rollback(rollbackErr => {
                        connection.release();
                        if (rollbackErr) return reject(rollbackErr);
                        reject(err);
                    });
                });
            });;
    });
};
/**
 * delete dir in transaction 
 */
ImageDao.prototype.moveDir = function(req, ids, targetId) {
    let self = this;
    return baseDao.trans().then(connection => {
        let promises = ids.map(id => {
            let params = {
                parent_id: targetId
            };
            return self.updateDirById(req, params, id, connection);
        });
        return Promise.all(promises)
            .then(() => {
                return new Promise((resolve, reject) => {
                    connection.commit(err => {
                        connection.release();
                        if (err) return reject(err);
                        resolve();
                    });
                });
            }).catch(err => {
                return new Promise((resolve, reject) => {
                    connection.rollback(rollbackErr => {
                        connection.release();
                        if (rollbackErr) return reject(rollbackErr);
                        reject(err);
                    });
                });
            });;
    });
};

module.exports = ImageDao;