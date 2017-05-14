var fs = require('fs-extra')
var path = require('path')

var DATA = JSON.parse(fs.readFileSync('data.json'));

var cleanUser = DATA.cleanUser;
var cleanConfigFiles = DATA.cleanConfigFiles;
var cleanAutoCompletion = DATA.cleanAutoCompletion;
var cleanData = DATA.cleanData;
var fixMaDeTai = DATA.fixMaDeTai;

var mongoose = require('mongoose');
var configDB = require('./config/config').database;
var mongooseConnection = mongoose.connect(configDB.url);
require('./models/User.js')(mongoose);
require('./models/SharedData.js')(mongoose);


console.log('Initializing...');

console.log('Preparing config files...');

var files = [
	{
		example: 'config/roles.json.example',
		original: 'config/roles.json'
	},
	{
		example: 'app/service.js.example',
		original: 'app/service.js'
	},

]

if (cleanConfigFiles){
	files.map((file, index) => {
		try {
			fs.copySync(path.join(__dirname, file.example), path.join(__dirname, file.original))
			// console.log("success!")
		} catch (err) {
			console.error(err)
			process.exit(1)
		}
	});

	console.log('config files OK')
}

console.log('preparing DB...')

var async = require('asyncawait/async');
var await = require('asyncawait/await');
async(() => {
	
	var User = mongoose.model('User');
	var CryptoJS = require('crypto-js');
	var result = '';
	
	if (cleanUser){
		result = await(new Promise((resolve, reject) => {
			User.remove({}, (err) => {
				if (err){
					console.log(err);
					reject('error');
				}
				else{
					resolve('OK');
				}
			})
		}))

		if (result == 'OK'){
			console.log('clean User collection: OK');
		}
		else {
			process.exit(1);
		}

		try {
			fs.removeSync(path.join(__dirname, 'config/acl.json'))
		}
		catch (e){
			// console.log(e);
		}

		var users = DATA.users;

		for(var i = 0; i < users.length; i++){
			var user = users[i];
			result = await(new Promise((resolve, reject) => {
				var newUser = new User();

				newUser.username = user.username;
				var l = 0;
				while (l < 1000){
					user.password = CryptoJS.MD5(user.password).toString();
					l++;
				}
				newUser.password = newUser.hashPassword(user.password);
				
				newUser.fullname = user.fullname;
				newUser.maDeTai = user.maDeTai;
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
			
			if (result == 'OK'){
				console.log(user.username + ' created')
			}
			else {
				console.log(result);
				process.exit(1);
			}

			result = await(new Promise((resolve, reject) => {
				User.findOne({username: user.username}, (err, _user) => {
					if (err){
						console.log(err);
						reject('error')
					}
					else {
						var data = {}
						try {
							data = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/acl.json')))
						}
						catch (e){
							// console.log(e)
						}
						data[_user._id] = {
							userId: _user._id,
							roles: user.roles
						}

						fs.writeFileSync(path.join(__dirname, 'config/acl.json'), JSON.stringify(data, null, 4))
						resolve('OK')
					}
				})
			}))

			if (result == 'OK'){
				console.log(user.username + ' configed')
			}
			else {
				console.log('error');
				process.exit(1);
			}
		}
	}

	if (cleanAutoCompletion){
		// Init AutoCompletion tables
		let models = DATA.autoCompletion.models;
		for (var i = 0; i < models.length; i++) {
			let model = models[i];
			// let ObjectModel          = mongoose.model(model.modelName);
			require('./models/' + model.modelName + 'AutoCompletion' + '.js')(mongoose);
			console.log('./models/' + model.modelName + 'AutoCompletion' + '.js');
			var AutoCompletion       = mongoose.model(model.modelName + 'AutoCompletion');
			let result = await(new Promise((resolve, reject) => {
				AutoCompletion.remove({}, (err) => {
					if (err){
						console.log(err);
						reject('err');
					}
					else {
						resolve('OK');
					}
				})
			}))
			if (result != 'OK'){
				continue;
			}
			console.log('Clean ' + model.modelName + ' AutoCompletion: OK');
			result = await(new Promise((resolve, reject) => {
				var ac = new AutoCompletion();
				let props = JSON.parse(fs.readFileSync(path.join(__dirname, model.fileName)));
				for(let prop of props){
					if (('autoCompletion' in prop) && (prop['autoCompletion'])){
						// console.log(prop.name)
						ac[prop.name] = []
					}
				}
				for(let data_ in model.data){
					ac[data_] = model.data[data_];
				}
				ac.save((error, autoCompletion) => {
					if (error){
						console.log(error);
						reject('err');
					}
					else {
						resolve('OK');
					}
				})
			}))
			if (result != 'OK'){
				continue
			}
			console.log(model.modelName + 'AutoCompletion: OK');
		}
		// End
	}

	if (cleanData){
		var result = await (new Promise((resolve, reject) => {
			var Data = mongoose.model('SharedData');
			Data.remove({}, (err) => {
				if (err){
					resolve('error');
				}
				else {
					var data = new Data();
					data.deTai = DATA.deTai;
					data.save((err) => {
						if (err){
							resolve('err')
						}
						else {
							resolve('OK')
						}
					})
				}
			})
		}))

		if (result == 'OK'){
			console.log('Clean Data OK')
		}
		else {
			console.log('Clean Data error')
		}
		
	}

	if (fixMaDeTai){
		console.log('start fixing maDeTai...');
		let Models = [
			{
				init: require('./models/Paleontological.js')(mongoose),
				model: mongoose.model('Paleontological'),
				name: 'Cổ sinh'
			},
			{
				init: require('./models/Geological.js')(mongoose),
				model: mongoose.model('Geological'),
				name: 'Địa chất'
			},
			{
				init: require('./models/Animal.js')(mongoose),
				model: mongoose.model('Animal'),
				name: 'Động vật'
			},
			{
				init: require('./models/Soil.js')(mongoose),
				model: mongoose.model('Soil'),
				name: 'Thổ nhưỡng'
			},
			{
				init: require('./models/Vegetable.js')(mongoose),
				model: mongoose.model('Vegetable'),
				name: 'Thực vật'
			}
		]
		let maDeTais = await(new Promise((resolve, reject) => {
			mongoose.model('SharedData').findOne({}, (err, sharedData) => {
				if (!err && sharedData){
					let result = [];
					for(let dt of sharedData.deTai){
						result.push(dt.maDeTai);
					}
					resolve(result);
				}
				else {
					resolve([])
				}
			})
		}))

		for(let model of Models){
			var selection = {'maDeTai.maDeTai': {$nin: maDeTais}};
			let rows = await(new Promise((resolve, reject) => {
				model.model.find(selection, (err, instances) => {
					if (err || !instances){
						console.log(err);
						// console.log(instances)
						resolve([]);
					}
					else {
						// console.log(instances)
						resolve(instances);
					}
					
				})
			}))
			for(let r of rows){
				let result = await(new Promise((resolve, reject) => {
					let mdt = maDeTais[Math.floor(Math.random() * maDeTais.length)];
					r.maDeTai = {};
					r.maDeTai.maDeTai = mdt;
					r.save((err) => {
						if (err){
							console.log(err);
							resolve('err')
						}
						else {
							resolve('ok');
						}
					})
				}))
				console.log(result)
			}
		}
		console.log('Fix form: OK');
		let users = await(new Promise((resolve, reject) => {
			mongoose.model('User').find({'maDeTai': {$nin: maDeTais}}, (err, users) => {
				if (err){
					console.log(err);
					resolve([])
				}
				resolve(users);
			})
		}))
		for(let u of users){
			u.maDeTai = '';
			await(new Promise((resolve, reject) => {
				u.save((err) => {
					err && console.log(err);
					resolve([])
				})
			}))
		}
		console.log('Done');

	}

	console.log('\nSuccess!\n')
	mongoose.connection.close();

})()
