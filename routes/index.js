var express = require('express');
var router = express.Router();
var passport = require('passport');
// var acl = GLOBAL.myCustomVars.acl;
var mongoose = require('mongoose');
var acl = require('acl');
acl = new acl(new acl.memoryBackend());
require('../acl.js')(acl);

router.use(function (req, res, next) {
	console.log(req.url);
	next();
})

router.get('/test', aclMiddleWare('/test', 'view'), function (req, res, next) {
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

function aclMiddleWare (resource, action) {
	return function (req, res, next) {
		if (!('userId' in req.session)){
			return res.redirect('/app');
		}
		acl.isAllowed(req.session.userId, resource, action, function (err, result) {
			if (err){
				console.log(err);
			}
			console.log('result: ', result);
			if (result){
				next();
			}
			else {
				return res.redirect('/app');
			}
		});
	}
	
}

module.exports = router;
