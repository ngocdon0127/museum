var multer               = require('multer');
var fs                   = require('fs');
var path                 = require('path');
var UPLOAD_DEST_ANIMAL   = 'public/uploads/animal';
var upload               = multer({dest: UPLOAD_DEST_ANIMAL});
var mongoose             = require('mongoose');
var Animal               = mongoose.model('Animal');
var AnimalAutoCompletion = mongoose.model('AnimalAutoCompletion');
var User                 = mongoose.model('User');
var Log                  = mongoose.model('Log');

// Get shared functions
var aclMiddleware       = global.myCustomVars.aclMiddleware;
var checkRequiredParams = global.myCustomVars.checkRequiredParams;
var responseError       = global.myCustomVars.responseError;
var responseSuccess     = global.myCustomVars.responseSuccess;

var PROP_FIELDS = JSON.parse(fs.readFileSync(path.join(__dirname, '../models/AnimalSchemaProps.json')).toString());

var PROP_FIELDS_OBJ = {};

PROP_FIELDS.map(function (element, index) {
	PROP_FIELDS_OBJ[element.name] = index;
});

// File fields
var IMG_FIELDS = PROP_FIELDS.filter(function (element) {
	return !element.type.localeCompare('File')
});

var ACTION_CREATE = 0;
var ACTION_EDIT = 1;

module.exports = function (router) {

router.post('/dong-vat', aclMiddleware('/content/dong-vat', 'create'),
	upload.fields(IMG_FIELDS.reduce(function (preArray, curElement) {
		preArray.push({name: curElement.name}); 
		return preArray;
	}, [])), 
	function (req, res, next) {
		var newAnimal = new Animal();

		return saveOrUpdateAnimal(req, res, newAnimal, ACTION_CREATE);
})

router.put('/dong-vat', aclMiddleware('/content/dong-vat', 'edit'), 
	upload.fields(IMG_FIELDS.reduce(function (preArray, curElement) {
		preArray.push({name: curElement.name}); 
		return preArray;
	}, [])),
	function (req, res) {
		var missingParam = checkRequiredParams(['animalId'], req.body);
		if (missingParam){
			return responseError(res, 400, 'Missing animalId');  
		}
		Animal.findById(req.body.animalId, function (err, animal) {
			if (err){
				console.log(err);
				return responseError(res, 500, "Error while reading database")
			}
			
			if (animal){
				return saveOrUpdateAnimal(req, res, animal, ACTION_EDIT);
			}

			else {
				return responseError(res, 400, 'Invalid animalId')
			}
		})
})

router.get('/dong-vat', aclMiddleware('/content/dong-vat', 'view'), function (req, res) {
	Animal.find({deleted_at: {$eq: null}}, function (err, animals) {
		if (err){
			return responseError(res, 500, 'Error while reading database');
		}
		return responseSuccess(res, ['status', 'animals'], ['success', animals]);
	})
})

router.get('/dong-vat/auto', aclMiddleware('/content/dong-vat', 'create'), function (req, res) {
	// console.log(Object.keys(AnimalAutoCompletion.schema.paths));

	AnimalAutoCompletion.findOne({}, function (err, autoCompletion) {
		if (err){
			return responseError(res, 500, "Error while reading AutoCompletion data.");
		}
		else{
			var props = [];
			var values = [];
			for (var prop in AnimalAutoCompletion.schema.paths){
				// console.log((prop + " : " + prop.localeCompare('_id')));
				if ((prop.localeCompare('_id') != 0) && (prop.localeCompare('__v') != 0)){
					props.push(prop);
					if (autoCompletion && (prop in autoCompletion)){
						values.push(autoCompletion[prop]);
					}
					else {
						values.push([]);
					}
				}
			}
			return responseSuccess(res, props, values);
		}
	})
})

router.get('/dong-vat/:animalId', aclMiddleware('/content/dong-vat', 'view'), function (req, res) {
	// console.log(ObjectId(req.params.animalId));
	// console.log(req.params.animalId);
	Animal.findById(req.params.animalId, function (err, animal) {
		if (err){
			return responseError(res, 500, 'Error while reading database');
		}
		if (animal){
			if (animal.deleted_at){
				Log.find({action: {$eq: 'delete'}, "obj1._id": {$eq: mongoose.Types.ObjectId(req.params.animalId)}}, function (err, logs) {
					if (err || (logs.length < 1)){
						console.log(err);
						return responseError(res, 404, "This animal has been deleted");
					}
					// console.log(logs);
					return responseError(res, 404, "This animal has been deleted by " + logs[0].userFullName);
				})
			}
			else {
				// responseSuccess(res, ['animal'], [animal]);
				responseSuccess(res, ['animal'], [flatAnimal(animal)]);
				// return res.render('display', {title: 'Chi tiết mẫu dữ liệu', count: 1, obj1: flatAnimal(animal)});
			}
		}
		else{
			responseError(res, 404, 'Not Found');
		}
	})
})

router.get('/dong-vat/log/:logId/:position', function (req, res) {
	Log.findById(req.params.logId, function (err, log) {
		if (err){
			return responseError(res, 500, 'Error while reading database');
		}
		if (log){
			if ((log.action == 'update') && (req.params.position == 'diff')){
				// return responseSuccess(res, ['obj1', 'obj2'], [flatAnimal(log.obj1), flatAnimal(log.obj2)]);
				return res.render('display', {title: 'Các cập nhật', count: 2, obj1: flatAnimal(log.obj1), obj2: flatAnimal(log.obj2)});
			}

			switch (parseInt(req.params.position)){
				case 1:
					if ('obj1' in log){
						// return responseSuccess(res, ['animal'], [flatAnimal(log.obj1)])
						return res.render('display', {title: 'Dữ liệu chi tiết', count: 1, obj1: flatAnimal(log.obj1), obj2: {}});
					}
					else{
						return responseError(res, 400, 'Invalid object')
					}
				case 2:
					if (('obj2' in log) && (log.obj2)){
						return res.render('display', {title: 'Dữ liệu chi tiết', count: 1, obj1: flatAnimal(log.obj2)});
						// return responseSuccess(res, ['animal'], [flatAnimal(log.obj2)])
					}
					else{
						return responseError(res, 400, 'Invalid object')
					}
				default:
					return responseError(res, 400, 'Invalid object')
			}
		}
		else {
			return responseError(res, 400, 'Invalid logId')
		}
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
			var date = new Date();
			animal.deleted_at = date;
			animal.save();
			var newLog = new Log();
			newLog.action = 'delete';
			newLog.userId = req.user.id;
			newLog.userFullName = req.user.fullname;
			newLog.objType = 'animal';
			newLog.obj1 = animal;
			newLog.time = date;
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

function saveOrUpdateAnimal (req, res, animal, action) {
	var animalBeforeUpdate = {};
	if (action == ACTION_EDIT){
		animalBeforeUpdate = JSON.parse(JSON.stringify(animal));
	}
	
	// save props
	for (var i = 0; i < PROP_FIELDS.length; i++) {
		var element = PROP_FIELDS[i];
		
		if ((action == ACTION_CREATE) && (element.type.localeCompare('Mixed') !== 0)) {
			// Check required data props if action is create
			if (element.required && (element.type.localeCompare('File') != 0) && !(element.name in req.body)){
				return responseError(res, 400, "Missing " + element.name);
			}

			// Check required files if action is create
			if (element.required && (element.type.localeCompare('File') == 0) && !(element.name in req.files)){
				return responseError(res, 400, "Missing " + element.name);
			}
		}

		switch (element.type){
			case 'String':
				var value = '';
				try {
					value = req.body[element.name].trim();
				}
				catch (e){
					console.log(element.name);
				}
				if ('min' in element){
					if (value.length < element.min){
						return responseError(res, 400, element.name + ' must not shorter than ' + element.min + ' characters');
					}
				}

				if ('max' in element){
					if (value.length > element.max){
						return responseError(res, 400, element.name + ' must not longer than ' + element.max + ' characters');
					}
				}
				if ('regex' in element){
					var regex = new RegExp(element.regex);
					if (regex.test(value) === false){
						return responseError(res, 400, element.name + ' is in wrong format.');
					}
				}
				break;
			case 'Number':
				if ('min' in element){
					if (parseFloat(req.body[element.name]) < element.min){
						return responseError(res, 400, element.name + ' must not lower than ' + element.min);
					}
				}

				if ('max' in element){
					if (req.body[element.name].length > element.max){
						return responseError(res, 400, element.name + ' must not higher than ' + element.max);
					}
				}
				break;
			case 'Mixed':
				// TODO Validate sub properties
				var valid = false;
				if (element.required){
					for (var j = 0; j < element.subProps.length; j++) {
						var prop = element.subProps[j];
						var e = PROP_FIELDS[PROP_FIELDS_OBJ[prop]];
						if (e.type.localeCompare('String') == 0 && (prop in req.body)){
							if ('regex' in e){
								var regex = new RegExp(e.regex);
								if (regex.test(req.body.trim()) === false){
									return responseError(res, 400, e.name + ' is in wrong format.');
								}
							}
							valid = true;
							break;
						}
						if (e.type.localeCompare('Date') == 0 && (prop in req.body)){
							valid = true;
							break;
						}
						if (e.type.localeCompare('File') == 0 && (prop in req.files)){
							valid = true;
							break;
						}
					}
					if (!valid){
						return responseError(res, 400, 'Missing ' + element.name);
					}
				}
				break;
			default:
				break;
		}

		// var nodes = element.animalSchemaProp.split('.');
		// var lastProp = nodes.splice(nodes.length - 1, 1)[0];
		// var tree = nodes.join('.');
		// objectChild(newAnimal, tree)[lastProp] = req.body[element.name];
		if (element.name in req.body){
			objectChild(animal, element.animalSchemaProp)[element.name] = req.body[element.name].trim();

			// Update Auto Completion
			if (('autoCompletion' in element) && (element.autoCompletion)){

				AnimalAutoCompletion.findOne({}, createAutoCompletionCallback(element.name, req.body[element.name].trim()));

				function createAutoCompletionCallback(name, value) {
					return function (err, autoCompletion) {
						if (!err){
							if (autoCompletion && (name in autoCompletion)){
								// Update
								if (autoCompletion[name].indexOf(value) < 0){
									autoCompletion[name].push(value);
									autoCompletion.save();
								}
							}
							else{
								// Create new documents in AutoCompletion
								autoCompletion = new AnimalAutoCompletion();
								autoCompletion[name] = [value];
								autoCompletion.save();
							}
						}
					}
				}
			}
		}
	}

	animal.save(function (err, result) {
		if (err){
			console.log(err);
			return res.status(500).json({
				status: 'error',
				error: 'Error while saving to database'
			})
		}

		// rename images
		IMG_FIELDS.map(function (element) {
			if (req.files && (element.name in req.files) && req.files[element.name]){
				// var nodes = element.animalSchemaProp.split('.');
				// var lastProp = nodes.splice(nodes.length - 1, 1)[0];
				// var tree = nodes.join('.');
				// objectChild(animal, tree)[lastProp] = [];
				// rename(req.files[element.name], objectChild(animal, element.animalSchemaProp), UPLOAD_DEST_ANIMAL, result.id);

				if (action == ACTION_EDIT){
					
					// TODO
					// need to delete old files.

				}
				objectChild(animal, element.animalSchemaProp)[element.name] = [];
				rename(req.files[element.name], objectChild(animal, element.animalSchemaProp)[element.name], UPLOAD_DEST_ANIMAL, result.id);
			}
		})

		if (action == ACTION_CREATE){
			animal.created_at = new Date();
		}
		else {
			animal.updated_at = new Date();
		}
		animal.save(function (err, r) {
			if (err){
				console.log(err);
			}

			var newLog = new Log();
			newLog.action = (action == ACTION_CREATE) ? 'create' : 'update';
			newLog.time = new Date();
			newLog.objType = 'animal';
			newLog.userId = req.user.id;
			if (action == ACTION_CREATE){
				newLog.obj1 = animal;
			}
			else {
				newLog.obj1 = animalBeforeUpdate;
				newLog.obj2 = animal;
			}
			newLog.userFullName = req.user.fullname;
			newLog.save();
			res.status(200).json({
				status: 'success'
			});
		});
	})
}

function flatAnimal (animal) {
	var result = {};
	PROP_FIELDS.map(function (element) {
		// if (element.type.localeCompare('File')){
			result[element.name] = objectChild(animal, element.animalSchemaProp)[element.name];
		// }
	});
	return result;
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