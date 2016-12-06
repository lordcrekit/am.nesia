var express = require('express');
var router = express.Router();

var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

var ensureValid = require('../functions/ensureValid');
var ensureInDatabase = ensureValid.ensureInDatabase;
var ensureIsAdmin = ensureValid.ensureIsAdmin;

var mysql = require('mysql');
var connection = mysql.createConnection({
	database	: process.env.RDS_DB_NAME ,
	host		: process.env.RDS_HOSTNAME,
	user		: process.env.RDS_USERNAME,
	password	: process.env.RDS_PASSWORD,
	port		: process.env.RDS_PORT
});

router.get('/:questionid', ensureLoggedIn, function(req, res) {
	connection.query('SELECT * FROM questions WHERE questions.id = ?;',
			[req.params.questionid], function(err, rows, fields) {
		if ( err ) { res.send(err); return; }
        var question = rows[0];
        
        connection.query('SELECT * FROM answers WHERE answers.questionid = ?;',
                [req.params.questionid], function(err1, rows1, fields1) {
            if ( err1 && err1.errno != 1065 ) { res.send(err1); return; }
            var answers = rows1;
            
            connection.query('SELECT * FROM admins WHERE admins.userid = ?;', [req.user.id], function(err4, rows4) {
                if (err4) { res.send(err4); }
                var admin = (rows4.length > 0);
                
                res.render('question', {admin : admin, user : req.user, question : question, answers : answers });
            });
        });
    });
});

router.get('/:questionid/add-answer', ensureLoggedIn, ensureIsAdmin, function(req, res) {
    res.render('question-add-answer', {user : req.user, question : {id : req.params.questionid}});
});

router.post('/:questionid/add-answer', ensureLoggedIn, ensureIsAdmin, function(req, res) {
    connection.query(
            'INSERT INTO answers (questionid, answer, correct) VALUES (?, ?, ?);',
			[req.params.questionid, req.body.answerText, (req.body.isCorrect == 'correct')], function(err, rows, fields) {
        if ( err ) { res.send(err); return; }
        res.redirect('/questions/' + req.params.questionid);
    });
});


module.exports = router;