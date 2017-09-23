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
const mongoose = require('mongoose');


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
	let savedFiles = []
	// TODO
	let models = {
		'co-sinh': mongoose.model('Paleontological'),
		'dia-chat': mongoose.model('Geological'),
		'dong-vat': mongoose.model('Animal'),
		'tho-nhuong': mongoose.model('Soil'),
		'thuc-vat': mongoose.model('Vegetable'),
	}
	if (req.body.id && req.body.form && (req.body.form in models)) {
		// get all current saved files in the object
		let model = models[req.body.form];
		model.findById(req.body.id, (err, objectInstance) => {
			if (!err && objectInstance) {
				let PROP_FIELDS_OBJ = global.myCustomVars.models[req.body.form].PROP_FIELDS_OBJ;
				let PROP_FIELDS = global.myCustomVars.models[req.body.form].PROP_FIELDS;
				let UPLOAD_DESTINATION = global.myCustomVars.models[req.body.form].UPLOAD_DESTINATION;
				let objectChild = global.myCustomVars.objectChild;
				let arr = []
				if (req.body.field in PROP_FIELDS_OBJ) {
					arr = objectChild(objectInstance, PROP_FIELDS[PROP_FIELDS_OBJ[req.body.field]].schemaProp)[req.body.field];
					console.log('savedFiles');
					console.log(arr);
					arr.map(f => {
						savedFiles.push(f.split(STR_SEPERATOR)[f.split(STR_SEPERATOR).length - 1])
					})
				} else {
					console.log(req.body.field, 'not in', 'PROP_FIELDS_OBJ');
				}
			} else {
				console.log(err);
			}
			return res.json({
				status: 'success',
				field: req.body.field,
				randomStr: req.body.randomStr,
				files: files,
				savedFiles: savedFiles,
				id: req.body.id,
				form: req.body.form
			})
		})
	} else {
		return res.json({
			status: 'success',
			field: req.body.field,
			randomStr: req.body.randomStr,
			files: files,
			savedFiles: savedFiles,
			id: req.body.id,
			form: req.body.form
		})
	}
	// return res.json({
	// 	status: 'success',
	// 	field: req.body.field,
	// 	randomStr: req.body.randomStr,
	// 	files: files
	// })
})

router.delete('/instant-upload', upload.fields([{name: 'tmpfiles'}]), (req, res) => {
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
	let savedFiles = []
	// TODO
	let models = {
		'co-sinh': mongoose.model('Paleontological'),
		'dia-chat': mongoose.model('Geological'),
		'dong-vat': mongoose.model('Animal'),
		'tho-nhuong': mongoose.model('Soil'),
		'thuc-vat': mongoose.model('Vegetable'),
	}
	if (req.body.id && req.body.form && (req.body.form in models)) {
		// get all current saved files in the object
		let model = models[req.body.form];
		model.findById(req.body.id, (err, objectInstance) => {
			if (!err && objectInstance) {
				let PROP_FIELDS_OBJ = global.myCustomVars.models[req.body.form].PROP_FIELDS_OBJ;
				let PROP_FIELDS = global.myCustomVars.models[req.body.form].PROP_FIELDS;
				let UPLOAD_DESTINATION = global.myCustomVars.models[req.body.form].UPLOAD_DESTINATION;
				let objectChild = global.myCustomVars.objectChild;
				let arr = []
				if (req.body.field in PROP_FIELDS_OBJ) {
					arr = objectChild(objectInstance, PROP_FIELDS[PROP_FIELDS_OBJ[req.body.field]].schemaProp)[req.body.field];
					console.log('savedFiles');
					console.log(arr);
					arr.map(f => {
						savedFiles.push(f.split(STR_SEPERATOR)[f.split(STR_SEPERATOR).length - 1])
					})
				} else {
					console.log(req.body.field, 'not in', 'PROP_FIELDS_OBJ');
				}
			} else {
				console.log(err);
			}
			return res.json({
				status: 'success',
				field: req.body.field,
				randomStr: req.body.randomStr,
				files: files,
				savedFiles: savedFiles,
				id: req.body.id,
				form: req.body.form
			})
		})
	} else {
		return res.json({
			status: 'success',
			field: req.body.field,
			randomStr: req.body.randomStr,
			files: files,
			savedFiles: savedFiles,
			id: req.body.id,
			form: req.body.form
		})
	}
	
})

function isLoggedIn (req, res, next) {
	if (!req.isAuthenticated()){
		return res.redirect('/auth/login');
	}
	return next();
}

module.exports = router;
