var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars');
require('dotenv').config({silent: true});

var app = express();

// view engine setup
app.engine('handlebars', handlebars({layout: false}));
app.set('view engine', 'handlebars');

//favicon
app.use(favicon(path.join(__dirname, 'views', 'img', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/*
 * =====================================================================
 * Session framework setup
 *
 */
//VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");

// Set up session framework
var passport = require("passport"),
    session = require("express-session"),
    samlConfig = require('./SSO/config/saml')[process.env.SSO_PROFILE || appInfo.space_name || 'dev']; // Select configuration based on profile

var MemoryStore = require('session-memory-store')(session);


/*
 * =====================================================================
 *  Setup session support
 */

app.use(session({secret: samlConfig.passport.sessionSecret || 'SAML support for BlueMix',
    cookie: { path: '/', httpOnly: true, secure: !!samlConfig.passport.saml,  maxAge: null },
    resave: true,
    proxy: true,
    saveUninitialized: true,
    store: new MemoryStore()}));
/*
 * =====================================================================
 *  Passport framework setup
 */
app.use(passport.initialize());
app.use(passport.session());

// Configure passport SAML strategy parameters
require('./SSO/lib/passport')(passport, samlConfig);

/*
 * =====================================================================
 *  Mount API handlers before session to improve performance
 */
app.use('/api', require('./RoutesAPI')(app, samlConfig, passport));

/*
 * =====================================================================
 *  Configure secure routes
 */

app.use('/', require('./RoutesSecure')(app, samlConfig, passport));
/*
 * =====================================================================
 */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
