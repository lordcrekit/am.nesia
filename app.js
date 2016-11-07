var express = require('express');
var app = express();

// Set the view engine to ejs by default. We can change it later.
app.set('view engine', 'ejs');

// Let public be our static dir.
app.use(express.static('public'));

// Rout traffic to our homepage.
app.get('/', function(req, res) {
    res.redirect('/home');
});

// Deliver homepage.
app.get('/home', function(req, res) {
    res.render('home');
});

// Start the server.
var server = app.listen(process.env.PORT || 3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("App listening at http://%s:%s", host, port);
});
