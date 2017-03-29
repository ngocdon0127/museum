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
	id: 'admin',
	name: 'Admin',
	class: 'label label-danger'
}
LEVEL['manager'] = {
	id: 'manager',
	name: 'Manager',
	class: 'label label-success'
}
LEVEL['user'] = {
	id: 'user',
	name: 'Normal User',
	class: 'label label-primary'
}
LEVEL['pending-user'] = {
	id: 'pending-user',
	name: 'Pending User',
	class: 'label label-warning'
}

// console.log(LEVEL)

/* GET home page. */
// router.get('/', isLoggedIn, function(req, res, next) {
//   res.end('app');
// });

// Only admin can access these routes
router.use('/', isLoggedIn, aclMiddleware('/manager', 'view', '/config'), express.static(path.join(__dirname, '../views/admin/')));

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
				console.log('admin ' + u._id);
				u.level = LEVEL['admin'];
			}
			else if (userRoles.indexOf('manager') >= 0){
				console.log('manage ' + u._id);
				u.level = LEVEL['manager'];
			}
			else {
				console.log('user ' + u._id);
				u.level = LEVEL['user']
				if (!u.maDeTai){
					console.log('pending user ' + u._id);
					u.level = LEVEL['pending-user'];
				}
			}
		}
		result.users = users.filter((u, index) => {
			return (u._id == req.session.userId) || // Chính mình
			(	
				(['admin'].indexOf(u.level.id) < 0) && // Không thuộc cấp Admin
				((u.maDeTai == req.user.maDeTai) || (!u.maDeTai)) // Và chưa được gán và Đề tài nào, hoặc cùng đề tài với Manager
			)
		})

		result.sidebar = {
			active: 'users'
		}

		console.log(result);

		res.render('manager/users', result)

	})()
	
})

router.get('/test', function (req, res, next) {
	res.end('access granted')
})

router.post('/assign', aclMiddleware('/manager', 'edit'), function (req, res, next) {
	// Coi vai trò của user đang request là manager.
	// Admin sẽ có route assign riêng
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
				return responseError(req, '', res, 403, ['error'], ['Bạn không thể thay đổi thông tin của 1 Admin bằng thao tác này']);
			}
			else if (userRoles.indexOf('manager') >= 0){
				return responseError(req, '', res, 403, ['error'], ['Không thể thay đổi thông tin của 1 Manager bằng thao tác này']);
			}
			else {
				// Giả sử rằng maDeTai của manager đã hợp lệ.
				user.maDeTai = req.user.maDeTai;
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

router.post('/fire', aclMiddleware('/manager', 'edit'), function (req, res, next) {
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
				return responseError(req, '', res, 403, ['error'], ['Không thể thu hồi quyền hạn của 1 manager bằng thao tác này']);
			}
			else {

				if (user.maDeTai == req.user.maDeTai){
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
				else {
					return responseError(req, '', res, 403, ['error'], ['Tài khoản này không thuộc quyền quản lý của bạn'])
				}
			}
		}
	})()
})

router.post('/approve', aclMiddleware('/manager', 'edit'), function (req, res, next) {
	var async = require('asyncawait/async');
	var await = require('asyncawait/await');
	var nullParam = checkUnNullParams(['form', 'id', 'approved'], req.body);

	if (nullParam){
		return responseError(req, '', res, 400, ['error'], ['Thiếu ' + nullParam])
	}
	if (['co-sinh', 'dia-chat', 'dong-vat', 'tho-nhuong', 'thuc-vat'].indexOf(req.body.form) < 0){
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
	var MODELS = {
		'co-sinh': {
			model: mongoose.model('Paleontological'),
			objType: 'paleontological'
		},
		'dia-chat': {
			model: mongoose.model('Geological'),
			objType: 'geological'
		},
		'dong-vat': {
			model: mongoose.model('Animal'),
			objType: 'animal'
		},
		'tho-nhuong': {
			model: mongoose.model('Soil'),
			objType: 'soil'
		},
		'thuc-vat': {
			model: mongoose.model('Vegetable'),
			objType: 'vegetable'
		},
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
				log.save();
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
	var async = require('asyncawait/async');
	var await = require('asyncawait/await');

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
			maDeTais = await(new Promise((resolve, reject) => {
				SharedData.findOne({}, (err, sharedData) => {
					if (err || !sharedData){
						resolve([])
					}
					else {
						resolve(sharedData.maDeTai)
					}
				})
			}))
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
			}
		]
		let dataForCharts = {}

		for(let maDeTai of maDeTais){
			dataForCharts[maDeTai] = [];
			var idxColor = 0;
			for(model of Models){
				var projection = {deleted_at: {$eq: null}, 'maDeTai.maDeTai': {$eq: maDeTai}};
				let rows = await(new Promise((resolve, reject) => {
					model.model.find(projection, (err, instances) => {
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
		var user = JSON.parse(JSON.stringify(req.user));
		delete user.level;
		delete user.password;
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
