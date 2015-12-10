/**
 * @des    : the test project for base_dao module
 * @author : pigo.can
 * @date   : 15/12/10 下午1:07
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";


var mocha = require('mocha');
var chai = require('chai');
var expect = chai.expect,
    assert = chai.assert,
    should = chai.should;

var basedao = require('../dao/base_dao');

(
    //  init the config of chaijs
    function initChai() {
        chai.config.showDiff = true;    // turn on reporter diff display
        chai.config.truncateThreshold = 40;     // disable truncating
        chai.config.includeStack = true;    // turn on stack trace
    }
)();


describe('basedao test', function () {
    it('should return the ', function () {
        return basedao.insert('select * from sys_user where id = 2').then(function (results) {
            return expect(results[0].name).to.equal('系统管理员');
        });
    });
});



