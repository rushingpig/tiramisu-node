/**
 * @des    : the common router
 * @author : pigo.can
 * @date   : 15/12/9 上午9:52
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";
var express = require('express');
var config = require('../config');
var router = express.Router(config.exp_router_options);


router.get('/',function(req,res){
    res.redirect('/index');
});

router.get('/login',function(req,res){
    res.renders('login');
});
router.get('/index',function(req,res){
    res.render('index');
});
router.get('/logout',function(req,res){
    req.session.user = null;
    res.redirect('/login');
});

module.exports = router;