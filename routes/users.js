var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

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
		delete user.level;
		delete user.__v;
		delete user._id;
		delete user.maDeTai;
		return res.json({
			status: 'success',
			data: sides,
			user: user
		})
	}
	else {
		return res.json({
			status: 'error',
			error: 'Invalid user id'
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
