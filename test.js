var async = require('asyncawait/async');
var await = require('asyncawait/await');
var fs = require('fs');

async(function () {
	console.log('start');
	var a1 = await (new Promise(function (resolve, reject) {
		setTimeout(function () {
			resolve('first timeout');
		}, 1000);
	}))
	console.log(a1)

	var a2 = await (new Promise(function (resolve, reject) {
		setTimeout(function () {
			resolve('second timeout');
		}, 3000);
	}))
	console.log(a2)

	var a3 = await (new Promise(function (resolve, reject) {
		setTimeout(function () {
			resolve('third timeout');
		}, 2000);
	}))
	console.log(a3)
	console.log('finish');
})()

// console.log('out');

var x = [1, 2, 3]
for(let i of x){
	console.log(i)
}