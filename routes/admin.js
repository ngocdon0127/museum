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

var async = require('asyncawait/async');
var await = require('asyncawait/await');

var PROMISES = global.myCustomVars.promises;

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

		var users = await(global.myCustomVars.promises.getUsers()).usersNormal;
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
			let u = users[i];
			u.level = LEVEL[u.level];
		}
		result.users = users;
		result.sidebar = {
			active: 'users'
		}

		res.render('admin/users', result)

	})()
})

router.get('/test', function (req, res, next) {
	async(() => {
		let x = await(PROMISES.userHasRole(req.user.id, 'manager1'));
		res.end(JSON.stringify(x))
	})()
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
	// Admin
	var async = require('asyncawait/async');
	var await = require('asyncawait/await');

	var nullParam = checkUnNullParams(['userId', 'maDeTai'], req.body);

	if (nullParam){
		return responseError(req, '', res, 400, ['error'], ['Thiếu ' + nullParam])
	}

	req.body.maDeTai = req.body.maDeTai.trim();

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
			// do not care. Handle inside the above await block
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
						return responseError(req, '', res, 400, ['error', 'newMDT'], ['Mã đề tài không hợp lệ', req.body.maDeTai]);
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
					return responseError(req, '', res, 400, ['error', 'newMDT'], ['Mã đề tài không hợp lệ', req.body.maDeTai]);
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

router.post('/addMDT', aclMiddleware('/admin', 'edit'), (req, res, next) => {
	async(() => {
		var nullParam = checkUnNullParams(['newMaDeTai', 'adminPassword'], req.body);

		if (nullParam){
			return responseError(req, '', res, 400, ['error'], ['Thiếu ' + nullParam])
		}
		// console.log(req.body);
		req.body.newMaDeTai = req.body.newMaDeTai.trim();

		if (req.user.validPassword(req.body.adminPassword)){
			let result = await(PROMISES.addMaDeTai(req.body.newMaDeTai));
			if (result.status == 'error'){
				return responseError(req, '', res, 400, ['error'], [result.error]);
			}
			else if (result.status == 'success'){
				let roles = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/roles.json')));
				let newRole = req.body.newMaDeTai + '_content';
				newRole = newRole.replace(/\r+\n+/g, ' ');
				newRole = newRole.replace(/ {2,}/g, ' ');
				newRole = newRole.toLowerCase(); 
				newRole = newRole.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a"); 
				newRole = newRole.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e"); 
				newRole = newRole.replace(/ì|í|ị|ỉ|ĩ/g, "i"); 
				newRole = newRole.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o"); 
				newRole = newRole.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u"); 
				newRole = newRole.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y"); 
				newRole = newRole.replace(/đ/g, "d"); 
				newRole = newRole.replace(/ /g, "-");
				roles[newRole] = JSON.parse(JSON.stringify(roles['content']));
				roles[newRole].maDeTai = req.body.newMaDeTai;
				roles[newRole].role = newRole;
				roles[newRole].rolename = 'Nhân viên ' + req.body.newMaDeTai;
				fs.writeFileSync(path.join(__dirname, '../config/roles.json'), JSON.stringify(roles, null, 4));
				return restart(res);
			}
		}
		else {
			return responseError(req, '', res, 403, ['error'], ['Mật khẩu không đúng'])
		}

		
	})()
})

router.get('/statistic', (req, res, next) => {
	async(() => {
		let users = await(PROMISES.getUsers()).usersNormal;
		let countLevel = {
			'admin': 0,
			'manager': 0,
			'user': 0,
			'pending-user': 0
		}
		let countMaDeTai = {}
		// console.log(users);
		for(let user of users){
			if (user.maDeTai){
				console.log('checking ' + user.username);
				if (user.maDeTai in countMaDeTai){
					if (user.level in countMaDeTai[user.maDeTai]){
						countMaDeTai[user.maDeTai][user.level]++;
					}
					else {
						countMaDeTai[user.maDeTai][user.level] = 1;
					}
				}
				else {
					let obj = JSON.parse(JSON.stringify(countLevel));
					delete obj['pending-user'];
					obj[user.level] = 1;
					countMaDeTai[user.maDeTai] = obj;

				}
			}
		}
		for(let user of users){
			delete user.password;
			countLevel[user.level]++;
		}
		// return res.json({
		// 	countMaDeTai: countMaDeTai,
		// 	countLevel: countLevel
		// })
		return res.render('admin/users-statistic', {
			countLevel: countLevel,
			countMaDeTai: countMaDeTai,
			user: req.user,
			sidebar: {
				active: 'statistic-user'
			}
		})
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
