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

router.get('/', ensureLoggedIn, ensureInDatabase, function(req, res) {
	connection.query(
			'SELECT * FROM subscriptions AS s' +
				'INNER JOIN questions AS q ON s.subjectid = q.subjectid' +
				'LEFT JOIN submissions AS sm ON q.id = sm.questionid;',
				//'WHERE s.userid = ? AND (sm.questionid = NULL OR sm.nextDate < ?)' +
				//'LIMIT 1;',
			[req.user.id, new Date()], function(err, rows, fields) {
		if ( err && err.errno != 1065) {
			throw err;
			return;
		}
	});
});

router.get('/:questionID', function(req, res) {
	connection.query('SELECT * FROM WHERE subjects.id = ?;',
			[id], function(err, rows, fields) {
		if ( err && err.errno != 1065) {
			throw err;
			return;
		}
		res.send(rows);
	});
});

router.post('/:questionID', function(req, res) {
	
});

module.exports = router;