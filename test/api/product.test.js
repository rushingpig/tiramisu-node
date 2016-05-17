'use strict';
var assert = require('chai').assert;
var mysql = require('mysql');
var config = require('../../config');
var pool = mysql.createPool(config.mysql_options);
var request = require('supertest'),
    app = require('../../app'),
    agent = request.agent(app);

module.exports = function() {
    describe('test for product module...', function() {
        /**
         * the funtion for callback
         * @param done
         * @returns {Function}
         */
        function err(done) {
            return function(err, res) {
                if (err) {
                    return done(err);
                }
                done();
            }
        }

        /**
         * in order to get the session with login
         */
        before(function(done) {
            agent
                .post('/v1/a/login')
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

        /**
         * logout to delete session
         */
        after(function(done) {
            agent
                .get('/logout')
                .expect(302, err(done));
        });

        it('GET /v1/a/product/accessory', function(done) {
            agent.get('/v1/a/product/accessory')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res)=> {
                    assert.strictEqual(res.body.code, '0000');
                    assert.strictEqual(res.statusCode, 200);
                    done();
                });
        })

        it('GET /v1/a/product/sku/size', function(done) {
            agent.get('/v1/a/product/sku/size')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(err(done));
        })

        it('POST /v1/a/product/sku', function(done) {
            let sku_1 = {
                "size": "约1磅",
                "original_price": 13800,
                "price": 12800,
                "website": 1,
                "book_time": 3,
                "regionalism_id": 441300,
                "secondary_booktimes": [{
                    "book_time": 2,
                    "regionalism_id": 441310
                }, {
                    "book_time": 2,
                    "regionalism_id": 441320
                }]
            };
            let sku_2 = {
                "size": "约2磅",
                "original_price": 16800,
                "price": 15800,
                "website": 1,
                "book_time": 3,
                "regionalism_id": 441300,
                "presell_start": "2016-05-09 12:01:00",
                "presell_end": "2016-05-09 13:01:00",
                "send_start": "2016-07-09 12:01:00",
                "send_end": "2016-08-09 12:01:00"
            };
            let sku_3 = {
                "size": "约3磅",
                "original_price": 21800,
                "price": 20800,
                "website": 1,
                "book_time": 3,
                "regionalism_id": 441300,
                "activity_price": 19800,
                "activity_start": "2016-05-09 12:01:00",
                "activity_end": "2016-06-09 12:01:00"
            };
            let request_body = {
                "name": "测试sku新增产品1",
                "category_id": 1,
                "sku": [sku_1, sku_2, sku_3]
            };
            agent.post('/v1/a/product/sku')
                .type('application/json')
                .send(request_body)
                .end((err, res) => {
                    assert.strictEqual(res.body.code, '0000');
                    assert.strictEqual(res.statusCode, 200);
                    let pro_sql = 'select * from buss_product where name = \'测试sku新增产品1\'';
                    pool.query(pro_sql, function(err, result) {
                        assert.equal(result.length, 1);
                        let product_id = result[0].id;
                        let sku_sql = 'select product_id,size,website,regionalism_id,book_time from buss_product_sku where product_id = ' + product_id;
                        pool.query(sku_sql, function(err, result) {
                            assert.equal(result.length, 4);
                            let sku_booktime_sql = 'select count(1) as count from buss_product_sku a join buss_product_sku_booktime b on a.id = b.sku_id where a.product_id = ' + product_id + ' and a.size = \'约1磅\'';
                            pool.query(sku_booktime_sql, function (err, result) {
                                assert.equal(result[0].count, 2);
                            });
                            done();
                        });
                    });
                });
        })

        describe('test for get product details', function() {
            let primary_cate_id,secondary_cate_id,product_id,skus=[];
            before(function (done) {
                new Promise(function(resolve, reject){
                    let sql = 'insert into buss_product_category(parent_id,name,remarks) values(0,\'测试产品列表一级分类\',\'here is remarks\')';
                    pool.query(sql, function(err, result) {
                        if(err){
                            return reject(err);
                        }
                        primary_cate_id = result.insertId;
                        resolve(result.insertId);
                    });
                }).then(primary_cate_id => {
                    return new Promise((resolve, reject) => {
                        let sql = 'insert into buss_product_category(parent_id,name,remarks) values(' + primary_cate_id + ',\'测试产品列表二级分类\',\'here is remarks\')';
                        pool.query(sql, function(err, result) {
                            if(err){
                                return reject(err);
                            }
                            secondary_cate_id = result.insertId;
                            resolve(result.insertId);
                        });
                    });
                }).then(secondary_cate_id => {
                    return new Promise((resolve, reject) => {
                        let sql = 'insert into buss_product(name,category_id) values(\'测试产品列表产品1\',' + secondary_cate_id + ')';
                        pool.query(sql, function (err, result) {
                            if(err){
                                return reject(err);
                            }
                            product_id = result.insertId;
                            resolve(result.insertId);
                        });
                    });
                }).then(product_id => {
                    let promises = ['测试产品列表规格1','测试产品列表规格2'].map(item => {
                        return new Promise((resolve, reject) => {
                            let sql = 'insert into buss_product_sku(product_id,size,website,regionalism_id,price,original_price,book_time) '
                                + 'values(' + product_id + ',\'' + item + '\',1,440300,200,100,3)';
                            pool.query(sql, function (err, result) {
                                if(err){
                                    return reject(err);
                                }
                                resolve(result.insertId);
                            });
                        });
                    });
                    return Promise.all(promises);
                }).then(() => {
                    return new Promise((resolve, reject) => {
                        let sql = 'insert into buss_product_sku(product_id,size,website,regionalism_id,price,original_price,book_time,presell_start) '
                            + 'values(' + product_id + ',\'测试产品列表规格3\',2,440400,200,100,3,\'2016-05-17 17:38:43\')';
                        pool.query(sql, function (err, result) {
                            if(err){
                                return reject(err);
                            }
                            resolve(result.insertId);
                        });
                    });
                }).then(() => {
                    return new Promise((resolve, reject) => {
                        let sql = 'insert into buss_product_sku(product_id,size,website,regionalism_id,price,original_price,book_time,activity_start) '
                            + 'values(' + product_id + ',\'测试产品列表规格4\',2,440400,200,100,3,\'2016-05-17 17:38:43\')';
                        pool.query(sql, function (err, result) {
                            if(err){
                                return reject(err);
                            }
                            resolve(result.insertId);
                        });
                    });
                }).then(function(){
                    done();
                }).catch(function(err) {
                    done(err);
                });
            });
            it('GET /v1/a/product/details only by product name', function(done) {
                agent.get('/v1/a/product/details?name=测试产品列表')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        if(err) return done(err);
                        assert.equal(res.body.data.count, 2);
                        done();
                    });
            });
            it('GET /v1/a/product/details by product name & city id', function(done) {
                agent.get('/v1/a/product/details?name=测试产品列表&city=440400')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        if(err) return done(err);
                        assert.equal(res.body.data.count, 1);
                        done();
                    });
            });
            it('GET /v1/a/product/details by product name & city id & primary_cate', function(done) {
                agent.get('/v1/a/product/details?name=测试产品列表&city=440400&primary_cate=123')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        if(err) return done(err);
                        assert.equal(res.body.data.count, 0);
                        done();
                    });
            });
            it('GET /v1/a/product/details by product name & city id & isMall', function(done) {
                agent.get('/v1/a/product/details?name=测试产品列表&city=440300&isMall=false')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        if(err) return done(err);
                        assert.equal(res.body.data.count, 1);
                        done();
                    });
            });
            it('GET /v1/a/product/details by product name & city id & isActivity', function(done) {
                agent.get('/v1/a/product/details?name=测试产品列表&city=440400&isActivity=true')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        if(err) return done(err);
                        assert.equal(res.body.data.count, 1);
                        done();
                    });
            });
        });
        
    });
};