var async = require('asyncawait/async');
var await = require('asyncawait/await');

function wait(ms) {
   return new Promise(r => setTimeout(r, ms))  
}

function hoho() {
	console.log('start');
	async (function main() {
		console.log('sắp rồi...')
		await (wait(2007))
		console.log('chờ tí...')
		await (wait(2012))
		console.log('thêm chút nữa thôi...')
		await (wait(2016))
		console.log('xong rồi đấy!')
	})();
	console.log('stop');
}

hoho()