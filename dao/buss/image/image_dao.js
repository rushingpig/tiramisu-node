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
module.exports = ImageDao;