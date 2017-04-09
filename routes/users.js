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

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('/users/me');
});

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
						mongoose.model(model.modelName).find({'created_by.userId': user.id, deleted_at: {$eq: null}}, (err, rows) => {
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
			return res.json({
				status: 'success',
				user: user,
				data: sides
			})
		}
		else {
			
			return res.json({
				status: 'success',
				user: user,
				data: []
			})
		}
	})()
})

router.post('/me', isLoggedIn, upload.single('inputAvatar'), (req, res, next) => {
	async(() => {
		let user = await(PROMISES.getUser(req.session.userId));
		if (user){
			user = user.userMongoose;
			user.fullname = req.body.inputFullName;
			if (req.body.inputPassword && req.body.inputRepeat && (req.body.inputPassword == req.body.inputRepeat)){
				user.password = user.hashPassword(req.body.inputPassword);
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
				user.avatar.original = req.file.destination.substring('public/'.length) + '/' + req.file.filename;
			}
			user.save((err) => {
				if (err){
					console.log(err);
				}
				else {
					req.flash('user-msg', 'Cập nhật thành công');
				}
				
				return res.redirect('/users/me')
			})
		}
		else {
			return res.redirect('/users/me')
		}
	})()
})

function isLoggedIn (req, res, next) {
	if (!req.isAuthenticated()){
		return res.redirect('/auth/login');
	}
	return next();
}

module.exports = router;
