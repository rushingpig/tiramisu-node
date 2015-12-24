/**
 * @des    : middleware for user authentication
 * @author : pigo.can
 * @date   : 15/12/8 下午4:31
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";
var res_obj = require('../../util/res_obj');
var userService = require('../../service').user;
var se =require('../login/session_event');
var crypto = require('../../common/CryptoUtils');
function PassportMiddlerware() {
}

function localStrategy(req,username, password, done) {
    if(!(username && password)){
        return done(null,false,{msg : '请输入有效的用户名和密码'});
    }
    let db_password = crypto.md5(password.toString().trim());
    userService.getUserInfo(username,db_password).then(
        (user)=>{
            if(!user){
                return done(null,false,{msg:"用户名或错误,请确认后重新输入..."})
            }
            //  set user session
            se.emit('fill',req,user);
            return done(null,user);
        }
    ).catch((err)=>{
            return done(err);
    });
}
/**
 * just for session of the config is true
 * @param user
 * @param done
 */
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
    return (req,res,next)=>{
        passport.authenticate('local', function(err,user,msg){
            if(err){
                res.api(res_obj.FAIL,null);
            }else if(msg && !user){
                res.api(res_obj.INVALID_USERNAME_OR_PASSWORD,null);
            }else{
                res.api();
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