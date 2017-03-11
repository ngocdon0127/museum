var express = require('express');
var router = express.Router();
var passport = require('passport');
var path = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var SharedData = mongoose.model('SharedData');

var aclMiddleware = global.myCustomVars.aclMiddleware;
var acl = global.myCustomVars.acl;

var restart = global.myCustomVars.restart;

var PERM_ADMIN = global.myCustomVars.PERM_ADMIN;
var PERM_MANAGER = global.myCustomVars.PERM_MANAGER;
var PERM_USER = global.myCustomVars.PERM_USER;
var LEVEL = {};
LEVEL[PERM_ADMIN] = {
	name: 'Admin',
	class: 'label label-danger'
}
LEVEL[PERM_MANAGER] = {
	name: 'Manager',
	class: 'label label-success'
}
LEVEL[PERM_USER] = {
	name: 'Normal User',
	class: 'label label-primary'
}

// console.log(LEVEL)

/* GET home page. */
// router.get('/', isLoggedIn, function(req, res, next) {
//   res.end('app');
// });

// Only admin can access these routes
router.use('/', isLoggedIn, aclMiddleware('/admin', 'view'), express.static(path.join(__dirname, '../views/admin/')));

// redirect to /admin/users
router.get('/', function (req, res, next) {
	res.redirect('users')
})

router.get('/users', function (req, res, next) {
	var user = JSON.parse(JSON.stringify(req.user));
	delete user.level;
	delete user.password;

	User.find({}, function (err, users) {
		if (err){
			console.log(err);
			return res.json({status: 500, error: 'Error while reading database'})
		}
		users_ = JSON.parse(JSON.stringify(users))
		for(let i = 0; i < users_.length; i++){
			let u = users_[i];
			delete u.password;
			if (u.level) {
				console.log(u.level)
				u.level = LEVEL[u.level]
			}
			else {
				// console.log(e);
				users[i].level = PERM_USER;
				users[i].save();
				u.level = LEVEL[PERM_USER]
			}
		}
		console.log(users_)
		SharedData.findOne({}, (err, sharedData) => {
			var result = {
				user: user,
				users: users_
			}
			if (!err && sharedData){
				result.maDeTais = sharedData.maDeTai
			}
			else {
				result.maDeTais = []
			}
			res.render('admin/pages/tables/users', result)
		})
		
	})
	
})

router.get('/test', function (req, res, next) {
	res.end('access granted')
})

// require extra permission: admin-edit
router.post('/make/manager', aclMiddleware('/admin', 'edit'), function (req, res, next) {
	var async = require('asyncawait/async');
	var await = require('asyncawait/await');
	async(() => {
		var result = await(new Promise((resolve, reject) => {
			SharedData.findOne({}, (err, sharedData) => {
				if (err){
					resolve(-1)
				}
				else {
					resolve(sharedData)
				}
			})
		}))

		if (result != -1){
			var maDeTais = result.maDeTai;
			console.log(maDeTais);
			console.log(req.body.maDeTai);
			// console.log('cdcmm');
			if (!req.body.maDeTai){
				console.log('missing maDeTai');
				return res.json({
					status: 'error',
					error: 'Invalid maDeTai'
				})
			}
			if (req.body.userId == req.session.userId){
				console.log('dcmm');
				return res.json({
					status: 'error',
					error: 'Không thể tự sửa đổi cấp bậc của mình'
				})
			}
			// console.log('this');
			var user = await(new Promise((resolve, reject) => {
				// console.log('promise called');
				User.findById(req.body.userId, (err, user) => {
					// console.log('done query');
					if (err){
						console.log(err);
						res.json({
							status: 'error',
							error: 'Error while reading user info'
						})
						resolve(0)
					}
					else {
						if (!user) {
							console.log('invalid user');
							res.json({
								status: 'error',
								error: 'Invalid userId'
							})
							resolve(0)
						}
						else {
							// console.log('has user');
							resolve(user)
						}
					}
				})
			}))
			if (user){
				// console.log('user found');
				var userRoles = await(new Promise((resolve, reject) => {
					acl.userRoles(req.body.userId, (err, roles) => {
						console.log('promised userRoles called');
						if (err){
							resolve([])
						}
						else {
							resolve(roles)
						}
					})
				}))
				// console.log('userRoles done');
				// console.log(userRoles);
				if (userRoles.indexOf('admin') >= 0){
					return res.json({
						status: 'error',
						error: 'Không thể giảm cấp 1 Admin xuống Manager'
					})
				}
				else{
					user.maDeTai = req.body.maDeTai;
					user.level = PERM_MANAGER;
					user.save((err) => {
						if (err){
							res.json({
								status: 'error',
								error: 'Error while saving user info'
							})
						}
						else {
							if (result.maDeTai.indexOf(req.body.maDeTai) < 0){
								result.maDeTai.push(req.body.maDeTai);
								result.save((err) => {
									if (err){
										console.log(err);
										return res.json({
											status: 'error',
											error: 'Error while saving new MaDeTai'
										})
									}
									else {
										var data = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl.json')));
										if (req.body.userId in data){
											let r = data[req.body.userId];
											if (r.roles.indexOf('manager') < 0){
												r.roles.push('manager');
												fs.writeFileSync(path.join(__dirname, '../config/acl.json'), JSON.stringify(data, null, 4));
											}

										}
										else {
											data[req.body.userId] = {
												userId: req.body.userId,
												roles: ["manager"]
											}
											fs.writeFileSync(path.join(__dirname, '../config/acl.json'), JSON.stringify(data, null, 4));
										}
										return restart(res);
									}
								})
							}
							else {
								var data = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl.json')));
								if (req.body.userId in data){
									let r = data[req.body.userId];
									if (r.roles.indexOf('manager') < 0){
										r.roles.push('manager');
										fs.writeFileSync(path.join(__dirname, '../config/acl.json'), JSON.stringify(data, null, 4));
									}

								}
								else {
									data[req.body.userId] = {
										userId: req.body.userId,
										roles: ["manager"]
									}
									fs.writeFileSync(path.join(__dirname, '../config/acl.json'), JSON.stringify(data, null, 4));
								}
								return restart(res);
							}
						}
					})
				}
			}
		}
		else {
			res.json({
				status: 'error'
			})
		}

	})();
})

router.post('/remove/manager', aclMiddleware('/admin', 'edit'), function (req, res, next) {
	var async = require('asyncawait/async');
	var await = require('asyncawait/await');
	async(() => {
		if (req.body.userId == req.session.userId){
			console.log('dcmm');
			return res.json({
				status: 'error',
				error: 'Không thể tự sửa đổi cấp bậc của mình'
			})
		}
		var user = await(new Promise((resolve, reject) => {
		// console.log('promise called');
		User.findById(req.body.userId, (err, user) => {
			// console.log('done query');
			if (err){
				console.log(err);
				res.json({
					status: 'error',
					error: 'Error while reading user info'
				})
				resolve(0)
			}
			else {
				if (!user) {
					console.log('invalid user');
					res.json({
						status: 'error',
						error: 'Invalid userId'
					})
					resolve(0)
				}
				else {
					// console.log('has user');
					resolve(user)
				}
			}
		})
	}))
	if (user){
		// console.log('user found');
		var userRoles = await(new Promise((resolve, reject) => {
			acl.userRoles(req.body.userId, (err, roles) => {
				console.log('promised userRoles called');
				if (err){
					resolve([])
				}
				else {
					resolve(roles)
				}
			})
		}))
		// console.log('userRoles done');
		// console.log(userRoles);
		if (userRoles.indexOf('admin') >= 0){
			return res.json({
				status: 'error',
				error: 'Không thể thay đổi quyền của 1 Admin'
			})
		}
		else{
			var data = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl.json')));
			if (req.body.userId in data){
				let r = data[req.body.userId];
				let index = r.roles.indexOf('manager')
				if (index >= 0){
					r.roles.splice(index, 1);
					fs.writeFileSync(path.join(__dirname, '../config/acl.json'), JSON.stringify(data, null, 4));
				}

			}
			else {
				data[req.body.userId] = {
					userId: req.body.userId,
					roles: []
				}
				fs.writeFileSync(path.join(__dirname, '../config/acl.json'), JSON.stringify(data, null, 4));
			}
			return restart(res);
		}
	}
	})();
})

function isLoggedIn (req, res, next) {
	console.log('accessing ' + req.path);
	if (!req.isAuthenticated()){
		return res.redirect('/auth/login');
	}
	return next();
}

module.exports = router;
