'use strict';
var request = require('supertest'),
  app = require('../../app'),
  agent = request.agent(app);

module.exports = function () {
  describe('/v1/a/order', function () {

    //================== hooks begin ==================
    /**
     * the funtion for callback
     * @param done
     * @returns {Function}
     */
    function err(done, res_body) {
      return function (err, res) {
        if (err) {
          return done(err);
        }
        done();
      };
    }

    before(function (done) {
      //TODO based on your business
      agent.post('/v1/a/login')
        .type('application/json')
        .send({
          username: 'admin',
          password: '123'
        })
        .expect(
          200,
          {
            "code": "0000",
            "msg": "everything goes well -> enjoy yourself...",
            "data": {}
          },
          err(done));
    });
    /**
     * logout to delete session
     */
    after(function (done) {
      agent
        .get('/logout')
        .expect(302, err(done));
    });
    //================== hooks end ==================

    it('POST /v1/a/order correct request', function (done) {
      const req_body = {
        "delivery_time": "2016-01-05 13:00～14:00",
        "owner_mobile": "13309879988",
        "recipient_mobile": "13309879988",
        "delivery_id": 1,
        "owner_name": "张三",
        "delivery_type": "DELIVERY",
        "recipient_address": "eeee街",
        "remarks": "备注test",
        "recipient_name": "张三",
        "pay_modes_id": "1",
        "invoice": "1",
        "province_id": "330000",
        "total_amount": 480,
        "src_id": "2",
        "regionalism_id": "330204",
        "recipient_landmark": "www建筑",
        "city_id": "330200",
        "pay_status": "COD",
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
      agent.post('/v1/a/order')
        .type('application/json')
        .send(req_body)
        .expect(200, res_body, err(done));
    });

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
        "delivery_time": "2016-01-05 13:00～14:00",
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
        "delivery_time": "2016-01-05 13:00～14:00",
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
      const res_body_first = {
        "code": "0000",
        "msg": "everything goes well -> enjoy yourself...",
        "data": {}
      };
      const res_body_second = {
        "code": "2007",
        "msg": "This order is in system already",
        "data": {},
        "err": 'e123'
      };
      agent.post('/v1/i/order')
        .type('application/json')
        .send(req_body)
        .expect(200, res_body_first, err(function () { }));
      agent.post('/v1/i/order')
        .type('application/json')
        .send(req_body)
        .expect(200, res_body_second, err(done));
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
        "delivery_time": "2016-01-05 13:00～14:00",
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
  });
};