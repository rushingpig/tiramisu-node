/**
 * @des    : the eventemitter for fill session
 * @author : pigo.can
 * @date   : 15/12/9 下午4:32
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var util = require('util');
var EventEmitter = require('events');

function SessionEvent(){
    EventEmitter.call(this);
}

util.inherits(SessionEvent,EventEmitter);

var se = new SessionEvent();
//  listening the "fill" event
se.on('fill',function(req,user){
    if(arguments.length < 2){
        throw new Error('illegal arguments...');
    }
    req.session.user = user;
    req.userId = user.id;
});

module.exports = se;



