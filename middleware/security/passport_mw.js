/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/8 下午4:31
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";
var baseDao = require('../../dao/base_dao');
var se =require('../login/session_event');
function PassportMiddlerware() {
}
function localStrategy(req,username, password, done) {
    let user = {
        username: 'pigo',
        password: '123'
    };
    if (user.username != username) {
        return done(null, false, {message: 'incorrect username'})
    }
    if (user.password != password) {
        return done(null, false, {message: 'incorrect password'});
    }
    se.emit('fill',req,user);
    return done(null, user);
}

function serializeUser(user, done) {

    done(null, user);
}
function deserializeUser(user, done) {
    done(null, user);
}
/**
 * authenticate the user
 * @param passport
 * @returns {Function} middleware
 */
function authenticate(passport){
    return function(req,res,next){
        passport.authenticate('local', function(err,user){
            if(!user){
                res.render('login',{msg:'用户名或者密码错误,请重新输入'});
            }else{
                res.render('index');
            }
        })(req,res);
    }
}

function getLocalstrategyConfig(){
    return {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,
        session: false
    };
}


PassportMiddlerware.localStrategy = localStrategy;
PassportMiddlerware.serializeUser = serializeUser;
PassportMiddlerware.deserializeUser = deserializeUser;
PassportMiddlerware.getLocalstrategyConfig = getLocalstrategyConfig;
PassportMiddlerware.authenticate = authenticate;

module.exports = PassportMiddlerware;