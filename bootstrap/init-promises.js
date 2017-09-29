const mongoose = require('mongoose');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
const path = require('path');
const ROOT = path.join(__dirname, '../');
let acl = global.myCustomVars.acl;

// ============= Generate Promise for async/await =======================
// 
// 
// place all global Promises inside this object
global.myCustomVars.promises = {}

var getSharedData = () => {
	return new Promise((resolve, reject) => {
		mongoose.model('SharedData').findOne({}, (err, sharedData) => {
			if (!err && sharedData){
				resolve(sharedData);
			}
			else {
				resolve(null)
			}
		})
	});
}

global.myCustomVars.promises.getSharedData = getSharedData;

var getMaDeTai = () => {
	return new Promise((resolve, reject) => {
		mongoose.model('SharedData').findOne({}, (err, sharedData) => {
			if (!err && sharedData){
				let result = [];
				for(let dt of sharedData.deTai){
					result.push(dt.maDeTai);
				}
				result.sort((a, b) => {
					return a.localeCompare(b)
				})
				resolve(result);
			}
			else {
				resolve([])
			}
		})
	});
}

global.myCustomVars.promises.getMaDeTai = getMaDeTai;

var addMaDeTai = (maDeTai, tenDeTai, donViChuTri) => {
	return new Promise((resolve, reject) => {
		async(() => {
			maDeTai = maDeTai.trim();
			if (!maDeTai){
				resolve({
					status: 'error',
					error: 'Mã đề tài không hợp lệ'
				})
			}
			let maDeTais = await(getMaDeTai());
			if (maDeTais.indexOf(maDeTai) >= 0){
				resolve({
					status: 'error',
					error: 'Mã đề tài đã tồn tại'
				})
			}
			else {
				mongoose.model('SharedData').findOne({}, (err, sharedData) => {
					if (err || !sharedData){
						console.log(err);
						return resolve({
							status: 'error',
							error: 'Có lỗi xảy ra. Vui lòng thử lại'
						})
					}
					sharedData.deTai.push({
						maDeTai: maDeTai,
						tenDeTai: tenDeTai,
						donViChuTri: donViChuTri
					});
					sharedData.save((err) => {
						if (err){
							console.log(err);
							resolve({
								status: 'error',
								error: 'Có lỗi trong khi thêm Đề tài mới. Vui lòng thử lại'
							})
						}
						else {
							resolve({
								status: 'success'
							})
						}
					})
				})
			}
		})()
	})
}

global.myCustomVars.promises.addMaDeTai = addMaDeTai;

var getUserRoles = (userId) => {
	return new Promise((resolve, reject) => {
		acl.userRoles(userId, (err, roles) => {
			// console.log('promised userRoles called');
			if (err){
				resolve([])
			}
			else {
				resolve(roles)
			}
		})
	})
}

global.myCustomVars.promises.getUserRoles = getUserRoles;

var removeUserRoles = (userId, roles) => {
	return new Promise((resolve, reject) => {
		acl.removeUserRoles(userId, roles, (err) => {
			if (err){
				console.log(err);
				resolve({
					status: 'error',
					error: err
				})
			}
			else {
				resolve({
					status: 'success'
				})
			}
		})
	})
}

global.myCustomVars.promises.removeUserRoles = removeUserRoles;

var getUser = (userId) => {
	return new Promise((resolve, reject) => {
		mongoose.model('User').findById(userId, (err, user) => {
			if (err || !user){
				console.log(err);
				resolve(null);
			}
			else{
				let userMongoose = user;
				let userNormal = JSON.parse(JSON.stringify(user));
				let u = userNormal;
				u.id = u._id;
				acl.userRoles(u._id, (err, userRoles) => {
					// console.log('promised userRoles called');
					if (err){
						console.log(err);
						resolve({
							userNormal: userNormal,
							userMongoose: userMongoose
						})
					}
					else {
						if (userRoles.indexOf('admin') >= 0){
							// console.log('admin ' + u._id);
							u.level = 'admin';
						}
						else if (userRoles.indexOf('manager') >= 0){
							// console.log('manage ' + u._id);
							u.level = 'manager';
						}
						else {
							// console.log('user ' + u._id);
							u.level = 'user'
							if (!u.maDeTai){
								// console.log('pending user ' + u._id);
								u.level = 'pending-user';
							}
							else {
							}
						}
						mongoose.model('SharedData').findOne({}, (err, sharedData) => {
							if (!err && sharedData){
								for(let dt of sharedData.deTai){
									if (u.maDeTai == dt.maDeTai){
										u.deTai = dt.tenDeTai;
										break;
									}
								}
							}
							resolve({
								userNormal: userNormal,
								userMongoose: userMongoose
							})
						})
					}
				})
				

			}
		})
	})
}

global.myCustomVars.promises.getUser = getUser;

var getUsers = () => {
	return new Promise((resolve, reject) => {
		mongoose.model('User').find({}, (err, users) => {
			if (err || !users){
				console.log(err);
				resolve({usersMongoose: [], usersNormal: []});
			}
			else{
				async(() => {
					let users_ = JSON.parse(JSON.stringify(users));
					for(let i = 0; i < users_.length; i++){
						var u = users_[i];
						u.id = u._id;
						var userRoles = await(new Promise((resolve_, reject_) => {
							acl.userRoles(u._id, (err, roles) => {
								// console.log('promised userRoles called');
								if (err){
									console.log(err);
									resolve_([])
								}
								else {
									resolve_(roles)
								}
							})
						}))
						// console.log('userRoles done');
						// console.log(userRoles);
						if (userRoles.indexOf('admin') >= 0){
							// console.log('admin ' + u._id);
							u.level = 'admin';
						}
						else if (userRoles.indexOf('manager') >= 0){
							// console.log('manage ' + u._id);
							u.level = 'manager';
						}
						else {
							// console.log('user ' + u._id);
							u.level = 'user'
							if (!u.maDeTai){
								// console.log('pending user ' + u._id);
								u.level = 'pending-user';
							}
						}
					}
					// console.log('this');
					// console.log(users);
					resolve({
						usersMongoose: users, // Có Schema, không thể thêm hay bớt property
						usersNormal: users_   // Object JS thường, có thể thêm bớt thuộc tính
					});
				})()
				
			}
		})
	})
}

global.myCustomVars.promises.getUsers = getUsers;

var userHasRole = (userId, role) => {
	return new Promise((resolve, reject) => {
		mongoose.model('User').findById(userId, (err, user) => {
			if (err || !user){
				resolve(false)
			}
			else {
				acl.userRoles(userId, (err, roles) => {
					if (err){
						return resolve(false);
					}
					else if (roles.indexOf(role) >= 0){
						resolve(true);
					}
					else {
						resolve(false)
					}
				})
			}
		})
	})
}

global.myCustomVars.promises.userHasRole = userHasRole;
