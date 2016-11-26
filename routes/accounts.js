/*
 * Deals with account creation, deletion, login, etc. If you want to do account
 *	related stuff, but are not logged in, it goes here.
 */
var express = require('express');
var router = express.Router();
var form = require('express-form'),
    field = form.field;

router.get('/create', function(req, res) {
	res.render('account-create');
});

router.post('/create', function(req, res) {
	res.redirect('login');
});

router.get('/login', function(req, res) {
	res.render('account-login');
});

router.post('/login',
    form(
        field("username").trim().required().is(/^[a-z]+$/),
        field("password").trim().required().is(/^[a-z]+$/)
    ),
    function(req, res) {
        if (!req.form.isValid) {
            console.log(req.form.errors);
            console.log(req.form);
            res.render('account-login'); //TODO: add error message.
        } else {
            req.login.username = req.form.username;
            req.login.password = req.form.password;
            res.redirect('../home');
        }
});

module.exports = router;