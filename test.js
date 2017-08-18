
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

// var mongoose = require('mongoose');
// var configDB = require('./config/config').database;
// var mongooseConnection = mongoose.connect(configDB.url);
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


// mongoose.model('Test', mongoose.Schema({
// 	data: {
// 		type: String,
// 		set: v => parseInt(v)
// 	}
// }))

// let Test = mongoose.model('Test');

// let t = new Test();
// t.data = 'abc';
// console.log(t.data);
// t.save((err) => {
// 	err && console.log(err);
// 	mongoose.disconnect();
// })
// 

// var acl = require('acl');
// acl = new acl(new acl.memoryBackend());
// acl.allow('user', '/profile', 'view');
// acl.allow('manager', '/manager', 'view');
// acl.allow('admin', '/admin', 'view');
// acl.allow('master', '/master', 'view');
// acl.addUserRoles('don', 'user')
// acl.addUserRoles('don', 'manager')
// acl.addUserRoles('don', 'admin')
// acl.addUserRoles('don', 'master')
// acl.userRoles('don', (err, result) => {
// 	if (err){
// 		console.log(err);
// 	}
// 	else {
// 		console.log(result);
// 		// acl.removeUserRoles('don', result, (err) => {
// 		// 	if (err){
// 		// 		console.log(err);
// 		// 	}
// 		// 	else {
// 		// 		acl.userRoles('don', (err, result) => {
// 		// 			if (err){
// 		// 				console.log(err);
// 		// 			}
// 		// 			else {
// 		// 				console.log(result);
// 		// 			}
// 		// 		})
// 		// 	}
// 		// })
// 		acl.addUserRoles('don', 'manager', (err) => {
// 			if (err){
// 				console.log(err);
// 			}
// 			else {
// 				acl.userRoles('don', (err, result) => {
// 					if (err){
// 						console.log(err);
// 					}
// 					else {
// 						console.log(result);
// 					}
// 				})
// 			}
// 		});

// 	}
// })
// 

// var cluster = require('cluster')
// var workers = {}

// if (cluster.isMaster){
// 	nCores = require('os').cpus().length;
// 	cluster.on('fork', (worker) => {
// 		console.log('Attemping to fork worker');
// 	})
// 	cluster.on('online', (worker) => {
// 		console.log('worker forked', worker.process.pid);
// 		workers[worker.process.pid] = worker;
// 		console.log('Total workers: ' + Object.keys(workers).length);
// 	})
// 	cluster.on('exit', (worker, code, signal) => {
// 		console.log('worker ' + worker.id + ' with pid ' + worker.process.pid + ' is exitted, code ' + code + ', signal ' + signal);
// 		// for(let pid in workers){
// 		// 	workers[pid].kill();
// 		// }
// 		// console.log(cluster);
// 		cluster.fork();
// 		delete workers[worker.process.pid]

// 	})
// 	console.log('master ' + process.pid + ' is forking childs...');
// 	for(let i = 0; i < nCores; i++){
// 		console.log('forking child', i, '/', Object.keys(cluster.workers).length);
// 		cluster.fork();
// 	}
// 	// setTimeout(() => {

// 	// })
// 	setInterval(() => {
// 		console.log(Object.keys(workers).length + ' / ' + Object.keys(cluster.workers).length);
// 		if (Object.keys(workers).length >= nCores){
// 			console.log('start sending msg to workers');
// 			for(let pid in workers){
// 				workers[pid].send({data: Math.floor(Math.random())});
// 			}
// 		}
// 	}, 2000)
// 	// console.log(cluster);
// }
// else if (cluster.isWorker) {
// 	// console.log('++++++++++++');
// 	// console.log(cluster);
// 	// console.log('+++++++++++');
// 	console.log('worker ' + cluster.worker.id + ' forked with pid ' + cluster.worker.process.pid + ', process pid ' + process.pid);
// 	// console.log('worker ' + cluster.worker.id + ' exit now');
// 	// process.exit(0);
	
// 	process.on('message', (msg) => {
// 		console.log('worker ' + cluster.worker.process.pid + ' received msg: ');
// 		console.log(msg);
// 	})
// }
// 
// if (cluster.isMaster) {
//   const worker1 = cluster.fork();
//   const worker2 = cluster.fork();
//   // worker.send('msg send from master to worker');
//   cluster.on('message', (worker, msg) => {
//   	console.log('received msg from', worker);
//   	console.log('msg', msg);
//   })

//   // process.on('hehe', (a1, a2, a3) => {
//   // 	console.log('================= hehe emitted ================');
//   // 	console.log(a1);
//   // 	console.log('---------------');
//   // 	console.log(a2);
//   // 	console.log('---------------');
//   // 	console.log(a3);
//   // 	console.log('===============================================');
//   // })

//   // // process.send('msg from master to somewhere');
//   // process.emit('hehe', {p1: 'v1', p2: 'v2'}, {pp1: 'vv1', pp2: 'vv2'})
  

// } else if (cluster.isWorker) {
//   // process.on('message', (msg) => {
//   // 	console.log(msg);
//   //   process.send('msg from worker to master');
//   // cluster.send('msg from worker to master')
//   // });
  
//   process.on('hehe', (a1, a2, a3) => {
//   	console.log('================= hehe emitted ================');
//   	console.log(a1);
//   	console.log('---------------');
//   	console.log(a2);
//   	console.log('---------------');
//   	console.log(a3);
//   	console.log('===============================================');
//   })

//   // process.send('msg from master to somewhere');
//   process.emit('hehe', {p1: 'v1_' + process.pid, p2: 'v2'}, {pp1: 'vv1', pp2: 'vv2'})
// }
// 

// if (cluster.isMaster){
// 	let workers = {}


// }
// else if (cluster.isWorker){

// }


var officegen = require('officegen');
var fs = require('fs');
var path = require('path');

var docx = officegen ( 'docx' );

var out = fs.createWriteStream ( 'out.docx' );
 

out.on ( 'close', function () {
  console.log ( 'Finished to create the DOCX file!' );
});
var table = [
	[
		{
			"val": "No.",
			"opts": {
				"cellColWidth": 4261,
				"b": true,
				"sz": "48",
				"shd": {
					"fill": "7F7F7F",
					"themeFill": "text1",
					"themeFillTint": "80"
				},
				"fontFamily": "Avenir Book"
			}
		},
		{
			"val": "Title1",
			"opts": {
				"b": true,
				"color": "A00000",
				"align": "right",
				"shd": {
					"fill": "92CDDC",
					"themeFill": "text1",
					"themeFillTint": "80"
				}
			}
		},
		{
			"val": "Title2",
			"opts": {
				"align": "center",
				"vAlign": "center",
				"cellColWidth": 42,
				"b": true,
				"sz": "48",
				"shd": {
					"fill": "92CDDC",
					"themeFill": "text1",
					"themeFillTint": "80"
				}
			}
		}
	],
	[
		[{
			"type": "image",
			"path": path.resolve(__dirname, "thumb.jpg"),
			"opts": {
				"cx": 100,
				"cy": 100
			}
		}],
		[
			{
				"type": "text",
				"inline": true,
				"values": [
					{
						"opts": {
							"b": true,
							"sz": 20
						}
					},
					{
						"val": " Balance Training",
						"opts": {
							"sz": 20
						}
					},
					{
						"val": "abc",
						"opts": {
							"sz": 20
						}
					}
				]
			},
			{
				"type": "text",
				"inline": true,
				"values": [{
						"opts": {
							"b": true,
							"sz": 20
						}
					},
					{
						"val": " Beginning Knitting",
						"opts": {
							"sz": 20
						}
					},
					{
						"val": ", Salon",
						"opts": {
							"sz": 20
						}
					}
				]
			}
		],
		"All grown-ups were once children"
	],
	[2, "there is no harm in putting off a piece of work until another day.", ""],
	[3, "But when it is a matter of baobabs, that always means a catastrophe.", ""],
	[4, "watch out for the baobabs!", "END"]
]

var tableStyle = {
	tableColWidth: 4261,
	tableSize: 24,
	tableColor: "ada",
	tableAlign: "left",
	tableFontFamily: "Comic Sans MS"
}

var data = [[{
		type: "text",
		val: "Simple"
	}, {
		type: "text",
		val: " with color",
		opt: { color: '000088' }
	}, {
		type: "text",
		val: "  and back color.",
		opt: { color: '00ffff', back: '000088' }
	}, {
		type: "linebreak"
	}, {
		type: "text",
		val: "Bold + underline",
		opt: { bold: true, underline: true }
	}], {
		type: "horizontalline"
	}, [{ backline: 'EDEDED' }, {
		type: "text",
		val: "  backline text1.",
		opt: { bold: true }
	}, {
		type: "text",
		val: "  backline text2.",
		opt: { color: '000088' }
	}], {
		type: "text",
		val: "Left this text.",
		lopt: { align: 'left' }
	}, {
		type: "text",
		val: "Center this text.",
		lopt: { align: 'center' }
	}, {
		type: "text",
		val: "Right this text.",
		lopt: { align: 'right' }
	}, {
		type: "text",
		val: "Fonts face only.",
		opt: { font_face: 'Arial' }
	}, {
		type: "text",
		val: "Fonts face and size.",
		opt: { font_face: 'Arial', font_size: 40 }
	}, {
		type: "table",
		val: table,
		opt: tableStyle
	}, [{ // arr[0] is common option.
		align: 'right'
	}, {
		type: "image",
		path: path.resolve(__dirname, 'thumb.jpg')
	},{
		type: "image",
		path: path.resolve(__dirname, 'thumb.jpg')
	}], {
		type: "pagebreak"
	}
]

docx.createByJson(data);
var tableStyle = {
  tableColWidth: 4261,
  tableSize: 24,
  tableColor: "ada",
  tableAlign: "left",
  tableFontFamily: "Comic Sans MS",
  borders: true
}

// docx.createTable (table, tableStyle);
// docx.generate(out);
// 
const util = require('util')
console.log(fs.statSync('./2.txt'));
console.log(util.inspect(fs.statSync('./2.txt')))
console.log((new Date(fs.statSync('./2.txt').mtime)).getTime());