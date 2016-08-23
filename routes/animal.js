var multer             = require('multer');
var fs                 = require('fs');
var path               = require('path');
var UPLOAD_DEST_ANIMAL = 'public/uploads/animal';
var upload             = multer({dest: UPLOAD_DEST_ANIMAL});
var mongoose           = require('mongoose');
var Animal             = mongoose.model('Animal');
var User               = mongoose.model('User');
var Log                = mongoose.model('Log');

// Get shared functions
var aclMiddleware       = global.myCustomVars.aclMiddleware;
var checkRequiredParams = global.myCustomVars.checkRequiredParams;
var responseError       = global.myCustomVars.responseError;
var responseSuccess     = global.myCustomVars.responseSuccess;

var IMG_FIELDS = [
	{name: 'hinhVe'                , animalSchemaProp: 'duLieuPhanTichMau'} ,
	{name: 'dinhKemXuLy'           , animalSchemaProp: 'xuLyCheTac'}        ,
	{name: 'hinhAnhDinhKem'        , animalSchemaProp: 'media.xuLyCheTac'}  ,
	{name: 'dinhKemChayTrinhTuDNA' , animalSchemaProp: 'media.thongTinDNA'} ,
	{name: 'dinhKemTrinhTuDNA'     , animalSchemaProp: 'media.thongTinDNA'} ,
	{name: 'taiLieuPhanTich'       , animalSchemaProp: 'duLieuPhanTichMau'}
];

var PROP_FIELDS = JSON.parse(fs.readFileSync(path.join(__dirname, '../models/AnimalSchemaProps.json')).toString());

module.exports = function (router) {

router.post('/dong-vat', aclMiddleware('/content/dong-vat', 'create'),
	upload.fields(IMG_FIELDS.reduce(function (preArray, curElement) {
		preArray.push({name: curElement.name}); 
		return preArray;
	}, [])), 
	function (req, res, next) {
		var newAnimal = new Animal();

		// save props
		PROP_FIELDS.map(function (element) {
			// var nodes = element.animalSchemaProp.split('.');
			// var lastProp = nodes.splice(nodes.length - 1, 1)[0];
			// var tree = nodes.join('.');
			// objectChild(newAnimal, tree)[lastProp] = req.body[element.name];
			objectChild(newAnimal, element.animalSchemaProp)[element.name] = req.body[element.name];
		})

		newAnimal.save(function (err, result) {
			if (err){
				console.log(err);
				return res.status(500).json({
					status: 'error',
					error: 'Error while saving to database'
				})
			}

			// rename images
			IMG_FIELDS.map(function (element) {
				if (req.files[element.name]){
					// var nodes = element.animalSchemaProp.split('.');
					// var lastProp = nodes.splice(nodes.length - 1, 1)[0];
					// var tree = nodes.join('.');
					// objectChild(newAnimal, tree)[lastProp] = [];
					// rename(req.files[element.name], objectChild(newAnimal, element.animalSchemaProp), UPLOAD_DEST_ANIMAL, result.id);
					objectChild(newAnimal, element.animalSchemaProp)[element.name] = [];
					rename(req.files[element.name], objectChild(newAnimal, element.animalSchemaProp)[element.name], UPLOAD_DEST_ANIMAL, result.id);
				}
			})

			newAnimal.created_at = new Date();
			newAnimal.save(function (err, r) {
				if (err){
					console.log(err);
				}

				var newLog = new Log();
				newLog.action = 'create';
				newLog.time = new Date();
				newLog.objType = 'animal';
				newLog.userId = req.user.id;
				newLog.obj1 = newAnimal;
				newLog.userFullName = req.user.fullname;
				newLog.save();
				res.status(200).json({
					status: 'success'
				})
			});
		})
})

router.get('/dong-vat', aclMiddleware('/content/dong-vat', 'view'), function (req, res) {
	Animal.find({}, function (err, animals) {
		if (err){
			return responseError(res, 500, 'Error while reading database');
		}
		return responseSuccess(res, ['status', 'animals'], ['success', animals]);
	})
})

router.delete('/dong-vat', aclMiddleware('/content/dong-vat', 'delete'), function (req, res) {
	var missingParam = checkRequiredParams(['animalId'], req.body);
	if (missingParam){
		return responseError(res, 400, 'Missing ' + missingParam);
	}
	console.log(req.body);
	Animal.findById(req.body.animalId, function (err, animal) {
		console.log('function');
		if (err){
			console.log(err);
			return responseError(res, 500, 'Error while reading database');
		}
		if (animal){
			animal.deleted_at = new Date();
			animal.save();
			var newLog = new Log();
			newLog.action = 'delete';
			newLog.userId = req.user.id;
			newLog.userFullName = req.user.fullname;
			newLog.objType = 'animal';
			newLog.obj1 = animal;
			newLog.save();
			return responseSuccess(res, ['status'], ['success']);
		}
		else{
			return responseError(res, 400, 'Invalid animalId');
		}
	})
	// return res.end('ok');
})

}

function rename (curFiles, schemaField, position, mongoId) {
	// console.log(schemaField);
	try {
		schemaField.splice(0, schemaField.length); // delete all old elements
	}
	catch (e){
		console.log(e);
		schemaField = [];
	}
	for (var i = 0; i < curFiles.length; i++) {
		var file = curFiles[i];
		try {
			var curPath = path.join(position, file.filename);
			var newFileName = mongoId + '_+_' + file.originalname;
			var newPath = path.join(position, newFileName);
			fs.renameSync(curPath, newPath);
			schemaField.push(mongoId + '_+_' + file.originalname);
		}
		catch (e){
			console.log(e);
		}
	}
}

function objectChild (object, tree) {
	var nodes = tree.trim().split('.');
	for (var i = 0; i < nodes.length; i++) {
		if (nodes[i] in object){
			object = object[nodes[i]];
		}
		else {
			object[nodes[i]] = {}
		}
	}
	return object;
}

function generate (schema) {
	if (typeof(schema) != 'object'){
		tree = nodes.join('.');
		var pos = tree.lastIndexOf('.');
		(pos >= 0) ? (tree = tree.substring(0, pos)) : (tree = "");
		arr.push({name: nodes[nodes.length - 1], animalSchemaProp: tree});
	}
	else {
		for (var i in schema){
			nodes.push(i);
			generate(schema[i]);
			nodes.splice(nodes.length - 1, 1);
		}
	}
}

function autoFill () {
	var inputs = document.getElementsByTagName('input');
	for(var i = 0; i < inputs.length; i++) {
		try {
			switch (inputs[i].getAttribute('type')){
				case 'text':
					console.log('text ' + i);
					inputs[i].value = $($(inputs[i]).parent().parent().children()[0]).children()[0].innerHTML;
					console.log('done text ' + i);
					break;
				case 'number':
					console.log('number ' + i);
					inputs[i].value = Math.floor(Math.random() * 100);
					console.log('done number ' + i);
					break;
				case 'date':
					console.log('date ' + i);
					var x = new Date();
					inputs[i].value = x.getFullYear() + '-' + (x.getMonth() >= 9 ? (x.getMonth() + 1) : ( '0' + (x.getMonth() + 1))) + '-' + x.getDate();
					console.log('done date ' + i);
					break;
				default:
					break;
			}
			
		}
		catch (e) {
			console.log(e);
		}
	}
}