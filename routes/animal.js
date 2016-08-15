var multer             = require('multer');
var fs                 = require('fs');
var path               = require('path');
var UPLOAD_DEST_ANIMAL = 'public/uploads/animal';
var upload             = multer({dest: UPLOAD_DEST_ANIMAL});
var mongoose           = require('mongoose');
var Animal             = mongoose.model('Animal');
var User               = mongoose.model('User');
var Log                = mongoose.model('Log');

var aclMiddleware = global.myCustomVars.aclMiddleware;

var IMG_FIELDS = [
	{name: 'hinhVe'                , animalSchemaProp: 'duLieuPhanTichMau'}                ,
	{name: 'dinhKemXuLy'           , animalSchemaProp: 'xuLyCheTac'}                  ,
	{name: 'hinhAnhDinhKem'        , animalSchemaProp: 'media.xuLyCheTac'}         ,
	{name: 'dinhKemChayTrinhTuDNA' , animalSchemaProp: 'media.thongTinDNA'} ,
	{name: 'dinhKemTrinhTuDNA'     , animalSchemaProp: 'media.thongTinDNA'}     ,
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

			newAnimal.save(function (err, r) {
				if (err){
					console.log(err);
					res.status(500).json({
						status: 'error',
						error: 'Error while saving to database'
					})
				}

				var newLog = new Log();
				newLog.action = 'create';
				newLog.time = new Date();
				newLog.userId = req.user.id;
				newLog.animal1 = newAnimal;
				User.findById(req.user.id, function (err, user) {
					if (err){
						console.log(err);
						return newLog.save();
					}
					newLog.userFullName = user.fullname;
					newLog.save();
				})
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

function responseError (res, errCode, errMessage) {
	return res.status(errCode).json({
		status: 'error',
		error: errMessage
	})
}

function responseSuccess (res, props, values) {
	if ((props instanceof Array) && (values instanceof Array) && (props.length == values.length)){
		var result = {};
		result.status = 'success';
		for (var i = 0; i < props.length; i++) {
			result[props[i]] = values[i];
		}
		return res.status(200).json(result);
	}
	return res.status(200).json({
		status: 'success',
	})
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
					inputs[i].value = $($(inputs[i]).parent().parent().children()[0]).children()[0].innerHTML;
					break;
				case 'number':
					inputs[i].value = Math.floor(Math.random() * 100);
					break;
				case 'date':
					var x = new Date();
					inputs[i].value = x.getFullYear() + '-' + (x.getMonth() >= 9 ? (x.getMonth() + 1) : ( '0' + (x.getMonth() + 1))) + '-' + x.getDate();
					break;
				default:
					break;
			}
			
		}
		catch (e) {

		}
	}
}