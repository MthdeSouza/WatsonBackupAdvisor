var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var handlebars = require('express-handlebars');

var relayHandler = function relayHandler(req, res) {
  var relayState = req.query && req.query.RelayState || req.body && req.body.RelayState;
  var hashQuery = relayState && relayState.match(/^\#/) && ('/app'+relayState) || relayState  || '/';
  res.redirect(hashQuery);
};

module.exports = function(app, config, passport) {
  // Some pages requires an authenticated user
  function forceLogin(req,res,next){
    if (req.user)
      next();
    else req.user = { id:"000000000", displayName:"Nobody", email:"nobody@noWhere.com",firstName:"Nobody" }
      //res.redirect('/login/?RelayState=' + encodeURI(req.url) );
  }

  router.get('/', forceLogin, function(req, res) {
    //app.set('view engine', 'handlebars');
    delete req.session.WORKSPACE_ID;
    if (process.env.NODE_ENV==='production') {
      res.render('index');
    } else {
      res.render('index', {'debug': true});
    }
  });

  router.get('/poc_appops', (req, res) => { res.render('poc_appops') })

  router.get('/engagement', forceLogin, function (req, res) {
    req.session.WORKSPACE_ID="bea3c0b9-da71-4c65-b2a7-f5dd9dfd5b1c"
    res.render('index');
  });

  router.get('/survey', forceLogin, function (req, res) {
    req.session.WORKSPACE_ID="2cad8d53-2dcb-45b0-b778-3cf4ab5e74c8"
    res.render('index');
  });

  router.get('/external/:style', forceLogin, function(req, res) {
    res.render('index', {'external': req.params.style});
  });

  router.get('/external/:style/:message', forceLogin, function(req, res) {
    res.render('index', {'external': req.params.style, 'message': req.params.message });
  });

    // Start SAML login process
  router.get('/login', passport.authenticate(config.passport.strategy), relayHandler);
    // Process callback from IDP for login
  router.post('/login/callback/postResponse',
    // !!! Important !!! Response XML structure needs to be tweaked to pass signature validation
    passport.patchResponse(),passport.authenticate(config.passport.strategy), relayHandler
  );

  //router.get('/error/*',function(req,res){
  //  res.sendFile(__dirname + '/SSO' + req.path);
  //});

  router.get('/*',function(req,res){ // css, js, etc.  ---> Keep as the last function
    res.sendFile(__dirname + '/views' + req.path);
  });

  return router;
};
