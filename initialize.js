var fs = require('fs-extra')
var path = require('path')

var cleanUser = false;
var cleanAutoCompletion = false;

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

console.log('preparing DB...')

var async = require('asyncawait/async');
var await = require('asyncawait/await');
async(() => {
	var mongoose = require('mongoose');
	var configDB = require('./config/config').database;
	var mongooseConnection = mongoose.connect(configDB.url);
	require('./models/User.js')(mongoose);
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

		var users = [
			{
				username: 'museumtest@gmail.com',
				password: '123museumhust',
				fullname: 'Test Account',
				roles: ['content']
			},
			{
				username: 'kevinhoa95@gmail.com',
				password: 'museumhust1536',
				fullname: 'Hola',
				roles: ['content', 'admin']
			}
		]

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
		let models = [
			{
				modelName: 'Paleontological',
				fileName: 'models/PaleontologicalSchemaProps.json',
				data: {
					'loaiMauVat': [
						'Mẫu nghiên cứu',
						'Mẫu trưng bày',
						'Mẫu Type'
					],
					'hinhThucNhapMau': [
						'Thu thập',
						'Hiến tặng'
					]
				}
			},
			{
				modelName: 'Geological',
				fileName: 'models/GeologicalSchemaProps.json',
				data: {
					'loaiMauVat': [
						'Mẫu nghiên cứu',
						'Mẫu trưng bày',
						'Mẫu Type'
					],
					'hinhThucNhapMau': [
						'Thu thập',
						'Hiến tặng'
					]
				}
			},
			{
				modelName: 'Animal',
				fileName: 'models/AnimalSchemaProps.json',
				data: {
					'loaiMauVat': [
						'Mẫu nghiên cứu',
						'Mẫu trưng bày',
						'Mẫu Type'
					],
					'hinhThucNhapMau': [
						'Thu thập',
						'Hiến tặng'
					]
				}
			},
			{
				modelName: 'Soil',
				fileName: 'models/SoilSchemaProps.json',
				data: {
					'loaiMauVat': [
						'Mẫu nghiên cứu',
						'Mẫu trưng bày',
						'Mẫu Type'
					],
					'hinhThucNhapMau': [
						'Thu thập',
						'Hiến tặng'
					]
				}
			},
			{
				modelName: 'Vegetable',
				fileName: 'models/VegetableSchemaProps.json',
				data: {
					'loaiMauVat': [
						'Mẫu nghiên cứu',
						'Mẫu trưng bày',
						'Mẫu Type'
					],
					'hinhThucNhapMau': [
						'Thu thập',
						'Hiến tặng'
					]
				}
			},
		]
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

	console.log('\nSuccess!\n')
	mongoose.connection.close();

})()
