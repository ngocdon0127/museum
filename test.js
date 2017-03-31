 
// var fs = require('fs');
// var path = require('path');

// var CITIES = {};
// var DISTRICTS = {};
// var WARDS = {};

// WARDS = JSON.parse(fs.readFileSync(path.join(__dirname, 'wards.json')));

// console.log(WARDS);

// var wardsArr = [];

// for(let prop in WARDS){
// 	wardsArr.push({
// 		id: prop,
// 		name: WARDS[prop]["name"],
// 		type: WARDS[prop]["type"],
// 		"lon, lat": WARDS[prop]["lon, lat"],
// 		districtId: WARDS[prop]["districtId"],
// 	})
// }



// wardsArr.sort((a, b) => {
// 	return a.name.localeCompare(b.name);
// })

// console.log(wardsArr)

// fs.writeFileSync(path.join(__dirname, 'wards-sort.json'), JSON.stringify(wardsArr, null, 4));

var async = require('asyncawait/async');
var await = require('asyncawait/await');

// async(() => {
// 	p1 = new Promise((resolve, reject) => {
// 		setTimeout(() => {
// 			resolve(1)
// 		}, 1000)
// 	});
// 	p1.then(() => {console.log('resolved'); result = 'a'}, () => {console.log('rejected'); result = 'b'})
// 	var result = await(p1)
// 	console.log(result);
// 	result = await(new Promise((resolve, reject) => {
// 		setTimeout(() => {
// 			reject(2)
// 		}, 1000)
// 	}).then(() => {console.log('resolved');}, () => {console.log('rejected');}))
// 	console.log(result);
// })()

// var f = async((s) => {
// 	var r = await(new Promise((resolve, reject) => {
// 		setTimeout(() => {
// 			resolve(2)
// 		}, 1000)
// 	}));
// 	console.log(r);
// })
// console.log(1);
// console.log(f('x'));

// var suspendable = async (function defn(a, b) {
//     // assert(...) // may throw
//     var r = await(new Promise((resolve, reject) => {
// 		setTimeout(() => {
// 			resolve(2)
// 		}, 1000)
// 	}));
// 	console.log(r);
//     return r;
// });

// console.log('out');
// suspendable.then((val) => {
// 	console.log('OK');
// 	console.log(val);
// }, (err) => {
// 	console.log('err');
// 	console.log(err);
// })
// console.log(suspendable());
// 

var mongoose = require('mongoose');
var configDB = require('./config/config').database;
var mongooseConnection = mongoose.connect(configDB.url);
// require('./models/Animal.js')(mongoose);
// require('./models/SharedData.js')(mongoose);

// var Animal = mongoose.model('Animal');

// var maDeTais = ['DT-002'];

// var projection = {deleted_at: {$eq: null}, 'maDeTai.maDeTai': {$in: maDeTais}};
// Animal.find(projection, (err, animals) => {
// 	if (err){
// 		console.log(err);
// 	}
// 	else {
// 		console.log(animals.length);
// 		mongoose.model('SharedData').findOne({}, (err, sharedData) => {
// 			if (err || !sharedData){
// 				console.log(err);
// 			}
// 			else {
// 				console.log(sharedData.maDeTai)
// 			}
// 			mongoose.disconnect();
// 		})
		
// 	}
// })


mongoose.model('Test', mongoose.Schema({
	data: {
		type: String,
		set: v => parseInt(v)
	}
}))

let Test = mongoose.model('Test');

let t = new Test();
t.data = 'abc';
console.log(t.data);
t.save((err) => {
	err && console.log(err);
	mongoose.disconnect();
})