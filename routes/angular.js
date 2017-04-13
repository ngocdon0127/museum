var express = require('express');
var router = express.Router();
var passport = require('passport');
var path = require('path');

var aclMiddleware = global.myCustomVars.aclMiddleware;

/* GET home page. */
// router.get('/', isLoggedIn, function(req, res, next) {
//   res.end('app');
// });

router.use('/', isLoggedIn, express.static(path.join(__dirname, '../app')));

function isLoggedIn (req, res, next) {
	if (!req.isAuthenticated()){
		return res.redirect('/auth/login');
	}
	return next();
}

module.exports = router;
