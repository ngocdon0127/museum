var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');

var aclMiddleware = global.myCustomVars.aclMiddleware;

router.use(function (req, res, next) {
	console.log(req.url);
	next();
})

router.get('/test', aclMiddleware('/test', 'view'), function (req, res, next) {
	res.end("hehe");
})

// router.get('/test', function (req, res, next) {
// 	res.end("hehe");
// })

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
