/*

                      _oo0oo_
                     o8888888o
                     88" . "88
                     (| -_- |)
                     0\  =  /0
                   ___/`---'\___
                 .' \\|     |// '.
                / \\|||  :  |||// \
               / _||||| -:- |||||- \
              |   | \\\  -  /// |   |
              | \_|  ''\---/''  |_/ |
              \  .-\__  '-'  ___/-. /
            ___'. .'  /--.--\  `. .'___
         ."" '<  `.___\_<|>_/___.' >' "".
        | | :  `- \`.;`\ _ /`;.`/ - ` : | |
        \  \ `_.   \_ __\ /__ _/   .-` /  /
    =====`-.____`.___ \_____/___.-`___.-'=====
                      `=---='


    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

              佛祖保佑         永无BUG
*/

"use strict";
var LogHelper = require('./common/LogHelper');

//  init the log4js config
new LogHelper(log4js).config();
var config = require('./config');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var log4js = require('log4js');
var logger = log4js.getLogger('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var exphbs = require('express-handlebars');
var hbs = require('./common/HandlebarsUtils').instance(exphbs);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var validator = require('express-validator');
var compression = require('compression');
var res_obj = require('./util/res_obj');
var systemUtils = require('./common/SystemUtils');
var toolUtils = require('./common/ToolUtils');

var app = express();
var v1Router = require('./routes/v1');
var router = require('./routes');
var middleware = require('./middleware');


//global.loog = LogHelper.getLogger('tiramisu');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(log4js.connectLogger(logger, { level: 'auto' ,format:':method :status ✪ :url ✪  [:response-time ms]'}));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(validator(toolUtils.exp_validator_custom));
app.use(cookieParser());
app.use(middleware.system.wrapperResponse);
app.use('/v1/i/*',middleware.whiteIPList.isInWhiteList);
app.use(/^((?!\/v1\/i\/).)*$/, session(config.exp_session_options(MySQLStore)));
app.use('/v1/[a,i]/*',middleware.system.debugReqAndResParams);
app.use(express.static(path.join(__dirname, 'public'),config.exp_static_options));
if (config.login_required) {
    app.use(middleware.login.loginFilter);
}

//  do authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use('local',new LocalStrategy(middleware.passport.getLocalstrategyConfig(),middleware.passport.localStrategy));
passport.serializeUser(middleware.passport.serializeUser);
passport.deserializeUser(middleware.passport.deserializeUser);


//  router config
app.post('/v1/a/login',middleware.passport.authenticate(passport));

app.use(router);
app.use("/v1",v1Router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// all ajax request error handler
app.use('/v1/a/*',(err,req,res,next)=>{
    if(err.status === 404){
        res.status(err.status);
        res.api(res_obj.GET_LOST,null);
    }else{
        res.status(500);
        let resObj = res_obj.FAIL;
        resObj.err = err.message;
        res.json(resObj);
    }
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err,
            error: err
        });
    });
}

if (app.get('env') === 'dev') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        if(err){
          console.error(err);
        }
        systemUtils.commonRender(req,res);
    });
}

// production error handler
// no stacktraces leaked to user
// for the for-end framework
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    systemUtils.commonRender(req,res);
});
module.exports = app;
