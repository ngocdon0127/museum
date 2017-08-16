var express = require('express');
var router = express.Router();
var passport = require('passport');
var multer = require('multer');
const TMP_UPLOAD_DIR = 'public/uploads/tmp';
var upload = multer({dest: TMP_UPLOAD_DIR})
const path = require('path');
const fs = require('fs');
const fsE = require('fs-extra');
const ROOT = path.join(__dirname, '../')


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

router.get('/instant-upload', (req, res) => {
	res.render('instant-upload', {
		user: req.user,
		sidebar: {
			active: 'profile'
		},
	});
})

router.post('/instant-upload', upload.fields([{name: 'tmpfiles'}]), (req, res) => {
	console.log(req.files);
	console.log(req.body);
	 /* { fieldname: 'tmpfiles',
       originalname: '851575_126362140881916_1086262136_n.png',
       encoding: '7bit',
       mimetype: 'image/png',
       destination: 'public/uploads/tmp',
       filename: '1370080d63c024328a49fb7cc56aa2b5',
       path: 'public\\uploads\\tmp\\1370080d63c024328a49fb7cc56aa2b5',
       size: 8752 }, */
    req.files.tmpfiles.map(cur => {
		try {
			// Xóa bỏ 2 hoặc nhiều dấu chấm liền nhau. Đề phòng lỗi khi nó cố tình download file ngoài thư mục public
			// while (cur.originalname.indexOf('..') >= 0){
			// 	cur.originalname = cur.originalname.replace('..', '.');
			// }
			cur.originalname = cur.originalname.replace(/\.{2,}/g, '.');
			fsE.moveSync(path.join(ROOT, TMP_UPLOAD_DIR, cur.filename),
				path.join(ROOT, 
					TMP_UPLOAD_DIR,
					req.body.randomStr + STR_SEPERATOR + req.body.field + STR_SEPERATOR + cur.originalname
				)
			);
		}
		catch (e) {
			console.log(e);
		}
	})
	let files = []
	fs.readdirSync(path.join(ROOT, TMP_UPLOAD_DIR), {encoding: 'utf8'}).map((fileName) => {
		let prefix = req.body.randomStr + STR_SEPERATOR + req.body.field + STR_SEPERATOR;
		if (fileName.indexOf(prefix) == 0) {
			files.push(fileName.substring(fileName.lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length))
		}
	});
	return res.json({
		status: 'success',
		field: req.body.field,
		randomStr: req.body.randomStr,
		files: files
	})
})

router.post('/instant-upload/delete', upload.fields([{name: 'tmpfiles'}]), (req, res) => {
	console.log(req.files);
	console.log(req.body);
	try {
		fsE.removeSync(path.join(ROOT,
			TMP_UPLOAD_DIR, req.body.randomStr + STR_SEPERATOR + req.body.field + STR_SEPERATOR + req.body.fileName
		))
	} catch (e) {
		console.log(e);
	}
	let files = []
	fs.readdirSync(path.join(ROOT, TMP_UPLOAD_DIR), {encoding: 'utf8'}).map((fileName) => {
		let prefix = req.body.randomStr + STR_SEPERATOR + req.body.field + STR_SEPERATOR;
		if (fileName.indexOf(prefix) == 0) {
			files.push(fileName.substring(fileName.lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length))
		}
	});
	return res.json({
		status: 'success',
		field: req.body.field,
		randomStr: req.body.randomStr,
		files: files
	})
})

function isLoggedIn (req, res, next) {
	if (!req.isAuthenticated()){
		return res.redirect('/auth/login');
	}
	return next();
}

module.exports = router;
