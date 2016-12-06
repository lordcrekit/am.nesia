var express = require('express');
var fs = require('fs');
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
    
var first_time_setup = function() {
    connection.query("SHOW TABLES", function(err, rows) {
        if (err) {throw err;}
        var found = [];
        for (var i = 0; i < rows.length; i++) {
            found.push(rows[i]['Tables_in_' + process.env.RDS_DB_NAME]);
        }
        console.log(found);
        // Check users table.
        var needed = ['users', 'admins', 'subjects', 'questions',
                    'subscriptions', 'submissions', 'answers'];
        needed.forEach(function(value) {
            if (found.indexOf(value) <= -1) {
                console.log("Creating table " + value)
                fs.readFile('./functions/tableDeclarations/' + value + '.txt', 'ascii', function(err1, data) {
                    if (err1) { throw err1; }
                    connection.query(data, function(err2) {
                        if (err2 && err2.errno != 1065) { console.log(err2.errno); throw err2; }
                        console.log('      Success!');
                    });
                });
            }
        });
	});
};

module.exports = {firstTimeSetup : first_time_setup};