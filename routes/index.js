var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', isLoggedIn, function(req, res, next) {
	res.redirect('/app');
});

function isLoggedIn (req, res, next) {
	if (!req.isAuthenticated()){
		return res.redirect('/auth/login');
	}
	return next();
}

module.exports = router;
