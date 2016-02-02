/**
 * @des    : test for the order mobules
 * @author : pigo.can
 * @date   : 16/1/8 下午2:05
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
'use strict';
var mocha = require('mocha');
var chai = require('chai');
var expect = chai.expect,
  assert = chai.assert,
  should = chai.should,
  request = require('supertest'),
  app = require('../../app'),
  agent = request.agent(app);

(
  //  init the config of chaijs
  function initChai() {
    chai.config.showDiff = false;    // turn on reporter diff display
    chai.config.truncateThreshold = 40;     // disable truncating
    chai.config.includeStack = true;    // turn on stack trace
  })();

describe('test for order module...', function () {

  //================== hooks begin ==================

  /**
   * the funtion for callback
   * @param done
   * @returns {Function}
   */
  function err(done) {
    return function (err, res) {
      if (err) {
        return done(err);
      }
      done();
    };
  }

  /**
   * in order to get the session with login
   */
  before(function (done) {

  });

  beforeEach(function (done) {
    //TODO based on your business
    agent.post('/v1/a/login')
      .type('application/json')
      .send({
        username: 'admin',
        password: '123'
      })
      .expect(200, {
        "code": "0000",
        "msg": "everything goes well -> enjoy yourself...",
        "data": {}
      }, err(done));
    //done();
  });
  /**
   * logout to delete session
   */
  after(function (done) {
    agent
      .get('/logout')
      .expect(302, err(done));
  });
  afterEach(function (done) {
    //TODO based on your business
    done();
  });
  //================== hooks end ==================

  describe('POST /v1/a/order', function () {
    it('add order and related info successfully...', function (done) {
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
        .expect(200, err(done));
    });
  });

});