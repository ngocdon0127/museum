var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

var async = require('asyncawait/async');
var await = require('asyncawait/await');

var PROMISES = global.myCustomVars.promises;

/* GET users listing. */
router.get('/', function(req, res, next) {
  return res.redirect('me');
});

router.get('/me', isLoggedIn, function (req, res, next) {
	var roles = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/roles.json')).toString());
	var cores = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl-core.json')).toString())
	var aclRules = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl.json')).toString());
	if (aclRules.hasOwnProperty(req.user.id)){
		var data = aclRules[req.user.id];
		sides = [];
		for(var i = 0; i < data.roles.length; i++){
			var allows = roles[data.roles[i]].allows;
			for(var j = 0; j < allows.length; j++){
				if (allows[j].hasOwnProperty('actions') && allows[j].hasOwnProperty('resourceId') && (sides.indexOf(allows[j].resourceId) < 0)){
					sides.push(allows[j].resourceId)
				}
			}
		}
		let user = JSON.parse(JSON.stringify(req.user));
		delete user.password;
		delete user.__v;
		delete user._id;
		delete user.forgot_password;
		async(() => {
			let userRoles = await(PROMISES.getUserRoles(req.session.userId));
			if (userRoles.indexOf('admin') >= 0){
				user.level = 'Admin'
			}
			else if (userRoles.indexOf('manager') >= 0){
				user.level = 'Chủ nhiệm đề tài'
			}
			else {
				user.level = ''
			}
			return res.json({
				status: 'success',
				user: user,
				data: sides
			})
		})()
		
	}
	else {
		let user = JSON.parse(JSON.stringify(req.user));
		delete user.password;
		delete user.level;
		delete user.__v;
		delete user._id;
		delete user.forgot_password;
		return res.json({
			status: 'success',
			user: user,
			data: []
		})
	}
})

function isLoggedIn (req, res, next) {
	if (!req.isAuthenticated()){
		return res.redirect('/auth/login');
	}
	return next();
}

module.exports = router;
