var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var multer               = require('multer');
var UPLOAD_DESTINATION   = 'public/uploads/user/avatar';
var upload               = multer({dest: UPLOAD_DESTINATION});

var async = require('asyncawait/async');
var await = require('asyncawait/await');

var PROMISES = global.myCustomVars.promises;


router.get('/', function(req, res, next) {
  res.redirect('/users/me');
});

router.get('/all', isLoggedIn, (req, res, next) =>{
	async (() => {
		let user = await(PROMISES.getUser(req.session.userId));
		user = JSON.parse(JSON.stringify(user.userNormal));
		console.log(user);
		delete user.password;
		delete user.forgot_password;
		delete user.__v;
		let users = await (PROMISES.getUsers()).usersNormal;
		users.map((u) => {
			delete u.password;
			delete u.forgot_password;
			delete u.__v;
		})
		if (user.level !== 'admin'){
			users = users.filter((u) => {
				return u.maDeTai == user.maDeTai;
				// return true;
			})
		}
		return res.json({
			status: 'success',
			count: users.length,
			user: user,
			users: users
		})
	})()
})

router.get('/me', isLoggedIn, function (req, res, next) {
	if (!req.query.hasOwnProperty('datatype') || (req.query.datatype != 'json')){
		// render
		return async(() => {
			let user = await(PROMISES.getUser(req.session.userId));
			user = JSON.parse(JSON.stringify(user.userNormal));
			delete user.password;
			delete user.forgot_password;
			user.statistic = {}
			let models = [
				{
					modelName: 'Paleontological',
					title: 'Cổ sinh'
				},
				{
					modelName: 'Geological',
					title: 'Địa chất'
				},
				{
					modelName: 'Animal',
					title: 'Động vật'
				},
				{
					modelName: 'Soil',
					title: 'Thổ nhưỡng'
				},
				{
					modelName: 'Vegetable',
					title: 'Thực vật'
				}
			]
			user.statistic = []
			for(let model of models){
				user.statistic.push({
					title: model.title,
					number: await(new Promise((resolve, reject) => {
						mongoose.model(model.modelName).find({'created_by.userId': {$eq: user.id}, deleted_at: {$eq: null}}, (err, rows) => {
							if (err){
								console.log(err);
								resolve(0)
							}
							else {
								// console.log(rows.length);
								resolve(rows.length)
							}
							
						})
					}))
				});
			}
			// console.log(user);
			let msg = '';
			try {
				msg = req.flash('user-msg')
			}
			catch (e){
				console.log(e);
			}
			return res.render('profile', {
				user: user,
				profileUser: user,
				sidebar: {
					active: 'profile'
				},
				msg: msg
			});

		})()
		
	}

	// Trả về JSON
	async(() => {
		let user = await(PROMISES.getUser(req.session.userId)).userNormal;
		delete user.password;
		delete user.__v;
		delete user._id;
		delete user.forgot_password;
		var roles = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/roles.json')).toString());
		var cores = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl-core.json')).toString())
		var aclRules = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl.json')).toString());
		let sides = {};
		let template = {
			view: false,
			create: false,
			edit: false,
			delete: false,
			approve: false
		}
		for(let resourceId in cores.resources){
			sides[resourceId] = JSON.parse(JSON.stringify(template));
		}
		if (aclRules.hasOwnProperty(req.user.id)){

			// Nếu đã cấp quyền
			
			var data = aclRules[req.user.id];
			for(var i = 0; i < data.roles.length; i++){
				var allows = roles[data.roles[i]].allows;
				for(var j = 0; j < allows.length; j++){
					if (allows[j].hasOwnProperty('actions') && allows[j].hasOwnProperty('resourceId')){
						let resourceId = allows[j].resourceId;
						if (resourceId && (resourceId in cores.resources)){
							if (resourceId in sides){
								for(let a of allows[j].actions){
									sides[resourceId][a] = true;
								}
							}
							
							if (['admin', 'manager'].indexOf(user.level) >= 0){
								sides[resourceId].approve = true;
							}
						}
					}
				}
			}
			return res.json({
				status: 'success',
				user: user,
				restrict: sides
			})
		}
		else {
			
			// Nếu chưa được cấp quyền gì

			return res.json({
				status: 'success',
				user: user,
				restrict: sides
			})
		}
	})()
})

router.post('/me', isLoggedIn, upload.single('croppedAvatar'), (req, res, next) => {
	async(() => {

		let user = await(PROMISES.getUser(req.session.userId));
		if (user){
			user = user.userMongoose;
			user.fullname = req.body.inputFullName;
			if (req.body.inputPassword && req.body.inputRepeat && (req.body.inputPassword == req.body.inputRepeat)){
				if (user.validPassword(req.body.oldPassword)){
					user.password = user.hashPassword(req.body.inputPassword);
				}
				else {
					if (req.file){
						try {
							fs.unlinkSync(path.join(__dirname, '../public/uploads/user/avatar/' + req.file.filename));
						}
						catch (e){
							console.log(e);
						}
					}
					return res.status(400).json({
						status: 'error',
						error: 'Mật khẩu cũ không đúng'
					})
				}
				
			}
			if (req.file){
				if (user.avatar && user.avatar.original){
					try {
						fs.unlinkSync('public/' + user.avatar.original);
					}
					catch (e){
						console.log(e);
					}
				}
				fs.renameSync(req.file.path, req.file.path + '.jpg');
				user.avatar.original = req.file.destination.substring('public/'.length) + '/' + req.file.filename + '.jpg';
			}
			user.save((err) => {
				if (err){
					console.log(err);
				}
				else {
					req.flash('user-msg', 'Cập nhật thành công');
				}
				
				return res.json({
					status: 'success'
				})
			})
		}
		else {
			return res.json({
				status: 'success'
			})
		}
	})()
})

router.get('/:userId', isLoggedIn, function (req, res, next) {
	return async(() => {
		let user = await(PROMISES.getUser(req.params.userId));
		if (!user){
			return res.json({
				status: 'error',
				error: 'User không tồn tại hoặc bạn không có quyền xem thông tin của user này'
			})
		}
		user = JSON.parse(JSON.stringify(user.userNormal));
		delete user.password;
		delete user.forgot_password;
		let me = await(PROMISES.getUser(req.session.userId));
		me = JSON.parse(JSON.stringify(me.userNormal));
		delete me.password;
		delete me.forgot_password;
		let canView = false;
		if (me.level == 'admin'){
			canView = true;
		}
		if (me.maDeTai == user.maDeTai){
			canView = true;
		}
		if (!canView){
			return res.json({
				status: 'error',
				error: 'User không tồn tại hoặc bạn không có quyền xem thông tin của user này'
			})
		}
		user.statistic = {}
		let models = [
			{
				modelName: 'Paleontological',
				title: 'Cổ sinh'
			},
			{
				modelName: 'Geological',
				title: 'Địa chất'
			},
			{
				modelName: 'Animal',
				title: 'Động vật'
			},
			{
				modelName: 'Soil',
				title: 'Thổ nhưỡng'
			},
			{
				modelName: 'Vegetable',
				title: 'Thực vật'
			}
		]
		user.statistic = []
		for(let model of models){
			user.statistic.push({
				title: model.title,
				number: await(new Promise((resolve, reject) => {
					mongoose.model(model.modelName).find({'created_by.userId': {$eq: user.id}, deleted_at: {$eq: null}}, (err, rows) => {
						if (err){
							console.log(err);
							resolve(0)
						}
						else {
							// console.log(rows.length);
							resolve(rows.length)
						}
						
					})
				}))
			});
		}
		// console.log(user);
		let msg = '';
		try {
			msg = req.flash('user-msg')
		}
		catch (e){
			console.log(e);
		}
		return res.render('profile', {
			user: me,
			profileUser: user,
			sidebar: {
				active: 'profile'
			},
			msg: msg
		});

	})()
})

function isLoggedIn (req, res, next) {
	if (!req.isAuthenticated()){
		return res.redirect('/auth/login');
	}
	return next();
}

module.exports = router;
