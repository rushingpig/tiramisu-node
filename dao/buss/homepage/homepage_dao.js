"use strict";
var baseDao = require('../../base_dao'),
    del_flag = baseDao.del_flag,
    dbHelper = require('../../../common/DBHelper'),
    systemUtils = require('../../../common/SystemUtils'),
    config = require('../../../config');

function HomepageDao() {
    this.base_table = 'buss_homepage';
    this.base_insert_sql = 'insert into ?? set ?';
    this.base_select_sql = 'select ?? from ?? where 1=1 and del_flag = ? ';
    this.base_update_sql = 'update ?? set ?';
}

HomepageDao.prototype.deleteHomepageByRegionalisId = function (req, regionalism_id, connection) {
    let sql = this.base_update_sql + ' where regionalism_id = ?';
    let params = {del_flag: del_flag.HIDE};
    let columns = [this.base_table, systemUtils.assembleUpdateObj(req, params, true), regionalism_id];
    if (connection) {
        return baseDao.execWithConnection(connection, sql, columns);
    } else {
        return baseDao.select(sql, columns);
    }
}

HomepageDao.prototype.addHomepage = function (req, data, connection) {
    let sql = this.base_insert_sql;
    let columns = [this.base_table, systemUtils.assembleInsertObj(req, data, true)];
    if (connection) {
        return baseDao.execWithConnection(connection, sql, columns);
    } else {
        return baseDao.select(sql, columns);
    }
}

/**
 * modify homepage info 
 */
HomepageDao.prototype.modifyHomepage = function(req, data) {
    let self = this;
    return baseDao.trans().then(connection => {
        let promises = data.map(item => {
            // 删除原有城市的首页数据
            let delete_promises = item.regionalism_ids.map(regionalism_id => {
                return self.deleteHomepageByRegionalisId(req, regionalism_id, connection);
            });
            // 新增城市首页数据
            let add_promises = [];
            item.regionalism_ids.map(regionalism_id => {
                item.datas.forEach(data => {
                    data.regionalism_id = regionalism_id;
                    add_promises.push(self.addHomepage(req, data, connection));
                })
            });
            return Promise.all(delete_promises).then(() => {
                return Promise.all(add_promises);
            });
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
 * find homepage info by regionalism_id 
 */
HomepageDao.prototype.findHomepageInfoByRegionId = function(regionalism_id) {
    let sql = this.base_select_sql + ' and regionalism_id = ?';
    let columns = ['src', 'url'];
    let params = [columns, this.base_table, del_flag.SHOW, regionalism_id];
    return baseDao.select(sql, params);
};

module.exports = HomepageDao;