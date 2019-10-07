var express    = require('express');
var router     = express.Router();
var passport   = require('passport');
var path       = require('path');
var fs         = require('fs');
var mongoose   = require('mongoose');
var Log        = mongoose.model('Log');
var User       = mongoose.model('User');
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
//  
var getPublicIP = global.myCustomVars.getPublicIP;

var MODELS = {
	'co-sinh': {
		model: mongoose.model('Paleontological'),
		objType: 'paleontological',
		modelLabel: 'Cổ sinh'
	},
	'dia-chat': {
		model: mongoose.model('Geological'),
		objType: 'geological',
		modelLabel: 'Địa chất'
	},
	'dong-vat': {
		model: mongoose.model('Animal'),
		objType: 'animal',
		modelLabel: 'Động vật'
	},
	'tho-nhuong': {
		model: mongoose.model('Soil'),
		objType: 'soil',
		modelLabel: 'Thổ nhưỡng'
	},
	'thuc-vat': {
		model: mongoose.model('Vegetable'),
		objType: 'vegetable',
		modelLabel: 'Thực vật'
	},
	'nam': {
		model: mongoose.model('Mycology'),
		objType: 'mycology',
		modelLabel: 'Nấm'
	},
}

// console.log(LEVEL)

/* GET home page. */
// router.get('/', isLoggedIn, function(req, res, next) {
//   res.end('app');
// });

// Only manager can access these routes
router.use('/', isLoggedIn, aclMiddleware('/manager', 'view', '/config'), express.static(path.join(__dirname, '../views/admin/')));

// redirect to /manager/users
router.get('/', function (req, res, next) {
	res.redirect('users')
})

router.get('/users', function (req, res, next) {
	async(() => {
		var user = JSON.parse(JSON.stringify(req.user));
		delete user.password;
		var result = {
			user: user
		}
		result.maDeTais = await(PROMISES.getMaDeTai());
		var users = await(PROMISES.getUsers()).usersNormal;
		result.users = users.filter((u, index) => {
			delete u.password;
			delete u.forgot_password;
			if (u.id == req.session.userId){
				user.level = u.level;
			}
			return (u.id == req.session.userId) || // Chính mình
				u.level == 'pending-user' || // Nhân viên chưa thuộc đề tài nào
				((['manager', 'user'].indexOf(u.level) >= 0) && (u.maDeTai == req.user.maDeTai)) // Manager, nhân viên đề tài mình quản lý
		})
		result.sidebar = {
			active: 'users'
		}
		res.render('manager/users', result)
	})()
})

router.get('/samples', (req, res) => {
	async(() => {
		let user = await(PROMISES.getUser(req.session.userId)).userNormal;
		console.log(user);
		delete user.password;
		let selection = {
			deleted_at: {$eq: null},
			'maDeTai.maDeTai': req.user.maDeTai
		}
		let result = {}
		for (let modelName in MODELS) {
			result[modelName] = await (new Promise((resolve, reject) => {
				MODELS[modelName].model.find(selection, (err, samples) => {
					if (err) {
						console.log(err);
						return resolve([])
					}
					return resolve(samples)
				})
			}))
		}
		if (req.query.dataType == 'json') {
			return res.status(200).json(result)
		}
		return res.render('manager/samples', {
			MODELS: MODELS,
			result: result,
			user: user,
			sidebar: {active: '/samples'}
		})
	})()
})

router.get('/test', function (req, res, next) {
	res.end('access granted')
})

router.post('/assign', aclMiddleware('/manager', 'edit'), function (req, res, next) {
	// Coi vai trò của user đang request là manager.
	// Admin sẽ có route assign riêng

	var nullParam = checkUnNullParams(['userId'], req.body);

	if (nullParam){
		return responseError(req, '', res, 400, ['error'], ['Thiếu ' + nullParam])
	}

	async(() => {
		console.log(req.body);
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
			var maDeTais = await(PROMISES.getMaDeTai())

			if (userRoles.indexOf('admin') >= 0){
				return responseError(req, '', res, 403, ['error'], ['Bạn không thể thay đổi thông tin của 1 Admin bằng thao tác này']);
			}
			else if (userRoles.indexOf('manager') >= 0){
				return responseError(req, '', res, 403, ['error'], ['Không thể thay đổi thông tin của 1 Manager bằng thao tác này']);
			}
			else {
				// Giả sử rằng maDeTai của manager đã hợp lệ.
				let log = new Log();
				log.userId = req.session.userId;
				log.userFullName = req.user.fullname;
				log.action = 'assign';
				log.time = new Date();
				log.objType = 'user';
				user.maDeTai = req.user.maDeTai;
				let u1 = JSON.parse(JSON.stringify(user));
				delete u1.password;
				delete u1.lastLogin;
				delete u1.created_at;
				delete u1.avatar;
				delete u1.forgot_password;
				log.obj1 = u1;
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
						log.save(err => {
							if (err) {
								console.error('ERR: Save log failed. Try again');
								console.error(err);
								log.save(err_ => {
									if (err_) {
										console.error('ERR: Save log failed');
										console.error(err_);
										console.error(log);
									}
								})
							}
						});
						return responseSuccess(res, [], []);
					}
				})
			}
		}
	})()
})

router.post('/fire', aclMiddleware('/manager', 'edit'), function (req, res, next) {
	// Coi vai trò của user đang request là manager.
	// Admin sẽ có route fire riêng

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
				return responseError(req, '', res, 403, ['error'], ['Không thể thu hồi quyền hạn của 1 manager bằng thao tác này']);
			}
			else {

				if (user.maDeTai == req.user.maDeTai){
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
							// return responseSuccess(res, [], []);
							let data_ = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl.json')));
							delete data_[user.id];
							fs.writeFileSync(path.join(__dirname, '../config/acl.json'), JSON.stringify(data_, null, 4));
							acl.removeUserRoles(user.id, userRoles, (err) => {
								if (err){
									console.log(err);
									try {
										process.send({actionType: 'restart', target: 'all'});
									}
									catch (e){
										console.log(e);
										return restart(res)
									}
									return responseError(req, '', res, 500, ['error'], ['Có lỗi xảy ra. Vui lòng thử lại'])
								}
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
								log.save(err => {
									if (err) {
										console.error('ERR: Save log failed. Try again');
										console.error(err);
										log.save(err_ => {
											if (err_) {
												console.error('ERR: Save log failed');
												console.error(err_);
												console.error(log);
											}
										})
									}
								});
								return responseSuccess(res, [], []);
							})
							// return restart(res);
						}
					})
				}
				else {
					return responseError(req, '', res, 403, ['error'], ['Tài khoản này không thuộc quyền quản lý của bạn'])
				}
			}
		}
	})()
})

router.post('/approve', aclMiddleware('/manager', 'edit'), function (req, res, next) {
	var nullParam = checkUnNullParams(['form', 'id', 'approved'], req.body);

	if (nullParam){
		return responseError(req, '', res, 400, ['error'], ['Thiếu ' + nullParam])
	}
	if (['co-sinh', 'dia-chat', 'dong-vat', 'tho-nhuong', 'thuc-vat', 'nam'].indexOf(req.body.form) < 0){
		return responseError(req, '', res, 400, ['error'], ['Invalid parameter: form']);
	}
	console.log(req.body.approved);
	if (['1', '0', 1, 0].indexOf(req.body.approved) < 0){
		return responseError(req, '', res, 400, ['error'], ['Invalid parameter: approved']);
	}
	var objectModelId = '';
	try {
		// console.log(req.body[objectModelIdParamName]);
		objectModelId = mongoose.Types.ObjectId(req.body['id']);
	}
	catch (e){
		console.log(e);
		return responseError(req, '', res, 500, ['error'], ["id không đúng"]);
	}
	
	var ObjectModel = MODELS[req.body.form].model;
	async(() => {
		var objectInstance = await(new Promise((resolve, reject) => {
			ObjectModel.findById(objectModelId, function (err, objectInstance) {
				if (err){
					console.log(err);
					responseError(req, '', res, 500, ['error'], ["Error while reading database"])
					resolve(null)
				}
				
				if (objectInstance && (!objectInstance.deleted_at)) {
					resolve(objectInstance);
				}

				else {
					responseError(req, '', res, 400, ['error'], ['id không đúng'])
					resolve(null)
				}
			})
		}))
		if (objectInstance){
			var canApprove = false;

			var userRoles = await(new Promise((resolve, reject) => {
				acl.userRoles(req.session.userId, (err, roles) => {
					console.log('promised userRoles called');
					if (err){
						resolve([])
					}
					else {
						resolve(roles)
					}
				})
			}))

			if (userRoles.indexOf('admin') >= 0){
				// Nếu là Admin, approve đẹp
				canApprove = true;
			}
			if ((userRoles.indexOf('manager') >= 0) && req.user.maDeTai == objectInstance.maDeTai.maDeTai){
				// Nếu là chủ nhiệm đề tài, cũng OK
				canApprove = true;
			}
			if (!canApprove){
				return responseError(req, '', res, 403, ['error'], ['Bạn không có quyền phê duyệt mẫu dữ liệu này'])
			}

			if (objectInstance.flag.fApproved == (req.body.approved == '1')){
				return responseError(req, '', res, 400, ['error'], ['what???']);
			}

			objectInstance.flag.fApproved = (req.body.approved == '1');

			// Xử lý cannot extract GEO keys
			try {
				if (objectInstance.extra && objectInstance.extra.eGeoJSON && !objectInstance.extra.eGeoJSON.type) {
					objectInstance.extra.eGeoJSON = undefined;
					delete objectInstance.extra.eGeoJSON
				}
			} catch (e) {
				console.log(e);
			}
			// end
			let r = await(new Promise((resolve, reject) => {
				objectInstance.save((err) => {
					if (err){
						console.log(err);
						resolve(false)
					}
					else {
						resolve(true)
					}
				})
			}))
			if (r){
				let log = new Log();
				log.userId = req.session.userId;
				log.userFullName = req.user.fullname;
				log.action = (req.body.approved == '1') ? 'approve' : 'disapprove';
				log.time = new Date();
				log.objType = MODELS[req.body.form].objType;
				log.obj1 = JSON.parse(JSON.stringify(objectInstance));
				log.save(err => {
					if (err) {
						console.error('ERR: Save log failed. Try again');
						console.error(err);
						log.save(err_ => {
							if (err_) {
								console.error('ERR: Save log failed');
								console.error(err_);
								console.error(log);
							}
						})
					}
				});
				return responseSuccess(res, [], [])
			}
			else {
				return responseError(req, '', res, 500, ['error'], ['Có lỗi xảy ra. Vui lòng thử lại'])
			}

		}
	})()
})

router.get('/statistic', (req, res, next) => {
	// Admin và Manager dùng chung route này.

	async(() => {
		var userRoles = await(new Promise((resolve, reject) => {
			acl.userRoles(req.session.userId, (err, roles) => {
				// console.log('promised userRoles called');
				if (err){
					resolve([])
				}
				else {
					resolve(roles)
				}
			})
		}))
		let canViewAll = false;
		if (userRoles.indexOf('admin') >= 0){
			canViewAll = true;
		}
		let maDeTais = []
		if (!canViewAll){
			maDeTais = [req.user.maDeTai];
		}
		else {
			maDeTais = await(PROMISES.getMaDeTai())
		}
		let Models = [
			{
				model: mongoose.model('Paleontological'),
				name: 'Cổ sinh'
			},
			{
				model: mongoose.model('Geological'),
				name: 'Địa chất'
			},
			{
				model: mongoose.model('Animal'),
				name: 'Động vật'
			},
			{
				model: mongoose.model('Soil'),
				name: 'Thổ nhưỡng'
			},
			{
				model: mongoose.model('Vegetable'),
				name: 'Thực vật'
			},
			{
				model: mongoose.model('Mycology'),
				name: 'Nấm'
			}
		]
		let dataForCharts = {}

		for(let maDeTai of maDeTais){
			dataForCharts[maDeTai] = [];
			var idxColor = 0;
			for(model of Models){
				var selection = {deleted_at: {$eq: null}, 'maDeTai.maDeTai': {$eq: maDeTai}};
				let rows = await(new Promise((resolve, reject) => {
					model.model.find(selection, (err, instances) => {
						if (err || !instances){
							resolve([]);
						}
						resolve(instances);
					})
				}))
				dataForCharts[maDeTai].push({
					value: rows.length,
					label: model.name
				})
			}
		}
		// return res.json(dataForCharts)
		var user = await(PROMISES.getUser(req.session.userId)).userNormal;
		// var user = JSON.parse(JSON.stringify(req.user));
		delete user.password;
		console.log(dataForCharts);
		// tmp fake data for BSTMV.03/15-17
		for(let mdt in dataForCharts) {
			if (mdt.localeCompare('BSTMV.03/15-17') == 0) {
				dataForCharts[mdt].map((specimen, idx) => {
					if (specimen.label.localeCompare('Động vật')) {
						specimen.value += 11550 - 2338
					} else if (specimen.label.localeCompare('Thực vật')) {
						specimen.value += 3000 - 2619
					} else if (specimen.label.localeCompare('Địa chất')) {
						specimen.value += 750 - 2
					}
				})
			}
		}
		console.log('===============')
		console.log(dataForCharts);
		var resResult = {
			dataForCharts: dataForCharts, 
			user: user, 
			sidebar: {active: 'statistic'}
		}
		return res.render('manager/chartjs', resResult)
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
