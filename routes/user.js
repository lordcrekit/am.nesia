var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

var ensureValid = require('../functions/ensureValid');
var ensureInDatabase = ensureValid.ensureInDatabase;
var ensureIsAdmin = ensureValid.ensureIsAdmin;

var router = express.Router();

var mysql = require('mysql');
var connection = mysql.createConnection({
	database	: process.env.RDS_DBNAME,
	host		: process.env.RDS_HOSTNAME,
	user		: process.env.RDS_USERNAME,
	password	: process.env.RDS_PASSWORD,
	port		: process.env.RDS_PORT
});

/* GET user profile. */
router.get('/', ensureLoggedIn, function(req, res, next) {
    connection.query('SELECT * FROM admins WHERE admins.userid = ?;', [req.user.id], function(err, rows) {
        if (err || rows.length == 0) {
            res.render('user', { admin: false, user: req.user });    
        } else {
            res.render('user', { admin: true, user: req.user });
        }
    });
});

router.get('/request-admin', ensureLoggedIn, ensureInDatabase, function(req, res, next) {
   res.render('user-request-admin', {user : req.user}); 
});

router.post('/request-admin', ensureLoggedIn, ensureInDatabase, function(req, res, next) {
    if (req.body.password == process.env.REQUEST_ADMIN_PASSWORD) {
        connection.query('INSERT INTO admins VALUES (?)', [req.user.id], function(err) {
            if (err) { console.log(err); }
            res.redirect('/user');
        });
    }
});

router.get('/revoke-admin', ensureLoggedIn, ensureIsAdmin, function(req, res, next) {
    connection.query('DELETE FROM admins WHERE userid = (?)', [req.user.id], function(err) {
        if (err) { console.log(err); }
        res.redirect('/user');
    });
});

module.exports = router;
