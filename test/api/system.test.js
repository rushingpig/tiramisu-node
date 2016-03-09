/**
 * @des    :
 * @author : pigo.can
 * @date   : 16/1/11 下午3:45
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var assert = require('chai').assert;
var request = require('supertest'),
    app = require('../../app'),
    agent = request.agent(app);

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

        it('GET /v1/a/stations/getStationsByDistrictId correct request', function (done) {
            agent
                .get('/v1/a/stations/getStationsByDistrictId?province_id=110000')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(err(done));
        });

        it('PUT /v1/a/station/:stationId correct request', function (done) {
            const req_body = {
                regionalism_id: 110101,
                name: 'xxx配送站',
                coords: '[{"longitude":113.733327,"latitude":22.717183},{"longitude":113.810729,"latitude":22.625355}]'
            };
            const res_body = {
                "code": "0000",
                "msg": "everything goes well -> enjoy yourself...",
                "data": {}
            };
            agent.put('/v1/a/station/1')
                .set('Content-Type', 'application/json')
                .send(req_body)
                .expect(200, res_body, err(done));
        });

        it('GET /v1/a/stations/getStationsByName correct request', function (done) {
            agent
                .get('/v1/a/stations/getStationsByName')
                .query({station_name: '沙井配送站'})
                .query({page_no: 0})
                .query({page_size: 20})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(err(done));
        });

        it('POST /v1/a/station correct request', function (done) {
            const req_body = {
                regionalism_id: 110101,
                name: 'xxx配送站',
                coords: '[{"longitude":113.733327,"latitude":22.717183},{"longitude":113.810729,"latitude":22.625355}]'
            };
            const res_body = {
                "code": "0000",
                "msg": "everything goes well -> enjoy yourself...",
                "data": {}
            };
            agent.post('/v1/a/station')
                .set('Content-Type', 'application/json')
                .send(req_body)
                .expect(200, res_body, err(done));
        });

        it('DELETE /v1/a/station correct request', function (done) {
            const res_body = {
                "code": "0000",
                "msg": "everything goes well -> enjoy yourself...",
                "data": {}
            };
            agent.delete('/v1/a/station/1')
                .set('Content-Type', 'application/json')
                .expect(200, res_body, err(done));
        });
    });
};

