'use strict';
var request = require('supertest');
var assert = require('chai').assert;

const agent = request.agent(require('../../app'));

module.exports = function () {
  describe('/v1/i/order', function () {

    /**
     * the funtion for callback
     * @param done
     * @returns {Function}
     */
    function err(done, res_body) {
      return function (err, res) {
        if (err) {
          console.error(res.text);
          return done(err);
        }
        done();
      };
    }

    it('POST /v1/i/order correct request', function (done) {
      const req_body = {
        "regionalism_id": 330204,
        "recipient_name": "有赞收货员",
        "recipient_mobile": "13760008615",
        "recipient_landmark": "",
        "recipient_address": "丽雅查尔顿酒店",
        "delivery_id": -1,
        "src_id": 6,
        "pay_modes_id": 3,
        "pay_status": "PAYED",
        "owner_name": "梁展钊",
        "owner_mobile": "13760000000",
        "remarks": "有赞订单",
        "delivery_time": "2016-01-05 13:00~14:00",
        "delivery_type": "DELIVERY",
        "total_amount": 48000,
        "total_original_price": 60000,
        "total_discount_price": 12000,
        "merchant_id": "e123",
        "products": [
          {
            "product_id": 1,
            "name": "zhang",
            "size": "zhang1",
            "category_name": "类型1",
            "original_price": 20000,
            "sku_id": 22,
            "website": "website2",
            "discount_price": 180,
            "is_local_site": "0",
            "is_delivery": "1",
            "num": 2,
            "choco_board": "巧克力牌xxx",
            "greeting_card": "祝福语xxx",
            "atlas": true,
            "custom_name": "自定义名称xxx",
            "custom_desc": "自定义描述xxx",
            "amount": 360
          },
          {
            "product_id": 2,
            "name": "li",
            "size": "li3",
            "category_name": "类型3",
            "original_price": 20000,
            "sku_id": 24,
            "website": "website3",
            "discount_price": 300,
            "is_local_site": "1",
            "is_delivery": "1",
            "num": 5,
            "choco_board": "巧克力牌xxx",
            "greeting_card": "祝福语xxx",
            "atlas": true,
            "custom_name": "自定义名称xxx",
            "custom_desc": "自定义描述xxx",
            "amount": 1500
          }
        ]
      };
      const res_body = {
        "code": "0000",
        "msg": "everything goes well -> enjoy yourself...",
        "data": {}
      };
      agent.post('/v1/i/order')
        .type('application/json')
        .send(req_body)
        .expect(200, res_body, err(done));
      // TODO: assert order default status/is_deal etc
    });

    it('POST /v1/i/order duplicate merchant_id', function (done) {
      const req_body = {
        "regionalism_id": 330204,
        "recipient_name": "有赞收货员",
        "recipient_mobile": "13760008615",
        "recipient_landmark": "",
        "recipient_address": "丽雅查尔顿酒店",
        "delivery_id": -1,
        "src_id": 6,
        "pay_modes_id": 3,
        "pay_status": "PAYED",
        "owner_name": "梁展钊",
        "owner_mobile": "13760000000",
        "remarks": "有赞订单",
        "delivery_time": "2016-01-05 13:00~14:00",
        "delivery_type": "DELIVERY",
        "total_amount": 48000,
        "total_original_price": 60000,
        "total_discount_price": 12000,
        "merchant_id": "e123",
        "products": [
          {
            "product_id": 1,
            "name": "zhang",
            "size": "zhang1",
            "category_name": "类型1",
            "original_price": 20000,
            "sku_id": 22,
            "website": "website2",
            "discount_price": 180,
            "is_local_site": "0",
            "is_delivery": "1",
            "num": 2,
            "choco_board": "巧克力牌xxx",
            "greeting_card": "祝福语xxx",
            "atlas": true,
            "custom_name": "自定义名称xxx",
            "custom_desc": "自定义描述xxx",
            "amount": 360
          },
          {
            "product_id": 2,
            "name": "li",
            "size": "li3",
            "category_name": "类型3",
            "original_price": 20000,
            "sku_id": 24,
            "website": "website3",
            "discount_price": 300,
            "is_local_site": "1",
            "is_delivery": "1",
            "num": 5,
            "choco_board": "巧克力牌xxx",
            "greeting_card": "祝福语xxx",
            "atlas": true,
            "custom_name": "自定义名称xxx",
            "custom_desc": "自定义描述xxx",
            "amount": 1500
          }
        ]
      };
      agent.post('/v1/i/order')
        .type('application/json')
        .send(req_body)
        .end((err, res) => {
          assert.strictEqual(res.body.code, '2007');
          assert.strictEqual(res.statusCode, 200);
          done();
        });
    });

    it.skip('POST /v1/i/order default delivery_id to -1', function (done) {
      // TODO: default to UNTREATED as well
      // TODO: check setting created_by (req.session.user.id)
      // TODO: check differeciate different user by ip
      // TODO: coupon will be normalized as numbers only
      const req_body = {
        "regionalism_id": 330204,
        "recipient_name": "有赞收货员",
        "recipient_mobile": "13760008615",
        "recipient_landmark": "",
        "recipient_address": "丽雅查尔顿酒店",
        "delivery_id": 100,
        "src_id": 6,
        "pay_modes_id": 3,
        "pay_status": "PAYED",
        "owner_name": "梁展钊",
        "owner_mobile": "13760000000",
        "remarks": "有赞订单",
        "delivery_time": "2016-01-05 13:00~14:00",
        "delivery_type": "DELIVERY",
        "total_amount": 48000,
        "total_original_price": 60000,
        "total_discount_price": 12000,
        "products": [
          {
            "product_id": 1,
            "name": "zhang",
            "size": "zhang1",
            "category_name": "类型1",
            "original_price": 20000,
            "sku_id": 22,
            "website": "website2",
            "discount_price": 180,
            "is_local_site": "0",
            "is_delivery": "1",
            "num": 2,
            "choco_board": "巧克力牌xxx",
            "greeting_card": "祝福语xxx",
            "atlas": true,
            "custom_name": "自定义名称xxx",
            "custom_desc": "自定义描述xxx",
            "amount": 360
          }
        ]
      };
      agent.post('/v1/i/order')
        .type('application/json')
        .send(req_body)
        .end((err, res) => {
          assert.strictEqual(res.body.code, '0000');
          assert.strictEqual(res.statusCode, 200);
          // TODO: assert that the delivery_id is -1
          done();
        });
    });

    it('POST /v1/i/order with coupon', function (done) {
      const req_body = {
        "regionalism_id": 330204,
        "recipient_name": "有赞收货员",
        "recipient_mobile": "13760008615",
        "recipient_landmark": "",
        "recipient_address": "丽雅查尔顿酒店",
        "delivery_id": -1,
        "src_id": 6,
        "pay_modes_id": 3,
        "pay_status": "PAYED",
        "owner_name": "梁展钊",
        "owner_mobile": "13760000000",
        "remarks": "有赞订单",
        "delivery_time": "2016-01-05 13:00~14:00",
        "delivery_type": "DELIVERY",
        "total_amount": 48000,
        "total_original_price": 60000,
        "total_discount_price": 12000,
        "merchant_id": "e12345",
        "coupon": '123456',
        "products": [
          {
            "product_id": 1,
            "name": "zhang",
            "size": "zhang1",
            "category_name": "类型1",
            "original_price": 20000,
            "sku_id": 22,
            "website": "website2",
            "discount_price": 180,
            "is_local_site": "0",
            "is_delivery": "1",
            "num": 2,
            "choco_board": "巧克力牌xxx",
            "greeting_card": "祝福语xxx",
            "atlas": true,
            "custom_name": "自定义名称xxx",
            "custom_desc": "自定义描述xxx",
            "amount": 360
          },
          {
            "product_id": 2,
            "name": "li",
            "size": "li3",
            "category_name": "类型3",
            "original_price": 20000,
            "sku_id": 24,
            "website": "website3",
            "discount_price": 300,
            "is_local_site": "1",
            "is_delivery": "1",
            "num": 5,
            "choco_board": "巧克力牌xxx",
            "greeting_card": "祝福语xxx",
            "atlas": true,
            "custom_name": "自定义名称xxx",
            "custom_desc": "自定义描述xxx",
            "amount": 1500
          }
        ]
      };
      agent.post('/v1/i/order')
        .type('application/json')
        .send(req_body)
        .end((err, res) => {
          assert.strictEqual(res.body.code, '0000');
          assert.strictEqual(res.statusCode, 200);
          done();
        });
    });

    it('POST /v1/i/order wrong delivery_time', function (done) {
      const req_body = {
        "regionalism_id": 330204,
        "recipient_name": "有赞收货员",
        "recipient_mobile": "13760008615",
        "recipient_landmark": "",
        "recipient_address": "丽雅查尔顿酒店",
        "delivery_id": -1,
        "src_id": 6,
        "pay_modes_id": 3,
        "pay_status": "PAYED",
        "owner_name": "梁展钊",
        "owner_mobile": "13760000000",
        "remarks": "有赞订单",
        "delivery_time": "2016-01-05 13:00-14:00",
        "delivery_type": "DELIVERY",
        "total_amount": 48000,
        "total_original_price": 60000,
        "total_discount_price": 12000,
        "merchant_id": "e123",
        "products": [
          {
            "product_id": 1,
            "name": "zhang",
            "size": "zhang1",
            "category_name": "类型1",
            "original_price": 20000,
            "sku_id": 22,
            "website": "website2",
            "discount_price": 180,
            "is_local_site": "0",
            "is_delivery": "1",
            "num": 2,
            "choco_board": "巧克力牌xxx",
            "greeting_card": "祝福语xxx",
            "atlas": true,
            "custom_name": "自定义名称xxx",
            "custom_desc": "自定义描述xxx",
            "amount": 360
          },
          {
            "product_id": 2,
            "name": "li",
            "size": "li3",
            "category_name": "类型3",
            "original_price": 20000,
            "sku_id": 24,
            "website": "website3",
            "discount_price": 300,
            "is_local_site": "1",
            "is_delivery": "1",
            "num": 5,
            "choco_board": "巧克力牌xxx",
            "greeting_card": "祝福语xxx",
            "atlas": true,
            "custom_name": "自定义名称xxx",
            "custom_desc": "自定义描述xxx",
            "amount": 1500
          }
        ]
      };
      agent.post('/v1/i/order')
        .type('application/json')
        .send(req_body)
        .end((err, res) => {
          assert.deepEqual(
            res.body,
            {
              "code": "9997",
              "data": {},
              "err": [
                {
                  "msg": "Sample: 2016-01-18 19:30~20:30",
                  "param": "delivery_time",
                  "value": "2016-01-05 13:00-14:00"
                }
              ],
              "msg": "非法请求参数..."
            });
          assert.strictEqual(res.statusCode, 200);
          done();
        });
    });

    it('POST /v1/i/order empty buyer_nick E20160211222845015655359', function (done) {
      const req_body = {
        "regionalism_id": 330204,
        "recipient_name": "有赞收货员",
        "recipient_mobile": "13760008615",
        "recipient_landmark": "",
        "recipient_address": "丽雅查尔顿酒店",
        "delivery_id": -1,
        "src_id": 6,
        "pay_modes_id": 3,
        "pay_status": "PAYED",
        "owner_name": "",
        "owner_mobile": "13760000000",
        "remarks": "有赞订单",
        "delivery_time": "2016-01-05 13:00~14:00",
        "delivery_type": "DELIVERY",
        "total_amount": 48000,
        "total_original_price": 60000,
        "total_discount_price": 12000,
        "merchant_id": "e123",
        "products": [
          {
            "product_id": 1,
            "name": "zhang",
            "size": "zhang1",
            "category_name": "类型1",
            "original_price": 20000,
            "sku_id": 22,
            "website": "website2",
            "discount_price": 180,
            "is_local_site": "0",
            "is_delivery": "1",
            "num": 2,
            "choco_board": "巧克力牌xxx",
            "greeting_card": "祝福语xxx",
            "atlas": true,
            "custom_name": "自定义名称xxx",
            "custom_desc": "自定义描述xxx",
            "amount": 360
          }
        ]
      };
      const res_body = {
        "code": "9997",
        "err": [
          {
            "msg": "Invalid param",
            "param": "owner_name",
            "value": ""
          }
        ],
        "msg": "非法请求参数...",
        data: {}
      };
      agent.post('/v1/i/order')
        .type('application/json')
        .send(req_body)
        .expect(200, res_body, err(done));
    });

    it.skip('POST /v1/i/order too long recipient_name E20160214084947042597960', function (done) {
      const req_body = {
        "regionalism_id": "430602",
        "recipient_name": "李雪良（儿子李慧送）",
        "recipient_mobile": "13873088723",
        "recipient_landmark": "",
        "recipient_address": "岳阳火车站后面",
        "delivery_id": -1,
        "src_id": 6,
        "pay_modes_id": 3,
        "pay_status": "PAYED",
        "owner_name": "李慧",
        "owner_mobile": "13873088723",
        "remarks": "其他加盟城市满138减59",
        "delivery_time": "2016-02-15 10:30~11:30",
        "delivery_type": "DELIVERY",
        "total_amount": 7900,
        "total_original_price": 13800,
        "total_discount_price": 5900,
        "merchant_id": "E20160214084947042597960",
        "products": [
          {
            "sku_id": 23947,
            "num": 1,
            "choco_board": "爸爸，祝您生日快乐",
            "greeting_card": null,
            "discount_price": 0,
            "amount": 138
          }
        ]
      };
      const res_body = {
        "code": "0000",
        "msg": "everything goes well -> enjoy yourself...",
        "data": {}
      };
      agent.post('/v1/i/order')
        .type('application/json')
        .send(req_body)
        .expect(200, res_body, err(done));
    });

    it('POST /v1/i/order with old system src_id', function (done) {
      const req_body = {
        "regionalism_id": "430602",
        "recipient_name": "李雪良",
        "recipient_mobile": "13873088723",
        "recipient_landmark": "",
        "recipient_address": "岳阳火车站后面",
        "delivery_id": -1,
        "src_id": 10006,
        "pay_modes_id": 3,
        "pay_status": "PAYED",
        "owner_name": "李慧",
        "owner_mobile": "13873088723",
        "remarks": "其他加盟城市满138减59",
        "delivery_time": "2016-02-15 10:30~11:30",
        "delivery_type": "DELIVERY",
        "total_amount": 7900,
        "total_original_price": 13800,
        "total_discount_price": 5900,
        "merchant_id": "old_system_1",
        "products": [
          {
            "sku_id": 23947,
            "num": 1,
            "choco_board": "爸爸，祝您生日快乐",
            "greeting_card": null,
            "discount_price": 0,
            "amount": 138
          }
        ]
      };
      const res_body = {
        "code": "0000",
        "msg": "everything goes well -> enjoy yourself...",
        "data": {}
      };
      agent.post('/v1/i/order')
        .type('application/json')
        .send(req_body)
        .expect(200, res_body, err(done));
    });

    it('POST /v1/i/order phone number with *', function (done) {
      const req_body = {
        "regionalism_id": "430602",
        "recipient_name": "李雪良",
        "recipient_mobile": "1387308****",
        "recipient_landmark": "",
        "recipient_address": "岳阳火车站后面",
        "delivery_id": -1,
        "src_id": 10006,
        "pay_modes_id": 3,
        "pay_status": "PAYED",
        "owner_name": "李慧",
        "owner_mobile": "1387308****",
        "remarks": "其他加盟城市满138减59",
        "delivery_time": "2016-02-15 10:30~11:30",
        "delivery_type": "DELIVERY",
        "total_amount": 7900,
        "total_original_price": 13800,
        "total_discount_price": 5900,
        "merchant_id": "old_system_2",
        "products": [
          {
            "sku_id": 23947,
            "num": 1,
            "choco_board": "爸爸，祝您生日快乐",
            "greeting_card": null,
            "discount_price": 0,
            "amount": 138
          }
        ]
      };
      const res_body = {
        "code": "0000",
        "msg": "everything goes well -> enjoy yourself...",
        "data": {}
      };
      agent.post('/v1/i/order')
        .type('application/json')
        .send(req_body)
        .expect(200, res_body, err(done));
    });

    it('POST /v1/i/order with src_id > 10000 without pre-defined', function (done) {
      const req_body = {
        "regionalism_id": "430602",
        "recipient_name": "李雪良",
        "recipient_mobile": "1387308****",
        "recipient_landmark": "",
        "recipient_address": "岳阳火车站后面",
        "delivery_id": -1,
        "src_id": 10500,
        "pay_modes_id": 3,
        "pay_status": "PAYED",
        "owner_name": "李慧",
        "owner_mobile": "1387308****",
        "remarks": "其他加盟城市满138减59",
        "delivery_time": "2016-02-15 10:30~11:30",
        "delivery_type": "DELIVERY",
        "total_amount": 7900,
        "total_original_price": 13800,
        "total_discount_price": 5900,
        "merchant_id": "old_system_2",
        "products": [
          {
            "sku_id": 23947,
            "num": 1,
            "choco_board": "爸爸，祝您生日快乐",
            "greeting_card": null,
            "discount_price": 0,
            "amount": 138
          }
        ]
      };
      const res_body = {
        code: "2009",
        err: "ER_BAD_NULL_ERROR: Column 'src_id' cannot be null",
        msg: "Error happened when performing query",
        data: {}
      };
      agent.post('/v1/i/order')
        .type('application/json')
        .send(req_body)
        .expect(200, res_body, err(done));
    });

    it('POST /v1/i/order/error correct', function (done) {
      const req_body = {
        'merchant_id': 'abcde',
        'src_id': 29,
        'type': 'GENERAL',
        'detail': 'a test wrong order message'
      };
      agent.post('/v1/i/order/error')
        .type('application/json')
        .send(req_body)
        .end((err, res) => {
          assert.strictEqual(res.body.code, '0000');
          assert.strictEqual(res.statusCode, 200);
          done();
        });
    });

    it('POST /v1/i/order/error duplicate', function (done) {
      const req_body = {
        'merchant_id': 'abcde1',
        'src_id': 29,
        'type': 'GENERAL',
        'detail': 'a test wrong order message'
      };
      agent.post('/v1/i/order/error')
        .type('application/json')
        .send(req_body)
        .end((err, res) => {
          assert.strictEqual(res.body.code, '0000');
          assert.strictEqual(res.statusCode, 200);
          agent.post('/v1/i/order/error')
            .type('application/json')
            .send(req_body)
            .end((err, res) => {
              assert.strictEqual(res.body.code, '2007');
              assert.strictEqual(res.statusCode, 200);
              done();
            });
        });
    });

    it('PUT /v1/i/order/error correct', function (done) {
      const req_body = {
        'merchant_id': 'abcde2',
        'src_id': 29,
        'type': 'GENERAL',
        'detail': 'a test wrong order message'
      };
      agent.post('/v1/i/order/error')
        .type('application/json')
        .send(req_body)
        .end((err, res) => {
          assert.strictEqual(res.body.code, '0000');
          assert.strictEqual(res.statusCode, 200);
          const req_body = {
            'merchant_id': 'abcde2',
            'src_id': 29,
            'status': 'CLOSE'
          };
          agent.put('/v1/i/order/error')
            .type('application/json')
            .send(req_body)
            .end((err, res) => {
              assert.strictEqual(res.body.code, '0000');
              assert.strictEqual(res.statusCode, 200);
              done();
            });
        });
    });

    it('PUT /v1/i/order/error update 0 rows', function (done) {
      const req_body = {
        'merchant_id': 'abcde3',
        'src_id': 29,
        'status': 'CLOSE'
      };
      agent.put('/v1/i/order/error')
        .type('application/json')
        .send(req_body)
        .end((err, res) => {
          assert.strictEqual(res.body.code, '9996');
          assert.strictEqual(res.statusCode, 200);
          done();
        });
    });
  });
};
