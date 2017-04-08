var express = require('express');
var router = express.Router();
var passport = require('passport');
var multer = require('multer');

router.use(isLoggedIn);

var STR_SEPERATOR = global.myCustomVars.STR_SEPERATOR;

/* GET home page. */
router.get('/', function(req, res, next) {
	res.end("up content");
});

// handle data for animal form
require('./animal.js')(router);

// handle data for soil form
require('./soil.js')(router);

// handle data for geological form
require('./geological.js')(router);

// handle data for paleontological form
require('./paleontological.js')(router);

// handle data for paleontological form
require('./vegetable.js')(router);

// handle download request.
// 
// =================== NEED TO BE CHECKED VERY CAREFULLY. =====================
// =================== TO PREVENT DOWNLOADING SOURCE CODE. =====================
// 
router.get('/download/*', function (req, res, next) {
	var path = require('path');
	console.log(req.path);
	var regex = new RegExp('^\/download\/uploads.*$');
	var p = decodeURIComponent(req.path);
	if (p.indexOf('..') >= 0){
		return res.end('nice try.');
	}
	if (regex.test(p)){
		var fileLocation = p.substring('/download/'.length);
		console.log(path.join(__dirname, '../public', fileLocation));
		try{
			// fileLocation: /uploads/animal/58d79d38e2058328e82fd863_+_anhMauVat_+_Anh_1.png
			// filename: Anh_1.png
			let parts = fileLocation.split(STR_SEPERATOR);
			res.download(path.join(__dirname, '../public', fileLocation), parts[parts.length - 1]);
		}
		catch (e){
			console.log(e);
			return res.end('Invalid file location')
		}
	}
	else {
		return res.end('Invalid file path ' + p);
	}
	
	// res.end('ok');
})

function isLoggedIn (req, res, next) {
	if (!req.isAuthenticated()){
		return res.redirect('/auth/login');
	}
	return next();
}

module.exports = router;
