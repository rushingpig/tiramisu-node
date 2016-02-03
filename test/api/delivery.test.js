/**
 * @des    : the test for the module delivery
 * @author : pigo.can
 * @date   : 16/1/8 下午2:05
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";

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
    }
)();

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
              .expect(200, {
                  "code": "0000",
                  "msg": "everything goes well -> enjoy yourself...",
                  "data": {}
              }, err(done));
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
  });};
