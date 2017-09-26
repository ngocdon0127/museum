var express = require('express');
var router = express.Router();
var passport = require('passport');
var multer = require('multer');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Log = mongoose.model('Log');

var async = require('asyncawait/async');
var await = require('asyncawait/await');

var PROMISES = global.myCustomVars.promises;

var aclMiddleware = global.myCustomVars.aclMiddleware;


router.use(isLoggedIn);

/* GET home page. */
router.get('/', function(req, res, next) {
	// 1 user chỉ được xem lịch sử của các mẫu vật do chính user đó tạo ra.
	// Bao gồm cả các thao tác do Admin, Manager tác động lên mẫu vật đó.
	let selection = {'obj1.created_by.userId': {$in: [mongoose.Types.ObjectId(req.session.userId), req.session.userId]}};
	if ('user' in req.query){
		selection.userId = req.query.user;
	}
	if ('action' in req.query){
		selection.action = req.query.action;
	}

	if ('object' in req.query){
		var arr = [];
		arr.push(req.query.object);
		try {
			var mgOI = mongoose.Types.ObjectId(req.query.object);
			arr.push(mgOI)
		}
		catch (e){
			console.log(e);
		}
		selection['obj1._id'] = {$in: arr};
	}

	if ('type' in req.query){
		selection.objType = req.query.type;
	}

	Log.find({$or: [selection]}, {}, {sort: {time: -1}}, function (err, logs) {
		if (err){
			console.log(err);
			return res.status(500).json({
				status: 'error',
				error: 'Error while reading database'
			})
		}
		// return res.status(200).json({
		// 	status: 'success',
		// 	logs: logs,
		// 	path: '/log' + req.path,
		// })
		// return res.render('log', {user: req.user, logs: logs, path: '/log' + req.path});
		var actions = {
			'create': {
				label: 'Tạo mới'
			},
			'update': {
				label: 'Cập nhật'
			},
			'delete': {
				label: 'Xóa'
			},
			'approve': {
				label: 'Phê duyệt'
			},
			'disapprove': {
				label: 'Hủy phê duyệt'
			},
			'assign': {
				label: 'Assign'
			},
			'fire': {
				label: 'Fire'
			},
			'grant-manager': {
				label: 'Grant Manager'
			},
			'revoke-manager': {
				label: 'Revoke Manager'
			},
			'add-mdt': {
				label: 'Thêm đề tài'
			}
		}
		var forms = {
			'animal': {
				basePath: '/content/dong-vat',
				objectModelLabel: 'mẫu động vật',
				objectModelName: 'animal',
			},
			'soil': {
				basePath: '/content/tho-nhuong',
				objectModelLabel: 'mẫu thổ nhưỡng',
				objectModelName: 'soil',
			},
			'geological': {
				basePath: '/content/dia-chat',
				objectModelLabel: 'mẫu địa chất',
				objectModelName: 'geological',
			},
			'paleontological': {
				basePath: '/content/co-sinh',
				objectModelLabel: 'mẫu cổ sinh',
				objectModelName: 'paleontological'
			},
			'vegetable': {
				basePath: '/content/thuc-vat',
				objectModelLabel: 'mẫu thực vật',
				objectModelName: 'vegetable',
			},
			'user': {
				basePath: '/content/thuc-vat',
				objectModelLabel: 'tài khoản',
				objectModelName: 'user',
			},
			'detai': {
				basePath: '/content/thuc-vat',
				objectModelLabel: 'đề tài',
				objectModelName: 'detai',
			}
		}
		async(() => {
			let user = await(PROMISES.getUser(req.session.userId)).userNormal;
			var result = {
				user: user,
				logs: logs,
				path: '/log' + req.path,
				actions: actions,
				forms: forms,
				sidebar: {
					active: 'all-log'
				}
			}
			// return res.render('log', {user: req.user, logs: logs, path: '/log' + req.path, actions: actions, forms: forms});
			return res.render('manager/logs', result);
		})()
	})
})

router.get('/all', aclMiddleware('/log/all', 'view', '/log'), function (req, res, next) {
	async(() => {
		// Chủ nhiệm đề tài 1 không thể xem log của chủ nhiệm đề tài 2
		// var selection = {};
		let user = await(PROMISES.getUser(req.session.userId)).userNormal;
		// console.log(user);
		let selection = {};
		if (user.level == 'manager'){
			selection['$or'] = [
				{'obj1.maDeTai.maDeTai': {$eq: user.maDeTai}},  // Chủ nhiệm đề tài được xem log liên quan đến mẫu vật trong đề tài của mình
				{'obj2.maDeTai.maDeTai': {$eq: user.maDeTai}},
				{'obj1.maDeTai': {$eq: user.maDeTai}},          // Chủ nhiệm đề tài được xem log liên quan đến tài khoản trong đề tài của mình
				{'obj2.maDeTai': {$eq: user.maDeTai}},
				{userId: req.session.userId}                    // Chủ nhiệm đề tài được xem log liên quan đến tài khoản trong đề tài của mình, do mình thực hiện, hình như hơi thừa dòng này
			]
		}
		else {
			// Admin được xem tất cả log
			// console.log('level: ' + user.level);
		}
		if ('user' in req.query){
			selection.userId = req.query.user;
		}
		if ('action' in req.query){
			selection.action = req.query.action;
		}

		if ('object' in req.query){
			var arr = [];
			arr.push(req.query.object);
			try {
				var mgOI = mongoose.Types.ObjectId(req.query.object);
				arr.push(mgOI)
			}
			catch (e){
				console.log(e);
			}
			selection['obj1._id'] = {$in: arr};
		}

		if ('type' in req.query){
			selection.objType = req.query.type;
		}

		console.log(selection);

		Log.find(selection, {}, {sort: {time: -1}}, function (err, logs) {
		// Log.find({$or: [selection, selection1]}, {}, {sort: {time: -1}}, function (err, logs) {
			if (err){
				console.log(err);
				return res.status(500).json({
					status: 'error',
					error: 'Error while reading database'
				})
			}
			// return res.status(200).json({
			// 	status: 'success',
			// 	logs: logs
			// })
			var actions = {
				'create': {
					label: 'Tạo mới'
				},
				'update': {
					label: 'Cập nhật'
				},
				'delete': {
					label: 'Xóa'
				},
				'approve': {
					label: 'Phê duyệt'
				},
				'disapprove': {
					label: 'Hủy phê duyệt'
				},
				'assign': {
					label: 'Assign'
				},
				'fire': {
					label: 'Fire'
				},
				'grant-manager': {
					label: 'Grant Manager'
				},
				'revoke-manager': {
					label: 'Revoke Manager'
				},
				'add-mdt': {
					label: 'Thêm đề tài'
				},
				'chown': {
					label: 'Chuyển sở hữu'
				}
			}
			var forms = {
				'animal': {
					basePath: '/content/dong-vat',
					objectModelLabel: 'mẫu động vật',
					objectModelName: 'animal',
				},
				'soil': {
					basePath: '/content/tho-nhuong',
					objectModelLabel: 'mẫu thổ nhưỡng',
					objectModelName: 'soil',
				},
				'geological': {
					basePath: '/content/dia-chat',
					objectModelLabel: 'mẫu địa chất',
					objectModelName: 'geological',
				},
				'paleontological': {
					basePath: '/content/co-sinh',
					objectModelLabel: 'mẫu cổ sinh',
					objectModelName: 'paleontological'
				},
				'vegetable': {
					basePath: '/content/thuc-vat',
					objectModelLabel: 'mẫu thực vật',
					objectModelName: 'vegetable',
				},
				'user': {
					basePath: '/content/thuc-vat',
					objectModelLabel: 'tài khoản',
					objectModelName: 'user',
				},
				'detai': {
					basePath: '/content/thuc-vat',
					objectModelLabel: 'đề tài',
					objectModelName: 'detai',
				}
			}
			var result = {
				user: user,
				logs: logs,
				path: '/log' + req.path,
				actions: actions,
				forms: forms,
				sidebar: {
					active: 'all-log'
				}
			}
			// return res.render('log', {user: req.user, logs: logs, path: '/log' + req.path, actions: actions, forms: forms});
			return res.render('manager/logs', result);
		})
	})()
})

function isLoggedIn (req, res, next) {
	if (!req.isAuthenticated()){
		return res.redirect('/auth/login');
	}
	return next();
}

module.exports = router;
