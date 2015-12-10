/**
 * @des    : middleware for user authentication
 * @author : pigo.can
 * @date   : 15/12/8 下午4:31
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";
var userService = require('../../service').user;
var se =require('../login/session_event');
function PassportMiddlerware() {
}

function localStrategy(req,username, password, done) {
    if(!(username && password)){
        return done(null,false,{msg : '请输入有效的用户名和密码'});
    }
    userService.getUserInfo(username,password).then(
        (user)=>{

            if(!user || user.password !== password){
                return done(null,false,{msg:"用户名或错误,请确认后重新输入..."})
            }
            return done(null,user);
            //  set user session
            se.emit('fill',req,user);
        },
        (err)=>{
            return done(null,false,{msg:'服务器开小差了,稍后再来...'})
        }
    );
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
        passport.authenticate('local', function(err,user,msg){
            if(msg && !user){
                res.render('login',msg);
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