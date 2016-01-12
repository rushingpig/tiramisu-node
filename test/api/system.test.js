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

