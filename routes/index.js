/**
 * @des    : the common router for root
 * @author : pigo.can
 * @date   : 15/12/9 上午9:52
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var express = require('express');
var config = require('../config');
var router = express.Router(config.exp_router_options);
var systemUtils = require('../common/SystemUtils');


router.get('/',function(req,res){
    let userInfo = req.session.user,user;
    if(userInfo){
        user = {
            name : userInfo.name,
            permissions : userInfo.permissions
        };
    };
    systemUtils.commonRender(req,res);
});

router.get('/logout',function(req,res){
    req.session.user = null;
    req.logout();
    res.redirect('/');
});

module.exports = router;