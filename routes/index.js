var express = require('express');
var passport = require('passport');
var router = express.Router();

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
};

router.get('/', function(req, res) {
    res.redirect('/home');
});

// Deliver homepage.
router.get('/home', function(req, res) {
    console.log('user is' + req.user);
    req.session.returnTo = '/home';
    
    res.render('home', {user: req.user});
});

// Deliver about page
router.get('/about', function(req, res) {
    res.render('about');
});

// Login
router.get('/login',
  function(req, res){
    res.render('account-login', { env: env });
});

// Logout
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// After being logged in.
router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/login-failure' }),
  function(req, res) {
      console.log('user is ' + req.user);
      res.redirect(req.session.returnTo || '/');
});

module.exports = router;
