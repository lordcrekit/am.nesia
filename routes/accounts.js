/*
 * Deals with account creation, deletion, login, etc. If you want to do account
 *	related stuff, but are not logged in, it goes here.
 */
var express = require('express');
var router = express.Router();

router.get('/create', function(req, res) {
	res.render('account-create');
});

router.post('/create', function(req, res) {
	res.redirect('login');
});

router.get('/login', function(req, res) {
	res.render('account-login');
});

router.post('/login', function(req, res) {
	res.redirect('../home');
});

module.exports = router;