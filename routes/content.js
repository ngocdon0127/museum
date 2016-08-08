var express = require('express');
var router = express.Router();
var passport = require('passport');
var multer = require('multer');

router.use(isLoggedIn);

/* GET home page. */
router.get('/', function(req, res, next) {
	res.end("up content");
});

// handle data for animal form
require('./animal.js')(router);

function isLoggedIn (req, res, next) {
	if (!req.isAuthenticated()){
		return res.redirect('/auth/login');
	}
	return next();
}

module.exports = router;
