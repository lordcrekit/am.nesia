// Route for dealing with individual users. This would be their account page,
//  for example.
var express = require('express');
var router = express.Router();

router.get('/logout', function(req, res) {
    res.clearCookie("login");
    res.redirect('../home');
});

module.exports = router;