'use strict';
var request = require('supertest');
var assert = require('chai').assert;

const agent = request.agent(require('../../app'));

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
          console.error(res.text);
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
        .end((err, res) => {
           assert.strictEqual(res.body.code, '0000');
	         assert.strictEqual(res.statusCode, 200);
           done();
        });
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
        "delivery_time": "2016-01-05 13:00~14:00",
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
      agent.post('/v1/a/order')
        .type('application/json')
        .send(req_body)
        .end((err, res) => {
          assert.strictEqual(res.body.code, '0000');
          assert.strictEqual(res.statusCode, 200);
          done();
        });
    });

    it('PUT /v1/a/order/:orderId  edit the order by order id (exist : 9996, no exist : 0000) ', function (done) {
      const req_body = {
        "delivery_type": "DELIVERY",
        "owner_name": "欺骗不必",
        "owner_mobile": "13824201234",
        "recipient_name": "赖**",
        "recipient_mobile": "13824201234",
        "recipient_address": "下**路下梅湖**村商场",
        "province_id": 440000,
        "city_id": 441300,
        "regionalism_id": 441302,
        "recipient_landmark": "",
        "delivery_id": 2,
        "src_id": 12,
        "pay_modes_id": 12,
        "coupon": null,
        "pay_status": "PAYED",
        "remarks": "限时特价\n快点派送，急，晚上需要蛋糕",
        "invoice": null,
        "delivery_time": "2016-03-21 09:30~10:30",
        "order_id": "2016032010019270",
        "updated_time": "2016-03-21 15:43:32",
        "recipient_id": 19358,
        "delivery_name": "惠州配送站",
        "prefix_address": "广东省惠州市惠城区",
        "total_amount": 0,
        "total_original_price": 51200,
        "total_discount_price": 51200,
        "products": [
          {
            "sku_id": 15322,
            "choco_board": "生日快乐",
            "custom_desc": "",
            "custom_name": "",
            "discount_price": 51200,
            "greeting_card": "",
            "num": 2,
            "original_price": 25600,
            "name": "爸爸的爱",
            "atlas": 1,
            "size": "约2磅",
            "amount": 0
          }
        ],
        "gretting_card": ""
      };
      agent.put('/v1/a/order/2016032010000001')
          .type('application/json')
          .send(req_body)
          .end((err, res) => {
            assert.strictEqual(res.body.code, '9995');
            assert.strictEqual(res.statusCode, 200);
            done();
          });
    });

    it('POST /v1/a/order/src insert order src ', function (done) {
      const reqBody = {
        name: '土星',
        remark: 'api test'
      };
      agent.post('/v1/a/order/src')
          .type('application/json')
          .send(reqBody)
          .end((err, res) => {
            assert.strictEqual(res.body.code, '0000');
            assert.strictEqual(res.statusCode, 200);
            done();
          });
    });

    it('POST /v1/a/order/src insert order src ', function (done) {
      const reqBody = {
        parent_id: 2,
        name: '土卫二'
      };
      agent.post('/v1/a/order/src')
          .type('application/json')
          .send(reqBody)
          .end((err, res) => {
            assert.strictEqual(res.body.code, '0000');
            assert.strictEqual(res.statusCode, 200);
            done();
          });
    });

    it('PUT /v1/a/order/src/:srcId update order src (1) ', function (done) {
      const reqBody = {
        name: '400客服中心'
      };
      agent.put('/v1/a/order/src/2')
          .type('application/json')
          .send(reqBody)
          .end((err, res) => {
            assert.strictEqual(res.body.code, '0000');
            assert.strictEqual(res.statusCode, 200);
            done();
          });
    });

    it('PUT /v1/a/order/src/:srcId update order src (2) ', function (done) {
      const reqBody = {
        parent_id: 47,
        name: 'PC官方网站'
      };
      agent.put('/v1/a/order/src/1')
          .type('application/json')
          .send(reqBody)
          .end((err, res) => {
            assert.strictEqual(res.body.code, '0000');
            assert.strictEqual(res.statusCode, 200);
            done();
          });
    });

    it('DELETE /v1/a/order/src/:srcId delete order src ', function (done) {
      agent.delete('/v1/a/order/src/2')
          .end((err, res) => {
            assert.strictEqual(res.body.code, '0000');
            assert.strictEqual(res.statusCode, 200);
            done();
          });
    });
  });
};
