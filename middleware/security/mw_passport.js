/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/8 下午4:31
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";
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
    req.session.user = user;
    return done(null, user);
}

function serializeUser(user, done) {

    done(null, user);
}
function deserializeUser(user, done) {
    done(null, user);
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

module.exports = PassportMiddlerware;