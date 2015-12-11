var config = require('./config');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var log4js = require('log4js');
var logger = log4js.getLogger('express');
var session = require('express-session');
var exphbs = require('express-handlebars');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();
var v1Router = require('./routes/v1');
var router = require('./routes');
var middleware = require('./middleware');
var LogHelper = require('./common/LogHelper');
//  init the log4js config
new LogHelper(log4js).config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.engine('.hbs', exphbs({defaultLayout: 'single', extname: '.hbs'}));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(log4js.connectLogger(logger, { level: 'auto' ,format:':method :status ✪:url✪  [:response-time ms]'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(middleware.system.wrapperResponse);
app.use(session(config.exp_session_options));
if (config.login_required) {
    app.use(middleware.login.loginFilter);
}
middleware.db.initdb();
app.use(express.static(path.join(__dirname, 'public'),config.exp_static_options));

////  do authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use('local',new LocalStrategy(middleware.passport.getLocalstrategyConfig(),middleware.passport.localStrategy));
passport.serializeUser(middleware.passport.serializeUser);
passport.deserializeUser(middleware.passport.deserializeUser);


//  router config
app.post('/login',middleware.passport.authenticate(passport));

app.use(router);
app.use("/v1",v1Router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
