
// ============== Init ACL =======================

var acl = require('acl');
acl = new acl(new acl.memoryBackend());
require('./config/acl.js')(acl);
var path = require('path');
var fs = require('fs');

global.myCustomVars.acl = acl;

function aclMiddleware (resource, action, url) {
	var redirectURL = (url) ? url : '/home';
	return function (req, res, next) {
		if (!('userId' in req.session)){
			return res.redirect(redirectURL);
		}
		acl.isAllowed(req.session.userId, resource, action, function (err, result) {
			if (err){
				console.log(err);
			}
			console.log('result: ', result);
			if (result){
				next();
			}
			else {
				return res.redirect(redirectURL);
			}
		});
	}
}

global.myCustomVars.aclMiddleware = aclMiddleware;

// ============== Mongoose Model ================
var mongoose             = require('mongoose');
var Log                  = mongoose.model('Log');

// ============== Shared Variables ================

var ACTION_CREATE = 0;
global.myCustomVars.ACTION_CREATE = ACTION_CREATE;
var ACTION_EDIT = 1;
global.myCustomVars.ACTION_EDIT = ACTION_EDIT;
var STR_SEPERATOR = '_+_';
global.myCustomVars.STR_SEPERATOR = STR_SEPERATOR;
var STR_AUTOCOMPLETION_SEPERATOR = '_-_'; // Phải đồng bộ với biến cùng tên trong file app/service.js
global.myCustomVars.STR_AUTOCOMPLETION_SEPERATOR = STR_AUTOCOMPLETION_SEPERATOR;



// ============== Places ================
var CITIES = {};
var DISTRICTS = {};
var WARDS = {};
var tmpCities = JSON.parse(fs.readFileSync(path.join(__dirname, 'app', 'database', 'cities.json')));
for(let tc of tmpCities){
	CITIES[tc.id] = tc;
}
// console.log(CITIES)

var tmpDistricts = JSON.parse(fs.readFileSync(path.join(__dirname, 'app', 'database', 'districts.json')));
for(let td of tmpDistricts){
	DISTRICTS[td.id] = td;
}
// console.log(DISTRICTS)
var tmpWards = JSON.parse(fs.readFileSync(path.join(__dirname, 'app', 'database', 'wards.json')));
for(let tw of tmpWards){
	WARDS[tw.id] = tw;
}
// console.log(WARDS)



// ============== Shared Functions ================

var async = require('asyncawait/async');
var await = require('asyncawait/await');

/**
 * Check required parameters
 */

function checkRequiredParams (requiredParams, object) {
	if (requiredParams instanceof Array){
		for (var i = 0; i < requiredParams.length; i++) {
			if (!(requiredParams[i] in object)){
				return requiredParams[i];
			}
		}
	}
	return false;
}

global.myCustomVars.checkRequiredParams = checkRequiredParams;

/**
 * Check required parameters
 */

function checkUnNullParams (requiredParams, object) {
	if (requiredParams instanceof Array){
		for (var i = 0; i < requiredParams.length; i++) {
			if (!(object[requiredParams[i]])){
				return requiredParams[i];
			}
		}
	}
	return false;
}

global.myCustomVars.checkUnNullParams = checkUnNullParams;


/**
 * Send error message to response when some action failure
 *
 * @param {Object} req request (include uploaded files)
 * @param {String} dir upload directory
 * @param {Object} res response
 * @param {Integer} errCode Status Code send to client
 * @param {String} errMessage Error
 */

function responseError (req, dir, res, errCode, props, values) {

	// Delete files in request

	if (req.files){
		for (var field in req.files){
			var files = req.files[field];
			for (var i = 0; i < files.length; i++) {
				console.log('in response error')
				try {
					fs.unlinkSync(path.join(dir, files[i].filename));
				}
				catch (e){
					console.log(e)
				}
			}
		}
		
	}

	// Response to client

	if ((props instanceof Array) && (values instanceof Array) && (props.length == values.length)){
		var result = {};
		result.status = 'error';
		for (var i = 0; i < props.length; i++) {
			result[props[i]] = values[i];
		}
		return res.status(errCode).json(result);
	}
}

global.myCustomVars.responseError = responseError;


/**
 * When action success
 */

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

global.myCustomVars.responseSuccess = responseSuccess;

// rename(req.files[element.name], objectChild(objectInstance, element.schemaProp)[element.name], _UPLOAD_DEST_ANIMAL, result.id);
function rename (curFiles, schemaFieldName, schemaField, position, mongoId) {
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
			// while (file.originalname.indexOf('.') != file.originalname.lastIndexOf('.')){
			// 	file.originalname = file.originalname.replace('.', '');
			// }
			
			// Xóa bỏ 2 hoặc nhiều dấu chấm liền nhau. Đề phòng lỗi khi nó cố tình download file ngoài thư mục public
			while (file.originalname.indexOf('..') >= 0){
				file.originalname = file.originalname.replace('..', '.');
			}

			var newFileName = mongoId + STR_SEPERATOR + schemaFieldName + STR_SEPERATOR + file.originalname;
			// var newFileName = mongoId + STR_SEPERATOR + file.originalname;
			var newPath = path.join(position, newFileName);
			fs.renameSync(curPath, newPath);
			schemaField.push(newFileName);
		}
		catch (e){
			console.log(e);
		}
	}
}

global.myCustomVars.rename = rename;

function propsName (_PROP_FIELDS) {
	return _PROP_FIELDS.reduce(function (preObj, curElement) {
		if (('label' in curElement) && (curElement.label)){
			preObj[curElement.name] = curElement.label;
		}
		else {
			preObj[curElement.name] = curElement.name;
		}
		return preObj;
	}, {});
}

global.myCustomVars.propsName = propsName;

function flatObjectModel (_PROP_FIELDS, objectInstance) {
	var result = {};
	_PROP_FIELDS.map(function (element) {
		// if (element.type.localeCompare('File')){
			result[element.name] = objectChild(objectInstance, element.schemaProp)[element.name];
		// }
	});
	return result;
}

global.myCustomVars.flatObjectModel = flatObjectModel;

function objectChild (object, tree) {
	var nodes = tree.trim().split('.');
	for (var i = 0; i < nodes.length; i++) {
		if (nodes[i] in object){
			object = object[nodes[i]];
		}
		else {
			object[nodes[i]] = {};
			object = object[nodes[i]];
		}
	}
	return object;
}

global.myCustomVars.objectChild = objectChild;

function createSaveOrUpdateFunction (variablesBundle) {
	var Log = variablesBundle.Log;
	var AutoCompletion = variablesBundle.AutoCompletion;
	var objectModelName = variablesBundle.objectModelName;
	var objectModelNames = variablesBundle.objectModelNames;
	var objectModelIdParamName = variablesBundle.objectModelIdParamName;
	var objectBaseURL = variablesBundle.objectBaseURL;
	var _PROP_FIELDS = variablesBundle.PROP_FIELDS;
	var _UPLOAD_DEST_ANIMAL = variablesBundle.UPLOAD_DEST_ANIMAL;
	// console.log(variablesBundle.UPLOAD_DEST_ANIMAL);
	// console.log(1);

	return function saveOrUpdate (req, res, objectInstance, action) {
		var PROP_FIELDS_OBJ = {};

		_PROP_FIELDS.map(function (element, index) {
			PROP_FIELDS_OBJ[element.name] = index;
		});

		// File fields
		var FILE_FIELDS = _PROP_FIELDS.filter(function (element) {
			return !element.type.localeCompare('File')
		});

		if (action == ACTION_CREATE){
			objectInstance.created_by.userId = req.user.id // Owner
			objectInstance.created_by.userFullName = req.user.fullname // Owner
		}

		var objectBeforeUpdate = {};
		if (action == ACTION_EDIT){

			objectInstance.updated_by.userId = req.user.id
			objectInstance.updated_by.userFullName = req.user.fullname

			// Date will be converted to String.
			objectBeforeUpdate = JSON.parse(JSON.stringify(objectInstance));
		}

		// =============== Validate special fields ===============

		// Trường dữ liệu theo yêu cầu là số, nhưng thực tế cần phải lưu là String
		// VD: Chiều cao: "3 mét"

		var specialFields = {};
		specialFields.unitFields = [
			{
				fieldName: 'chieuCao'
			},
			{
				fieldName: 'chieuRong'
			},
			{
				fieldName: 'chieuDai'
			},
			{
				fieldName: 'trongLuong'
			},
			{
				fieldName: 'theTich'
			}
		]

		for(let field of specialFields.unitFields){
			if ((field.fieldName in req.body) && (req.body[field.fieldName])){
				req.body[field.fieldName] = parseFloat(req.body[field.fieldName]);
			}
		}
		delete specialFields.unitFields;

		// VD: Kinh độ, Vĩ độ: '1 ° 2 \' 3"'

		specialFields.coordinations = [
			{
				fieldName: 'kinhDo'
			},
			{
				fieldName: 'viDo'
			}
		]

		for(let field of specialFields.coordinations){
			if ((field.fieldName in req.body) && (req.body[field.fieldName])){
				console.log(req.body[field.fieldName]);
				if (!(/([0-9 ]+)(°|độ)([0-9 ]+)('|phút)([0-9 ]+)("|giây)/.test(req.body[field.fieldName].toLowerCase()))){
					console.log('Tọa độ thực')
					req.body[field.fieldName] = parseFloat(req.body[field.fieldName]);
				}
				else {
					console.log('Tọa độ rời rạc')
					req.body[field.fieldName] = req.body[field.fieldName].toLowerCase();
				}
			}
		}
		delete specialFields.coordinations;

		// End of Number Fields

		// =============== Handle undefined Tỉnh, Huyện, Xã ===============

		specialFields.placeFields = [
			{
				fieldName: 'tinh'
			},
			{
				fieldName: 'huyen'
			},
			{
				fieldName: 'xa'
			},
			{
				fieldName: 'gioiTinh'
			}
		]

		for(let field of specialFields.placeFields){
			// console.log('checking ' + field.fieldName);
			if (field.fieldName in req.body){
				let value_ = req.body[field.fieldName]
				// console.log(value_);
				if ((value_.indexOf('undefined') >= 0) || (value_.indexOf('string') >= 0) || (value_.indexOf('?') >= 0)){
					// console.log('delete now: ' + field.fieldName);
					req.body[field.fieldName] = ''
				}
			}
		}

		delete specialFields.placeFields

		// =============== End of Handle undefined Tỉnh, Huyện, Xã ===============

		delete specialFields;
		// =============== End of Validate special fields ===============
		
		// save props
		for (var i = 0; i < _PROP_FIELDS.length; i++) {
			var element = _PROP_FIELDS[i];
			
			// Check required
			if ((action == ACTION_CREATE) && (element.type.localeCompare('Mixed') !== 0)) {

				// Check required files if action is create
				if (element.required && (element.type.localeCompare('File') == 0) && (!(element.name in req.files) || !(req.files[element.name]))){
					console.log('missing file');
					return responseError(req, _UPLOAD_DEST_ANIMAL, res, 400, ['error', 'field'], ["Thiếu tham số", element.name]);
				}
			}

			// Check required
			if (element.type.localeCompare('Mixed') !== 0) {
				// Check required data props if action is create
				if (element.required && (element.type.localeCompare('File') != 0) && (!(element.name in req.body) || !(req.body[element.name]))) {
					console.log('response error');
					return responseError(req, _UPLOAD_DEST_ANIMAL, res, 400, ['error', 'field'], ["Thiếu tham số", element.name]);
				}
			}

			// Validate data
			switch (element.type){
				case 'String':
					var value = '';
					if (element.name in req.body){
						value = req.body[element.name];
						try {
							value = value.trim();
						}
						catch (e){
							// do not care
						}
						if ('min' in element){
							if (value.length < element.min){
								return responseError(req, _UPLOAD_DEST_ANIMAL, res, 400, ['error', 'field'], [element.name + ' không được ngắn hơn ' + element.min + ' ký tự', element.name]);
							}
						}

						if ('max' in element){
							if (value.length > element.max){
								return responseError(req, _UPLOAD_DEST_ANIMAL, res, 400, ['error', 'field'], [element.name + ' không được ngắn hơn ' + element.max + ' ký tự', element.name]);
							}
						}
						if ('regex' in element){
							var regex = new RegExp(element.regex);
							if (regex.test(value) === false){
								return responseError(req, _UPLOAD_DEST_ANIMAL, res, 400, ['error', 'field'], ['Sai định dạng', element.name]);
							}
						}
					}
					break;
				case 'Integer':
					// console.log('Integer nè');
					// console.log(req.body[element.name]);
					// console.log(parseInt(req.body[element.name]));
					if (req.body[element.name]){
						if (req.body[element.name] != parseInt(req.body[element.name])){
							let label = element.name;
							try {
								label = element.label;
							}
							catch (e){
								console.log(e);
							}
							return responseError(req, _UPLOAD_DEST_ANIMAL, res, 400, ['error', 'field'], [label + ' phải là số nguyên', element.name])
						}
					}
					// Không break.
				case 'Number':
					if ('min' in element){
						if (parseFloat(req.body[element.name]) < element.min){
							return responseError(req, _UPLOAD_DEST_ANIMAL, res, 400, ['error', 'field'], [element.name + ' không được nhỏ hơn ' + element.min, element.name]);
						}
					}

					if ('max' in element){
						if (parseFloat(req.body[element.name]) > element.max){
							return responseError(req, _UPLOAD_DEST_ANIMAL, res, 400, ['error', 'field'], [element.name + ' không được lớn hơn ' + element.max, element.name]);
						}
					}
					// console.log('number in ' + element.name);
					// console.log(req.body[element.name])
					// console.log(typeof(req.body[element.name]));
					if (req.body[element.name]){
						req.body[element.name] = parseFloat(req.body[element.name]);
					}
					// return;
					break;
				case 'Date':
					// console.log('date');
					// console.log(req.body[element.name]);
					
					if (req.body[element.name]){
						// Preprocess Date: Change from '23/02/2017' to '2017/02/23'
						// Catch error later
						try {
							let dateValue_ = req.body[element.name].split('/');
							if (dateValue_.length < 3){
								return responseError(req, _UPLOAD_DEST_ANIMAL, res, 400, ['error', 'field'], ['Không đúng định dạng ngày tháng', element.name])
							}
							dateValue_.map((element, index) => {
								dateValue_[index] = element.trim();
							})
							dateValue_.reverse();
							req.body[element.name] = dateValue_.join('/')
							console.log(req.body[element.name]);
						}
						catch (e){
							console.log(e)
						}
					}
					

					break;
				case 'File':
					if ('regex' in element){
						var regex = new RegExp(element.regex);
						if (req.files && element.name in req.files){
						// if (element.name in req.files){
							var files = req.files[element.name];
							for (var j = 0; j < files.length; j++) {
								var file = files[j];

								// rename ABCDEF.PNG => ABCDEF.png
								// console.log(file.originalname)
								var fn_ = file.originalname.split('.');
								if (fn_.length < 2){
									return responseError(req, _UPLOAD_DEST_ANIMAL, res, 400, ['error', 'field'], ['File thiếu định dạng', element.name]);
								}

								fn_[fn_.length - 1] = fn_[fn_.length - 1].toLowerCase();
								file.originalname = fn_.join('.')
								// console.log(file.originalname)

								// Now, test the name of file

								if (!regex.test(file.originalname)){
									// console.log(regex);
									// console.log(file.originalname);
									return responseError(req, _UPLOAD_DEST_ANIMAL, res, 400, ['error', 'field'], ['Tên file trong trường không hợp lệ', element.name]);
								}
							}
						}
					}
					if (element.hasOwnProperty('maxSize')){
						// Check maxium file size
						console.log(req.files)
						if (req.files && (element.name in req.files)){
							var files = req.files[element.name];
							var maxFileSize = parseInt(element.maxSize);
							for(var file of files){
								// console.log(file)
								var fileSize = parseInt(file.size); // bytes
								if (fileSize > maxFileSize){
									return responseError(req, _UPLOAD_DEST_ANIMAL, res, 400, ['error', 'field'], ['Kích thước file tối đa là ' + (maxFileSize / 1024 / 1024).toFixed(2) + ' MB', element.name])
								}
								// console.log(file.originalname + ' passed')
							}
						}
					}
					break;
				case 'Mixed':
					// TODO Validate sub properties
					var valid = false;
					if (action == ACTION_CREATE){
						if (element.required){
							for (var j = 0; j < element.subProps.length; j++) {
								var prop = element.subProps[j];
								var e = _PROP_FIELDS[PROP_FIELDS_OBJ[prop]];
								if (e.type.localeCompare('String') == 0 && (prop in req.body)){
									var v = req.body[prop];
									try {
										v = v.trim();
									}
									catch (e){
										// Do not care
									}
									if ('regex' in e){
										var regex = new RegExp(e.regex);
										if (regex.test(v) === false){
											return responseError(req, _UPLOAD_DEST_ANIMAL, res, 400, ['error', 'field'], ['Sai định dạng', e.name]);
										}
									}
									valid = true;
									break;
								}
								if (e.type.localeCompare('Date') == 0 && (prop in req.body)){
									valid = true;
									break;
								}
								if (e.type.localeCompare('File') == 0 && (req.files) && (prop in req.files)){
									valid = true;
									break;
								}
							}
							if (!valid){
								return responseError(req, _UPLOAD_DEST_ANIMAL, res, 400, ['error', 'field'], ['Thiếu tham số', element.name]);
							}
						}
					}
					else if (action == ACTION_EDIT){
						// 
						// Actually, we don't need to validate these Mixed properties.
						// Sub properties will be validated automatically
						// But we need to delete data of this field
						delete req.body[element.name];
					}
					break;
				default:
					break;
			}

			// var nodes = element.schemaProp.split('.');
			// var lastProp = nodes.splice(nodes.length - 1, 1)[0];
			// var tree = nodes.join('.');
			// objectChild(newAnimal, tree)[lastProp] = req.body[element.name];
			if (element.type.localeCompare('Mixed') && element.type.localeCompare('File') && (element.name in req.body)) {
				var value = req.body[element.name];
				try {
					value = value.trim();
				}
				catch (e){
					// do not care
				}
				objectChild(objectInstance, element.schemaProp)[element.name] = value;

				// Update Auto Completion
				if (('autoCompletion' in element) && (element.autoCompletion)){
					var value_ = value.split(STR_AUTOCOMPLETION_SEPERATOR);
					for(let v of value_){
						v = v.trim();
						if (v){
							AutoCompletion.findOne({}, createAutoCompletionCallback(element.name, v));
						}
					}
					

					function createAutoCompletionCallback(name, value) {
						return function (err, autoCompletion) {
							if (!err){
								if (autoCompletion){
									if (name in autoCompletion){
										// Update
										if (autoCompletion[name].indexOf(value) < 0){
											autoCompletion[name].push(value);
											autoCompletion.save();
										}
									}
									else{
										autoCompletion[name] = [value];
										autoCompletion.save();
									}
								}
								else{
									// Create new documents in AutoCompletion
									autoCompletion = new AutoCompletion();
									console.log('add new auto completion row');
									autoCompletion[name] = [value];
									autoCompletion.save();
								}
							}
						}
					}
				}
			}
		}

		// process some special props
		_PROP_FIELDS.map(function (field) {
			if (field.type == 'Unit'){
				// TODO unit
			}
		})

		objectInstance.save(function (err, result) {
			if (err){
				console.log('======')
				console.log(err)
				console.log('======')
				try {
					var errField = err.errors[Object.keys(err.errors)[0]].path;
					var dotPos = errField.lastIndexOf('.');
					if (dotPos >= 0){
						errField = errField.substring(dotPos + 1);
					}
					return responseError(req, _UPLOAD_DEST_ANIMAL, res, 400, ['error', 'field'], ['Dữ liệu nhập vào không hợp lệ', errField]);
				}
				catch (e){
					console.log(err);
					console.log('Server error');
				}
				return responseError(req, _UPLOAD_DEST_ANIMAL, res, 400, ['error'], ['Error while saving to database']);
			}

			// rename images
			FILE_FIELDS.map(function (element) {
				// console.log('---');
				// console.log(element.name);
				// if (req.files){
				// 	console.log(element.name in req.files);
				// 	if (element.name in req.files){
				// 		console.log(req.files[element.name]);
				// 	}
				// }
				
				// console.log('---');
				// console.log(objectChild(animal, element.schemaProp)[element.name]);
				if (req.files && (element.name in req.files) && req.files[element.name]){
					// console.log('new file for ' + element.name);
					// var nodes = element.schemaProp.split('.');
					// var lastProp = nodes.splice(nodes.length - 1, 1)[0];
					// var tree = nodes.join('.');
					// objectChild(animal, tree)[lastProp] = [];
					// rename(req.files[element.name], objectChild(animal, element.schemaProp), UPLOAD_DEST_ANIMAL, result.id);

					if (action == ACTION_EDIT){
						
						// TODO
						// need to delete old files.
						// console.log('delete old files');
						var files = objectChild(objectInstance, element.schemaProp)[element.name];
						// console.log(files);
						for (var j = 0; j < files.length; j++) {
							// fs.unlinkSync(path.join(_UPLOAD_DEST_ANIMAL, files[j]));
							try {
								fs.unlinkSync(path.join(_UPLOAD_DEST_ANIMAL, files[j]));
								console.log('deleted ' + files[j])
							}
							catch (e){
								console.log('delete failed ' + files[j])
								console.log(e)
							}
						}

					}
					objectChild(objectInstance, element.schemaProp)[element.name] = [];
					rename(req.files[element.name], element.name, objectChild(objectInstance, element.schemaProp)[element.name], _UPLOAD_DEST_ANIMAL, result.id);
					// rename(req.files[element.name], objectChild(objectInstance, element.schemaProp)[element.name], _UPLOAD_DEST_ANIMAL, result.id);
				}
			})

			if (action == ACTION_CREATE){
				objectInstance.created_at = new Date();
			}
			else {
				objectInstance.updated_at = new Date();
			}
			objectInstance.flag.fApproved = false;
			objectInstance.save(function (err, r) {
				if (err){
					console.log(err);
				}

				var newLog = new Log();
				newLog.action = (action == ACTION_CREATE) ? 'create' : 'update';
				newLog.time = new Date();
				newLog.objType = objectModelName;
				newLog.userId = req.user.id;
				if (action == ACTION_CREATE){
					newLog.obj1 = JSON.parse(JSON.stringify(objectInstance));
				}
				else {
					newLog.obj1 = objectBeforeUpdate;
					newLog.obj2 = JSON.parse(JSON.stringify(objectInstance));
				}
				newLog.userFullName = req.user.fullname;
				newLog.save();
				res.status(200).json({
					status: 'success'
				});
			});
		})
	}
}


global.myCustomVars.createSaveOrUpdateFunction = createSaveOrUpdateFunction;

function exportFile (objectInstance, PROP_FIELDS, ObjectModel, LABEL, res, paragraph, extension) {

	async (function (){
		console.log("calling docx");
		
		// Tiền xử lý không đồng bộ.
		// Bắt buộc phải dùng Promise, async/await
		var re = await (new Promise(function (resolve, reject) {
			// console.log('dmm');
			setTimeout(function () {
				// console.log('hehe');
				resolve('ok')
			}, 1);
		}))
		
		// End of Tiền xử lý không đồng bộ

		var statistics = {
			totalMoneyProp: 0,
			totalNonMoneyProp: 0,
			moneyPropFilled: 0,
			nonMoneyPropFilled: 0,
			totalMoneyPropStr: '',
			totalNonMoneyPropStr: '',
			moneyPropFilledStr: '',
			nonMoneyPropFilledStr: ''
		};

		PROP_FIELDS = JSON.parse(JSON.stringify(PROP_FIELDS));

		/** Tiền xử lý Schema
		 * 1 vài thuộc tính phụ thuộc vào giá trị của 1 (hay nhiều) thuộc tính khác
		 * Ví dụ, Mẫu trên đất liền thì Quốc gia, Tỉnh, Huyện, Xã là các thuộc tính có *
		 * Nhưng Mẫu trên biển thì chỉ Quốc gia có *
		 * => Cần xử lý cập nhật lại các required fields trong PROP_FIELDS.
		 */

		// TODO: Có thể phải thực hiện bước này ngay khi load Model. Tính sau :v

		// DiaDiemThuMau

		if (objectInstance.flag.fDiaDiemThuMau != 'dat-lien'){
			for(var i = 0; i < PROP_FIELDS.length; i++){
				var field = PROP_FIELDS[i];
				if (['tinh', 'huyen', 'xa'].indexOf(field.name) >= 0){
					field.required = false;
					field.money = false;
					// console.log(field.name);
				}
			}
		}

		try {
			// Quốc gia khác, không phải Việt Nam
			let qg = objectInstances.duLieuThuMau.diaDiemThuMau.quocGia;
			if ((qg) && (qg.trim()) && (qg.trim() != 'Việt Nam')){
				for(var i = 0; i < PROP_FIELDS.length; i++){
					var field = PROP_FIELDS[i];
					if (['tinh', 'huyen', 'xa'].indexOf(field.name) >= 0){
						field.required = false;
						field.money = false;
						// console.log(field.name);
					}
				}
			}
		}
		catch (e){
			console.log(e);
		}

		delete objectInstance.flag.fDiaDiemThuMau; // TODO: Don't know why, check later
		for(var i = 0; i < PROP_FIELDS.length; i++){
			var field = PROP_FIELDS[i];
			// console.log(field.name);
			if (field.name == 'fDiaDiemThuMau'){
				// console.log('len: ' + PROP_FIELDS.length);
				PROP_FIELDS.splice(i, 1); // Xóa nó đi để không tính vào phần thống kê bao nhiêu trường tính tiền, bao nhiêu trường không tính tiền. (Cuối file xuất ra)
				// console.log('len: ' + PROP_FIELDS.length);
				break;
			}
		}

		// resolve place id to string
		try {
			objectInstance.duLieuThuMau.diaDiemThuMau.tinh = CITIES[objectInstance.duLieuThuMau.diaDiemThuMau.tinh].name;
			objectInstance.duLieuThuMau.diaDiemThuMau.huyen = DISTRICTS[objectInstance.duLieuThuMau.diaDiemThuMau.huyen].name;
			objectInstance.duLieuThuMau.diaDiemThuMau.xa = WARDS[objectInstance.duLieuThuMau.diaDiemThuMau.xa].name;
		}

		catch (e){
			console.log(e);
			// do not care
		}

		// End of DiaDiemThuMau
		
		// fApproved
		
		for(var i = 0; i < PROP_FIELDS.length; i++){
			var field = PROP_FIELDS[i];
			// console.log(field.name);
			if (field.name == 'fApproved'){
				console.log('len: ' + PROP_FIELDS.length);
				PROP_FIELDS.splice(i, 1); // Xóa nó đi để không tính vào phần thống kê bao nhiêu trường tính tiền, bao nhiêu trường không tính tiền. (Cuối file xuất ra)
				console.log('len: ' + PROP_FIELDS.length);
				break;
			}
		}
		
		// End of fApproved


		// delete objectInstance.flag;

		/**
		 * End of Tiền xử lý Schema
		 */

		function display(obj){
			// console.log(staticPath)
			// console.log(count)
			if (obj instanceof Array){
				var result =  obj.reduce(function (preStr, curElement, curIndex){
					// console.log(curElement.split('_+_')[1]);
					preStr += curElement.split('_+_')[1];
					if (curIndex < obj.length - 1){
						preStr += '\n\n';
					}
					return preStr;
				}, '');
				return result;
			}
			else if (obj instanceof Date){
				return [obj.getDate(), obj.getMonth() + 1, obj.getFullYear()].join(' / ');
			}
			// Need to escape to prevent injected HTML + JS
			return obj;
		}


		var curProp = '';
		var addPropRow = true;

		function inOrder (tree) {
			if (!tree){
				return;
			}
			if (tree instanceof Function){
				return;
			}
			if (typeof(tree) == 'string'){
				return;
			}
			for(var i = 0; i < Object.keys(tree).length; i++){
				var prop = Object.keys(tree)[i];
				// console.log(stt + ' : ' + prop + ' : ' + curDeep);
				// Add data to docx object
				var p;
				switch (curDeep){
					case 0:
						addPropRow = true;
						// Label
						try{
							p = LABEL[prop];
						}
						catch (e){
							console.log(e);
							// Do not care;
							// break;
						}
						var row = [
							{
								val: p,
								opts: rowSpanOpts
							},
							{
								val: '',
								opts: rowSpanOpts
							},
							{
								val: '',
								opts: rowSpanOpts
							},
							{
								val: '',
								opts: rowSpanOpts
							}
						];
						table.push(row);
						break;
					case 1:
						stt++;
						curProp = prop;
						addPropRow = true;
						// console.log('printing ' + prop);
						// var value = flatOI[prop];
						// if ((flatOI[prop] instanceof Object) && (Object.keys(flatOI[prop]) > 0)){
						// 	value = JSON.stringify(flatOI[prop]);
						// }
						// if ((flatOI[prop] instanceof Object) && (Object.keys(flatOI[prop]) < 1)){
						// 	value = '';
						// }
						var value = display(flatOI[prop]);
						try{

							if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].label){
								p = PROP_FIELDS[PROP_FIELDS_OBJ[prop]].label
							}

							if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].money){
								statistics.totalMoneyProp++;
								statistics.totalMoneyPropStr += ' ' + prop;
							}
							else {
								statistics.totalNonMoneyProp++;
								statistics.totalNonMoneyPropStr += ' ' + prop;
							}
						}
						catch (e){
							// console.log(e);
							// Do not care;
							// console.log(prop + ' : index : ' + PROP_FIELDS_OBJ[prop])
						}

						
						var row = [
							{
								val: stt,
								opts: labelOpts
							},
							{
								val: p,
								opts: detailOpts
							},
							{
								val: value,
								opts: detailOpts
							},
							{
								val: '',
								opts: detailOpts
							}
						]
						if (value){
							table.push(row);
							if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].money){
								statistics.moneyPropFilled++;
								statistics.moneyPropFilledStr += ' ' + prop;
							}
							else {
								statistics.nonMoneyPropFilled++;
								statistics.nonMoneyPropFilledStr += ' ' + prop;
							}
						}
						break;
					case 2:
						// var value = flatOI[prop];
						// if ((flatOI[prop] instanceof Object) && (Object.keys(flatOI[prop]) > 0)){
						// 	value = JSON.stringify(flatOI[prop]);
						// }
						// if ((flatOI[prop] instanceof Object) && (Object.keys(flatOI[prop]) < 1)){
						// 	value = '';
						// }
						var value = display(flatOI[prop]);
						try{

							if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].label){
								p = PROP_FIELDS[PROP_FIELDS_OBJ[prop]].label
							}

							if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].money){
								statistics.totalMoneyProp++;
								statistics.totalMoneyPropStr += ' ' + prop;
							}
							else {
								statistics.totalNonMoneyProp++;
								statistics.totalNonMoneyPropStr += ' ' + prop;
							}
						}
						catch (e){
							console.log(e);
							// Do not care;
							// console.log(prop + ' : index : ' + PROP_FIELDS_OBJ[prop])
						}
						var row = null;
						if (addPropRow){
							try{
								curProp = LABEL[curProp];
							}
							catch (e){
								console.log(e);
								// Do not care;
								// break;
							}
							row = [
								{
									val: stt,
									opts: labelOpts
								},
								{
									val: curProp,
									opts: detailOpts
								},
								{
									val: '',
									opts: detailOpts
								},
								{
									val: '',
									opts: detailOpts
								}
							]
							table.push(row);
							addPropRow = false;
						}
						
						row = [
							{
								val: '',
								opts: labelOpts
							},
							{
								val: p,
								opts: detailItalicOpts
							},
							{
								val: value,
								opts: detailOpts
							},
							{
								val: '',
								opts: detailOpts
							}
						]
						if (value){
							table.push(row);
							if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].money){
								statistics.moneyPropFilled++;
								statistics.moneyPropFilledStr += ' ' + prop;
							}
							else {
								statistics.nonMoneyPropFilled++;
								statistics.nonMoneyPropFilledStr += ' ' + prop;
							}
						}
						break;
				}

				// console.log('inc curDeep');
				
				// stt++;
				curDeep++;
				inOrder(tree[prop]);
				curDeep--;
			}
		}

		var fs = require('fs');
		var officegen = require('officegen');
		var docx = officegen({
			type: 'docx',
			subjects: 'Mẫu phiếu dữ liệu',
			orientation: 'landscape'
			// orientation: 'portrait'
		});

		docx.on('finalize', function (written) {
			console.log("Docx: written " + written + " bytes.");
		});

		docx.on('error', function (error) {
			console.log("Docx: Error");
			console.log(error);
			console.log("===");
		})

		

		for(var i = 0; i < paragraph.text.length; i++){
			var pObj = docx.createP();
			pObj.options.align = "center";
			pObj.addText(paragraph.text[i] + '\n\n', paragraph.style[i]);
		}

		var flatOI = flatObjectModel(PROP_FIELDS, objectInstance);

		var pObj = docx.createP();
		pObj.options.align = "center";
		pObj.addText('Mã đề tài: ' + display(flatOI.maDeTai), {color: '000000', bold: true, font_face: 'Times New Roman', font_size: 12});

		var rowSpanOpts = {
			// cellColWidth: 2261,
			b:true,
			sz: '24',
			align: 'center',
			shd: {
				fill: "CCCCCC",
				// themeFill: "text1",
				// "themeFillTint": "30"
			},
			// gridSpan: 3,
			fontFamily: "Times New Roman"
		};

		var labelOpts = {
			cellColWidth: 500,
			b:true,
			sz: '24',
			align: 'center',
			shd: {
				fill: "FFFFFF",
				// themeFill: "text1",
				// "themeFillTint": "30"
			},
			fontFamily: "Times New Roman"
		};

		var detailOpts = {
			// cellColWidth: 2261,
			// b:true,
			sz: '24',
			shd: {
				fill: "FFFFFF",
				// themeFill: "text1",
				// "themeFillTint": "30"
			},
			fontFamily: "Times New Roman"
		};

		var detailItalicOpts = {
			// cellColWidth: 2261,
			sz: '22',
			bold: true,
			shd: {
				fill: "FFFFFF",
				// themeFill: "text1",
				// "themeFillTint": "30"
			},
			fontFamily: "Times New Roman"
		};

		var table = [
		[
			{
				val: "STT",
				opts: labelOpts
			},
			{
				val: "Trường dữ liệu",
				opts: labelOpts
			},
			{
				val: "Nội dung",
				opts: labelOpts
			},
			{
				val: "Ghi chú",
				opts: labelOpts
			}
		]];

		// Delete Unit fields
		PROP_FIELDS.map(function (field) {
			if (field.type == 'Unit' && flatOI[field.name.substring('donVi_'.length)] && flatOI[field.name]){
				flatOI[field.name.substring('donVi_'.length)] += ' ' + flatOI[field.name];
				flatOI[field.name.substring('donVi_'.length)].trim();
				return;
			}
		})

		{
			var index = 0;
			while (true){
				if (PROP_FIELDS[index] && (PROP_FIELDS[index].type == 'Unit')){
					PROP_FIELDS.splice(index, 1);
				}
				else {
					index++;
				}
				if (index >= PROP_FIELDS.length){
					break;
				}
			} // Delete Unit fields

			PROP_FIELDS.map(function (element, index) {
				if (element.type == 'Mixed'){
					var sp_ = element.subProps;
					var index = 0;
					while (true){
						if (sp_[index].indexOf('donVi_') >= 0){
							sp_.splice(index, 1);
						}
						else {
							index++;
						}
						if (index >= sp_.length){
							break;
						}
					}
				}
			}) // Delete subprops
		}

		var PROP_FIELDS_OBJ = {};

		PROP_FIELDS.map(function (element, index) {
			PROP_FIELDS_OBJ[element.name] = index;
		});

		// Một số trường như loaiMauVat, giaTriSuDung cho phép nhiều thuộc tính, cần loại bỏ STR_AUTOCOMPLETION_SEPERATOR (thường là _+_)

		PROP_FIELDS.map((element, index) => {
			if (('autoCompletion' in element) && (element.autoCompletion)){
				try {
					// flatOI[element.name] = flatOI[element.name].split(STR_AUTOCOMPLETION_SEPERATOR).join(', ');
					flatOI[element.name] = flatOI[element.name].replace(new RegExp(STR_AUTOCOMPLETION_SEPERATOR, 'g'), ', ');
				}
				catch (e){
					console.log(e);
				}
			}
		})

		{
			// Trường đặc biệt: Không AutoCompletion nhưng cho phép chọn nhiều mục 
			// => Cũng cần loại bỏ STR_AUTOCOMPLETION_SEPERATOR
			// Bọc trong ngoặc cho đỡ trùng tên biến :v
			let fields = [
				{
					fieldName: 'loaiMauVat'
				}
			]

			for(let f of fields){
				try {
					// flatOI[f.fieldName] = flatOI[f.fieldName].split(STR_AUTOCOMPLETION_SEPERATOR).join(', ');
					flatOI[f.fieldName] = flatOI[f.fieldName].replace(new RegExp(STR_AUTOCOMPLETION_SEPERATOR, 'g'), ', ');
				}
				catch (e){
					console.log(e);
				}

			}
		}

		// End of STR_AUTOCOMPLETION_SEPERATOR
		
		// Reconstruct tree
		var oi = {};
		PROP_FIELDS.map(function (field) {

			if ((field.type == 'Mixed') || (field.name == 'maDeTai')){
				if (field.money){
					statistics.totalMoneyProp++;
					statistics.totalMoneyPropStr += ' ' + field.name;
				}
				else {
					statistics.totalNonMoneyProp++;
					statistics.totalNonMoneyPropStr += ' ' + field.name;
				}
				
				if (field.name == 'maDeTai'){
					if (flatOI.maDeTai){
						if (field.money){
							statistics.moneyPropFilled++;
							statistics.moneyPropFilledStr += ' maDeTai';
						}
						else {
							statistics.nonMoneyPropFilled++;
							statistics.nonMoneyPropFilledStr += ' maDeTai';
						}
					}
				}
				else {
					var sp_ = field.subProps;
					var flag = false;
					// console.log('checking mixed: ' + field.name)
					for(var i = 0; i < sp_.length; i++){

						// console.log(sp_[i] + ' : "' + flatOI[sp_[i]] + '"')
						if (flatOI[sp_[i]]){
							// Nếu flatOI[sp_[i]] là Object Array, tuy không có dữ liệu nhưng vẫn có method
							// Khi đó 
							// flag = true;
							// break;
							var val = JSON.parse(JSON.stringify(flatOI[sp_[i]]));
							// var val = flatOI[sp_[i]];
							if ((val instanceof Array) || (val instanceof Object)){
								// console.log(sp_[i] + ' : "' + flatOI[sp_[i]] + '" true ' + typeof(flatOI[sp_[i]]))
								if ((val instanceof Array) && (val.length > 0)){
									// console.log('Array length: ' + val.length)
									flag = true;
									break;
								}
								if ((val instanceof Object) && (Object.keys(val).length > 0)){
									// console.log('Object keys length: ' + Object.keys(val))
									flag = true;
									break;
								}
							}
							else {
								flag = true;
								break;
							}
						}
					}
					if (flag){
						if (field.money){
							statistics.moneyPropFilled++;
							statistics.moneyPropFilledStr += ' ' + field.name;
							console.log('adding money prop filled: ' + field.name);
						}
						else {
							statistics.nonMoneyPropFilled++;
							statistics.nonMoneyPropFilledStr += ' ' + field.name;
							console.log('adding non money prop filled: ' + field.name);
						}
					}
					
				}
			}

			if (field.type == 'Mixed'){
				// Do not add Mixed property to tree
				// Mixed property has it's own name.
				// Ex: phanBoVietNam => phanBoVietNameMixed

				// But we need to add it to statistics. Add above.
				return;
			}
			if (field.name != 'maDeTai'){
				objectChild(oi, field.schemaProp)[field.name] = {};
			}
			
			// console.log(oi);
		});

		var curDeep = 0;
		var stt = 0;
		
		

		inOrder(oi);

		var tableStyle = {
			tableColWidth: 3200,
			// tableSize: 200,
			// tableColor: "ada",
			tableAlign: "left",
			tableFontFamily: "Times New Roman",
			borders: true
		}

		docx.createTable (table, tableStyle);

		// Những trường con của các trường Mixed luôn có money = false
		// => Chúng luôn được thêm vào:
		// statistics.totalNonMoneyProp, statistics.totalNonMoneyPropStr, statistics.nonMoneyPropFilled, statistics.nonMoneyPropFilledStr
		// Cần loại bỏ:

		PROP_FIELDS.map(function (field) {
			if (field.type == 'Mixed'){
				var sp_ = field.subProps;
				statistics.totalNonMoneyProp -= sp_.length;

				for(var i = 0; i < sp_.length; i++){
					if (statistics.nonMoneyPropFilledStr.indexOf(sp_[i]) >= 0){
						statistics.nonMoneyPropFilled--;
					}
					statistics.totalNonMoneyPropStr = statistics.totalNonMoneyPropStr.replace(sp_[i], '');
					statistics.nonMoneyPropFilledStr = statistics.nonMoneyPropFilledStr.replace(sp_[i], '');
				}
			}
		})

		pObj = docx.createP();
		pObj.options.align = "left";
		pObj.addText('', {color: '000000', bold: true, font_face: 'Times New Roman', font_size: 12});

		// statistics
		pObj = docx.createP();
		pObj.options.align = "left";
		pObj.addText('Số trường bắt buộc đã nhập: ' + statistics.moneyPropFilled + '/' + statistics.totalMoneyProp + '.', {color: '000000', font_face: 'Times New Roman', font_size: 12});

		pObj = docx.createP();
		pObj.options.align = "left";
		pObj.addText('Số trường không bắt buộc đã nhập: ' + statistics.nonMoneyPropFilled + '/' + statistics.totalNonMoneyProp + '.', {color: '000000', font_face: 'Times New Roman', font_size: 12});

		
		try {
			pObj = docx.createP();
			pObj.options.align = "left";
			pObj.addText('Phê duyệt: ' + (objectInstance.flag.fApproved ? 'Đã phê duyệt' : 'Chưa phê duyệt'), {color: '000000', font_face: 'Times New Roman', font_size: 12});
		}
		catch (e){
			console.log(e);
		}

		// var fs = require('fs');
		var tmpFileName = (new Date()).getTime() + '.tmp.docx';
		var outputStream = fs.createWriteStream(path.join(__dirname, tmpFileName));
		outputStream.on('close', function () {
			console.log('output done.');
			// console.log(LABEL);
			var outputFileName = 'PCSDL';
			try {
				if (LABEL.objectModelLabel){
					outputFileName += '_' + LABEL.objectModelLabel;
				}
				if (flatOI.tenVietNam){
					outputFileName += '_' + flatOI.tenVietNam;
				}
				if (flatOI.soHieuBaoTangCS){
					outputFileName += '_' + flatOI.soHieuBaoTangCS;
				}
			}
			catch (e){
				console.log(e);
			}
			if (extension == 'docx'){
				outputFileName += '.docx';
				res.download(path.join(__dirname, tmpFileName), outputFileName, function (err) {
					try {
						fs.unlinkSync(path.join(__dirname, tmpFileName));
					}
					catch (e){
						console.log(e);
					}
				});
			}
			else if (extension == 'pdf'){
				console.log('pdf');
				outputFileName += '.pdf';
				var exec = require('child_process').exec;
				var cmd = 'cd ' + __dirname + ' && libreoffice5.3 --invisible --convert-to pdf ' + tmpFileName;
				console.log('starting: ' + cmd);
				console.log(objectInstance.id);
				exec(cmd, function (err, stdout, stderr) {
					if (err){
						console.log(err);
						return res.end('err');
					}
					console.log('--out-')
					console.log(stdout);
					console.log('--err-')
					console.log(stderr);
					console.log('--end-')
					pdfFileName = tmpFileName.substring(0, tmpFileName.length - 'docx'.length) + 'pdf';
					// console.log(pdfFileName);
					// console.log(outputFileName);
					res.download(path.join(__dirname, pdfFileName), outputFileName, function (err) {
						try {
							fs.unlinkSync(path.join(__dirname, pdfFileName));
							fs.unlinkSync(path.join(__dirname, tmpFileName));
						}
						catch (e){
							console.log(e);
						}
					});
				})
				// return res.end("ok")

			}
			// res.end("OK");
		});
		docx.generate(outputStream);


		// Assume objectInstance is a tree (JSON),
		// with depth <= 3
	})();

}

global.myCustomVars.exportFile = exportFile;

function exportXLSX (objectInstance, PROP_FIELDS, ObjectModel, LABEL, res, paragraph, extension) {

	var async = require('asyncawait/async');
	var await = require('asyncawait/await');
	async (function (){
		console.log("calling xlsx");

		// Tiền xử lý không đồng bộ.
		// Bắt buộc phải dùng Promise, async/await
		var re = await (new Promise(function (resolve, reject) {
			// console.log('dmm');
			setTimeout(function () {
				// console.log('hehe');
				resolve('ok')
			}, 1);
		}))
		
		// End of Tiền xử lý không đồng bộ

		function setCell(sheet, col, row, value, format) {
			sheet.set(col, row, value);
			sheet.font(col, row, format);
			// sheet.border(col, row, {top: 'thin', right: 'thin', bottom: 'thin', left: 'thin'})
		}

		function addEntireRow(sheet, value, format) {
			sheet.merge({row: sheetRowIndex, col: 1}, {row: sheetRowIndex, col: _NUM_COL});
			setCell(sheet, 1, sheetRowIndex, value, format);
			sheetRowIndex++;
		}

		var statistics = {
			totalMoneyProp: 0,
			totalNonMoneyProp: 0,
			moneyPropFilled: 0,
			nonMoneyPropFilled: 0,
			totalMoneyPropStr: '',
			totalNonMoneyPropStr: '',
			moneyPropFilledStr: '',
			nonMoneyPropFilledStr: ''
		};

		PROP_FIELDS = JSON.parse(JSON.stringify(PROP_FIELDS));

		/** Tiền xử lý Schema
		 * 1 vài thuộc tính phụ thuộc vào giá trị của 1 (hay nhiều) thuộc tính khác
		 * Ví dụ, Mẫu trên đất liền thì Quốc gia, Tỉnh, Huyện, Xã là các thuộc tính có *
		 * Nhưng Mẫu trên biển thì chỉ Quốc gia có *
		 * => Cần xử lý cập nhật lại các required fields trong PROP_FIELDS.
		 */

		// TODO: Có thể phải thực hiện bước này ngay khi load Model. Tính sau :v

		// DiaDiemThuMau

		if (objectInstance.flag.fDiaDiemThuMau != 'dat-lien'){
			for(var i = 0; i < PROP_FIELDS.length; i++){
				var field = PROP_FIELDS[i];
				if (['tinh', 'huyen', 'xa'].indexOf(field.name) >= 0){
					field.required = false;
					field.money = false;
					// console.log(field.name);
				}
			}
		}

		try {
			// Quốc gia khác, không phải Việt Nam
			let qg = objectInstances.duLieuThuMau.diaDiemThuMau.quocGia;
			if ((qg) && (qg.trim()) && (qg.trim() != 'Việt Nam')){
				for(var i = 0; i < PROP_FIELDS.length; i++){
					var field = PROP_FIELDS[i];
					if (['tinh', 'huyen', 'xa'].indexOf(field.name) >= 0){
						field.required = false;
						field.money = false;
						// console.log(field.name);
					}
				}
			}
		}
		catch (e){
			console.log(e);
		}

		delete objectInstance.flag.fDiaDiemThuMau;
		for(var i = 0; i < PROP_FIELDS.length; i++){
			var field = PROP_FIELDS[i];
			// console.log(field.name);
			if (field.name == 'fDiaDiemThuMau'){
				console.log('len: ' + PROP_FIELDS.length);
				PROP_FIELDS.splice(i, 1); // Xóa nó đi để không tính vào phần thống kê bao nhiêu trường tính tiền, bao nhiêu trường không tính tiền. (Cuối file xuất ra)
				console.log('len: ' + PROP_FIELDS.length);
				break;
			}
		}

		// resolve place id to string
		try {
			objectInstance.duLieuThuMau.diaDiemThuMau.tinh = CITIES[objectInstance.duLieuThuMau.diaDiemThuMau.tinh].name;
			objectInstance.duLieuThuMau.diaDiemThuMau.huyen = DISTRICTS[objectInstance.duLieuThuMau.diaDiemThuMau.huyen].name;
			objectInstance.duLieuThuMau.diaDiemThuMau.xa = WARDS[objectInstance.duLieuThuMau.diaDiemThuMau.xa].name;
		}

		catch (e){
			console.log(e);
			// do not care
		}

		

		// End of DiaDiemThuMau


		// fApproved
		
		for(var i = 0; i < PROP_FIELDS.length; i++){
			var field = PROP_FIELDS[i];
			// console.log(field.name);
			if (field.name == 'fApproved'){
				console.log('len: ' + PROP_FIELDS.length);
				PROP_FIELDS.splice(i, 1); // Xóa nó đi để không tính vào phần thống kê bao nhiêu trường tính tiền, bao nhiêu trường không tính tiền. (Cuối file xuất ra)
				console.log('len: ' + PROP_FIELDS.length);
				break;
			}
		}
		
		// End of fApproved

		// delete objectInstance.flag;
		/**
		 * End of Tiền xử lý Schema
		 */

		function display(obj){
			// console.log(staticPath)
			// console.log(count)
			if (obj instanceof Array){
				var result =  obj.reduce(function (preStr, curElement, curIndex){
					// console.log(curElement.split('_+_')[1]);
					preStr += curElement.split('_+_')[1];
					if (curIndex < obj.length - 1){
						preStr += '\n\n';
					}
					return preStr;
				}, '');
				return result;
			}
			else if (obj instanceof Date){
				return [obj.getDate(), obj.getMonth() + 1, obj.getFullYear()].join(' / ');
			}
			// Need to escape to prevent injected HTML + JS
			return obj;
		}


		var curProp = '';
		var addPropRow = true;

		function inOrder (tree) {
			if (!tree){
				return;
			}
			if (tree instanceof Function){
				return;
			}
			if (typeof(tree) == 'string'){
				return;
			}
			for(var i = 0; i < Object.keys(tree).length; i++){
				var prop = Object.keys(tree)[i];
				// console.log(stt + ' : ' + prop + ' : ' + curDeep);
				// Add data to docx object
				var p;
				switch (curDeep){
					case 0:
						addPropRow = true;
						// Label
						try{
							p = LABEL[prop];
						}
						catch (e){
							console.log(e);
							// Do not care;
							// break;
						}
						// var row = [
						// 	{
						// 		val: p,
						// 		opts: rowSpanOpts
						// 	},
						// 	{
						// 		val: '',
						// 		opts: rowSpanOpts
						// 	},
						// 	{
						// 		val: '',
						// 		opts: rowSpanOpts
						// 	},
						// 	{
						// 		val: '',
						// 		opts: rowSpanOpts
						// 	}
						// ];
						// table.push(row);


						setCell(sheet, 1, sheetRowIndex, p, labelOpts);
						sheet.merge({row: sheetRowIndex, col: 1}, {row: sheetRowIndex, col: _NUM_COL});
						sheet.align(1, sheetRowIndex, 'left');
						// sheet.fill(1, sheetRowIndex, {type: 'lightGrid', fgColor: 'FFFFFF00', bgColor: 'FFFFFF00'})
						// sheet.fill(1, sheetRowIndex, {fgColor:8,bgColor:64});
						sheetRowIndex++;
						break;
					case 1:
						stt++;
						curProp = prop;
						addPropRow = true;
						
						var value = display(flatOI[prop]);
						try{

							if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].label){
								p = PROP_FIELDS[PROP_FIELDS_OBJ[prop]].label
							}

							if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].money){
								statistics.totalMoneyProp++;
								statistics.totalMoneyPropStr += ' ' + prop;
							}
							else {
								statistics.totalNonMoneyProp++;
								statistics.totalNonMoneyPropStr += ' ' + prop;
							}
						}
						catch (e){
							// console.log(e);
							// Do not care;
							// console.log(prop + ' : index : ' + PROP_FIELDS_OBJ[prop])
						}

						
						// var row = [
						// 	{
						// 		val: stt,
						// 		opts: labelOpts
						// 	},
						// 	{
						// 		val: p,
						// 		opts: detailOpts
						// 	},
						// 	{
						// 		val: value,
						// 		opts: detailOpts
						// 	},
						// 	{
						// 		val: '',
						// 		opts: detailOpts
						// 	}
						// ]
						if (value){
							// table.push(row);


							setCell(sheet, 1, sheetRowIndex, stt, labelOpts);
							setCell(sheet, 2, sheetRowIndex, p, detailOpts);
							setCell(sheet, 3, sheetRowIndex, value, detailOpts);
							sheetRowIndex++;


							if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].money){
								statistics.moneyPropFilled++;
								statistics.moneyPropFilledStr += ' ' + prop;
							}
							else {
								statistics.nonMoneyPropFilled++;
								statistics.nonMoneyPropFilledStr += ' ' + prop;
							}
						}
						break;
					case 2:
						
						var value = display(flatOI[prop]);
						try{

							if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].label){
								p = PROP_FIELDS[PROP_FIELDS_OBJ[prop]].label
							}

							if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].money){
								statistics.totalMoneyProp++;
								statistics.totalMoneyPropStr += ' ' + prop;
							}
							else {
								statistics.totalNonMoneyProp++;
								statistics.totalNonMoneyPropStr += ' ' + prop;
							}
						}
						catch (e){
							console.log(e);
							// Do not care;
							// console.log(prop + ' : index : ' + PROP_FIELDS_OBJ[prop])
						}
						var row = null;
						if (addPropRow){
							try{
								curProp = LABEL[curProp];
							}
							catch (e){
								console.log(e);
								// Do not care;
								// break;
							}
							// row = [
							// 	{
							// 		val: stt,
							// 		opts: labelOpts
							// 	},
							// 	{
							// 		val: curProp,
							// 		opts: detailOpts
							// 	},
							// 	{
							// 		val: '',
							// 		opts: detailOpts
							// 	},
							// 	{
							// 		val: '',
							// 		opts: detailOpts
							// 	}
							// ]
							// table.push(row);


							setCell(sheet, 1, sheetRowIndex, stt, labelOpts);
							setCell(sheet, 2, sheetRowIndex, curProp, detailOpts);
							sheetRowIndex++;

							addPropRow = false;
						}
						
						
						// console.log(p + ' : ' + value)
						if (value){

							setCell(sheet, 2, sheetRowIndex, p, detailItalicOpts);
							setCell(sheet, 3, sheetRowIndex, value, detailOpts);
							sheetRowIndex++;

							if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].money){
								statistics.moneyPropFilled++;
								statistics.moneyPropFilledStr += ' ' + prop;
							}
							else {
								statistics.nonMoneyPropFilled++;
								statistics.nonMoneyPropFilledStr += ' ' + prop;
							}
						}
						break;
				}

				// console.log('inc curDeep');
				
				// stt++;
				curDeep++;
				inOrder(tree[prop]);
				curDeep--;
			}
		}

		// Templates
		var rowSpanOpts = {
			// cellColWidth: 2261,
			b:true,
			sz: '24',
			align: 'center',
			shd: {
				fill: "CCCCCC",
				// themeFill: "text1",
				// "themeFillTint": "30"
			},
			// gridSpan: 3,
			fontFamily: "Times New Roman"
		};

		var labelOpts = {
			bold: true,
			align: 'center',
			name: "Times New Roman",
			scheme: '-', // Phải có cái này thì mới chuyển thành font Times New Roman.
			sz: 12
		};

		var detailOpts = {
			// cellColWidth: 2261,
			// b:true,
			sz: '12',
			name: "Times New Roman",
			scheme: '-',
			family: '3',
		};

		var detailItalicOpts = {
			// cellColWidth: 2261,
			// b:true,
			sz: '12',
			name: "Times New Roman",
			scheme: '-',
			family: '3',
			iter: true
		};
		// End

		var excelbuilder = require('msexcel-builder');
		var tmpFileName = (new Date()).getTime() + '.tmp.xlsx';
		var workbook = excelbuilder.createWorkbook(path.join(__dirname), tmpFileName);
		var _NUM_ROW = 200;
		var _NUM_COL = 4;
		var sheet = workbook.createSheet('PCSDL', _NUM_COL, _NUM_ROW);
		sheet.width(1, 10);
		sheet.width(2, 20);
		sheet.width(3, 30);
		sheet.width(4, 20);
		// wrap + border all
		for(var i = 1; i <= _NUM_COL; i++){
			for(var j = 1; j <= _NUM_ROW; j++){
				sheet.wrap(i, j, true);
			}
		}
		// end of wrap all
		for(var i = 0; i < _NUM_ROW; i++){
			sheet.align(1, i, 'center');
			sheet.valign(1, i, 'center');
		}

		var sheetRowIndex = 1;
		var sheetColIndex = 0;

		for(var i = 0; i < paragraph.text.length; i++){
			
			sheet.merge({row: sheetRowIndex, col: 1}, {row: sheetRowIndex, col: 4});
			setCell(sheet, 1, sheetRowIndex, paragraph.text[i], {name: 'Times New Roman', sz: '12', family: '3', scheme: '-', bold: true, iter: 'false'});
			sheet.height(sheetRowIndex, 50);
			sheetRowIndex++;

		}

		var flatOI = flatObjectModel(PROP_FIELDS, objectInstance);

		

		sheet.merge({row: sheetRowIndex, col: 1}, {row: sheetRowIndex, col: 4});
		console.log('merged: ' + sheetRowIndex + ', 1 and ' + sheetRowIndex + ', 4.')
		setCell(sheet, 1, sheetRowIndex, 'Mã đề tài: ' + display(flatOI.maDeTai), detailOpts);
		sheet.font({col: 1, row: sheetRowIndex}, {bold: true, name: 'Times New Roman', sz: 12});
		sheet.height(sheetRowIndex, 50);
		sheetRowIndex++;

		setCell(sheet, 1, sheetRowIndex, 'STT', labelOpts);
		setCell(sheet, 2, sheetRowIndex, 'Trường dữ liệu', labelOpts);
		setCell(sheet, 3, sheetRowIndex, 'Nội dung', labelOpts);
		setCell(sheet, 4, sheetRowIndex, 'Ghi chú', labelOpts);
		sheetRowIndex++;


		// Delete Unit fields
		PROP_FIELDS.map(function (field) {
			if (field.type == 'Unit' && flatOI[field.name.substring('donVi_'.length)] && flatOI[field.name]){
				flatOI[field.name.substring('donVi_'.length)] += ' ' + flatOI[field.name];
				flatOI[field.name.substring('donVi_'.length)].trim();
				return;
			}
		})

		{
			var index = 0;
			while (true){
				if (PROP_FIELDS[index] && (PROP_FIELDS[index].type == 'Unit')){
					PROP_FIELDS.splice(index, 1);
				}
				else {
					index++;
				}
				if (index >= PROP_FIELDS.length){
					break;
				}
			} // Delete Unit fields

			PROP_FIELDS.map(function (element, index) {
				if (element.type == 'Mixed'){
					var sp_ = element.subProps;
					var index = 0;
					while (true){
						if (sp_[index].indexOf('donVi_') >= 0){
							sp_.splice(index, 1);
						}
						else {
							index++;
						}
						if (index >= sp_.length){
							break;
						}
					}
				}
			}) // Delete subprops
		}

		var PROP_FIELDS_OBJ = {};

		PROP_FIELDS.map(function (element, index) {
			PROP_FIELDS_OBJ[element.name] = index;
		});

		// Một số trường như loaiMauVat, giaTriSuDung cho phép nhiều thuộc tính, cần loại bỏ STR_AUTOCOMPLETION_SEPERATOR (thường là _+_)

		PROP_FIELDS.map((element, index) => {
			if (('autoCompletion' in element) && (element.autoCompletion)){
				try {
					// flatOI[element.name] = flatOI[element.name].split(STR_AUTOCOMPLETION_SEPERATOR).join(', ');
					flatOI[element.name] = flatOI[element.name].replace(new RegExp(STR_AUTOCOMPLETION_SEPERATOR, 'g'), ', ');
				}
				catch (e){
					console.log(e);
				}
			}
		})

		{
			// Trường đặc biệt: Không AutoCompletion nhưng cho phép chọn nhiều mục 
			// => Cũng cần loại bỏ STR_AUTOCOMPLETION_SEPERATOR
			// Bọc trong ngoặc cho đỡ trùng tên biến :v
			let fields = [
				{
					fieldName: 'loaiMauVat'
				}
			]

			for(let f of fields){
				try {
					// flatOI[f.fieldName] = flatOI[f.fieldName].split(STR_AUTOCOMPLETION_SEPERATOR).join(', ');
					flatOI[f.fieldName] = flatOI[f.fieldName].replace(new RegExp(STR_AUTOCOMPLETION_SEPERATOR, 'g'), ', ');
				}
				catch (e){
					console.log(e);
				}
			}
		}

		// End of STR_AUTOCOMPLETION_SEPERATOR
		
		// Reconstruct tree
		var oi = {};
		PROP_FIELDS.map(function (field) {

			if ((field.type == 'Mixed') || (field.name == 'maDeTai')){
				if (field.money){
					statistics.totalMoneyProp++;
					statistics.totalMoneyPropStr += ' ' + field.name;
				}
				else {
					statistics.totalNonMoneyProp++;
					statistics.totalNonMoneyPropStr += ' ' + field.name;
				}
				
				if (field.name == 'maDeTai'){
					if (flatOI.maDeTai){
						if (field.money){
							statistics.moneyPropFilled++;
							statistics.moneyPropFilledStr += ' maDeTai';
						}
						else {
							statistics.nonMoneyPropFilled++;
							statistics.nonMoneyPropFilledStr += ' maDeTai';
						}
					}
				}
				else {
					var sp_ = field.subProps;
					var flag = false;
					// console.log('checking mixed: ' + field.name)
					for(var i = 0; i < sp_.length; i++){

						// console.log(sp_[i] + ' : "' + flatOI[sp_[i]] + '"')
						if (flatOI[sp_[i]]){
							// Nếu flatOI[sp_[i]] là Object Array, tuy không có dữ liệu nhưng vẫn có method
							// Khi đó 
							// flag = true;
							// break;
							var val = JSON.parse(JSON.stringify(flatOI[sp_[i]]));
							// var val = flatOI[sp_[i]];
							if ((val instanceof Array) || (val instanceof Object)){
								// console.log(sp_[i] + ' : "' + flatOI[sp_[i]] + '" true ' + typeof(flatOI[sp_[i]]))
								if ((val instanceof Array) && (val.length > 0)){
									// console.log('Array length: ' + val.length)
									flag = true;
									break;
								}
								if ((val instanceof Object) && (Object.keys(val).length > 0)){
									// console.log('Object keys length: ' + Object.keys(val))
									flag = true;
									break;
								}
							}
							else {
								flag = true;
								break;
							}
						}
					}
					if (flag){
						if (field.money){
							statistics.moneyPropFilled++;
							statistics.moneyPropFilledStr += ' ' + field.name;
							console.log('adding money prop filled: ' + field.name);
						}
						else {
							statistics.nonMoneyPropFilled++;
							statistics.nonMoneyPropFilledStr += ' ' + field.name;
							console.log('adding non money prop filled: ' + field.name);
						}
					}
					
				}
			}

			if (field.type == 'Mixed'){
				// Do not add Mixed property to tree
				// Mixed property has it's own name.
				// Ex: phanBoVietNam => phanBoVietNameMixed

				// But we need to add it to statistics. Add above.
				return;
			}
			if (field.name != 'maDeTai'){
				objectChild(oi, field.schemaProp)[field.name] = {};
			}
			
			// console.log(oi);
		});

		var curDeep = 0;
		var stt = 0;
		
		

		inOrder(oi);

		// Những trường con của các trường Mixed luôn có money = false
		// => Chúng luôn được thêm vào:
		// statistics.totalNonMoneyProp, statistics.totalNonMoneyPropStr, statistics.nonMoneyPropFilled, statistics.nonMoneyPropFilledStr
		// Cần loại bỏ:

		PROP_FIELDS.map(function (field) {
			if (field.type == 'Mixed'){
				var sp_ = field.subProps;
				statistics.totalNonMoneyProp -= sp_.length;

				for(var i = 0; i < sp_.length; i++){
					if (statistics.nonMoneyPropFilledStr.indexOf(sp_[i]) >= 0){
						statistics.nonMoneyPropFilled--;
					}
					statistics.totalNonMoneyPropStr = statistics.totalNonMoneyPropStr.replace(sp_[i], '');
					statistics.nonMoneyPropFilledStr = statistics.nonMoneyPropFilledStr.replace(sp_[i], '');
				}
			}
		})

		// Make sure that all above cells has border

		for(var i = 3; i < sheetRowIndex; i++){
			for(var j = 0; j <= _NUM_COL; j++){
				sheet.border(j, i, {top: 'thin', right: 'thin', bottom: 'thin', left: 'thin'});
			}
		}


		addEntireRow(sheet, '', {})

		sheet.align(1, sheetRowIndex, 'left');
		addEntireRow(sheet,
			'Số trường bắt buộc đã nhập: ' + statistics.moneyPropFilled + '/' + statistics.totalMoneyProp + '.', {
			name: 'Times New Roman',
			sz: 12,
			scheme: '-'
		})


		sheet.align(1, sheetRowIndex, 'left');
		addEntireRow(sheet,
			'Số trường không bắt buộc đã nhập: ' + statistics.nonMoneyPropFilled + '/' + statistics.totalNonMoneyProp + '.', {
			name: 'Times New Roman',
			sz: 12,
			scheme: '-'
		})

		try {
			sheet.align(1, sheetRowIndex, 'left');
			addEntireRow(sheet,
				'Phê duyệt: ' + (objectInstance.flag.fApproved ? 'Đã phê duyệt' : 'Chưa phê duyệt') , {
				name: 'Times New Roman',
				sz: 12,
				scheme: '-'
			})
		}
		catch (e){
			console.log(e);
		}

		// pObj = docx.createP();
		// pObj.options.align = "left";
		// pObj.addText(JSON.stringify(statistics, null, 4), {color: '000000', font_face: 'Times New Roman', font_size: 12});

		// var fs = require('fs');
		
		// var outputStream = fs.createWriteStream(path.join(__dirname, tmpFileName));


		workbook.save(function (err) {
			if (err){
				console.log(err);
				return res.end('err');
			}
			console.log('output done.');
			// console.log(LABEL);
			var outputFileName = 'PCSDL';
			try {
				if (LABEL.objectModelLabel){
					outputFileName += '_' + LABEL.objectModelLabel;
				}
				if (flatOI.tenVietNam){
					outputFileName += '_' + flatOI.tenVietNam;
				}
				if (flatOI.soHieuBaoTangCS){
					outputFileName += '_' + flatOI.soHieuBaoTangCS;
				}
			}
			catch (e){
				console.log(e);
			}
			if (extension == 'xlsx'){
				outputFileName += '.xlsx';
				res.download(path.join(__dirname, tmpFileName), outputFileName, function (err) {
					try {
						fs.unlinkSync(path.join(__dirname, tmpFileName));
					}
					catch (e){
						console.log(e);
					}
				});
			}
			
			// res.end("OK");
		});
		// xlsx.generate(outputStream);


		// Assume objectInstance is a tree (JSON),
		// with depth <= 3
	})();
}

global.myCustomVars.exportXLSX = exportXLSX;

var getAllHandler = function (options) {
	return function (req, res) {
		var async = require('asyncawait/async')
		var await = require('asyncawait/await')
		async(() => {
			// ObjectModel.find({deleted_at: {$eq: null}}, {}, {skip: 0, limit: 10, sort: {created_at: -1}}, function (err, objectInstances) {
			var ObjectModel = options.ObjectModel;
			var UPLOAD_DEST_ANIMAL = options.UPLOAD_DEST_ANIMAL;
			var PROP_FIELDS = options.PROP_FIELDS;
			var objectModelNames = options.objectModelNames;
			var projection = {deleted_at: {$eq: null}};
			var userRoles = await(new Promise((resolve, reject) => {
				acl.userRoles(req.session.userId, (err, roles) => {
					// console.log('promised userRoles called');
					if (err){
						resolve([])
					}
					else {
						resolve(roles)
					}
				})
			}))

			// console.log(userRoles);

			// Default. User chỉ có thể xem những phiếu do chính mình tạo
			projection['created_by.userId'] = req.user._id;

			if (userRoles.indexOf('manager') >= 0){
				// Chủ nhiệm đề tài có thể xem tất cả mẫu dữ liệu trong cùng đề tài
				delete projection['created_by.userId'];
				projection['maDeTai.maDeTai'] = req.user.maDeTai;
			}

			if (userRoles.indexOf('admin') >= 0){
				// Admin, Xem tất
				delete projection['created_by.userId']; // Xóa cả cái này nữa. Vì có thể có admin ko có manager role. :))
				delete projection['maDeTai.maDeTai'];
			}

			// ===
			// if (!req.user.level || (parseInt(req.user.level) < global.myCustomVars.PERM_ACCESS_SAME_MUSEUM)){
			// 	// Nếu level user nhỏ hơn PERM_ACCESS_SAME_MUSEUM => chỉ có thể xem dữ liệu của mình
			// 	projection['created_by.userId'] = req.user._id;
			// }
			// if (req.user.level){
			// 	let level = parseInt(req.user.level);
			// 	if ((level >= PERM_ACCESS_SAME_MUSEUM) && (level < PERM_ACCESS_ALL)){
			// 		// Chủ nhiệm đề tài có thể xem tất cả mẫu dữ liệu trong cùng đề tài
			// 		delete projection['created_by.userId'];
			// 		projection['maDeTai.maDeTai'] = req.user.maDeTai;
			// 	}
			// 	else if (level >= PERM_ACCESS_ALL){
			// 		delete projection['maDeTai.maDeTai'];
			// 	}
			// }
			// ===
			console.log(projection);
			// ObjectModel.find(projection, {}, {skip: 0, limit: 10, sort: {created_at: -1}}, function (err, objectInstances) {
			ObjectModel.find(projection, {}, {sort: {created_at: -1}}, function (err, objectInstances) {
				if (err){
					return responseError(req, UPLOAD_DEST_ANIMAL, res, 500, ['error'], ['Error while reading database']);
				}
				// var d1 = new Date();
				objectInstances = JSON.parse(JSON.stringify(objectInstances));
				try {
					objectInstances.map((o, i) => {
						let id = o._id;
						let created_at = o.created_at;
						objectInstances[i] =  flatObjectModel(PROP_FIELDS, o);
						objectInstances[i]._id = id;
						objectInstances[i].created_at = created_at;
					})
				}
				catch (e){
					console.log(e);
				}
				// var d2 = new Date();
				// console.log("==================");
				// console.log("time: " + ((d2.getTime() - d1.getTime()) / 1000));
				// console.log("==================");
				return responseSuccess(res, ['status', objectModelNames], ['success', objectInstances]);
			})
		})();
	}
}

global.myCustomVars.getAllHandler = getAllHandler;

var getAutoCompletionHandler = function (options) {
	return function (req, res) {
		// console.log(Object.keys(AutoCompletion.schema.paths));
		var AutoCompletion = options.AutoCompletion;
		var UPLOAD_DEST_ANIMAL = options.UPLOAD_DEST_ANIMAL;
		AutoCompletion.findOne({}, function (err, autoCompletion) {
			if (err){
				return responseError(req, UPLOAD_DEST_ANIMAL, res, 500, ['error'], ["Error while reading AutoCompletion data"]);
			}
			else{
				var props = [];
				var values = [];
				for (var prop in AutoCompletion.schema.paths){
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
	}
}

global.myCustomVars.getAutoCompletionHandler = getAutoCompletionHandler;

var getSingleHandler = function (options) {
	return function (req, res) {
		// console.log(ObjectId(req.params.animalId));
		// console.log(req.params.animalId);
		var ObjectModel = options.ObjectModel;
		var objectModelName = options.objectModelName;
		var PROP_FIELDS = options.PROP_FIELDS;
		var UPLOAD_DEST_ANIMAL = options.UPLOAD_DEST_ANIMAL;
		var objectModelIdParamName = options.objectModelIdParamName;
		var objectBaseURL = options.objectBaseURL;
		var LABEL = options.LABEL;
		var objectModelLabel = options.objectModelLabel;
		ObjectModel.findById(req.params.objectModelIdParamName, function (err, objectInstance) {
			if (err){
				return responseError(req, UPLOAD_DEST_ANIMAL, res, 500, ['error'], ['Error while reading database']);
			}
			if (objectInstance){
				if (objectInstance.deleted_at){
					Log.find({action: {$eq: 'delete'}, "obj1._id": {$eq: mongoose.Types.ObjectId(req.params.objectModelIdParamName)}}, function (err, logs) {
						if (err || (logs.length < 1)){
							console.log(err);
							return responseError(req, UPLOAD_DEST_ANIMAL, res, 404, ['error'], ["Mẫu dữ liệu này đã bị xóa"]);
						}
						// console.log(logs);
						return responseError(req, UPLOAD_DEST_ANIMAL, res, 404, ['error'], ["Mẫu dữ liệu này đã bị xóa bởi " + logs[0].userFullName]);
					})
				}
				else {
					// return responseSuccess(res, ['objectInstance'], [objectInstance]);
					if (req.query.display == 'html'){
						return res.render('display', {title: 'Chi tiết mẫu ' + objectModelLabel, objectPath: objectBaseURL, count: 1, obj1: flatObjectModel(PROP_FIELDS, objectInstance), objectModelId: objectInstance.id, props: propsName(PROP_FIELDS), staticPath: UPLOAD_DEST_ANIMAL.substring(UPLOAD_DEST_ANIMAL.indexOf('public') + 'public'.length)});
					}
					else if (['docx', 'pdf', 'xlsx'].indexOf(req.query.display) >= 0){

						console.log('combined');
						
						var paragraph = options.paragraph;
						
						var exportFuncs = {
							docx: exportFile,
							pdf: exportFile,
							xlsx: exportXLSX
						}

						exportFuncs[req.query.display](objectInstance, PROP_FIELDS, ObjectModel, LABEL, res, paragraph, req.query.display);
						// return res.end("OK");
					}
					
					else {
						if (req.query.filename == 'raw'){
							return responseSuccess(res, [objectModelName], [flatObjectModel(PROP_FIELDS, objectInstance)]);
						}
						else {
							let tmp = flatObjectModel(PROP_FIELDS, objectInstance);
							try {
								for(p in tmp){
									if (tmp[p] instanceof Array){ // Chỉ có những trường file đính kèm thì mới là Array
										let files = tmp[p];
										files.map((f, i) => {
											let url = '/uploads/' + objectModelName + '/' + f;
											let obj = {
												fileName: f.substring(f.lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length),
												urlDirect: url,
												urlDownload: '/content/download' + url
											}
											files[i] = obj;
										})
									}
								}
							}
							catch (e){
								console.log(e);
							}
							return responseSuccess(res, [objectModelName], [tmp]);
						}
					}
					
				}
			}
			else{
				responseError(req, UPLOAD_DEST_ANIMAL, res, 404, ['error'], ['Không tìm thấy']);
			}
		})
	}
}

global.myCustomVars.getSingleHandler = getSingleHandler;

// hanle route: objectBaseURL + '/log/:logId/:position'
var getLogHandler = function (options) {
	return function (req, res) {
		var UPLOAD_DEST_ANIMAL = options.UPLOAD_DEST_ANIMAL;
		var objectBaseURL = options.objectBaseURL;
		var PROP_FIELDS = options.PROP_FIELDS;
		Log.findById(req.params.logId, function (err, log) {
			if (err){
				return responseError(req, UPLOAD_DEST_ANIMAL, res, 500, ['error'], ['Error while reading database']);
			}
			if (log){
				if ((log.action == 'update') && (req.params.position == 'diff')){
					// return responseSuccess(res, ['obj1', 'obj2'], [flatObjectModel(PROP_FIELDS, log.obj1), flatObjectModel(PROP_FIELDS, log.obj2)]);
					return res.render('display', {title: 'Các cập nhật', objectPath: objectBaseURL, count: 2, obj1: flatObjectModel(PROP_FIELDS, log.obj1), obj2: flatObjectModel(PROP_FIELDS, log.obj2), staticPath: UPLOAD_DEST_ANIMAL.substring(UPLOAD_DEST_ANIMAL.indexOf('public') + 'public'.length), props: propsName(PROP_FIELDS)});
				}

				switch (parseInt(req.params.position)){
					case 1:
						if ('obj1' in log){
							// return responseSuccess(res, ['animal'], [flatObjectModel(PROP_FIELDS, log.obj1)])
							return res.render('display', {title: 'Dữ liệu chi tiết', objectPath: objectBaseURL, count: 1, obj1: flatObjectModel(PROP_FIELDS, log.obj1), obj2: {}, staticPath: UPLOAD_DEST_ANIMAL.substring(UPLOAD_DEST_ANIMAL.indexOf('public') + 'public'.length), props: propsName(PROP_FIELDS)});
						}
						else{
							return responseError(req, UPLOAD_DEST_ANIMAL, res, 400, ['error'], ['Invalid object'])
						}
					case 2:
						if (('obj2' in log) && (log.obj2)){
							return res.render('display', {title: 'Dữ liệu chi tiết', objectPath: objectBaseURL, count: 1, obj1: flatObjectModel(PROP_FIELDS, log.obj2), staticPath: UPLOAD_DEST_ANIMAL.substring(UPLOAD_DEST_ANIMAL.indexOf('public') + 'public'.length), props: propsName(PROP_FIELDS)});
							// return responseSuccess(res, ['animal'], [flatObjectModel(PROP_FIELDS, log.obj2)])
						}
						else{
							return responseError(req, UPLOAD_DEST_ANIMAL, res, 400, ['error'], ['Invalid object'])
						}
					default:
						return responseError(req, UPLOAD_DEST_ANIMAL, res, 400, ['error'], ['Invalid object'])
				}
			}
			else {
				return responseError(req, UPLOAD_DEST_ANIMAL, res, 400, ['error'], ['Invalid logId'])
			}
		})
	}
}

global.myCustomVars.getLogHandler = getLogHandler;

var deleteHandler = function (options) {
	return function (req, res) {
		var async = require('asyncawait/async')
		var await = require('asyncawait/await')
		async(() => {
			var objectModelIdParamName = options.objectModelIdParamName;
			var UPLOAD_DEST_ANIMAL = options.UPLOAD_DEST_ANIMAL;
			var objectModelName = options.objectModelName;
			var objectModelIdParamName = options.objectModelIdParamName
			var ObjectModel = options.ObjectModel;
			var missingParam = checkRequiredParams([objectModelIdParamName], req.body);
			if (missingParam){
				return responseError(req, UPLOAD_DEST_ANIMAL, res, 400, ['error'], ['Thiếu ' + missingParam]);
			}

			var objectInstance = await(new Promise((resolve, reject) => {
				ObjectModel.findById(req.body[objectModelIdParamName], function (err, objectInstance) {
					// console.log('function');
					if (err){
						console.log(err);
						responseError(req, UPLOAD_DEST_ANIMAL, res, 500, ['error'], ['Error while reading database']);
						resolve(null)
					}
					resolve(objectInstance);
				})
			}))
			if (objectInstance){
				var canDelete = false;
				var userRoles = await(new Promise((resolve, reject) => {
					acl.userRoles(req.session.userId, (err, roles) => {
						console.log('promised userRoles called');
						if (err){
							resolve([])
						}
						else {
							resolve(roles)
						}
					})
				}))

				if (userRoles.indexOf('admin') >= 0){
					// Nếu là Admin, xóa đẹp
					canDelete = true;
				}
				if ((userRoles.indexOf('manager') >= 0) && req.user.maDeTai == objectInstance.maDeTai.maDeTai){
					// Nếu là chủ nhiệm đề tài, cũng OK
					canDelete = true;
				}
				if (objectInstance.created_by.userId == req.user.id){
					canDelete = true; // Nếu mẫu do chính user tạo, có thể xóa
				}

				// ===
				
				// if (objectInstance.created_by.userId == req.user.id){
				// 	canDelete = true; // Nếu mẫu do chính user tạo, có thể xóa
				// }
				// if (req.user.level){
				// 	let level = parseInt(req.user.level);
				// 	if (level >= PERM_ACCESS_ALL){
				// 		canDelete = true; // Nếu là SUPERUSER, xóa đẹp
				// 	}
				// 	else if ((level >= PERM_ACCESS_SAME_MUSEUM) && (req.user.maDeTai == objectInstance.maDeTai.maDeTai)){
				// 		canDelete = true; // Nếu là chủ nhiệm đề tài, cũng OK
				// 	}
				// }
				
				if (!canDelete){
					return responseError(req, UPLOAD_DEST_ANIMAL, res, 403, ['error'], ['Bạn không có quyền xóa mẫu dữ liệu này'])
				}

				var date = new Date();
				objectInstance.deleted_at = date;
				objectInstance.save();
				var newLog = new Log();
				newLog.action = 'delete';
				newLog.userId = req.user.id;
				newLog.userFullName = req.user.fullname;
				newLog.objType = objectModelName;
				newLog.obj1 = objectInstance;
				newLog.time = date;
				newLog.save();
				return responseSuccess(res, ['status'], ['success']);
			}
			else{
				return responseError(req, UPLOAD_DEST_ANIMAL, res, 400, ['error'], ['Invalid ' + objectModelIdParamName]);
			}
		})()
		// return res.end('ok');
	}
}

global.myCustomVars.deleteHandler = deleteHandler;

var putHandler = function (options) {
	return function (req, res, next) {
		// console.log(req.body);
		var async = require('asyncawait/async')
		var await = require('asyncawait/await')
		delete req.body.maDeTai;
		delete req.body.fApproved;

		async(() => {
			var objectModelIdParamName = options.objectModelIdParamName
			var UPLOAD_DEST_ANIMAL = options.UPLOAD_DEST_ANIMAL
			var ObjectModel = options.ObjectModel
			var saveOrUpdate = options.saveOrUpdate;
			// console.log(objectModelIdParamName);
			var missingParam = checkRequiredParams([objectModelIdParamName], req.body);
			if (missingParam){
				return responseError(req, UPLOAD_DEST_ANIMAL, res, 400, ['error'], ['Thiếu ' + objectModelIdParamName]);  
			}
			// console.log(req.body.animalId);
			var objectModelId = '';
			try {
				// console.log(req.body[objectModelIdParamName]);
				objectModelId = mongoose.Types.ObjectId(req.body[objectModelIdParamName]);
			}
			catch (e){
				console.log(e);
				return responseError(req, UPLOAD_DEST_ANIMAL, res, 500, ['error'], [objectModelIdParamName + " không đúng"]);
			}
			var objectInstance = await(new Promise((resolve, reject) => {
				ObjectModel.findById(objectModelId, function (err, objectInstance) {
					if (err){
						console.log(err);
						responseError(req, UPLOAD_DEST_ANIMAL, res, 500, ['error'], ["Error while reading database"])
						resolve(null)
					}
					
					if (objectInstance && (!objectInstance.deleted_at)) {
						resolve(objectInstance);
					}

					else {
						responseError(req, UPLOAD_DEST_ANIMAL, res, 400, ['error'], [objectModelIdParamName + ' không đúng'])
						resolve(null)
					}
				})
			}))
			if (objectInstance){
				var canEdit = false;

				var userRoles = await(new Promise((resolve, reject) => {
					acl.userRoles(req.session.userId, (err, roles) => {
						console.log('promised userRoles called');
						if (err){
							resolve([])
						}
						else {
							resolve(roles)
						}
					})
				}))

				if (userRoles.indexOf('admin') >= 0){
					// Nếu là Admin, cập nhật đẹp
					canEdit = true;
				}
				if ((userRoles.indexOf('manager') >= 0) && req.user.maDeTai == objectInstance.maDeTai.maDeTai){
					// Nếu là chủ nhiệm đề tài, cũng OK
					canEdit = true;
				}
				if (objectInstance.created_by.userId == req.user.id){
					canEdit = true; // Nếu mẫu do chính user tạo, có thể cập nhật
				}

				// ===
				// if (objectInstance.created_by.userId == req.user.id){
				// 	canEdit = true; // Nếu mẫu do chính user tạo, có thể cập nhật
				// }
				// if (req.user.level){
				// 	let level = parseInt(req.user.level);
				// 	if (level >= PERM_ACCESS_ALL){
				// 		canEdit = true; // Nếu là SUPERUSER, cập nhật đẹp
				// 	}
				// 	else if ((level >= PERM_ACCESS_SAME_MUSEUM) && (req.user.maDeTai == objectInstance.maDeTai.maDeTai)){
				// 		canEdit = true; // Nếu là chủ nhiệm đề tài, cũng OK
				// 	}
				// }
				// ===

				if (!canEdit){
					return responseError(req, UPLOAD_DEST_ANIMAL, res, 403, ['error'], ['Bạn không có quyền sửa đổi mẫu dữ liệu này'])
				}

				return saveOrUpdate(req, res, objectInstance, ACTION_EDIT);
			}
		})();

		
	}
}

global.myCustomVars.putHandler = putHandler;

var postHandler = function (options) {
	var ObjectModel = options.ObjectModel;
	var saveOrUpdate = options.saveOrUpdate;
	var UPLOAD_DEST_ANIMAL = options.UPLOAD_DEST_ANIMAL;
	return function (req, res, next) {
		var newInstance = new ObjectModel();

		if (!req.user.maDeTai){
			return responseError(req, UPLOAD_DEST_ANIMAL, res, 403, ['error'], ['Tài khoản của bạn chưa được liên kết với bất kỳ bảo tàng nào. Liên hệ chủ nhiệm đề tài để được cập nhật tài khoản.']);

		}

		newInstance.flag.fApproved = false;
		delete req.body.fApproved;

		newInstance.maDeTai.maDeTai = req.user.maDeTai;
		delete req.body.maDeTai;

		return saveOrUpdate(req, res, newInstance, ACTION_CREATE);
	}
}

global.myCustomVars.postHandler = postHandler;

var restart = function (res) {
	res.status(200).json({
		status: 'success'
	});

	console.log('res sent');

	setTimeout(function () {
		console.log('halt');
		process.exit(0);
	}, 1000)
}

global.myCustomVars.restart = restart;

// ============= Generate Promise for async/await =======================

global.myCustomVars.promises = {}

var getSharedData = () => {
	return new Promise((resolve, reject) => {
		mongoose.model('SharedData').findOne({}, (err, sharedData) => {
			if (!err && sharedData){
				resolve(sharedData);
			}
			else {
				resolve(null)
			}
		})
	});
}

global.myCustomVars.promises.getSharedData = getSharedData;

var getMaDeTai = () => {
	return new Promise((resolve, reject) => {
		mongoose.model('SharedData').findOne({}, (err, sharedData) => {
			if (!err && sharedData){
				let result = [];
				for(let dt of sharedData.deTai){
					result.push(dt.maDeTai);
				}
				resolve(result);
			}
			else {
				resolve([])
			}
		})
	});
}

global.myCustomVars.promises.getMaDeTai = getMaDeTai;

var addMaDeTai = (maDeTai, tenDeTai, donViChuTri) => {
	return new Promise((resolve, reject) => {
		async(() => {
			maDeTai = maDeTai.trim();
			if (!maDeTai){
				resolve({
					status: 'error',
					error: 'Mã đề tài không hợp lệ'
				})
			}
			let maDeTais = await(getMaDeTai());
			if (maDeTais.indexOf(maDeTai) >= 0){
				resolve({
					status: 'error',
					error: 'Mã đề tài đã tồn tại'
				})
			}
			else {
				mongoose.model('SharedData').findOne({}, (err, sharedData) => {
					if (err || !sharedData){
						console.log(err);
						return resolve({
							status: 'error',
							error: 'Có lỗi xảy ra. Vui lòng thử lại'
						})
					}
					sharedData.deTai.push({
						maDeTai: maDeTai,
						tenDeTai: tenDeTai,
						donViChuTri: donViChuTri
					});
					sharedData.save((err) => {
						if (err){
							console.log(err);
							resolve({
								status: 'error',
								error: 'Có lỗi trong khi thêm Đề tài mới. Vui lòng thử lại'
							})
						}
						else {
							resolve({
								status: 'success'
							})
						}
					})
				})
			}
		})()
	})
}

global.myCustomVars.promises.addMaDeTai = addMaDeTai;

var getUserRoles = (userId) => {
	return new Promise((resolve, reject) => {
		acl.userRoles(userId, (err, roles) => {
			// console.log('promised userRoles called');
			if (err){
				resolve([])
			}
			else {
				resolve(roles)
			}
		})
	})
}

global.myCustomVars.promises.getUserRoles = getUserRoles;

var getUser = (userId) => {
	return new Promise((resolve, reject) => {
		mongoose.model('User').findById(userId, (err, user) => {
			if (err || !user){
				console.log(err);
				resolve(null);
			}
			else{
				resolve(user)
			}
		})
	})
}

global.myCustomVars.promises.getUser = getUser;

var getUsers = () => {
	return new Promise((resolve, reject) => {
		mongoose.model('User').find({}, (err, users) => {
			if (err || !users){
				console.log(err);
				resolve({usersMongoose: [], usersNormal: []});
			}
			else{
				async(() => {
					let users_ = JSON.parse(JSON.stringify(users));
					for(let i = 0; i < users_.length; i++){
						var u = users_[i];
						var userRoles = await(new Promise((resolve_, reject_) => {
							acl.userRoles(u._id, (err, roles) => {
								// console.log('promised userRoles called');
								if (err){
									console.log(err);
									resolve_([])
								}
								else {
									resolve_(roles)
								}
							})
						}))
						// console.log('userRoles done');
						// console.log(userRoles);
						if (userRoles.indexOf('admin') >= 0){
							// console.log('admin ' + u._id);
							u.level = 'admin';
						}
						else if (userRoles.indexOf('manager') >= 0){
							// console.log('manage ' + u._id);
							u.level = 'manager';
						}
						else {
							// console.log('user ' + u._id);
							u.level = 'user'
							if (!u.maDeTai){
								// console.log('pending user ' + u._id);
								u.level = 'pending-user';
							}
						}
					}
					// console.log('this');
					// console.log(users);
					resolve({
						usersMongoose: users, // Có Schema, không thể thêm hay bớt property
						usersNormal: users_   // Object JS thường, có thể thêm bớt thuộc tính
					});
				})()
				
			}
		})
	})
}

global.myCustomVars.promises.getUsers = getUsers;

var userHasRole = (userId, role) => {
	return new Promise((resolve, reject) => {
		mongoose.model('User').findById(userId, (err, user) => {
			if (err || !user){
				resolve(false)
			}
			else {
				acl.userRoles(userId, (err, roles) => {
					if (err){
						return resolve(false);
					}
					else if (roles.indexOf(role) >= 0){
						resolve(true);
					}
					else {
						resolve(false)
					}
				})
			}
		})
	})
}

global.myCustomVars.promises.userHasRole = userHasRole;