var express = require('express');
var app = express();

// Let public be our static dir.
app.use(express.static('public'));

// Rout traffic to our homepage.
app.get('/', function(req, res) {
    res.redirect('/home');
});

// Deliver homepage.
app.get('/home', function(req, res) {
    res.send('homepage lol');
});

// Start the server.
var server = app.listen(8081, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("App listening at http://%s:%s", host, port);
});
