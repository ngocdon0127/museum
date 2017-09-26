var express = require('express');
var router = express.Router();
var passport = require('passport');
var path = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var SharedData = mongoose.model('SharedData');
var Log = mongoose.model('Log');

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
var getPublicIP = global.myCustomVars.getPublicIP;

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
		result.maDeTais = await(PROMISES.getMaDeTai())

		for(let i = 0; i < users.length; i++){
			let u = users[i];
			if (u.id == req.session.userId){
				console.log('my level: ' + u.level);
				user.level = u.level;
			}
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
		var result = await(PROMISES.getSharedData())

		if (result){
			var maDeTais = await(PROMISES.getMaDeTai());
			// console.log(maDeTais);
			// console.log(req.body.maDeTai);
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
					let log = new Log();
					log.userId = req.session.userId;
					log.userFullName = req.user.fullname;
					log.action = 'grant-manager';
					log.time = new Date();
					log.objType = 'user';
					let u1 = JSON.parse(JSON.stringify(user));
					delete u1.password;
					delete u1.lastLogin;
					delete u1.created_at;
					delete u1.avatar;
					delete u1.forgot_password;
					log.obj1 = u1;

					user.maDeTai = req.body.maDeTai;
					user.save((err) => {
						if (err){
							res.status(500).json({
								status: 'error',
								error: 'Error while saving user info'
							})
						}
						else {
							if (maDeTais.indexOf(req.body.maDeTai) < 0){
								return responseError(req, '', res, 400, ['error', 'newMDT'], ['Mã đề tài không hợp lệ', req.body.maDeTai]);
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
								acl.addUserRoles(req.body.userId, 'manager', (err) => {
									if (err){
										console.log(err);
										// TODO
										// Chỗ này cần sử dụng restart(res) để dừng worker hiện tại. 
										// Vì có sự thay đổi về ACL nhưng cập nhật bị lỗi
										// nên cần đánh dấu, restart toàn bộ worker
										try {
											process.send({actionType: 'restart', target: 'all'});
										}
										catch (e){
											console.log(e);
										}
										return responseError(req, '', res, 500, ['error'], ['Có lỗi xảy ra. Vui lòng thử lại']);
									}
									// TODO
									// Chỗ này cần gửi message về Master.
									// Yêu cầu restart tất cả các worker khác
									
									try {
										process.send({actionType: 'restart', target: 'other'});
									}
									catch (e){
										console.log(e);
									}
									let u2 = JSON.parse(JSON.stringify(user));
									delete u2.password;
									delete u2.lastLogin;
									delete u2.created_at;
									delete u2.avatar;
									delete u2.forgot_password;
									log.obj2 = u2 // Mã đề tài mới sẽ lưu tại đây.
									log.extra = {
										agent: req.headers['user-agent'],
										localIP: req.body.localIP,
										publicIP: getPublicIP(req)
									}
									// console.log('saving log');
									log.save((err) => {
										if (err){
											console.log(err);
										}
									});
									return responseSuccess(res, [], []);
								})
								// return restart(res);
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
			acl.removeUserRoles(req.body.userId, 'manager', (err) => {
				if (err){
					console.log(err);
					// TODO
					// Chỗ này cần sử dụng restart(res) để dừng worker hiện tại. 
					// Vì có sự thay đổi về ACL nhưng cập nhật bị lỗi
					// nên cần đánh dấu, restart toàn bộ worker
					try {
						process.send({actionType: 'restart', target: 'all'});
					}
					catch (e){
						console.log(e);
					}
					return responseError(req, '', res, 500, ['error'], ['Có lỗi xảy ra. Vui lòng thử lại']);
				}
				// TODO
				// Chỗ này cần gửi message về Master.
				// Yêu cầu restart tất cả các worker khác
				try {
					process.send({actionType: 'restart', target: 'other'});
				}
				catch (e){
					console.log(e);
				}
				let log = new Log();
				log.userId = req.session.userId;
				log.userFullName = req.user.fullname;
				log.action = 'revoke-manager';
				log.time = new Date();
				log.objType = 'user';
				let u1 = JSON.parse(JSON.stringify(user));
				delete u1.password;
				delete u1.lastLogin;
				delete u1.created_at;
				delete u1.avatar;
				delete u1.forgot_password;
				log.obj1 = u1;
				log.extra = {
					agent: req.headers['user-agent'],
					localIP: req.body.localIP,
					publicIP: getPublicIP(req)
				}
				// console.log('saving log');
				log.save((err) => {
					if (err){
						console.log(err);
					}
				});
				return responseSuccess(res, [], []);
			})
			// return restart(res);
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
			var maDeTais = await(PROMISES.getMaDeTai())

			if (userRoles.indexOf('admin') >= 0){
				if (req.body.userId == req.session.userId){
					// Chính mình
					if (maDeTais.indexOf(req.body.maDeTai) < 0){
						return responseError(req, '', res, 400, ['error', 'newMDT'], ['Mã đề tài không hợp lệ', req.body.maDeTai]);
					}
					else {
						let log = new Log();
						log.userId = req.session.userId;
						log.userFullName = req.user.fullname;
						log.action = 'assign';
						log.time = new Date();
						log.objType = 'user';
						let u1 = JSON.parse(JSON.stringify(user));
						delete u1.password;
						delete u1.lastLogin;
						delete u1.created_at;
						delete u1.avatar;
						delete u1.forgot_password;
						log.obj1 = u1;

						user.maDeTai = req.body.maDeTai;
						user.save((err) => {
							if (err){
								console.log(err);
								return responseError(req, '', res, 500, ['error'], ['Error while saving user info'])
							}
							else {
								let u2 = JSON.parse(JSON.stringify(user));
								delete u2.password;
								delete u2.lastLogin;
								delete u2.created_at;
								delete u2.avatar;
								delete u2.forgot_password;
								log.obj2 = u2 // Mã đề tài mới sẽ lưu tại đây.
								log.extra = {
									agent: req.headers['user-agent'],
									localIP: req.body.localIP,
									publicIP: getPublicIP(req)
								}
								// console.log('saving log');
								log.save((err) => {
									if (err){
										console.log(err);
									}
								});
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
					let log = new Log();
					log.userId = req.session.userId;
					log.userFullName = req.user.fullname;
					log.action = 'assign';
					log.time = new Date();
					log.objType = 'user';
					let u1 = JSON.parse(JSON.stringify(user));
					delete u1.password;
					delete u1.lastLogin;
					delete u1.created_at;
					delete u1.avatar;
					delete u1.forgot_password;
					log.obj1 = u1;

					user.maDeTai = req.body.maDeTai;
					user.save((err) => {
						if (err){
							console.log(err);
							return responseError(req, '', res, 500, ['error'], ['Error while saving user info'])
						}
						else {
							let u2 = JSON.parse(JSON.stringify(user));
							delete u2.password;
							delete u2.lastLogin;
							delete u2.created_at;
							delete u2.avatar;
							delete u2.forgot_password;
							log.obj2 = u2 // Mã đề tài mới sẽ lưu tại đây.
							log.extra = {
								agent: req.headers['user-agent'],
								localIP: req.body.localIP,
								publicIP: getPublicIP(req)
							}
							// console.log('saving log');
							log.save((err) => {
								if (err){
									console.log(err);
								}
							});
							return responseSuccess(res, [], []);
						}
					})
				}
				
			}
		}
	})()
})

router.post('/fire', aclMiddleware('/admin', 'edit'), function (req, res, next) {
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
			// do not care. Handle inside the above await-block
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
				let log = new Log();
				log.userId = req.session.userId;
				log.userFullName = req.user.fullname;
				log.action = 'fire';
				log.time = new Date();
				log.objType = 'user';
				let u1 = JSON.parse(JSON.stringify(user));
				delete u1.password;
				delete u1.lastLogin;
				delete u1.created_at;
				delete u1.avatar;
				delete u1.forgot_password;
				log.obj1 = u1;

				user.maDeTai = '';
				user.save((err) => {
					if (err){
						console.log(err);
						return responseError(req, '', res, 500, ['error'], ['Error while saving user info'])
					}
					else {
						let data_ = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl.json')));
						delete data_[user.id];
						fs.writeFileSync(path.join(__dirname, '../config/acl.json'), JSON.stringify(data_, null, 4));
						acl.removeUserRoles(user.id, userRoles, (err) => {
							if (err){
								console.log(err);
								try {
									process.send({actionType: 'restart', target: 'all'})
								}
								catch (e){
									console.log(e);
								}
								return responseError(req, '', res, 500, ['error'], ['Có lỗi xảy ra. Vui lòng thử lại'])
							}
							try {
								process.send({actionType: 'restart', target: 'other'})
							}
							catch (e){
								console.log(e);
							}
							let u2 = JSON.parse(JSON.stringify(user));
							delete u2.password;
							delete u2.lastLogin;
							delete u2.created_at;
							delete u2.avatar;
							delete u2.forgot_password;
							log.obj2 = u2 // Mã đề tài mới sẽ lưu tại đây.
							log.extra = {
								agent: req.headers['user-agent'],
								localIP: req.body.localIP,
								publicIP: getPublicIP(req)
							}
							// console.log('saving log');
							log.save((err) => {
								if (err){
									console.log(err);
								}
							});
							return responseSuccess(res, [], []);
						})
						// return restart(res)
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
		if (req.body.tenDeTai){
			req.body.tenDeTai = req.body.tenDeTai.trim();
		}
		
		if (req.body.donViChuTri){
			req.body.donViChuTri = req.body.donViChuTri.trim();
		}

		if (req.user.validPassword(req.body.adminPassword)){
			let result = await(PROMISES.addMaDeTai(req.body.newMaDeTai, req.body.tenDeTai, req.body.donViChuTri));
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
				newRole = newRole.replace(/[^a-z0-9-._]/g, "-");
				roles[newRole] = JSON.parse(JSON.stringify(roles['content']));
				roles[newRole].maDeTai = req.body.newMaDeTai;
				roles[newRole].role = newRole;
				roles[newRole].rolename = 'Nhân viên ' + req.body.newMaDeTai;
				fs.writeFileSync(path.join(__dirname, '../config/roles.json'), JSON.stringify(roles, null, 4));
				let log = new Log();
				log.userId = req.session.userId;
				log.userFullName = req.user.fullname;
				log.action = 'add-mdt';
				log.time = new Date();
				log.objType = 'detai';
				let u1 = {
					maDeTai: req.body.newMaDeTai,
					tenDeTai: req.body.tenDeTai,
					donViChuTri: req.body.donViChuTri
				}
				log.obj1 = u1;
				log.extra = {
					agent: req.headers['user-agent'],
					localIP: req.body.localIP,
					publicIP: getPublicIP(req)
				}
				// console.log('saving log');
				log.save((err) => {
					if (err){
						console.log(err);
					}
				});
				try {
					process.send({actionType: 'restart', target: 'all'});
				}
				catch (e){
					console.log(e);
					return restart(res);
				}
				// return restart(res);
				
				return responseSuccess(res, [], []);
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
		let user = req.user;
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
		for(let u of users){
			if (u.id == req.session.userId){
				user.level = u.level;
			}
			delete u.password;
			countLevel[u.level]++;
		}
		// return res.json({
		// 	countMaDeTai: countMaDeTai,
		// 	countLevel: countLevel
		// })
		return res.render('admin/users-statistic', {
			countLevel: countLevel,
			countMaDeTai: countMaDeTai,
			user: user,
			sidebar: {
				active: 'statistic-user'
			}
		})
	})()
})

router.get('/login-as', aclMiddleware('/admin', 'edit'), (req, res, next) => {
	User.findById(req.query.userid, function (err, user) {
		if (err || !user){
			console.log(err);
			return res.redirect('/users/me')
		}
		console.log(user);
		// login acl
		req.session.userId = user.id;

		// login passport
		req.user = user;
		req.session.passport.user = user.id;
		return res.redirect('/users/me')
	})
})



function isLoggedIn (req, res, next) {
	console.log('accessing ' + req.path);
	if (!req.isAuthenticated()){
		return res.redirect('/auth/login');
	}
	console.log('pass isLoggedIn');
	return next();
}

module.exports = router;