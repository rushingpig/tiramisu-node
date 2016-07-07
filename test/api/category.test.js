'use strict';
var assert = require('chai').assert;
var should = require('should');
var request = require('supertest');
var mysql = require('mysql');
var config = require('../../config');
var pool = mysql.createPool(config.mysql_options);
var async = require('async');

const agent = request.agent(require('../../app'));

module.exports = function() {

    describe('test for category module', function() {

        before(function(done) {
            agent.post('/v1/a/login')
                .type('application/json')
                .send({
                    username: 'admin',
                    password: '123'
                })
                .end((err, res) => {
                    assert.strictEqual(res.body.code, '0000');
                    assert.strictEqual(res.statusCode, 200);
                    done();
                });
        });

        describe('POST /v1/a/product/categories/primary', function () {
            it('add a new primary category', function (done) {
                agent
                    .post('/v1/a/product/categories/primary')
                    .type('application/json')
                    .send({
                        name: '幸福蛋糕1',
                        remarks: '全国通用1',
                        isAddition: 0,
                        cities: [440300, 441300]
                    })
                    .end((err, res) => {
                        assert.strictEqual(res.body.code, '0000');
                        assert.strictEqual(res.statusCode, 200);
                        let cate_sql = 'select id from buss_product_category ' +
                            'where name = \'幸福蛋糕1\' and remarks = \'全国通用1\' and isAddition = 0';
                        pool.query(cate_sql, (err, result) => {
                            assert.equal(result.length, 1, 'no result of primary category');
                            let id = result[0].id;
                            let cate_region_sql = 'select count(1) \'count\' from buss_product_category_regionalism where category_id = ' + id;
                            assert.isNotNull(id, "there was no id");
                            pool.query(cate_region_sql, (err, result) => {
                                assert.strictEqual(result[0].count, 2);
                                done();
                            });
                        });
                    });
            });
            it('add a new primary category bind with all cities', function (done) {
                agent
                    .post('/v1/a/product/categories/primary')
                    .type('application/json')
                    .send({
                        name: '测试所有城市1',
                        remarks: '所有城市通用1',
                        isAddition: 0,
                        isAll: 1
                    })
                    .end((err, res) => {
                        console.log(res.body);
                        assert.strictEqual(res.body.code, '0000');
                        assert.strictEqual(res.statusCode, 200);
                        let cate_sql = 'select id from buss_product_category ' +
                            'where name = \'测试所有城市1\' and remarks = \'所有城市通用1\' and isAddition = 0';
                        pool.query(cate_sql, (err, result) => {
                            assert.equal(result.length, 1, 'no result of primary category');
                            let id = result[0].id;
                            assert.isNotNull(id, "can not get primary category id");
                            let cate_region_sql = 'select count(1) as count from buss_product_category_regionalism where category_id = ' + id;
                            pool.query(cate_region_sql, (err, result) => {
                                let cate_region_count = result[0].count;
                                let all_cities_sql = 'select count(1) as count from dict_regionalism where level_type = 2 and del_flag = 1';
                                pool.query(all_cities_sql, (err, result) => {
                                    let all_cities_count = result[0].count;
                                    assert.equal(cate_region_count, all_cities_count);
                                    done();
                                });
                            });
                        });
                    });
            });
            it('add primary category with wrong isAddition', function (done) {
                agent
                    .post('/v1/a/product/categories/primary')
                    .type('application/json')
                    .send({
                        name: '幸福蛋糕1',
                        remarks: '全国通用1',
                        isAddition: false,
                        cities: [440300, 441300]
                    })
                    .end((err, res) => {
                        assert.strictEqual(res.body.code, '9997');
                        assert.strictEqual(res.body.msg, '非法请求参数...');
                        assert.strictEqual(res.statusCode, 200);
                        done();
                    });
            });
        });

        describe('POST /v1/a/product/categories/secondary', function () {
            let parentId = 10;
            before(function (done) {
                let promises = [440500, 440600].map(function (id) {
                    return new Promise(function (resolve, reject) {
                        let sql = 'insert into buss_product_category_regionalism(category_id,regionalism_id) values('+ parentId + ',' + id + ')';
                        pool.query(sql, function (err, result) {
                            if (err) {
                                return reject(err);
                            }
                            return resolve();
                        });
                    });
                });
                Promise.all(promises).then(() => done());
            });
            it('add a new secondary category', function (done) {
                agent
                    .post('/v1/a/product/categories/secondary')
                    .type('application/json')
                    .send({
                        name: '幸福蛋糕2',
                        parentId: parentId,
                        remarks: '全国通用2',
                        isAddition: 0,
                        cities: [440300, 441300]
                    })
                    .end((err, res) => {
                        assert.strictEqual(res.body.code, '0000');
                        assert.strictEqual(res.statusCode, 200);
                        let cate_sql = 'select id from buss_product_category ' +
                            'where name = \'幸福蛋糕2\' and remarks = \'全国通用2\' and isAddition = 0 and parent_id = 10';
                        pool.query(cate_sql, (err, result) => {
                            assert.equal(result.length, 1, 'no result of secondary category');
                            let id = result[0].id;
                            let cate_region_sql = 'select count(1) \'count\' from buss_product_category_regionalism where category_id = ' + id;
                            assert.isNotNull(id, "there was no id");
                            pool.query(cate_region_sql, (err, result) => {
                                assert.strictEqual(result[0].count, 2);
                                done();
                            });
                        });
                    });
            });
            it('add a new secondary category bind with all cities', function (done) {
                agent
                    .post('/v1/a/product/categories/secondary')
                    .type('application/json')
                    .send({
                        parentId: parentId,
                        name: '测试所有城市2',
                        remarks: '所有城市通用2',
                        isAddition: 0,
                        isAll: 1
                    })
                    .end((err, res) => {
                        console.log(res.body);
                        assert.strictEqual(res.body.code, '0000');
                        assert.strictEqual(res.statusCode, 200);
                        let cate_sql = 'select id from buss_product_category ' +
                            'where name = \'测试所有城市2\' and remarks = \'所有城市通用2\' and isAddition = 0';
                        pool.query(cate_sql, (err, result) => {
                            assert.equal(result.length, 1, 'no result of secondary category');
                            let id = result[0].id;
                            assert.isNotNull(id, "can not get secondary category id");
                            let cate_region_sql = 'select count(1) as count from buss_product_category_regionalism where category_id = ' + id;
                            pool.query(cate_region_sql, (err, result) => {
                                let cate_region_count = result[0].count;
                                let all_cities_sql = 'select count(1) as count from buss_product_category_regionalism where category_id = ' + parentId + ' and del_flag = 1';
                                pool.query(all_cities_sql, (err, result) => {
                                    let all_cities_count = result[0].count;
                                    assert.equal(cate_region_count, all_cities_count);
                                    done();
                                });
                            });
                        });
                    });
            });
        });

        describe('GET /v1/a/product/categories/name', function () {

            before(function (done) {
                let sql = 'insert into buss_product_category(parent_id,name) values(1,\'蛋糕测试\')';
                pool.query(sql, function (err, result) {
                    if (err) {
                        return done(err);
                    }
                    let id = result.insertId;
                    let sql = 'insert into buss_product(name,category_id) values(\'产品1\',' + id + ')';
                    pool.query(sql, done);
                });
            });
            it('get categories list by name', function (done) {
                const name = '蛋糕';
                agent
                    .get('/v1/a/product/categories/name?name=' + name)
                    .type('application/json')
                    .end((err, res) => {
                        assert.strictEqual(res.body.code, '0000');
                        assert.strictEqual(res.statusCode, 200);
                        assert.isArray(res.body.data);
                        done();
                    });
            });
        });

        describe('GET /v1/a/product/category/:id/remarks', function () {

            let id;
            before(function (done) {
                let sql = 'insert into buss_product_category(parent_id,name,remarks) values(1,\'备注测试\',\'here is remarks\')';
                pool.query(sql, function (err, result) {
                    if (err) {
                        return done(err);
                    }
                    id = result.insertId;
                    done();
                });
            });
            it('get category remarks by category id', function (done) {
                agent
                    .get('/v1/a/product/category/' + id + '/remarks')
                    .type('application/json')
                    .end((err, res) => {
                        assert.strictEqual(res.body.code, '0000');
                        assert.strictEqual(res.statusCode, 200);
                        assert.isNotNull(res.body.data.remarks);
                        done();
                    });
            });
        });

        describe('GET /v1/a/product/category/:id/regions/pc', function () {

            let id;
            before(function (done) {
                let sql = 'insert into buss_product_category_regionalism(category_id,regionalism_id) values(10,440300)';
                pool.query(sql, function (err, result) {
                    if (err) {
                        return done(err);
                    }
                    id = result.insertId;
                    done();
                });
            });
            it('get category regions for pc by category id', function (done) {
                agent
                    .get('/v1/a/product/category/10/regions/pc')
                    .type('application/json')
                    .end((err, res) => {
                        assert.strictEqual(res.body.code, '0000');
                        assert.strictEqual(res.statusCode, 200);
                        assert.isArray(res.body.data);
                        done();
                    });
            });
        });

        describe('GET /v1/a/product/categories/search', function() {

            let primary_id;
            let secondary_ids = [];
            let product_id;
            before(function(done) {
                new Promise(function(resolve, reject) {
                    let sql = 'insert into buss_product_category(parent_id,name) values(0,\'搜索测试一级分类1\')';
                    pool.query(sql, function(err, result) {
                        if (err) {
                            return reject(err);
                        }
                        primary_id = result.insertId;
                        return resolve(result.insertId);
                    });
                }).then(function(insertId) {
                    let sqls = [
                        'insert into buss_product_category(parent_id,name) values(' + insertId + ',\'搜索测试二级分类1\')',
                        'insert into buss_product_category(parent_id,name) values(' + insertId + ',\'搜索测试二级分类2\')'
                    ];
                    let promises = sqls.map(function(sql, index) {
                        return new Promise(function(resolve, reject) {
                            pool.query(sql, function(err, result) {
                                if (err) {
                                    return reject(err);
                                }
                                secondary_ids[index] = result.insertId;
                                return resolve();
                            });
                        });
                    });
                    return Promise.all(promises);
                }).then(function() {
                    let sql = 'insert into buss_product(name,category_id) values(\'分类产品1\',' + secondary_ids[0] + ')';
                    return new Promise(function(resolve, reject) {
                        pool.query(sql, function(err, result) {
                            if (err) {
                                return reject(err);
                            }
                            product_id = result.insertId;
                            return resolve();
                        });
                    });
                }).then(function() {
                    let sql = 'insert into buss_product_category_regionalism(category_id,regionalism_id,sort) values(' + primary_id + ',440300,1)';
                    return new Promise(function(resolve, reject) {
                        pool.query(sql, function(err, result) {
                            if (err) {
                                return reject(err);
                            }
                            return resolve();
                        });
                    });
                }).then(function() {
                    let promises = secondary_ids.map(function(id, index) {
                        let sql = 'insert into buss_product_category_regionalism(category_id,regionalism_id,sort) values(' + id + ',440300,' + index + ')';
                        return new Promise(function(resolve, reject) {
                            pool.query(sql, function(err, result) {
                                if (err) {
                                    return reject(err);
                                }
                                return resolve();
                            });
                        });
                    });
                    return Promise.all(promises);
                }).then(function (){
                    return new Promise((resolve, reject) => {
                        let sql = 'insert into buss_product_sku(product_id,size,website,regionalism_id,price,original_price,book_time) ' + 'values(' + product_id + ',\'搜索测试sku\',1,440300,200,100,3)';
                        pool.query(sql, function(err, result) {
                            if (err) {
                                return reject(err);
                            }
                            resolve(result.insertId);
                        });
                    });
                })
                .then(function() {
                    done();
                }).catch(function(err) {
                    done(err);
                });
            });

            it('search category list by multiple condition', function(done) {
                let query = '?secondary_id=' + secondary_ids[0] + '&city_id=440300';
                agent
                    .get('/v1/a/product/categories/search' + query)
                    .type('application/json')
                    .end((err, res) => {
                        assert.strictEqual(res.body.code, '0000');
                        assert.strictEqual(res.statusCode, 200);
                        let expect_data = [{
                            "count": 1,
                            "primary_id": primary_id,
                            "primary_name": "搜索测试一级分类1",
                            "primary_sort": 1,
                            "secondary_id": secondary_ids[0],
                            "secondary_name": "搜索测试二级分类1",
                            "secondary_sort": 0
                        }];
                        assert.deepEqual(res.body.data, expect_data);
                        done();
                    });
            });

            it('search category list by secondary_id', function(done) {
                let query = '?primary_id=' + primary_id;
                agent
                    .get('/v1/a/product/categories/search' + query)
                    .type('application/json')
                    .end((err, res) => {
                        assert.strictEqual(res.body.code, '0000');
                        assert.strictEqual(res.statusCode, 200);
                        let expect_data_1 = {
                            "count": 1,
                            "primary_id": primary_id,
                            "primary_name": "搜索测试一级分类1",
                            "secondary_id": secondary_ids[0],
                            "secondary_name": "搜索测试二级分类1"
                        };
                        let expect_data_2 = {
                            "count": 0,
                            "primary_id": primary_id,
                            "primary_name": "搜索测试一级分类1",
                            "secondary_id": secondary_ids[1],
                            "secondary_name": "搜索测试二级分类2"
                        };
                        res.body.data.should.containEql(expect_data_1);
                        res.body.data.should.containEql(expect_data_2);
                        done();
                    });
            });
        });
        
        describe('PUT /v1/a/product/category/primary', function () {
            
            let id,secondary_id,product_id;
            before(function (done) {
                new Promise(function (resolve, reject) {
                    let sql = 'insert into buss_product_category(parent_id,name,remarks) values(0,\'修改一级分类测试\',\'备注\')';
                    pool.query(sql, function (err, result) {
                        if (err) {
                            return reject(err);
                        }
                        id = result.insertId;
                        return resolve(result.insertId);
                    });
                }).then(() => {
                    return new Promise(function (resolve, reject) {
                        let sql = 'insert into buss_product_category(parent_id,name,remarks) values(' + id + ',\'修改一级分类测试子分类1\',\'备注\')';
                        pool.query(sql, function (err, result) {
                            if (err) {
                                return reject(err);
                            }
                            secondary_id = result.insertId;
                            return resolve(result.insertId);
                        });
                    });
                }).then(() => {
                    var promises = ['440300','441300'].map(function (city_id) {
                        return new Promise(function (resolve, reject) {
                            let sql = 'insert into buss_product_category_regionalism(category_id,regionalism_id) values(' + id + ',' + city_id + ')';
                            pool.query(sql, function (err, result) {
                                if (err) {
                                    return reject(err);
                                }
                                return resolve(result.insertId);
                            });
                        });
                    });
                    return Promise.all(promises);
                }).then(() => {
                    var promises = ['441300'].map(function (city_id) {
                        return new Promise(function (resolve, reject) {
                            let sql = 'insert into buss_product_category_regionalism(category_id,regionalism_id) values(' + secondary_id + ',' + city_id + ')';
                            pool.query(sql, function (err, result) {
                                if (err) {
                                    return reject(err);
                                }
                                return resolve(result.insertId);
                            });
                        });
                    });
                    return Promise.all(promises);
                }).then(() => {
                    return new Promise(function (resolve, reject) {
                        let sql = 'insert into buss_product(name,category_id) values(\'修改一级分类产品1\',' + secondary_id + ')';
                        pool.query(sql, function (err, result) {
                            if (err) {
                                return reject(err);
                            }
                            product_id = result.insertId;
                            return resolve(result.insertId);
                        });
                    });
                }).then(() => {
                    return new Promise((resolve, reject) => {
                        let sql = 'insert into buss_product_sku(product_id,size,website,regionalism_id,price,original_price,book_time) ' + 'values(' + product_id + ',\'修改一级分类sku\',1,441300,200,100,3)';
                        pool.query(sql, function(err, result) {
                            if (err) {
                                return reject(err);
                            }
                            resolve(result.insertId);
                        });
                    });
                }).then(function () {
                    done();
                }).catch(function (err) {
                    done(err);
                });
            });
            it('modify primary category info by category id', function (done) {
                let modify_name = '修改后的一级分类测试';
                let modify_remarks = '修改后的备注';
                let req_body = {
                    id: id,
                    name: modify_name,
                    remarks: modify_remarks
                };
                agent
                    .put('/v1/a/product/category/primary')
                    .type('application/json')
                    .send(req_body)
                    .end((err, res) => {
                        assert.strictEqual(res.body.code, '0000');
                        assert.strictEqual(res.statusCode, 200);
                        let sql = 'select * from buss_product_category where id = ' + id;
                        pool.query(sql, function (err, result) {
                            if (err) {
                                done(err);
                            }
                            assert.equal(result.length, 1);
                            assert.equal(result[0].name, modify_name);
                            assert.equal(result[0].remarks, modify_remarks);
                            done();
                        });
                    });
            });
            it('modify primary category region relationship by category id', function (done) {
                let req_body = {
                    id: id,
                    cities_add: [440100,441900],
                    cities_delete: [441300]
                };
                agent
                    .put('/v1/a/product/category/primary')
                    .type('application/json')
                    .send(req_body)
                    .end((err, res) => {
                        assert.strictEqual(res.body.code, '0000');
                        assert.strictEqual(res.statusCode, 200);
                        let sql = 'select regionalism_id from buss_product_category_regionalism where del_flag = 1 and category_id = ' + id;
                        pool.query(sql, function (err, result) {
                            if (err) {
                                done(err);
                            }
                            assert.equal(result.length, 3);
                            assert.deepEqual(result, [{regionalism_id:440300},{regionalism_id:440100},{regionalism_id:441900}]);
                            let sql = 'select count(1) as num from buss_product_sku where product_id = ' + product_id + ' and regionalism_id = 441300 and del_flag = 0';
                            pool.query(sql, function (err, result) {
                                if (err) {
                                    done(err);
                                }
                                assert.equal(result[0].num, 1);
                                done();
                            });
                        });
                    });
            });
        });
        
        describe('PUT /v1/a/product/category/secondary', function () {
            
            let id,product_id;
            before(function (done) {
                new Promise(function (resolve, reject) {
                    let sql = 'insert into buss_product_category(parent_id,name,remarks) values(1,\'修改二级分类测试\',\'备注\')';
                    pool.query(sql, function (err, result) {
                        if (err) {
                            return reject(err);
                        }
                        id = result.insertId;
                        return resolve(result.insertId);
                    });
                }).then(function (id) {
                    var promises = ['340300','341300'].map(function (city_id) {
                        return new Promise(function (resolve, reject) {
                            let sql = 'insert into buss_product_category_regionalism(category_id,regionalism_id) values(' + id + ',' + city_id + ')';
                            pool.query(sql, function (err, result) {
                                if (err) {
                                    return reject(err);
                                }
                                return resolve(result.insertId);
                            });
                        });
                    });
                    return Promise.all(promises);
                }).then(() => {
                    return new Promise(function (resolve, reject) {
                        let sql = 'insert into buss_product(name,category_id) values(\'修改一级分类产品1\',' + id + ')';
                        pool.query(sql, function (err, result) {
                            if (err) {
                                return reject(err);
                            }
                            product_id = result.insertId;
                            return resolve(result.insertId);
                        });
                    });
                }).then(() => {
                    return new Promise((resolve, reject) => {
                        let sql = 'insert into buss_product_sku(product_id,size,website,regionalism_id,price,original_price,book_time) ' + 'values(' + product_id + ',\'修改一级分类sku\',1,341300,200,100,3)';
                        pool.query(sql, function(err, result) {
                            if (err) {
                                return reject(err);
                            }
                            resolve(result.insertId);
                        });
                    });
                }).then(function () {
                    done();
                }).catch(function (err) {
                    done(err);
                });
            });
            it('modify secondary category info by category id', function (done) {
                let modify_name = '修改后的二级分类测试';
                let modify_remarks = '修改后的备注';
                let req_body = {
                    id: id,
                    name: modify_name,
                    remarks: modify_remarks
                };
                agent
                    .put('/v1/a/product/category/secondary')
                    .type('application/json')
                    .send(req_body)
                    .end((err, res) => {
                        assert.strictEqual(res.body.code, '0000');
                        assert.strictEqual(res.statusCode, 200);
                        let sql = 'select * from buss_product_category where id = ' + id;
                        pool.query(sql, function (err, result) {
                            if (err) {
                                done(err);
                            }
                            assert.equal(result.length, 1);
                            assert.equal(result[0].name, modify_name);
                            assert.equal(result[0].remarks, modify_remarks);
                            done();
                        });
                    });
            });
            it('modify secondary category region relationship by category id', function (done) {
                let req_body = {
                    id: id,
                    cities_add: [340100,341900],
                    cities_delete: [341300]
                };
                agent
                    .put('/v1/a/product/category/primary')
                    .type('application/json')
                    .send(req_body)
                    .end((err, res) => {
                        assert.strictEqual(res.body.code, '0000');
                        assert.strictEqual(res.statusCode, 200);
                        let sql = 'select regionalism_id from buss_product_category_regionalism where del_flag = 1 and category_id = ' + id;
                        pool.query(sql, function (err, result) {
                            if (err) {
                                done(err);
                            }
                            assert.equal(result.length, 3);
                            assert.deepEqual(result, [{regionalism_id:340300},{regionalism_id:340100},{regionalism_id:341900}]);
                            let sql = 'select count(1) as num from buss_product_sku where product_id = ' + product_id + ' and regionalism_id = 341300 and del_flag = 0';
                            pool.query(sql, function (err, result) {
                                if (err) {
                                    done(err);
                                }
                                assert.equal(result[0].num, 1);
                                done();
                            });
                        });
                    });
            });
        });
        
        describe('GET /v1/a/product/category/:id/details', function () {
            
            let primary_id;
            before(function (done) {
                new Promise(function (resolve, reject) {
                    let sql = 'insert into buss_product_category(parent_id,name,remarks,isAddition) values(1,\'分类详情测试\',\'remarks\',0)';
                    pool.query(sql, function (err,result) {
                        if (err) {
                            return reject(err);
                        }
                        primary_id = result.insertId;
                        return resolve();
                    });
                }).then(function () {
                    let promises = ['440300','441300'].map(function (id, index) {
                        let sql = 'insert into buss_product_category_regionalism(category_id,regionalism_id) values(' + primary_id + ',' + id + ')';
                        return new Promise(function (resolve,reject) {
                            pool.query(sql, function (err, result) {
                                if (err) {
                                    return reject(err);
                                }
                                return resolve();
                            });
                        });
                    });
                    return Promise.all(promises);
                }).then(function () {
                    done();
                }).catch(function (err) {
                    done(err);
                });
            });
            
            it('get category details by id', function (done) {
                agent
                    .get('/v1/a/product/category/' + primary_id + '/details')
                    .type('application/json')
                    .end((err, res) => {
                        assert.strictEqual(res.body.code, '0000');
                        assert.strictEqual(res.statusCode, 200);
                        let expect_data = {
                            category: {
                                name: '分类详情测试',
                                parent_id: 1,
                                remarks: 'remarks',
                                isAddition: 0
                            },
                            regions: [{
                                city_id: 440300,
                                province_id: 440000
                            },{
                                city_id: 441300,
                                province_id: 440000
                            }]
                        };
                        assert.deepEqual(res.body.data.category, expect_data.category);
                        res.body.data.regions.should.containEql(expect_data.regions[0]);
                        res.body.data.regions.should.containEql(expect_data.regions[1]);
                        done();
                    });
            });
        });
        
        describe('PUT /v1/a/product/categories/sort', function () {
            
            let cates = [9998,9999];
            before(function (done) {
                let promises = cates.map(function (id, index) {
                    let sql = 'insert into buss_product_category_regionalism(category_id,regionalism_id,sort) values(' + id + ',440300,' + id + ')';
                    return new Promise(function (resolve,reject) {
                        pool.query(sql, function (err, result) {
                            if (err) {
                                return reject(err);
                            }
                            return resolve();
                        });
                    });
                });
                Promise.all(promises).then(() => {
                    done();
                }).catch(err => {
                    done(err);
                });
            });
            
            it('update sort by category id and regionalism id', function (done) {
                let req_data = {
                    regionalism_id: 440300,
                    ranking: [
                        {
                            category_id: cates[0],
                            sort: 1
                        },
                        {
                            category_id: cates[1],
                            sort: 2
                        }
                    ]
                };
                agent
                    .put('/v1/a/product/categories/sort')
                    .type('application/json')
                    .send(req_data)
                    .end((err, res) => {
                        assert.strictEqual(res.body.code, '0000');
                        assert.strictEqual(res.statusCode, 200);
                        let sql = 'select category_id,sort from buss_product_category_regionalism where regionalism_id = 440300 and category_id in (' + cates[0] + ',' + cates[1] + ')';
                        pool.query(sql, (err, result) => {
                            if (err) {
                                return done(err);
                            }
                            result = JSON.parse(JSON.stringify(result));
                            assert.equal(result.length, 2);
                            result.should.containEql(req_data.ranking[0]);
                            result.should.containEql(req_data.ranking[1]);
                            done();
                        });
                    });
            });
        });

        describe('DELETE /v1/a/product/categories/:id', function () {
            
            let secondary_ids = [],product_id,sku_id;
            before(function (done) {
                let sqls = [
                    'insert into buss_product_category(parent_id,name) values(1,\'删除测试二级分类1\')',
                    'insert into buss_product_category(parent_id,name) values(1,\'删除测试二级分类2\')'
                ];
                let promises = sqls.map(function(sql, index) {
                    return new Promise(function(resolve, reject) {
                        pool.query(sql, function(err, result) {
                            if (err) {
                                return reject(err);
                            }
                            secondary_ids[index] = result.insertId;
                            return resolve();
                        });
                    });
                });
                return Promise.all(promises)
                    .then(() => {
                        let sql = 'insert into buss_product_category_regionalism(category_id,regionalism_id) values(' + secondary_ids[1] + ',440300)';
                        return new Promise(function(resolve, reject) {
                            pool.query(sql, function (err, result) {
                                if (err) {
                                    return done(err);
                                }
                                return resolve(result.insertId);

                            });
                        });
                    }).then(() => {
                        let sql = 'insert into buss_product(name,category_id) values(\'删除分类产品1\',' + secondary_ids[0] + ')';
                        return new Promise(function(resolve, reject) {
                            pool.query(sql, function(err, result) {
                                if (err) {
                                    return reject(err);
                                }
                                product_id = result.insertId;
                                return resolve(result.insertId);
                            });
                        });
                    }).then(() => {
                        return new Promise((resolve, reject) => {
                            let sql = 'insert into buss_product_sku(product_id,size,website,regionalism_id,price,original_price,book_time) ' + 'values(' + product_id + ',\'删除二级分类sku\',1,440400,200,100,3)';
                            pool.query(sql, function(err, result) {
                                if (err) {
                                    return reject(err);
                                }
                                sku_id = result.insertId;
                                resolve(result.insertId);
                            });
                        });
                    }).then(() => {
                        done();
                    }).catch(err => {
                        done(err);
                    });
            });
            
            it('delete one category and remove its products to another category', function (done) {
                agent
                    .delete('/v1/a/product/categories/' + secondary_ids[0])
                    .type('application/json')
                    .send({
                        new_category: secondary_ids[1]
                    })
                    .end((err, res) => {
                        console.log(res.body)
                        assert.strictEqual(res.body.code, '0000');
                        assert.strictEqual(res.statusCode, 200);
                        let sql = 'select category_id from buss_product where id = ' + product_id;
                        pool.query(sql, (err, result) => {
                            if (err) {
                                return done(err);
                            }
                            assert.equal(result[0].category_id, secondary_ids[1]);
                            let sql = 'select del_flag from buss_product_sku where id = ' + sku_id + ' and regionalism_id = 440400';
                            pool.query(sql, (err, result) => {
                                if (err) {
                                    return done(err);
                                }
                                assert.equal(result[0].del_flag, 0);
                                done();
                            });
                        });
                    });
            });
        });
        
    });
};