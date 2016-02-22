/**
 * @des    :
 * @author : pigo.can
 * @date   : 16/1/11 下午3:45
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
    describe('/v1/a', function () {

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

        it('GET /v1/a/city/:cityId/stations correct request', function (done) {
            agent
                .get('/v1/a/city/110100/stations')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(err(done));
        });

        it('PUT /v1/a/station/:stationId/coords correct request', function (done) {
            const req_body = {
                coords: '[{"longitude":113.733327,"latitude":22.717183},{"longitude":113.810729,"latitude":22.625355}]'
            };
            const res_body = {
                "code": "0000",
                "msg": "everything goes well -> enjoy yourself...",
                "data": {}
            };
            agent.put('/v1/a/station/1/coords')
                .set('Content-Type', 'application/json')
                .send(req_body)
                .expect(200, res_body, err(done));
        });
    });
};

