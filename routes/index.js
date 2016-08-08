var express = require('express');
var router = express.Router();
var passport = require('passport');
var acl = require('acl');
var mongodb = require('mongodb');
mongodb.connect("mongodb://ngocdon0127:museum@ds145415.mlab.com:45415/museum", function(error, db) {
	var mongoBackend = new acl.mongodbBackend(db, 'acl_');
	acl = new acl(mongoBackend);
	require('../acl.js')(acl);
	router.get('/test', acl.middleware(), function (req, res, next) {
		res.end("hehe");
	})
});

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
