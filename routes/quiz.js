var express = require('express');
var router = express.Router();

var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var ensureInDatabase = require('../functions/ensureValid').ensureInDatabase;

var mysql = require('mysql');
var connection = mysql.createConnection({
	database	: process.env.RDS_DB_NAME ,
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
				'INNER JOIN questions AS q ON s.subjectid = q.subjectid ' +
				'LEFT JOIN submissions AS sm ON q.id = sm.questionid ' +
				'WHERE s.userid = ? AND (sm.questionid IS NULL OR sm.nextDate <= ?) ' +
				'LIMIT 1;',
			[req.user.id, new Date()], function(err, rows, fields) {
		if ( err && err.errno != 1065) { res.send(err); return;	}
        if ( rows.length == 0 ) {
            res.redirect('/subjects');
        } else {
            res.redirect('/quiz/' + rows[0]['id']);
		}
	});
});

router.get('/:questionID', ensureLoggedIn, function(req, res) {
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

router.post('/:questionid', ensureLoggedIn, ensureInDatabase, function(req, res) {
    
    // Check to see if that answer was correct.
	connection.query('SELECT * FROM answers WHERE answers.questionid = ? AND answers.answer = ?;',
            [req.params.questionid, req.body.answerText], function(err, rows, fields) {
        if ( err && err.errno != 1065) { res.send(err); return; }
        
        var correct = rows.length > 0;
        
        // Get all the correct answers.
        connection.query('SELECT * FROM answers WHERE answers.questionid = ? AND answers.correct = true;',
                [req.params.questionid], function(err1, rows1, fields1) {
            if ( err1 ) { res.send(err1); return; }
            
            // Get the previous submission.
            connection.query('SELECT * FROM submissions WHERE submissions.userid = ? AND submissions.questionid = ?;',
                    [req.user.id, req.params.questionid], function(err2, rows2, fields2) {
                if (err2 && err2.errno != 1065) {res.send(err2); return;}
                var previous_submission = (rows2.length == 0)
                        ? null
                        : rows2[0];
                
                // Update the submissions.
                var origDate = new Date();
                var nextDate = new Date(origDate.getTime() + 60000);
                
                if (previous_submission) {
                    connection.query('UPDATE submissions AS s SET s.origDate = ?, s.nextDate = ? WHERE s.userid = ? AND s.questionid = ?;',
                            [origDate, nextDate, req.user.id, req.params.questionid], function(err3, rows3, fields3) {
                        if (err3) { res.send(err3); return; }
                        res.render('quiz-submit', {user : req.user, correct : correct, gaveAnswer : req.body.answerText, correctAnswers : rows1});
                    });
                } else {
                    connection.query('INSERT INTO submissions VALUES (?, ?, ?, ?)',
                            [req.user.id, req.params.questionid, origDate, nextDate ], function(err3, rows3, fields3) {
                        if (err3) { res.send(err3); return; }
                        res.render('quiz-submit', {user : req.user, correct : correct, gaveAnswer : req.body.answerText, correctAnswers : rows1});
                    });
                }
            });
        });
    });
});

module.exports = router;