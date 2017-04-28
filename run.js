var cluster = require('cluster');
var noCPUs = require('os').cpus().length;
var config = require('./config/config.js');
var noThreads = config.noThreads;

if ((noCPUs == 1) || (parseInt(noThreads) == 1)){
	return require('./bin/www');
}

if (cluster.isMaster){
	cluster.on('fork', (worker) => {
		console.log('Attemping to fork worker');
	})
	cluster.on('online', (worker) => {
		console.log('worker ' + worker.id + ' with pid ' + worker.process.pid + ' is forked');
	})

	cluster.on('exit', (worker, code, signal) => {
		console.log('worker ' + worker.id + ' with pid ' + worker.process.pid + ' is exitted, code ' + code + ', signal ' + signal);
		cluster.fork();
	})

	cluster.on('message', (worker, msg) => {
		if (config.environment == 'development'){
			console.log('received message from worker ' + worker.id + ' pid ' + worker.process.pid);
			console.log(msg);
		}
		
		if (msg.actionType){
			switch (msg.actionType) {
				case 'restart':
					console.log('Master received restart-request from worker ' + worker.id + ' pid ' + worker.process.pid);
					console.log(msg);
					if (msg.target == 'other'){
						// console.log('----------------');
						// console.log('start killing other workers');
						// console.log('----------------');
						let stt = 1;
						for(let id in cluster.workers){
							let w = cluster.workers[id]
							let pid = w.process.pid;
							if (pid != worker.process.pid){
								// console.log('killing ' + pid);
								// cluster.workers[pid].kill();
								w.send({actionType: 'killYourSelf', timeout: stt * 1000});
							}
							else {
								// console.log('do not kill ' + pid);
							}
							stt++;
						}
					}
					else if (msg.target == 'all'){
						// console.log('----------------');
						// console.log('start killing all workers');
						// console.log('----------------');
						let stt = 0;
						for(let id in cluster.workers){
							let w = cluster.workers[id]
							let pid = w.process.pid;
							w.send({actionType: 'killYourSelf', timeout: stt * 1000});
							stt++;
						}
					}
					break;
				default:
			}
		}
	})

	console.log('master ' + process.pid + ' is forking childs...');
	if (noThreads == 'optimal'){
		noThreads = noCPUs;
	}
	else {
		noThreads = parseInt(noThreads)
	}
	if (noThreads < 0){
		noThreads = noCPUs
	}
	for(let i = 0; i < noThreads; i++){
		cluster.fork();
	}
	// setTimeout(() => {
	// 	console.log('time out');
	// 	for(let pid in workers){
	// 		workers[pid].kill(0, 1);
	// 		break;
	// 	}
	// }, 2000)
	// console.log(cluster);
}
else if (cluster.isWorker){
	// process.exit(0, 1);
	// console.log('worker ' + cluster.worker.id + ' forked with pid ' + cluster.worker.process.pid + ', process pid ' + process.pid);
	process.on('message', (msg) => {
		if (config.environment == 'development'){
			console.log('worker ' + cluster.worker.process.pid + ' received msg: ');
			console.log(msg);
		}
		if (msg.actionType == 'killYourSelf'){
			console.log('preparing to exit');
			setTimeout(() => {
				console.log('halt');
				process.exit(0)
			}, msg.timeout)
		}
		
	})
	require('./bin/www');
	// process.send({actionType: 'restart', target: 'other'})
}