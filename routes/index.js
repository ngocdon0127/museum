var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var fs = require('fs');
var path = require('path');

var aclMiddleware = global.myCustomVars.aclMiddleware;

router.use(function (req, res, next) {
	console.log(req.url);
	next();
})

router.get('/test', aclMiddleware('/test', 'view'), function (req, res, next) {
	res.end("hehe");
})

router.get('/config', aclMiddleware('/config', 'view'), function (req, res, next) {
	User.find({}, function (err, users) {
		if (err){
			return console.log(err);
		}
		var aclRules = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl.json')).toString());
		var roles = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/roles.json')).toString());
		var result = {};
		result.users = {};
		for (var i = 0; i < users.length; i++) {
			var user = {};
			user.id = users[i].id;
			user.fullname = users[i].fullname;
			user.username = users[i].username;
			result.users[user.id] = user;
		}
		
		result.roles = [];
		for (var i = 0; i < roles.length; i++) {
			result.roles.push(roles[i].role);
		}
		result.aclRules = {};
		for (var i = 0; i < aclRules.length; i++) {
			result.aclRules[aclRules[i].userId] = [];
			for (var j = 0; j < aclRules[i].roles.length; j++) {
				result.aclRules[aclRules[i].userId].push(aclRules[i].roles[j]);
			}
		}
		return res.json({
			users: result.users,
			roles: result.roles,
			aclRules: result.aclRules
		})
	})
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
