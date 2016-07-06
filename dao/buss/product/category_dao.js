'use strict';
var baseDao = require('../../base_dao'),
    del_flag = baseDao.del_flag,
    config = require('../../../config'),
    dbHelper = require('../../../common/DBHelper'),
    systemUtils = require('../../../common/SystemUtils'),
    TiramisuError = require('../../../error/tiramisu_error'),
    errorMessage = require('../../../util/res_obj'),
    async = require('async');

function CategoryDao() {
    this.base_table = config.tables.buss_product_category;
    this.baseColumns = ['id', 'name'];
    this.base_insert_sql = 'insert into ?? set ?';
    this.base_select_sql = 'select ?? from ?? where 1=1 and del_flag = ? ';
    this.base_update_sql = 'update ?? set ?';
    this.base_delete_sql = 'delete from ?? where ?';
}

// TODO:当前默认上线城市渠道是PC端，后期新增其他渠道需要修改代码

/**
 * insert primary category
 * parentId default to 0
 * no sort in buss_product_category_regionalism
 */
CategoryDao.prototype.insertPrimaryCategory = function(req, data) {
    const self = this;
    return baseDao.trans().then(connection => {
        return new Promise((resolve, reject) => {
            // insert category itself
            let params = {
                parent_id: 0,
                name: data.name,
                remarks: data.remarks,
                isAddition: data.isAddition
            };
            connection.query(
                self.base_insert_sql, [self.base_table, systemUtils.assembleInsertObj(req, params, true)],
                (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!results.insertId) {
                        return reject(new TiramisuError(errorMessage.FAIL));
                    }
                    return resolve(results.insertId);
                }
            );
        }).then(insertId => {
            return new Promise((resolve, reject) => {
                if (data.isAll) {
                    // get all active cities
                    let sql = 'select id from ?? where level_type = 2 and del_flag = ?';
                    connection.query(sql, [config.tables.dict_regionalism, del_flag.SHOW], (err, results) => {
                        if (err) {
                            return reject(err);
                        }
                        data.cities = results.map(result => {
                            return result.id;
                        });
                        return resolve(insertId);
                    });
                } else {
                    return resolve(insertId);
                }
            });
        }).then(insertId => {
            // insert category regions relationship
            let relations = data.cities.map(cityId => {
                return new Promise((resolve, reject) => {
                    let params = {
                        category_id: insertId,
                        regionalism_id: cityId
                    };
                    connection.query(
                        self.base_insert_sql, [config.tables.buss_product_category_regionalism, systemUtils.assembleInsertObj(req, params, true)],
                        (err) => {
                            if (err) {
                                return reject(err);
                            }
                            return resolve();
                        }
                    );
                })
            });
            return Promise.all(relations);
        }).then(() => {
            return new Promise((resolve, reject) => {
                connection.commit(err => {
                    connection.release();
                    if (err) return reject(err);
                    return resolve();
                });
            });
        }).catch(err => {
            return new Promise((resolve, reject) => {
                connection.rollback(rollbackErr => {
                    connection.release();
                    if (rollbackErr) return reject(rollbackErr);
                    return reject(err);
                });
            });
        });
    });
};

/**
 * insert secondary category
 */
CategoryDao.prototype.insertSecondaryCategory = function(req, data) {
    return baseDao.trans().then(connection => {
        return new Promise((resolve, reject) => {
            let params = {
                parent_id: data.parentId,
                name: data.name,
                remarks: data.remarks,
                isAddition: data.isAddition
            };
            connection.query(
                this.base_insert_sql, [this.base_table, systemUtils.assembleInsertObj(req, params, true)],
                (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!results.insertId) {
                        return reject(new TiramisuError(errorMessage.FAIL));
                    }
                    return resolve(results.insertId);
                }
            );
        }).then(insertId => {
            return new Promise((resolve, reject) => {
                if (data.isAll) {
                    // get all active cities depend on primary category
                    let sql = 'select regionalism_id as id from ?? where category_id = ? and del_flag = ?';
                    connection.query(sql, [config.tables.buss_product_category_regionalism, data.parentId, del_flag.SHOW], (err, results) => {
                        if (err) {
                            return reject(err);
                        }
                        data.cities = results.map(result => {
                            return result.id;
                        });
                        return resolve(insertId);
                    });
                } else {
                    return resolve(insertId);
                }
            });
        }).then(insertId => {
            // insert category regions relationship
            let relations = data.cities.map(cityId => {
                return new Promise((resolve, reject) => {
                    let params = {
                        category_id: insertId,
                        regionalism_id: cityId
                    };
                    connection.query(
                        this.base_insert_sql, [config.tables.buss_product_category_regionalism, systemUtils.assembleInsertObj(req, params, true)],
                        (err) => {
                            if (err) {
                                return reject(err);
                            }
                            return resolve();
                        }
                    );
                })
            });
            return Promise.all(relations);
        }).then(() => {
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
        });
    });
};

/**
 * update primary category by id
 */
CategoryDao.prototype.updatePrimaryCategory = function(req, data) {
    const self = this;
    return baseDao.trans().then(connection => {
        return new Promise((resolve, reject) => {
            if (!data.category) {
                return process.nextTick(() => {
                    resolve();
                });
            }
            // modify category itself
            connection.query(
                self.base_update_sql + 'where id = ?', [self.base_table, systemUtils.assembleUpdateObj(req, data.category, true), data.id],
                (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve();
                }
            );
        }).then(() => {
            // delete category region relationship
            let relations = data.cities_delete.map(cityId => {
                return new Promise((resolve, reject) => {
                    connection.query(
                        self.base_update_sql + 'where category_id = ? and regionalism_id = ?', [
                            config.tables.buss_product_category_regionalism,
                            systemUtils.assembleUpdateObj(req, {
                                del_flag: del_flag.HIDE
                            }, true),
                            data.id,
                            cityId
                        ],
                        (err) => {
                            if (err) {
                                return reject(err);
                            }
                            return resolve();
                        }
                    );
                }).then(() => {
                    // 删除一级分类后，需要关联删除二级分类相关的区域，继而触发器删除sku区域
                    return new Promise((resolve, reject) => {
                        let sql = 'update ?? set ? where category_id = (select id from ?? where parent_id = ?) and regionalism_id = ?';
                        let params = [
                            config.tables.buss_product_category_regionalism,
                            systemUtils.assembleUpdateObj(req, {
                                del_flag: del_flag.HIDE
                            }, true),
                            config.tables.buss_product_category,
                            data.id,
                            cityId
                        ];
                        connection.query(sql, params, err => {
                            if (err) {
                                return reject(err);
                            }
                            return resolve();
                        });
                    });
                });
            });
            return Promise.all(relations);
        }).then(() => {
            // insert category region relationship
            let relations = data.cities_add.map(cityId => {
                return new Promise((resolve, reject) => {
                    let params = {
                        category_id: data.id,
                        regionalism_id: cityId
                    };
                    connection.query(
                        self.base_insert_sql, [
                            config.tables.buss_product_category_regionalism,
                            systemUtils.assembleInsertObj(req, params, true)
                        ],
                        (err) => {
                            if (err) {
                                return reject(err);
                            }
                            return resolve();
                        }
                    );
                })
            });
            return Promise.all(relations);
        }).then(() => {
            return new Promise((resolve, reject) => {
                connection.commit(err => {
                    connection.release();
                    if (err) return reject(err);
                    return resolve();
                });
            });
        }).catch(err => {
            console.log(err);
            return new Promise((resolve, reject) => {
                connection.rollback(rollbackErr => {
                    connection.release();
                    if (rollbackErr) return reject(rollbackErr);
                    return reject(err);
                });
            });
        });
    });
};

/**
 * update secondary category by id
 */
CategoryDao.prototype.updateSecondaryCategory = function(req, data) {
    const self = this;
    return baseDao.trans().then(connection => {
        return new Promise((resolve, reject) => {
            if (!data.category) {
                return process.nextTick(() => {
                    resolve();
                });
            }
            // modify category itself
            connection.query(
                self.base_update_sql + 'where id = ?', [self.base_table, systemUtils.assembleUpdateObj(req, data.category, true), data.id],
                (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve();
                }
            );
        }).then(() => {
            // delete category region relationship
            let relations = data.cities_delete.map(cityId => {
                return new Promise((resolve, reject) => {
                    connection.query(
                        self.base_update_sql + 'where category_id = ? and regionalism_id = ?', [
                            config.tables.buss_product_category_regionalism,
                            systemUtils.assembleUpdateObj(req, {
                                del_flag: del_flag.HIDE
                            }, true),
                            data.id,
                            cityId
                        ],
                        (err) => {
                            if (err) {
                                return reject(err);
                            }
                            return resolve();
                        }
                    );
                })
            });
            return Promise.all(relations);
        }).then(() => {
            // insert category region relationship
            let relations = data.cities_add.map(cityId => {
                return new Promise((resolve, reject) => {
                    let params = {
                        category_id: data.id,
                        regionalism_id: cityId
                    };
                    connection.query(
                        self.base_insert_sql, [
                            config.tables.buss_product_category_regionalism,
                            systemUtils.assembleInsertObj(req, params, true)
                        ],
                        (err) => {
                            if (err) {
                                return reject(err);
                            }
                            return resolve();
                        }
                    );
                })
            });
            return Promise.all(relations);
        }).then(() => {
            return new Promise((resolve, reject) => {
                connection.commit(err => {
                    connection.release();
                    if (err) return reject(err);
                    return resolve();
                });
            });
        }).catch(err => {
            console.log(err);
            return new Promise((resolve, reject) => {
                connection.rollback(rollbackErr => {
                    connection.release();
                    if (rollbackErr) return reject(rollbackErr);
                    return reject(err);
                });
            });
        });
    });
};

/**
 * find categories by name
 */
CategoryDao.prototype.findCategoriesByName = function(data) {
    let columns = [
        'cate_a.id as primary_id',
        'cate_a.name as primary_name',
        'cate_b.id as secondary_id',
        'cate_b.name as secondary_name',
        'count(product.id) as count'
    ];
    let sql = 'select ' + columns.join(',') +
        ' from ?? cate_a join ?? cate_b on cate_a.id = cate_b.parent_id and cate_a.del_flag = ? and cate_b.del_flag = ? ' +
        ' join ?? product on cate_b.id = product.category_id and product.del_flag = ? ' +
        ' where cate_a.name like ? or cate_b.name like ? group by cate_a.id,cate_b.id';
    let table_product = config.tables.buss_product;
    let like_name = '%' + data.name + '%';
    let params = [
        this.base_table,
        this.base_table,
        del_flag.SHOW,
        del_flag.SHOW,
        table_product,
        del_flag.SHOW,
        like_name,
        like_name
    ];
    return baseDao.select(sql, params);
}

/**
 * get category remark by id
 */
CategoryDao.prototype.getCategoryRemarkById = function(data) {
    let sql = this.base_select_sql + 'and id = ? ';
    let params = ['remarks', this.base_table, del_flag.SHOW, data.id];
    return baseDao.select(sql, params);
}

/**
 * get category regions by id
 */
CategoryDao.prototype.getCategoryRegionsById = function(data) {
    let sql = 'select city_regions.id as city_id,city_regions.parent_id as province_id ' +
        'from ?? cate_region join ?? city_regions on cate_region.regionalism_id = city_regions.id ' +
        'where cate_region.del_flag = ? and cate_region.category_id = ?';
    let params = [config.tables.buss_product_category_regionalism, config.tables.dict_regionalism, del_flag.SHOW, data.id];
    return baseDao.select(sql, params);
}

/**
 * find categories list by multiple condition
 */
CategoryDao.prototype.findCategoriesList = function(data) {

    let columns = [
        'count(product.id) as count',
        'cate_primary.id as primary_id',
        'cate_primary.name as primary_name',
        'cate_secondary.id as secondary_id',
        'cate_secondary.name as secondary_name',
    ];

    let select_sql = ' from ?? cate_primary join ?? cate_secondary on cate_primary.id = cate_secondary.parent_id and cate_primary.del_flag = ? and cate_secondary.del_flag = ? ' +
        ' left join ?? product on cate_secondary.id = product.category_id and product.del_flag = ? ';
    let select_params = [
        'buss_product_category',
        'buss_product_category',
        del_flag.SHOW,
        del_flag.SHOW,
        'buss_product',
        del_flag.SHOW
    ];

    let where_sql = ' where 1 = 1 ';
    let where_params = [];

    let group_sql = ' group by cate_primary.id,cate_secondary.id ';

    // primary_id、secondary_id两个参数，要求只能传一个或者都不传
    if (data.primary_id) {
        where_sql += ' and cate_primary.id = ? ';
        where_params.push(data.primary_id);
    }
    if (data.secondary_id) {
        where_sql += ' and cate_secondary.id = ? ';
        where_params.push(data.secondary_id);
    }

    // province_id、city_id两个参数，要求只能传一个或者都不传
    if (data.city_id) {
        // 当存在city_id，需要对结果进行排序
        // 需要根据一级分类进行排序
        select_sql += ' join ?? cate_regions_primary on cate_primary.id = cate_regions_primary.category_id and cate_regions_primary.regionalism_id = ? and cate_regions_primary.del_flag = ? ';
        select_params.push('buss_product_category_regionalism');
        select_params.push(data.city_id);
        select_params.push(del_flag.SHOW);
        columns.push('cate_regions_primary.sort as primary_sort');
        // 需要根据二级分类进行排序
        select_sql += ' join ?? cate_regions_secondary on cate_secondary.id = cate_regions_secondary.category_id and cate_regions_secondary.regionalism_id = ? and cate_regions_secondary.del_flag = ? ';
        select_params.push('buss_product_category_regionalism');
        select_params.push(data.city_id);
        select_params.push(del_flag.SHOW);
        columns.push('cate_regions_secondary.sort as secondary_sort');
    }
    if (data.province_id) {
        select_sql += ' join ?? cate_regions on cate_secondary.id = cate_regions.category_id and cate_regions.del_flag = ? ';
        select_params.push('buss_product_category_regionalism');
        select_params.push(del_flag.SHOW);
        select_sql += 'join ?? dict on cate_regions.regionalism_id = dict.id and dict.del_flag = ? and dict.parent_id = ? ';
        select_params.push('dict_regionalism');
        select_params.push(del_flag.SHOW);
        select_params.push(data.province_id);
    }

    let sql = 'select ' + columns.join(',') + select_sql + where_sql + group_sql;
    let params = select_params.concat(where_params);
    console.log(sql);
    console.log(params);
    return baseDao.select(sql, params);
}

/**
 * find categories by primary category id
 */
CategoryDao.prototype.findSecondaryCategoriesByPrimaryCategoryId = function(req, data) {
    let columns = [
        'cate.id as id',
        'cate.name as name'
    ];
    let sql = 'select ' + columns.join(',') + ' from ?? cate where parent_id = ? and del_flag = ? ';
    let params = [this.base_table, data.id, del_flag.SHOW];
    return baseDao.select(sql, params);
}

/**
 * get category info by id
 */
CategoryDao.prototype.getCategoryById = function(data) {
    let columns = [
        'name',
        'parent_id',
        'remarks',
        'isAddition'
    ];
    let sql = 'select ' + columns.join(',') + ' from ?? where id = ? and del_flag = ? ';
    let params = [this.base_table, data.id, del_flag.SHOW];
    return baseDao.select(sql, params);
}

/**
 * update sort by category id and regionalism id
 */
CategoryDao.prototype.updateSort = function(req, data) {
    let sql = this.base_update_sql + ' where regionalism_id = ? and category_id = ?';
    return baseDao.trans().then(connection => {
        let promises = data.map(item => {
            let params = [config.tables.buss_product_category_regionalism, systemUtils.assembleUpdateObj(req, {
                sort: item.sort
            }, true), item.regionalism_id, item.category_id];
            return baseDao.select(sql, params);
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
            });
    });
}

/*
 * 根据delete_category删除分类，并移动分类下产品到new_category分类下
 */
CategoryDao.prototype.deleteCategoryById = function(req, delete_category, new_category) {
    return baseDao.trans().then(connection => {
        // 移动sku到new_category分类下
        let sql = this.base_update_sql + ' where category_id = ?';
        let params = [config.tables.buss_product, systemUtils.assembleUpdateObj(req, {category_id: new_category}, true), delete_category];
        return baseDao.execWithConnection(connection, sql, params)
            .then(() => {
                let sql = this.base_update_sql + ' where id = ?';
                let params = [config.tables.buss_product_category, systemUtils.assembleUpdateObj(req, {del_flag: del_flag.HIDE}, true), delete_category];
                return baseDao.execWithConnection(connection, sql, params)
            })
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
            });
    });
}

module.exports = CategoryDao;