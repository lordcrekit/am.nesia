var express = require('express');
var app = express();

// Set the view engine to ejs by default. We can change it later.
app.set('view engine', 'ejs');

// Get sessions ready.
var session = require('client-sessions');
app.use(session({
    cookieName:'login',
    secret: 'bmeyeahmklbahyeambjsealtoijapej', // TODO: Generate this on start.
    duration: 5 * 60 * 60 * 1000,   // You have to login again after 5 hours.
    acctiveuration: 1000 * 60 * 5,  // Inactivity period of 5 minutes.
    cookie: {
        ephemeral: true,
        httpOnly: true
    }
}));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());
app.use(bodyParser.json())

// Let public be our static dir.
app.use(express.static('public'));

// Rout traffic to our homepage.
app.get('/', function(req, res) {
    res.redirect('/home');
});

// Deliver homepage.
app.get('/home', function(req, res) {
    console.log(req.login);
    res.render('home', {account: req.login});
});

// Deliver about page
app.get('/about', function(req, res) {
	res.render('about');
});

app.use('/account', require('./routes/account'));
app.use('/accounts', require('./routes/accounts'));

// Start the server.
var server = app.listen(process.env.PORT || 3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("App listening at http://%s:%s", host, port);
});
