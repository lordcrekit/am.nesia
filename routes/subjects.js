var express = require('express');
var router = express.Router();

var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var ensureInDatabase = require('../functions/ensureInDatabase').ensureInDatabase;

var mysql = require('mysql');
var connection = mysql.createConnection({
	database	: process.env.RDS_DBNAME,
	host		: process.env.RDS_HOSTNAME,
	user		: process.env.RDS_USERNAME,
	password	: process.env.RDS_PASSWORD,
	port		: process.env.RDS_PORT
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});

router.get('/', function(req, res) {
	res.redirect('/subjects/-1');
});

router.get('/:subjectID', ensureLoggedIn, function(req, res) {
	var id = parseInt(req.params.subjectID);
	console.log(id);
	connection.query('SELECT * FROM subjects WHERE subjects.id = ?;',
			[id], function(err, rows, fields) {
		if ( err && err.errno != 1065) {
			res.send(err);
			return;
		}
		if (rows.length == 0) {subject = null;} 
		else {var subject = rows[0];}
		
		connection.query(
				'SELECT * FROM subjects WHERE subjects.ownerid = ?;',
				[id], function(err1, rows1, fields1) {
			if ( err1 && err1.errno != 1065) {
				res.send(err1);
				return;
			}
			connection.query(
					'SELECT * FROM questions WHERE questions.ownerid = ?;',
					[id], function(err2, rows2, fields2) {
				if ( err2 && err2.errno != 1065) {
					res.send(err2);
					return;
				}
				connection.query(
						'SELECT * FROM subscriptions AS s WHERE s.userid = ? AND s.subjectid = ?;',
						[req.user.id, req.params.subjectID], function(err3, rows3, fields3) {
					if ( err3 && err3.errno != 1065) {
						res.send(err3);
						return;
					}
					var subscribed = (rows3.length > 0);
					res.render('subjects', {
						user : req.user,
						subject : subject,
						subscribed : subscribed,
						subjects : rows1,
						questions : rows2
					});
					return;
				});
			});
		});
	});
});

router.get('/:subjectID/subscribe', ensureLoggedIn, ensureInDatabase, function(req, res) {
	connection.query(
			'INSERT INTO subscriptions VALUES (?, ?, 0)',
			[req.user.id, req.params.subjectID], function(err, rows, fields) {
		if (err) {
			res.send(err);
			return;
		}
		res.redirect('/subjects/' + req.params.subjectID);
	});
});

router.get('/:subjectID/unsubscribe', ensureLoggedIn, ensureInDatabase, function(req, res) {
	connection.query(
			'DELETE FROM subscriptions WHERE userid = ? and subjectid = ?;',
			[req.user.id, req.params.subjectID], function(err, rows, fields) {
		if (err) {
			res.send(err);
			return;
		}
		res.redirect('/subjects/' + req.params.subjectID);
	});
});

module.exports = router;