var express = require('express');
var path = require('path');

// Load environment variables.
var dotenv = require('dotenv');
dotenv.load();

// Authentication strategy.
var passport = require('passport'),
    Auth0Strategy = require('passport-auth0');
var strategy = new Auth0Strategy({
    domain:       process.env.AUTH0_DOMAIN,
    clientID:     process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:  process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
  }, function(accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  });
passport.use(strategy);

// Decrease payload size.
passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function(user, done) { done(null, user); });

var app = express();

// Set the view engine to ejs by default. We can change it later.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var logger = require('morgan');
app.use(logger('dev'));

// Get sessions ready.
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var session = require('client-sessions');
app.use(session({
    cookieName:'session',
    secret: 'bmeyeahmklbahyeambjsealtoijapej', // TODO: Generate this on start.
    duration: 5 * 60 * 60 * 1000,   // You have to login again after 5 hours.
    acctiveuration: 1000 * 60 * 5,  // Inactivity period of 5 minutes.
    cookie: {
        ephemeral: true,
        httpOnly: true
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// Let public be our static dir.
app.use(express.static(path.join(__dirname, 'public')));

// Fromat the DB
require('./functions/firstTimeSetup').firstTimeSetup();

app.use('/', require('./routes/index'));
app.use('/user', require('./routes/user'));
app.use('/subjects', require('./routes/subjects'));
app.use('/quiz', require('./routes/quiz'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
    // development error handler
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
        message: err.message,
        error: err
    });
  });
} else {
    // production error handler
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
        message: err.message,
        error: {}
      });
    });
}

module.exports = app;
