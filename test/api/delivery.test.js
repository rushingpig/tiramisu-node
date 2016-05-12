/**
 * @des    : the test for the module delivery
 * @author : pigo.can
 * @date   : 16/1/8 下午2:05
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var assert = require('chai').assert;
var request = require('supertest'),
    app = require('../../app'),
    agent = request.agent(app);

module.exports = function () {
  describe('test for delivery module...', function () {
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
          }
      }

      /**
       * in order to get the session with login
       */
      before(function (done) {
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

      beforeEach(function (done) {
          done();
      });
      /**
       * logout to delete session
       */
      after(function (done) {
          agent
              .get('/logout')
              .expect(302, err(done));
      });

      describe('GET /v1/a/provinces', function () {
          it('get the list of the all provinces', function (done) {
              agent
                  .get('/v1/a/provinces')
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end(err(done));
          });
      });

      it('GET /v1/a/city/:cityId/deliverymans', function (done) {
          agent.get('/v1/a/city/440300/deliverymans')
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                  assert.strictEqual(res.body.code, '0000');
                  assert.strictEqual(res.statusCode, 200);
                  done();
              });
      });

      it('GET /v1/a/delivery/order/:orderId/proof', function (done) {
          agent.get('/v1/a/delivery/order/2016031410000001/proof')
              .query({deliveryman_id: 1})
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                  assert.strictEqual(res.body.code, '0000');
                  assert.strictEqual(res.statusCode, 200);
                  done();
              });
      });

      it('GET /v1/a/delivery/order/:orderId/history/record', function (done) {
          agent.get('/v1/a/delivery/order/2016031410000001/history/record')
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                  assert.strictEqual(res.body.code, '9998');
                  assert.strictEqual(res.statusCode, 200);
                  done();
              });
      });

      it('GET /v1/a/delivery/order/:orderId/proof', function (done) {
          agent.get('/v1/a/delivery/order/2016031410000001/proof')
              .query({deliveryman_id: 2})
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                  assert.strictEqual(res.body.code, '9998');
                  assert.strictEqual(res.statusCode, 200);
                  done();
              });
      });

      it('GET /v1/a/delivery/record', function (done) {
          agent.get('/v1/a/delivery/record')
              .query({
                  begin_time: '2016-04-19',
                  end_time: '2016-04-19',
                  city_id: 440300,
                  deliveryman_id: 8
              })
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                  assert.strictEqual(res.body.code, '0000');
                  assert.strictEqual(res.statusCode, 200);
                  done();
              });
      });

      it('GET /v1/a/order/:orderId/deliverymans', function (done) {
          agent.get('/v1/a/order/2016031410000022/deliverymans')
              .expect('Content-Type', /json/)
              .expect(200)
              .end(err(done));
      });

      it.skip('PUT /v1/a/order/:orderId/signin', function (done) {
          let body = {};
          agent.put('/v1/a/order/2016031510002707/signin')
              .send(body)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(err(done));
      });

  });};
