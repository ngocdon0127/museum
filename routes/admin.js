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
var checkUnNullParams = global.myCustomVars.checkUnNullParams;
var responseError = global.myCustomVars.responseError;
//  responseError (req, dir, res, errCode, props, values)
var responseSuccess = global.myCustomVars.responseSuccess;
//  responseSuccess (res, props, values)

// var PERM_ADMIN = global.myCustomVars.PERM_ADMIN;
// var PERM_MANAGER = global.myCustomVars.PERM_MANAGER;
// var PERM_USER = global.myCustomVars.PERM_USER;
var LEVEL = {};
LEVEL['admin'] = {
	name: 'Admin',
	class: 'label label-danger'
}
LEVEL['manager'] = {
	name: 'Manager',
	class: 'label label-success'
}
LEVEL['user'] = {
	name: 'Normal User',
	class: 'label label-primary'
}
LEVEL['pending-user'] = {
	name: 'Pending User',
	class: 'label label-warning'
}

// console.log(LEVEL)

/* GET home page. */
// router.get('/', isLoggedIn, function(req, res, next) {
//   res.end('app');
// });

// Only admin can access these routes
router.use('/', isLoggedIn, aclMiddleware('/admin', 'view', '/manager'));

// redirect to /admin/users
router.get('/', function (req, res, next) {
	res.redirect('users')
})

router.get('/users', function (req, res, next) {
	var async = require('asyncawait/async')
	var await = require('asyncawait/await')
	async(() => {
		var user = JSON.parse(JSON.stringify(req.user));
		delete user.level;
		delete user.password;

		var users = await(new Promise((resolve, reject) => {
			User.find({}, function (err, users) {
				if (err){
					console.log(err);
					res.status(500).json({status: 'error', error: 'Error while reading database'})
					resolve([])
				}
				users_ = JSON.parse(JSON.stringify(users))
				for(let i = 0; i < users_.length; i++){
					let u = users_[i];
					delete u.password;
				}
				// console.log(users_)
				resolve(users_);
			})
		}))
		var result = {
			user: user
		}
		result.maDeTais = await(new Promise((resolve, reject) => {
			SharedData.findOne({}, (err, sharedData) => {
				if (!err && sharedData){
					resolve(sharedData.maDeTai);
				}
				else {
					resolve([])
				}
			})
		}))

		for(let i = 0; i < users.length; i++){
			var u = users[i];
			var userRoles = await(new Promise((resolve, reject) => {
				acl.userRoles(u._id, (err, roles) => {
					// console.log('promised userRoles called');
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
				// console.log('admin ' + u._id);
				u.level = LEVEL['admin'];
			}
			else if (userRoles.indexOf('manager') >= 0){
				// console.log('manage ' + u._id);
				u.level = LEVEL['manager'];
			}
			else {
				// console.log('user ' + u._id);
				u.level = LEVEL['user']
				if (!u.maDeTai){
					// console.log('pending user ' + u._id);
					u.level = LEVEL['pending-user'];
				}
			}
		}
		result.users = users;
		result.sidebar = {
			active: 'users'
		}

		// console.log(result);

		res.render('admin/users', result)

	})()
	
})

router.get('/test', function (req, res, next) {
	res.end('access granted')
})

// require extra permission: admin-edit
router.post('/grant/manager', aclMiddleware('/admin', 'edit'), function (req, res, next) {
	var async = require('asyncawait/async');
	var await = require('asyncawait/await');
	async(() => {
		var result = await(new Promise((resolve, reject) => {
			SharedData.findOne({}, (err, sharedData) => {
				if (err || !sharedData){
					resolve([])
				}
				else {
					resolve(sharedData)
				}
			})
		}))

		if (result){
			var maDeTais = result.maDeTai;
			console.log(maDeTais);
			console.log(req.body.maDeTai);
			// console.log('cdcmm');
			if (!req.body.maDeTai){
				console.log('missing maDeTai');
				return res.status(400).json({
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
						res.status(500).json({
							status: 'error',
							error: 'Error while reading user info'
						})
						resolve(0)
					}
					else {
						if (!user) {
							console.log('invalid user');
							res.status(400).json({
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
					return res.status(403).json({
						status: 'error',
						error: 'Không thể giảm cấp 1 Admin xuống Manager'
					})
				}
				else{
					user.maDeTai = req.body.maDeTai;
					// user.level = PERM_MANAGER;
					user.save((err) => {
						if (err){
							res.status(500).json({
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
										return res.status(500).json({
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
			res.status(500).json({
				status: 'error'
			})
		}

	})();
})

router.post('/revoke/manager', aclMiddleware('/admin', 'edit'), function (req, res, next) {
	var async = require('asyncawait/async');
	var await = require('asyncawait/await');
	async(() => {
		if (req.body.userId == req.session.userId){
			console.log('dcmm');
			return res.status(403).json({
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
				res.status(500).json({
					status: 'error',
					error: 'Error while reading user info'
				})
				resolve(0)
			}
			else {
				if (!user) {
					console.log('invalid user');
					res.status(400).json({
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
			return res.status(403).json({
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

router.post('/assign', aclMiddleware('/admin', 'edit'), function (req, res, next) {
	// Coi vai trò của user đang request là manager.
	// Admin sẽ có route assign riêng
	var async = require('asyncawait/async');
	var await = require('asyncawait/await');

	var nullParam = checkUnNullParams(['userId', 'maDeTai'], req.body);

	if (nullParam){
		return responseError(req, '', res, 400, ['error'], ['Thiếu ' + nullParam])
	}

	async(() => {
		var user = await(new Promise((resolve, reject) => {
			User.findById(req.body.userId, (err, user) => {
				if (err){
					console.log(err);
					res.status(500).json({
						status: 'error',
						error: 'Error while reading user info'
					})
					resolve(null)
				}
				else {
					if (user){
						resolve(user)
					}
					else {
						res.status(400).json({
							status: 'error',
							error: 'Invalid userId'
						})
						resolve(null)
					}
				}
			})
		}))
		if (!user){
			// do not care. Handle inside the above await
		}
		else {
			var userRoles = await(new Promise((resolve, reject) => {
				acl.userRoles(user.id, (err, roles) => {
					if (err){
						console.log(err);
						resolve([])
					}
					else {
						resolve(roles)
					}
				})
			}))
			var maDeTais = await(new Promise((resolve, reject) => {
				SharedData.findOne({}, (err, sharedData) => {
					if (err || !sharedData){
						resolve([])
					}
					else {
						resolve(sharedData.maDeTai)
					}
				})
			}))

			if (userRoles.indexOf('admin') >= 0){
				if (req.body.userId == req.session.userId){
					// Chính mình
					if (maDeTais.indexOf(req.body.maDeTai) < 0){
						return responseError(req, '', res, 400, ['error'], ['Mã đề tài không hợp lệ']);
					}
					else {
						user.maDeTai = req.body.maDeTai;
						user.save((err) => {
							if (err){
								console.log(err);
								return responseError(req, '', res, 500, ['error'], ['Error while saving user info'])
							}
							else {
								return responseSuccess(res, [], []);
							}
						})
					}
					
				}
				else {
					return responseError(req, '', res, 403, ['error'], ['Bạn không thể thay đổi thông tin của 1 Admin khác']);
				}
			}
			else if (userRoles.indexOf('manager') >= 0){
				return responseError(req, '', res, 403, ['error'], ['Không thể thay đổi thông tin của 1 Manager bằng thao tác này. Thay vào đó, hãy thu hồi quyền của Manager đó (Revoke Manager Role), sau đó cấp phát lại. (Grant Manager Role on ...)']);
			}
			else {
				if (maDeTais.indexOf(req.body.maDeTai) < 0){
					return responseError(req, '', res, 400, ['error'], ['Mã đề tài không hợp lệ']);
				}
				else {
					user.maDeTai = req.body.maDeTai;
					user.save((err) => {
						if (err){
							console.log(err);
							return responseError(req, '', res, 500, ['error'], ['Error while saving user info'])
						}
						else {
							return responseSuccess(res, [], []);
						}
					})
				}
				
			}
		}
	})()
})

router.post('/fire', aclMiddleware('/admin', 'edit'), function (req, res, next) {
	// Coi vai trò của user đang request là manager.
	// Admin sẽ có route fire riêng
	var async = require('asyncawait/async');
	var await = require('asyncawait/await');

	var nullParam = checkUnNullParams(['userId'], req.body);

	if (nullParam){
		return responseError(req, '', res, 400, ['error'], ['Thiếu ' + nullParam])
	}
	async(() => {
		var user = await(new Promise((resolve, reject) => {
			User.findById(req.body.userId, (err, user) => {
				if (err){
					console.log(err);
					res.status(500).json({
						status: 'error',
						error: 'Error while reading user info'
					})
					resolve(null)
				}
				else {
					if (user){
						resolve(user)
					}
					else {
						res.status(400).json({
							status: 'error',
							error: 'Invalid userId'
						})
						resolve(null)
					}
				}
			})
		}))
		if (!user){
			// do not care. Handle inside the above await
		}
		else {
			var userRoles = await(new Promise((resolve, reject) => {
				acl.userRoles(user.id, (err, roles) => {
					if (err){
						console.log(err);
						resolve([])
					}
					else {
						resolve(roles)
					}
				})
			}))

			if (userRoles.indexOf('admin') >= 0){
				return responseError(req, '', res, 403, ['error'], ['wanna fire an admin? :))']);
			}
			else if (userRoles.indexOf('manager') >= 0){
				return responseError(req, '', res, 403, ['error'], ['Không thể thu hồi tất cả quyền hạn của 1 manager bằng thao tác này. Thay vào đó hãy thu hồi quyền manager (Revoke Manager Role) và thử lại']);
			}
			else {

				user.maDeTai = '';
				user.save((err) => {
					if (err){
						console.log(err);
						return responseError(req, '', res, 500, ['error'], ['Error while saving user info'])
					}
					else {
						return responseSuccess(res, [], []);
					}
				})
			}
		}
	})()
})



function isLoggedIn (req, res, next) {
	console.log('accessing ' + req.path);
	if (!req.isAuthenticated()){
		return res.redirect('/auth/login');
	}
	return next();
}

module.exports = router;
