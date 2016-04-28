/**
 * @des    :
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

        it('GET /v1/a/product/accessory', function (done) {
            agent.get('/v1/a/product/accessory')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(err(done));
        })

    });
};
