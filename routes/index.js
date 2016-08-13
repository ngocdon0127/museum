var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var fs = require('fs');
var path = require('path');
var multer = require('multer');
var uploads = multer({dest: 'public/uploads/animal'});

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
		for (var i in roles) {
			var r = {};
			r.role = roles[i].role;
			r.rolename = roles[i].rolename;
			result.roles.push(r);
		}
		result.aclRules = {};
		for (var i in aclRules) {
			result.aclRules[aclRules[i].userId] = [];
			for (var j = 0; j < aclRules[i].roles.length; j++) {
				result.aclRules[aclRules[i].userId].push(aclRules[i].roles[j]);
			}
		}
		// return res.json({
		// 	users: result.users,
		// 	roles: result.roles,
		// 	aclRules: result.aclRules,
		// 	user: req.user
		// })
		res.render('config', {
			users: result.users,
			roles: result.roles,
			aclRules: result.aclRules,
			user: req.user
		});
	})
})

router.post('/config', uploads.single('photo'), aclMiddleware('/config', 'edit'), function (req, res, next){
	console.log('---');
	console.log(req.body);
	// console.log(JSON.parse(req.body));
	console.log('---');
	User.findById(req.body.userid, function (err, user) {
		if (err){
			console.log(err);
			return res.status(403).json({
				status: 'error',
				error: 'You don\'t have permission to access this page'
			})
		}
		if (user){
			var roles = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/roles.json')).toString());
			var newRoles = [];
			for (var i in roles){
				var r = roles[i].role;
				if ((r in req.body) && (req.body[r] == 'on')){
					newRoles.push(r);
				}
			}
			var aclRules = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl.json')).toString());
			if (!(user.id in aclRules)){
				aclRules[user.id] = {};
				aclRules[user.id].userId = user.id;
			}
			aclRules[user.id].roles = newRoles;
			fs.writeFileSync(path.join(__dirname, '../config/acl.json'), JSON.stringify(aclRules, null, 4));
			console.log("OK. restarting server");
			return restart(res);
		}
		else {
			return res.status(400).json({
				status: 'error',
				error: 'Invalid userid'
			})
		}
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

function restart (res) {
	res.status(200).json({
		status: 'success'
	});

	console.log('res sent');

	setTimeout(function () {
		console.log('halt');
		process.exit(0);
	}, 1000)
}

module.exports = router;
