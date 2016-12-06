var express = require('express');
var router = express.Router();

var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

var ensureValid = require('../functions/ensureValid');
var ensureInDatabase = ensureValid.ensureInDatabase;
var ensureIsAdmin = ensureValid.ensureIsAdmin;

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
		if (rows.length == 0) {subject = {id : -1};} 
		else {var subject = rows[0];}
		
		connection.query(
				'SELECT * FROM subjects WHERE subjects.ownerid = ?;',
				[id], function(err1, rows1, fields1) {
			if ( err1 && err1.errno != 1065) {
				res.send(err1);
				return;
			}
			connection.query(
					'SELECT * FROM questions WHERE questions.subjectid = ?;',
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
                    
                    connection.query('SELECT * FROM admins WHERE admins.userid = ?;', [req.user.id], function(err4, rows4) {
                        if (err4) { res.send(err4); }
                        var admin = (rows4.length > 0);
                        res.render('subjects', {
                            admin : admin,
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
});

router.get('/:subjectid/add-subject', ensureIsAdmin, function(req, res) {
    res.render('subject-add-subject', { user : req.user, subject : { id : req.params.subjectid } });
});

router.post('/:subjectid/add-subject', ensureIsAdmin, function(req, res) {
    if ( !req.body.subjectName || req.body.subjectName.length == 0 ) { res.send('must enter name'); return; }
    connection.query('INSERT INTO subjects (ownerid, name) VALUES (?, ?);', [req.params.subjectid, req.body.subjectName], function(err, rows, fields) {
        if (err) {res.send(err); return;}
        res.redirect('/subjects/' + req.params.subjectid);
    });
});

router.get('/:subjectid/add-question', ensureIsAdmin, function(req, res) {
    res.render('subject-add-question', {user : req.user, subject : {id : req.params.subjectid}});
});

router.post('/:subjectid/add-question', ensureIsAdmin, function(req, res) {
    if ( !req.body.questionText || req.body.questionText.length == 0 ) { res.send('must enter name'); return; }
    connection.query('INSERT INTO questions (subjectid, text) VALUES (?, ?);', [req.params.subjectid, req.body.questionText], function(err, rows, fields) {
        if (err) {res.send(err); return;}
        res.redirect('/subjects/' + req.params.subjectid);
    });
});

router.get('/:subjectID/subscribe', ensureLoggedIn, ensureInDatabase, function(req, res) {
	connection.query(
			'INSERT INTO subscriptions VALUES (?, ?, 0);',
			[req.user.id, req.params.subjectID], function(err, rows, fields) {
		if (err) { res.send(err); return; }
		res.redirect('/subjects/' + req.params.subjectID);
	});
});

router.get('/:subjectID/unsubscribe', ensureLoggedIn, ensureInDatabase, function(req, res) {
	connection.query(
			'DELETE FROM subscriptions WHERE userid = ? and subjectid = ?;',
			[req.user.id, req.params.subjectID], function(err, rows, fields) {
		if (err) { res.send(err); return; }
		res.redirect('/subjects/' + req.params.subjectID);
	});
});

module.exports = router;