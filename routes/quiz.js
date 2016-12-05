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
			'SELECT q.id, q.text, q.type FROM subscriptions AS s ' +
				'INNER JOIN questions AS q ON s.subjectid = q.ownerid ' +
				'LEFT JOIN submissions AS sm ON q.id = sm.questionid ' +
				'WHERE s.userid = ? AND (sm.questionid IS NULL OR sm.nextDate <= ?) ' +
				'LIMIT 1;',
			[req.user.id, new Date()], function(err, rows, fields) {
		if ( err && err.errno != 1065) {
			throw err;
			return;
		}
		res.redirect('/quiz/' + rows[0]['id']);
		return;
	});
});

router.get('/:questionID', function(req, res) {
	connection.query('SELECT * FROM questions WHERE questions.id = ?;',
			[req.params.questionID], function(err, rows, fields) {
		if ( err && err.errno != 1065) {
			throw err;
			return;
		}
		if ( rows.length == 0 ) {
			res.send("No more quizes! You're all done for now.");
		} else {
			res.render('quiz', {user : req.user, quiz : rows[0]})
		}
	});
});

router.post('/:questionID', function(req, res) {
	
});

module.exports = router;