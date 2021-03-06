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
var version = require('../../package.json').version;
function PassportMiddlerware() {
}

function localStrategy(req,username, password, done) {
    if(!(username && password)){
        return done(null,false,{msg : '请输入有效的用户名和密码'});
    }
    let db_password = crypto.md5(password.toString().trim());
    userService.getUserInfo(username,db_password).then((userInfo)=>{
            if(!userInfo){
                return done(null,false,res_obj.INVALID_USERNAME_OR_PASSWORD)
            }else if(!userInfo.is_usable){
                return done(null,false,res_obj.USER_NOT_USABLE);
            }
            //  set user session
            se.emit('fill',req,userInfo);
            let user = {
                username : userInfo.username,
                name : userInfo.name,
                is_admin : userInfo.is_admin,
                permissions : userInfo.permissions
            };
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
                res.api(res_obj.FAIL,err);
            }else if(msg && !user){
                res.api(msg,null);
            }else{
                res.api({user,version});
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