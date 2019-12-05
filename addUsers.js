var mongoose = require('mongoose');
var configDB = require('./config/config').database;
var mongooseConnection = mongoose.connect(configDB.url);
require('./models/User.js')(mongoose);
var User = mongoose.model('User')
var CryptoJS = require('crypto-js');

var fs = require('fs');
var path = require('path');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

async (() => {
	let data = fs.readFileSync(path.join(__dirname, 'addUsers.txt')).toString().split('\n');
	console.log(data);
	for(let i = 0; i < data.length; i++){
		let userInfos = data[i].split('\t');
		console.log(userInfos);
		// console.log('hehe');
		if (userInfos.length < 3){
			console.log('invalid user info. skip')
			continue;
		}
		let r = await (new Promise((resolve, reject) => {
			let newUser = new User();

			newUser.username = userInfos[1];
			var l = 0;
			while (l < 1000){
				userInfos[2] = CryptoJS.MD5(userInfos[2]).toString();
				l++;
			}
			newUser.password = newUser.hashPassword(userInfos[2]);
			
			newUser.fullname = userInfos[0];
			console.log(newUser);
			return resolve(null)
			newUser.save(function (err, user) {
				if (err){
					console.log(err);
					reject('error while creating account ' + user.username);
				}
				else {
					resolve('OK')
				}
			})
		}))
		if (r != 'OK'){
			console.log('error creating user ' + userInfos[0]);
		}
		else {
			console.log('user ' + userInfos[0] + ' created');
		}
	}
	mongooseConnection.disconnect();
})()
