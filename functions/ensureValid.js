var express = require('express');

var mysql = require('mysql');
var connection = mysql.createConnection({
	database	: process.env.RDS_DB_NAME,
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

/*
 * Makes sure the user is in the database.
 */
var ensureInDatabase = function(req, res, next) {
	connection.query(
			'SELECT * FROM users WHERE users.id = ?;',
			[req.user.id], function(err, rows, fields) {
		if (err) {
			res.send(err);
			return;
		}
		if ( rows.length == 0 ) {
			console.log("adding " + req.user.id + " to database.");
			connection.query(
					'INSERT INTO users VALUES (?, null, ?, ?);',
					[req.user.id, 5, 172800000], function(err1, rows1, fields1) {
				if (err1) {
					res.send(err1);
					return;
				}
				next();
			});
		} else {
			next();
		}
	});
};

/*
 * Makes sure the user is an admin.
 */
var ensureIsAdmin = function(req, res, next) {
    connection.query('SELECT * FROM admins WHERE admins.userid = ?;',
            [req.user.id], function(err) {
        if (err) {
            console.log(err);
            res.render('no-access');
        } else {
            next();
        }
    });
}

module.exports = {ensureInDatabase : ensureInDatabase, ensureIsAdmin : ensureIsAdmin };