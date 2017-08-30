
// ============== Init ACL =======================

var acl = require('acl');
acl = new acl(new acl.memoryBackend());
require('./config/acl.js')(acl);
const path = require('path');
const fs = require('fs');
const fsE = require('fs-extra');
const TMP_UPLOAD_DIR = 'public/uploads/tmp';
const ROOT = path.join(__dirname);

// place all global Promises inside this object
global.myCustomVars.promises = {}

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
			// console.log('result: ', result);
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

// rename(req.files[element.name], objectChild(objectInstance, element.schemaProp)[element.name], _UPLOAD_DESTINATION, result.id);
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
	objectInstance = JSON.parse(JSON.stringify(objectInstance));
	var result = {};
	_PROP_FIELDS.map(function (element) {
		if (element.type.localeCompare('Date') === 0){
			result[element.name] = new Date(objectChild(objectInstance, element.schemaProp)[element.name]);
		}
		else {
			result[element.name] = objectChild(objectInstance, element.schemaProp)[element.name];
		}
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
	var _UPLOAD_DESTINATION = variablesBundle.UPLOAD_DESTINATION;
	// console.log(variablesBundle.UPLOAD_DESTINATION);
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
			objectInstance.created_by.userId = req.user.id // creator
			objectInstance.created_by.userFullName = req.user.fullname // creator
			objectInstance.owner.userId = req.user.id // Owner
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
					return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], ["Thiếu tham số", element.name]);
				}
			}

			// Check required
			if (element.type.localeCompare('Mixed') !== 0) {
				// Check required data props if action is create
				if (element.required && (element.type.localeCompare('File') != 0) && (!(element.name in req.body) || !(req.body[element.name]))) {
					console.log('response error');
					return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], ["Thiếu tham số", element.name]);
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
								return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], [element.name + ' không được ngắn hơn ' + element.min + ' ký tự', element.name]);
							}
						}

						if ('max' in element){
							if (value.length > element.max){
								return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], [element.name + ' không được ngắn hơn ' + element.max + ' ký tự', element.name]);
							}
						}
						if ('regex' in element){
							var regex = new RegExp(element.regex);
							if (regex.test(value) === false){
								return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], ['Sai định dạng', element.name]);
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
							return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], [label + ' phải là số nguyên', element.name])
						}
					}
					// Không break.
				case 'Number':
					if ('min' in element){
						if (parseFloat(req.body[element.name]) < element.min){
							return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], [element.name + ' không được nhỏ hơn ' + element.min, element.name]);
						}
					}

					if ('max' in element){
						if (parseFloat(req.body[element.name]) > element.max){
							return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], [element.name + ' không được lớn hơn ' + element.max, element.name]);
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
								return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], ['Không đúng định dạng ngày tháng', element.name])
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
									return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], ['File thiếu định dạng', element.name]);
								}

								fn_[fn_.length - 1] = fn_[fn_.length - 1].toLowerCase();
								file.originalname = fn_.join('.')
								// console.log(file.originalname)

								// Now, test the name of file

								if (!regex.test(file.originalname)){
									// console.log(regex);
									// console.log(file.originalname);
									return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], ['Tên file trong trường không hợp lệ', element.name]);
								}
							}
						}
					}
					if (element.hasOwnProperty('maxSize')){
						// Check maxium file size
						// console.log(req.files)
						if (req.files && (element.name in req.files)){
							var files = req.files[element.name];
							var maxFileSize = parseInt(element.maxSize);
							for(var file of files){
								// console.log(file)
								var fileSize = parseInt(file.size); // bytes
								if (fileSize > maxFileSize){
									return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], ['Kích thước file tối đa là ' + (maxFileSize / 1024 / 1024).toFixed(2) + ' MB', element.name])
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
											return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], ['Sai định dạng', e.name]);
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
								return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], ['Thiếu tham số', element.name]);
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
					return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], ['Dữ liệu nhập vào không hợp lệ', errField]);
				}
				catch (e){
					console.log(err);
					console.log('Server error');
				}
				return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error'], ['Error while saving to database']);
			}
			const currentTmpFiles = fs.readdirSync(path.join(ROOT, TMP_UPLOAD_DIR), {encoding: 'utf8'});
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
					// rename(req.files[element.name], objectChild(animal, element.schemaProp), UPLOAD_DESTINATION, result.id);

					if (action == ACTION_EDIT){
						
						// TODO
						// need to delete old files.
						// console.log('delete old files');

						// 
						// NOW we don't need to delete old files.
						// have a new API to to that
						// the remaining files are actually necessary
						// var files = objectChild(objectInstance, element.schemaProp)[element.name];
						// // console.log(files);
						// for (var j = 0; j < files.length; j++) {
						// 	// fs.unlinkSync(path.join(_UPLOAD_DESTINATION, files[j]));
						// 	try {
						// 		fs.unlinkSync(path.join(_UPLOAD_DESTINATION, files[j]));
						// 		console.log('deleted ' + files[j])
						// 	}
						// 	catch (e){
						// 		console.log('delete failed ' + files[j])
						// 		console.log(e)
						// 	}
						// }
						// var files = objectChild(objectInstance, element.schemaProp)[element.name];
						// // console.log(files);
						// if(files instanceof Array) {
						// 	for (var j = 0; j < files.length; j++) {
						// 		// fs.unlinkSync(path.join(_UPLOAD_DESTINATION, files[j]));
						// 		try {
						// 			fs.unlinkSync(path.join(_UPLOAD_DESTINATION, files[j]));
						// 			console.log('deleted ' + files[j])
						// 		}
						// 		catch (e){
						// 			console.log('delete failed ' + files[j])
						// 			console.log(e)
						// 		}
						// 	}
						// }

					}
					objectChild(objectInstance, element.schemaProp)[element.name] = [];
					rename(req.files[element.name], element.name, objectChild(objectInstance, element.schemaProp)[element.name], _UPLOAD_DESTINATION, result.id);
					// rename(req.files[element.name], objectChild(objectInstance, element.schemaProp)[element.name], _UPLOAD_DESTINATION, result.id);
				}

				// Thêm các file được tải lên bằng route /content/instant-upload vào trong mẫu vật.
				// (các file được tải lên trong khi người dùng đang nhập liệu, trước khi mẫu vật được thực sự tạo ra)
				
				let randomStr = req.body.randomStr;
				currentTmpFiles.map((fileName) => {
					let prefix = req.body.randomStr + STR_SEPERATOR + element.name + STR_SEPERATOR;
					if (fileName.indexOf(prefix) == 0) {
						let curFullName = fileName.split(STR_SEPERATOR);
						curFullName[0] = result.id;
						let newFullName = curFullName.join(STR_SEPERATOR);
						fsE.moveSync(
							path.join(ROOT, TMP_UPLOAD_DIR, fileName),
							path.join(ROOT, _UPLOAD_DESTINATION, newFullName),
							{overwrite: true}
						);
						objectChild(objectInstance, element.schemaProp)[element.name].push(newFullName)
					}
				});
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

var exportFilePromise = (objectInstance, options, extension) => {
	let docxHTMLSource = fs.readFileSync(path.join(__dirname, 'templates', 'header.html')).toString('utf-8');
	let PROP_FIELDS = options.PROP_FIELDS;

	let ObjectModel = options.ObjectModel;
	let LABEL = options.LABEL;
	let UPLOAD_DESTINATION = options.UPLOAD_DESTINATION;
	let paragraph = options.paragraph;
	let objectModelName = options.objectModelName;
	let printedProperties = options.req.body;
	let IMG_MAX_WIDTH = 300;
	let IMG_MAX_HEIGHT = 300;
	let printAll = !(('body' in options.req) && (options.req.body.custom == 1))

	// const images = require('images');
	const images = require('image-size');
	// function to encode file data to base64 encoded string
	function base64_encode(file) {
		// read binary data
		var bitmap = fs.readFileSync(file);
		// convert binary data to base64 encoded string
		return new Buffer(bitmap).toString('base64');
	}
	let img2HTML = (imgpath, maxWidth, maxHeight) => {
		let image = images(imgpath);
		let width = image.width;
		let height = image.height;
		let newWidth = -1;
		let newHeight = -1;
		if ((width <= maxWidth) && (height <= maxHeight)){
			newWidth = width;
			newHeight = height;
		} else {
			if (width / maxWidth < height / maxHeight){
				// scale height
				let rate = height / maxHeight;
				// console.log('rate:', rate)
				newHeight = height / rate;
				newWidth = width / rate;
			} else {
				// scale width
				let rate = width / maxWidth;
				// console.log('rate:', rate)
				newHeight = height / rate;
				newWidth = width / rate;
			}
		}
		newWidth = Math.round(newWidth);
		newHeight = Math.round(newHeight);
		// console.log('new size:', newWidth, ' x ', newHeight);
		let base64str = base64_encode(imgpath);
		let extension = imgpath.substring(imgpath.lastIndexOf('.') + 1).toLowerCase();
		let MIME = {
			jpg: 'jpeg',
			jpeg: 'jpeg',
			gif: 'gif',
			png: 'png'
		}
		if (MIME.hasOwnProperty(extension)) {
			let mime = MIME[extension];
			return `<img src="data:image/${mime};base64,${base64str}" width='${newWidth}' height='${newHeight}'/>`
		} else {
			return ''
		}
	}
	return new Promise((RESOLVE, REJECT) => {
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

			if (objectInstance.flag.fDiaDiemThuMau == 'bien'){
				for(var i = 0; i < PROP_FIELDS.length; i++){
					var field = PROP_FIELDS[i];
					if (['tinh', 'huyen', 'xa'].indexOf(field.name) >= 0){
						field.required = false;
						field.money = false;
						// console.log(field.name);
					}
				}
			}
			else if (objectInstance.flag.fDiaDiemThuMau == 'dao'){
				for(var i = 0; i < PROP_FIELDS.length; i++){
					var field = PROP_FIELDS[i];
					if (['huyen', 'xa'].indexOf(field.name) >= 0){
						field.required = false;
						field.money = false;
						// console.log(field.name);
					}
				}
			}
			else if (objectInstance.flag.fDiaDiemThuMau == 'dat-lien'){
				// Không cần làm gì, vì tinh, huyen, xa đã mặc định là money = true
			}

			try {
				// Quốc gia khác, không phải Việt Nam
				let qg = objectInstance.duLieuThuMau.diaDiemThuMau.quocGia;
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
					// var result =  obj.reduce(function (preStr, curElement, curIndex){
					// 	// console.log(curElement.split('_+_')[1]);
					// 	// preStr += curElement.split('_+_')[1];
					// 	preStr += curElement.substring(curElement.lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length);
					// 	if (curIndex < obj.length - 1){
					// 		preStr += ', \n\n';
					// 	}
					// 	return preStr;
					// }, '');
					// return result;
					return (obj.length < 1) ? '' : obj;
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
							// table.push(row);
							docxHTMLSource += `
								<tr>
									<td colspan="4" class="bg td"><p class="tnr lb"><b>${p}</b></p></td>
								</tr>
							`
							
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
								if (printAll || (prop in printedProperties)){
									// table.push(row);
									if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].type !== 'File'){
										docxHTMLSource += `
										<tr>
											<td class="td"><p class="tnrlb">${stt}</p></td>
											<td class="td"><p class="tnr">${p}</p></td>
											<td class="td"><p class="tnr">${value}</p></td>
											<td class="td"></td>
										</tr>
										`
									} else {
										let td = ``;
										for(let iidx = 0; iidx < value.length; iidx++) {
											if (['jpg', 'jpeg', 'gif', 'png', 'tif', 'tiff', 'raw', 'bmp', 'bpg', 'eps'].indexOf(value[iidx].substring(value[iidx].lastIndexOf('.') + 1).toLowerCase()) >= 0) {
												td += img2HTML(path.join(__dirname, UPLOAD_DESTINATION, value[iidx]), IMG_MAX_WIDTH, IMG_MAX_HEIGHT) + '<br /><br />\n\n';
											} else {
												td += '<p class="tnr">' + display(value[iidx].substring(value[iidx].lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length)) + '</p>'
											}
										}
										docxHTMLSource += `
										<tr>
											<td class="td"><p class="tnrlb">${stt}</p></td>
											<td class="td"><p class="tnr">${p}</p></td>
											<td class="td">${td}</td>
											<td class="td"></td>
										</tr>
										`
									}
									
								}
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
							// Xử lý có thêm 1 dòng cho các thuộc tính mixed hay không.
							// Có thể cứ in ()
							// hoặc là xét xem các thuộc tính con có giá trị thì mới in
							let subProps;
							let flagHasRealChildren = false; // Oánh dấu nếu thuộc tính này có các thuộc tính con thực sự có gía trị
							if (curProp.indexOf('Mixed') >= 0){
								let element_ = PROP_FIELDS[PROP_FIELDS_OBJ[curProp.substring(0, curProp.length - 5)]]
								subProps = element_.subProps;
								// Với curPop == 'kichThuocMau', subProps = ['chieuCao', 'chieuRong', 'chieuDai', 'trongLuong', 'theTich']
								// Tiện vl. :-D
							}
							else {
								// console.log('get', curProp);
								subProps = [];
								for(let k in flatOI){
									try {
										if (PROP_FIELDS[PROP_FIELDS_OBJ[k]].schemaProp.indexOf('.' + curProp) >= 0){
											subProps.push(k);
										}
									}
									catch (e){
										// console.log(e);
									}
								}
							}
							// console.log(subProps);
							if (subProps instanceof Array){
								for(let j = 0; j < subProps.length; j++){
									let sp = subProps[j];
									if (printAll || (display(flatOI[sp]) && (sp in printedProperties))) {
										flagHasRealChildren = true;
										break;
									}
								}
							}
							else {
								flagHasRealChildren = true;
							}
							if (addPropRow && flagHasRealChildren){
								// Thêm 1 dòng cho các thể loại: Thông tin khác, Phân bố Việt Nam, các thuộc tính mixed
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
								// table.push(row);
								docxHTMLSource += `
									<tr>
										<td class="td"><p class="tnrlb">${stt}</p></td>
										<td class="td"><p class="tnr">${curProp}</p></td>
										<td class="td"><p class="tnr"></p></td>
										<td class="td"></td>
									</tr>
									`
								addPropRow = false;
							} else {
								// console.log('khong in', curProp, 'prop row', addPropRow);
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
								if (printAll || (prop in printedProperties)){
									// table.push(row);
									// docxHTMLSource += `
									// <tr>
									// 	<td class="td"><p class="ct tnr lb"></p></td>
									// 	<td class="td"><p class="tnri">${p}</p></td>
									// 	<td class="td"><p class="tnr">${value}</p></td>
									// 	<td class="td"></td>
									// </tr>
									// `
									if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].type !== 'File'){
										docxHTMLSource += `
										<tr>
											<td class="td"><p class="ct tnr lb"></p></td>
											<td class="td"><p class="tnri">${p}</p></td>
											<td class="td"><p class="tnr">${value}</p></td>
											<td class="td"></td>
										</tr>
										`
									} else {
										let td = ``;
										for(let iidx = 0; iidx < value.length; iidx++) {
											if (['jpg', 'jpeg', 'gif', 'png', 'tif', 'tiff', 'raw', 'bmp', 'bpg', 'eps'].indexOf(value[iidx].substring(value[iidx].lastIndexOf('.') + 1).toLowerCase()) >= 0) {
												td += img2HTML(path.join(__dirname, UPLOAD_DESTINATION, value[iidx]), IMG_MAX_WIDTH, IMG_MAX_HEIGHT) + '<br /><br />\n\n';
											} else {
												td += '<p class="tnr">' + display(value[iidx].substring(value[iidx].lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length)) + '</p>'
											}
											// td +=  '<img src="" >\n';
										}
										docxHTMLSource += `
										<tr>
											<td class="td"><p class="ct tnr lb"></p></td>
											<td class="td"><p class="tnri">${p}</p></td>
											<td class="td">${td}</td>
											<td class="td"></td>
										</tr>
										`
									}
								}
								
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
			// var officegen = require('officegen');
			// var docx = officegen({
			// 	type: 'docx',
			// 	subjects: 'Mẫu phiếu dữ liệu',
			// 	orientation: 'landscape'
			// 	// orientation: 'portrait'
			// });

			// docx.on('finalize', function (written) {
			// 	console.log("Docx: written " + written + " bytes.");
			// });

			// docx.on('error', function (error) {
			// 	console.log("Docx: Error");
			// 	console.log(error);
			// 	console.log("===");
			// })

			docxHTMLSource += '<div class="row" id="pcsdl-title">';
			for(var i = 0; i < paragraph.text.length; i++){
				docxHTMLSource += `<p class="ptitle">${paragraph.text[i]}</p>`
				// var pObj = docx.createP();
				// pObj.options.align = "center";
				// pObj.addText(paragraph.text[i] + '\n\n', paragraph.style[i]);
			}

			var flatOI = flatObjectModel(PROP_FIELDS, objectInstance);

			// var pObj = docx.createP();
			// pObj.options.align = "center";
			// pObj.addText('Mã đề tài: ' + display(flatOI.maDeTai), {color: '000000', bold: true, font_face: 'Times New Roman', font_size: 12});
			docxHTMLSource += `<p class='ptitle'>Mã đề tài: ${display(flatOI.maDeTai)}</p>`
			docxHTMLSource += '</div>';

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
				}) // Delete subProps
			}

			var PROP_FIELDS_OBJ = {};

			PROP_FIELDS.map(function (element, index) {
				PROP_FIELDS_OBJ[element.name] = index;
			});

			// Một số trường như loaiMauVat, giaTriSuDung cho phép nhiều thuộc tính, cần loại bỏ STR_AUTOCOMPLETION_SEPERATOR (thường là _-_)

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
			
			docxHTMLSource += `
				<table id='maintable'>
					<tbody>
						<tr>
							<th class="td"><p class="ct tnr lb">STT</p></th>
							<th class="td"><p class="ct tnr lb">Trường dữ liệu</p></th>
							<th class="td"><p class="ct tnr lb">Nội dung</p></th>
							<th class="td"><p class="ct tnr lb">Ghi chú</p></th>
						</tr>
			`
			

			inOrder(oi);

			var tableStyle = {
				tableColWidth: 3200,
				// tableSize: 200,
				// tableColor: "ada",
				tableAlign: "left",
				tableFontFamily: "Times New Roman",
				borders: true
			}

			// docx.createTable (table, tableStyle);

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

			docxHTMLSource += `</tbody></table>`

			// pObj = docx.createP();
			// pObj.options.align = "left";
			// pObj.addText('', {color: '000000', bold: true, font_face: 'Times New Roman', font_size: 12});
			docxHTMLSource += '<p class="tnr b"></p><br />'

			// statistics
			// pObj = docx.createP();
			// pObj.options.align = "left";
			// pObj.addText('Số trường bắt buộc đã nhập: ' + statistics.moneyPropFilled + '/' + statistics.totalMoneyProp + '.', {color: '000000', font_face: 'Times New Roman', font_size: 12});
			docxHTMLSource += `<p class="tnr b">Số trường bắt buộc đã nhập: ${statistics.moneyPropFilled}/${statistics.totalMoneyProp}.</p>`

			// pObj = docx.createP();
			// pObj.options.align = "left";
			// pObj.addText('Số trường không bắt buộc đã nhập: ' + statistics.nonMoneyPropFilled + '/' + statistics.totalNonMoneyProp + '.', {color: '000000', font_face: 'Times New Roman', font_size: 12});
			docxHTMLSource += `<p class="tnr b">Số trường không bắt buộc đã nhập: ${statistics.nonMoneyPropFilled}/${statistics.totalNonMoneyProp}.</p>`

			
			try {
				// pObj = docx.createP();
				// pObj.options.align = "left";
				// pObj.addText('Phê duyệt: ' + (objectInstance.flag.fApproved ? 'Đã phê duyệt' : 'Chưa phê duyệt'), {color: '000000', font_face: 'Times New Roman', font_size: 12});
				docxHTMLSource += `<p class='tnr'>Phê duyệt: ${(objectInstance.flag.fApproved ? 'Đã phê duyệt' : 'Chưa phê duyệt')}</p>`
			}
			catch (e){
				console.log(e);
			}

			// var fs = require('fs');
			var tmpFileName = (new Date()).getTime() + '.tmp.docx';
			/*
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
					// res.download(path.join(__dirname, tmpFileName), outputFileName, function (err) {
					// 	try {
					// 		fs.unlinkSync(path.join(__dirname, tmpFileName));
					// 	}
					// 	catch (e){
					// 		console.log(e);
					// 	}
					// });
					RESOLVE({
						status: 'success',
						absoluteFilePath: {
							docx: path.join(__dirname, tmpFileName)
						},
						outputFileName: {
							docx: outputFileName
						}
					})
				}
				else if (extension == 'pdf'){
					console.log('pdf');
					outputDocxFileName = outputFileName + '.docx';
					outputFileName += '.pdf';
					var exec = require('child_process').exec;
					var cmd = 'cd ' + __dirname + ' && ' + require('./config/config.js').libreoffice + ' --invisible --convert-to pdf ' + tmpFileName;
					console.log('starting: ' + cmd);
					console.log(objectInstance.id);
					exec(cmd, function (err, stdout, stderr) {
						if (err){
							console.log(err);
							try {
								fs.unlinkSync(path.join(__dirname, tmpFileName));
							}
							catch (e){
								console.log(e);
							}
							RESOLVE({
								status: 'error',
								error: 'error while converting to pdf'
							})
						}
						console.log('--out-')
						console.log(stdout);
						console.log('--err-')
						console.log(stderr);
						console.log('--end-')
						pdfFileName = tmpFileName.substring(0, tmpFileName.length - 'docx'.length) + 'pdf';
						// console.log(pdfFileName);
						// console.log(outputFileName);
						// res.download(path.join(__dirname, pdfFileName), outputFileName, function (err) {
							// try {
								// fs.unlinkSync(path.join(__dirname, pdfFileName));
								// fs.unlinkSync(path.join(__dirname, tmpFileName)); 
							// }
							// catch (e){
							// 	console.log(e);
							// }
						// });
						RESOLVE({
							status: 'success',
							absoluteFilePath: {
								docx: path.join(__dirname, tmpFileName),
								pdf: path.join(__dirname, pdfFileName),
							},
							outputFileName: {
								docx: outputDocxFileName,
								pdf: outputFileName
							}
						})
					})
					// return res.end("ok")

				}
				// res.end("OK");
			});
			docx.generate(outputStream); */
			docxHTMLSource += fs.readFileSync(path.join(__dirname, 'templates', 'footer.html'));
			var HtmlDocx = require('html-docx-js');
			// var docx = HtmlDocx.asBlob(docxHTMLSource, {orientation: 'portrait'});
			var docx = HtmlDocx.asBlob(docxHTMLSource, {orientation: 'landscape'});
			// fs.writeFileSync('out.html', docxHTMLSource);
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
			fs.writeFile(tmpFileName, docx, function(err) {
				if (err) throw err;
				if (extension == 'docx'){
					outputFileName += '.docx';
					// res.download(path.join(__dirname, tmpFileName), outputFileName, function (err) {
					// 	try {
					// 		fs.unlinkSync(path.join(__dirname, tmpFileName));
					// 	}
					// 	catch (e){
					// 		console.log(e);
					// 	}
					// });
					RESOLVE({
						status: 'success',
						absoluteFilePath: {
							docx: path.join(__dirname, tmpFileName)
						},
						outputFileName: {
							docx: outputFileName
						}
					})
				}
				else if (extension == 'pdf'){
					console.log('pdf');
					const HTMLPDF = require('html-pdf');
					outputDocxFileName = outputFileName + '.docx';
					outputFileName += '.pdf';
					pdfFileName = tmpFileName.substring(0, tmpFileName.length - 'docx'.length) + 'pdf';
					HTMLPDF.create(docxHTMLSource, {format: 'A4', orientation: 'landscape', border: "1cm"}).toFile(pdfFileName, (err, result) => {
						console.log('create pdf done');
						if (err){
							console.log(err);
							try {
								fs.unlinkSync(path.join(__dirname, tmpFileName));
							}
							catch (e){
								console.log(e);
							}
							RESOLVE({
								status: 'error',
								error: 'error while converting to pdf'
							})
						}
						RESOLVE({
							status: 'success',
							absoluteFilePath: {
								docx: path.join(__dirname, tmpFileName),
								pdf: path.join(__dirname, pdfFileName),
							},
							outputFileName: {
								docx: outputDocxFileName,
								pdf: outputFileName
							}
						})
					})
					// var exec = require('child_process').exec;
					// var cmd = 'cd ' + __dirname + ' && ' + require('./config/config.js').libreoffice + ' --invisible --convert-to pdf ' + tmpFileName;
					// console.log('starting: ' + cmd);
					console.log(objectInstance.id);
					/*
					exec(cmd, function (err, stdout, stderr) {
						if (err){
							console.log(err);
							try {
								fs.unlinkSync(path.join(__dirname, tmpFileName));
							}
							catch (e){
								console.log(e);
							}
							RESOLVE({
								status: 'error',
								error: 'error while converting to pdf'
							})
						}
						console.log('--out-')
						console.log(stdout);
						console.log('--err-')
						console.log(stderr);
						console.log('--end-')
						
						// console.log(pdfFileName);
						// console.log(outputFileName);
						// res.download(path.join(__dirname, pdfFileName), outputFileName, function (err) {
							// try {
								// fs.unlinkSync(path.join(__dirname, pdfFileName));
								// fs.unlinkSync(path.join(__dirname, tmpFileName)); 
							// }
							// catch (e){
							// 	console.log(e);
							// }
						// });
						RESOLVE({
							status: 'success',
							absoluteFilePath: {
								docx: path.join(__dirname, tmpFileName),
								pdf: path.join(__dirname, pdfFileName),
							},
							outputFileName: {
								docx: outputDocxFileName,
								pdf: outputFileName
							}
						})
					}) */
					// return res.end("ok")

				}
			});


			// Assume objectInstance is a tree (JSON),
			// with depth <= 3
		})();
	})
}

function exportFile (objectInstance, options, res, extension) {
	// console.log(options);
	async (() => {
		let result = await (exportFilePromise(objectInstance, options, extension));
		// console.log(result);
		if (result.status == 'success'){
			if (['docx', 'pdf'].indexOf(extension) >= 0){
				res.download(result.absoluteFilePath[extension], result.outputFileName[extension], function (err) {
					try {
						fs.unlinkSync(result.absoluteFilePath[extension]);
						fs.unlinkSync(result.absoluteFilePath.docx); // nếu extension là pdf thì cần xóa cả file này
					}
					catch (e){
						console.log(e);
					}
				});
			}
			else {
				return res.end('invalid extension');
			}
		}
		else {
			return res.end('err')
		}
	})()
}

global.myCustomVars.exportFile = exportFile;

var exportXLSXPromise = (objectInstance, options, extension) => {
	let PROP_FIELDS = options.PROP_FIELDS;
	let ObjectModel = options.ObjectModel;
	let LABEL = options.LABEL;
	let paragraph = options.paragraph;
	let objectModelName = options.objectModelName;
	let printedProperties = options.req.body;
	let printAll = !(('body' in options.req) && (options.req.body.custom == 1))

	return new Promise((RESOLVE, REJECT) => {
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

			if (objectInstance.flag.fDiaDiemThuMau == 'bien'){
				for(var i = 0; i < PROP_FIELDS.length; i++){
					var field = PROP_FIELDS[i];
					if (['tinh', 'huyen', 'xa'].indexOf(field.name) >= 0){
						field.required = false;
						field.money = false;
						// console.log(field.name);
					}
				}
			}
			else if (objectInstance.flag.fDiaDiemThuMau == 'dao'){
				for(var i = 0; i < PROP_FIELDS.length; i++){
					var field = PROP_FIELDS[i];
					if (['huyen', 'xa'].indexOf(field.name) >= 0){
						field.required = false;
						field.money = false;
						// console.log(field.name);
					}
				}
			}
			else if (objectInstance.flag.fDiaDiemThuMau == 'dat-lien'){
				// Không cần làm gì, vì tinh, huyen, xa đã mặc định là money = true
				
			}

			try {
				// Quốc gia khác, không phải Việt Nam
				let qg = objectInstance.duLieuThuMau.diaDiemThuMau.quocGia;
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
						// preStr += curElement.split('_+_')[1];
						preStr += curElement.substring(curElement.lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length);
						if (curIndex < obj.length - 1){
							preStr += ', \n\n';
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

							
							
							if (value){
								if (printAll || (prop in printedProperties)){
									setCell(sheet, 1, sheetRowIndex, stt, labelOpts);
									setCell(sheet, 2, sheetRowIndex, p, detailOpts);
									setCell(sheet, 3, sheetRowIndex, value, detailOpts);
									sheetRowIndex++;
								}


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
							// Xử lý có thêm 1 dòng cho các thuộc tính mixed hay không.
							// Có thể cứ in ()
							// hoặc là xét xem các thuộc tính con có gía trị thì mới in
							let subProps;
							let flagHasRealChildren = false; // Óanh dấu nếu thuộc tính này có các thuộc tính con thực sự có gía trị
							if (curProp.indexOf('Mixed') >= 0){
								let element_ = PROP_FIELDS[PROP_FIELDS_OBJ[curProp.substring(0, curProp.length - 5)]]
								subProps = element_.subProps;
								// Với curPop == 'kichThuocMau', subProps = ['chieuCao', 'chieuRong', 'chieuDai', 'trongLuong', 'theTich']
								// Tiện vl. :-D
							}
							else {
								// console.log('get', curProp);
								subProps = [];
								for(let k in flatOI){
									try {
										if (PROP_FIELDS[PROP_FIELDS_OBJ[k]].schemaProp.indexOf('.' + curProp) >= 0){
											subProps.push(k);
										}
									}
									catch (e){
										// console.log(e);
									}
								}
							}
							if (subProps instanceof Array){
								for(let j = 0; j < subProps.length; j++){
									let sp = subProps[j];
									if (display(flatOI[sp]) && (sp in printedProperties)){
										flagHasRealChildren = true;
										break;
									}
								}
							}
							else {
								flagHasRealChildren = true;
							}
							if (addPropRow && flagHasRealChildren){
								try{
									curProp = LABEL[curProp];
								}
								catch (e){
									console.log(e);
									// Do not care;
									// break;
								}
								setCell(sheet, 1, sheetRowIndex, stt, labelOpts);
								setCell(sheet, 2, sheetRowIndex, curProp, detailOpts);
								sheetRowIndex++;

								addPropRow = false;
							}
							
							
							// console.log(p + ' : ' + value)
							if (value){

								if (printAll || (prop in printedProperties)){
									setCell(sheet, 2, sheetRowIndex, p, detailItalicOpts);
									setCell(sheet, 3, sheetRowIndex, value, detailOpts);
									sheetRowIndex++;
								}

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
				}) // Delete subProps
			}

			var PROP_FIELDS_OBJ = {};

			PROP_FIELDS.map(function (element, index) {
				PROP_FIELDS_OBJ[element.name] = index;
			});

			// Một số trường như loaiMauVat, giaTriSuDung cho phép nhiều thuộc tính, cần loại bỏ STR_AUTOCOMPLETION_SEPERATOR (thường là _-_)

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
			workbook.save(function (err) {
				if (err){
					console.log(err);
					// return res.end('err');
					RESOLVE({
						status: 'error',
						error: 'error while saving workbook'
					})
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
					// res.download(path.join(__dirname, tmpFileName), outputFileName, function (err) {
					// 	try {
					// 		fs.unlinkSync(path.join(__dirname, tmpFileName));
					// 	}
					// 	catch (e){
					// 		console.log(e);
					// 	}
					// });
					RESOLVE({
						status: 'success',
						absoluteFilePath: {
							xlsx: path.join(__dirname, tmpFileName)
						} ,
						outputFileName: {
							xlsx: outputFileName
						}
					})
				}
			});
			// Assume objectInstance is a tree (JSON),
			// with depth <= 3
		})();
	})
}

function exportXLSX (objectInstance, options, res, extension) {
	async(() => {
		let result = await (exportXLSXPromise(objectInstance, options, extension));
		if (result.status == 'success'){
			res.download(result.absoluteFilePath.xlsx, result.outputFileName.xlsx, function (err) {
				try {
					fs.unlinkSync(result.absoluteFilePath.xlsx);
				}
				catch (e){
					console.log(e);
				}
			});
		}
		else {
			return res.end('error')
		}
	})();
}

global.myCustomVars.exportXLSX = exportXLSX;

var exportZipPromise = (objectInstance, options, extension) => {
	let PROP_FIELDS = options.PROP_FIELDS;
	let ObjectModel = options.ObjectModel;
	let LABEL = options.LABEL;
	let paragraph = options.paragraph;
	let objectModelName = options.objectModelName;

	return new Promise((RESOLVE, REJECT) => {
		async(() => {
			let exec = require('child_process').exec;
			let d = new Date();
			let tmpFolderName = 'tmp' + d.getTime();
			let absoluteFolderPath = path.join(__dirname, 'tmp', tmpFolderName);
			fs.mkdirSync(absoluteFolderPath);
			// console.log(result);
			// return res.end('ok')
			let result = await (exportFilePromise(objectInstance, options, 'pdf'));
			// console.log(result);
			if (result.status != 'success'){
				return RESOLVE({
					status: 'error',
					error: result.error
				})
			}
			let r = result;
			console.log(r);
			fs.renameSync(r.absoluteFilePath.docx, path.join(__dirname, 'tmp', tmpFolderName, r.outputFileName.docx));
			fs.renameSync(r.absoluteFilePath.pdf, path.join(__dirname, 'tmp', tmpFolderName, r.outputFileName.pdf));
			
			result = await (exportXLSXPromise(objectInstance, options, 'xlsx'));
			// console.log(result);
			if (result.status != 'success'){
				return RESOLVE({
					status: 'error',
					error: result.error
				})
			}
			let fileName = result.outputFileName.xlsx;
			fs.renameSync(result.absoluteFilePath.xlsx, path.join(__dirname, 'tmp', tmpFolderName, result.outputFileName.xlsx));
			let flatOI = flatObjectModel(PROP_FIELDS, objectInstance);
			// console.log('here process flatOI ' + Object.keys(flatOI).length);
			for(let i in flatOI){
				let arrFiles = flatOI[i];
				if (arrFiles instanceof Array){
					// console.log('processing files ' + arrFiles);
					arrFiles.map((file) => {
						try {
							fsE.copySync(
								path.join(__dirname, options.UPLOAD_DESTINATION, file), 
								path.join(
									__dirname, 
									'tmp',
									tmpFolderName, 
									file.substring(file.lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length)
								)
							);
						}
						catch (e){
							console.log(e);
						}
					})
				}
			}
			return RESOLVE({
				status: 'success',
				absoluteFolderPath: path.join(__dirname, 'tmp', tmpFolderName),
				tmpFolderName: tmpFolderName,
				fileName: fileName.substring(0, fileName.lastIndexOf('.')) ,
				flatOI: flatOI
			})
		})();
	})
}

function exportZip (objectInstance, options, res, extension) {
	async(() => {
		let result = await (exportZipPromise(objectInstance, options, extension));
		if (result.status == 'success'){
			let absoluteFolderPath = result.absoluteFolderPath;
			let d = new Date();
			let wrapperName = 'PCSDL_export-' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '_' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds();

			// wrapperName có prefix 'PCSDL_' là để client download file cho tiện. Xem app/service.js

			console.log(absoluteFolderPath);
			fs.mkdirSync(path.join(__dirname, 'tmp', wrapperName));
			let exec = require('child_process').exec;
			let fileName = result.fileName;
			fs.renameSync(absoluteFolderPath, path.join(__dirname, 'tmp', wrapperName, fileName));
			cmd = 'cd "' + path.join(__dirname, 'tmp') + '" && zip -r "' + wrapperName + '.zip" "' + wrapperName + '"';
			console.log(cmd);
			result = await (new Promise((resolve, reject) => {
				exec(cmd, function (err, stdout, stderr) {
					if (err){
						console.log(err);
						resolve({
							status: 'error',
							error: 'error while zipping folder'
						})
					}
					else {
						resolve({
							status: 'success'
						})
					}
				})
			}))
			if (result.status != 'success'){
				return res.end('error')
			}
			return res.download(path.join(__dirname, 'tmp', wrapperName + '.zip'), (err) => {
				if (err){
					console.log(err);
					return res.end(err);
				}
				try {
					fsE.removeSync(path.join(__dirname, 'tmp', wrapperName + '.zip'));
					fsE.removeSync(path.join(__dirname, 'tmp', wrapperName));
				}
				catch (e){
					console.log(e);
				}
			})
		}
		else {
			return res.end('error')
		}
	})();
	
}

var getAllHandler = function (options) {
	return function (req, res) {
		async(() => {
			// ObjectModel.find({deleted_at: {$eq: null}}, {}, {skip: 0, limit: 10, sort: {created_at: -1}}, function (err, objectInstances) {
			var ObjectModel = options.ObjectModel;
			var UPLOAD_DESTINATION = options.UPLOAD_DESTINATION;
			var PROP_FIELDS = options.PROP_FIELDS;
			var PROP_FIELDS_OBJ = options.PROP_FIELDS_OBJ;
			var objectModelNames = options.objectModelNames;
			var objectModelName = options.objectModelName;
			var selection = {deleted_at: {$eq: null}};
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
			// Default. User chỉ có thể xem những phiếu do chính mình tạo
			selection['owner.userId'] = req.user._id;

			if (userRoles.indexOf('manager') >= 0){
				// Chủ nhiệm đề tài có thể xem tất cả mẫu dữ liệu trong cùng đề tài
				delete selection['owner.userId'];
				selection['maDeTai.maDeTai'] = req.user.maDeTai;
			}

			if (userRoles.indexOf('admin') >= 0){
				// Admin, Xem tất
				delete selection['owner.userId']; // Xóa cả cái này nữa. Vì có thể có admin ko có manager role. :))
				delete selection['maDeTai.maDeTai'];
			}
			// ObjectModel.find(selection, {}, {skip: 0, limit: 10, sort: {created_at: -1}}, function (err, objectInstances) {
			
			// Filter
			for (let p in req.query) {
				let v = req.query[p].trim();
				if (p in PROP_FIELDS_OBJ){
					console.log('filter: ' + p);
					// console.log(PROP_FIELDS[PROP_FIELDS_OBJ[p]]);
					try {
						let prop = PROP_FIELDS[PROP_FIELDS_OBJ[p]];
						if (prop.type == 'String'){
							selection[prop.schemaProp + '.' + p] = new RegExp(v, 'i'); // bỏ qua chữ hoa chữ thường
						}
						else if (prop.type == 'Integer'){
							selection[prop.schemaProp + '.' + p] = parseInt(v);
						}
						else if (prop.type == 'Number'){
							selection[prop.schemaProp + '.' + p] = parseFloat(v);
						}
					}
					catch (e){
						console.log(e);
					}
				}
				else {
					console.log('unexpected: ' + p);
				}
			}
			// console.log(selection);
			ObjectModel.find(selection, {}, {sort: {created_at: -1}}, function (err, objectInstances) {
				if (err){
					console.log(err);
					return responseError(req, UPLOAD_DESTINATION, res, 500, ['error'], ['Error while reading database']);
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
						let tmp = objectInstances[i];
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
					})
				}
				catch (e){
					console.log(e);
				}
				// var d2 = new Date();
				// console.log("==================");
				// console.log("time: " + ((d2.getTime() - d1.getTime()) / 1000));
				// console.log("==================");
				return responseSuccess(res, ['status', objectModelNames, 'total'], ['success', objectInstances, objectInstances.length]);
			})
		})();
	}
}

global.myCustomVars.getAllHandler = getAllHandler;

var getAutoCompletionHandler = function (options) {
	return function (req, res) {
		// console.log(Object.keys(AutoCompletion.schema.paths));
		var AutoCompletion = options.AutoCompletion;
		var UPLOAD_DESTINATION = options.UPLOAD_DESTINATION;
		AutoCompletion.findOne({}, function (err, autoCompletion) {
			if (err){
				return responseError(req, UPLOAD_DESTINATION, res, 500, ['error'], ["Error while reading AutoCompletion data"]);
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

		var ObjectModel = options.ObjectModel;
		var objectModelName = options.objectModelName;
		var PROP_FIELDS = options.PROP_FIELDS;
		var UPLOAD_DESTINATION = options.UPLOAD_DESTINATION;
		var objectModelIdParamName = options.objectModelIdParamName;
		var objectBaseURL = options.objectBaseURL;
		var LABEL = options.LABEL;
		var objectModelLabel = options.objectModelLabel;
		options.req = req;
		ObjectModel.findById(req.params.objectModelIdParamName, function (err, objectInstance) {
			if (err){
				return responseError(req, UPLOAD_DESTINATION, res, 500, ['error'], ['Error while reading database']);
			}
			if (objectInstance){
				if (objectInstance.deleted_at){
					Log.find({action: {$eq: 'delete'}, "obj1._id": {$eq: mongoose.Types.ObjectId(req.params.objectModelIdParamName)}}, function (err, logs) {
						if (err || (logs.length < 1)){
							console.log(err);
							return responseError(req, UPLOAD_DESTINATION, res, 404, ['error'], ["Mẫu dữ liệu này đã bị xóa"]);
						}
						// console.log(logs);
						return responseError(req, UPLOAD_DESTINATION, res, 404, ['error'], ["Mẫu dữ liệu này đã bị xóa bởi " + logs[0].userFullName]);
					})
				}
				else {
					// return responseSuccess(res, ['objectInstance'], [objectInstance]);
					if (req.query.display == 'html'){
						return res.render('display', {title: 'Chi tiết mẫu ' + objectModelLabel, objectPath: objectBaseURL, count: 1, obj1: flatObjectModel(PROP_FIELDS, objectInstance), objectModelId: objectInstance.id, props: propsName(PROP_FIELDS), staticPath: UPLOAD_DESTINATION.substring(UPLOAD_DESTINATION.indexOf('public') + 'public'.length)});
					}
					else if (req.query.display == 'nested') {
						return responseSuccess(res, [objectModelName], [objectInstance]);
					}
					else if (['docx', 'pdf', 'xlsx', 'zip'].indexOf(req.query.display) >= 0){

						console.log('combined');
						
						var paragraph = options.paragraph;
						
						var exportFuncs = {
							docx: exportFile,
							pdf: exportFile,
							xlsx: exportXLSX,
							zip: exportZip
						}
						exportFuncs[req.query.display](objectInstance, options, res, req.query.display);
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
				responseError(req, UPLOAD_DESTINATION, res, 404, ['error'], ['Không tìm thấy']);
			}
		})
	}
}

global.myCustomVars.getSingleHandler = getSingleHandler;

var duplicateHandler = function (options) {
	return function (req, res) {

		var ObjectModel = options.ObjectModel;
		var objectModelName = options.objectModelName;
		var PROP_FIELDS = options.PROP_FIELDS;
		let PROP_FIELDS_OBJ = options.PROP_FIELDS_OBJ
		var UPLOAD_DESTINATION = options.UPLOAD_DESTINATION;
		var objectModelIdParamName = options.objectModelIdParamName;
		var objectBaseURL = options.objectBaseURL;
		var LABEL = options.LABEL;
		var objectModelLabel = options.objectModelLabel;
		options.req = req;
		ObjectModel.findById(req.body[objectModelIdParamName], function (err, objectInstance) {
			if (err){
				return responseError(req, UPLOAD_DESTINATION, res, 500, ['error'], ['Error while reading database']);
			}
			if (objectInstance){
				if (objectInstance.deleted_at){
					Log.find({action: {$eq: 'delete'}, "obj1._id": {$eq: mongoose.Types.ObjectId(req.body[objectModelIdParamName])}}, function (err, logs) {
						if (err || (logs.length < 1)){
							console.log(err);
							return responseError(req, UPLOAD_DESTINATION, res, 404, ['error'], ["Mẫu dữ liệu này đã bị xóa"]);
						}
						// console.log(logs);
						return responseError(req, UPLOAD_DESTINATION, res, 404, ['error'], ["Mẫu dữ liệu này đã bị xóa bởi " + logs[0].userFullName]);
					})
				}
				else {
					// TODO
					// Need to check if this user can view this data or not !!!
					let newInstance = new ObjectModel(objectInstance);
					newInstance._id = mongoose.Types.ObjectId();
					newInstance.isNew = true; // VERY IMPORTANT
					newInstance.created_at = new Date();
					delete newInstance.updated_at;
					newInstance.created_by = {
						userId: req.user._id,
						userFullName: req.user.fullname
					}
					delete newInstance.updated_by
					delete newInstance.deleted_by
					let tmp = flatObjectModel(PROP_FIELDS, newInstance);
					let duplicatedFiles = []
					for(p in tmp){
						if (tmp[p] instanceof Array){ // Chỉ có những trường file đính kèm thì mới là Array
							let files = tmp[p];
							objectChild(newInstance, PROP_FIELDS[PROP_FIELDS_OBJ[p]].schemaProp)[p] = []
							files.map((f, i) => {
								try {
									let duplicatedFileName = f.replace(objectInstance._id, newInstance._id);
									fsE.copySync(path.join(ROOT, UPLOAD_DESTINATION, f), path.join(ROOT, UPLOAD_DESTINATION, duplicatedFileName));
									duplicatedFiles.push(duplicatedFileName)
									objectChild(newInstance, PROP_FIELDS[PROP_FIELDS_OBJ[p]].schemaProp)[p].push(duplicatedFileName);
								} catch (e) {
									console.log(e);
								}
							})
						}
					}
					newInstance.save(err => {
						if (err) {
							console.log(err);
							for(f of duplicatedFiles) {
								try {
									fsE.removeSync(path.join(ROOT, UPLOAD_DESTINATION, f))
								} catch (e) {
									console.log(e);
								}
							}
							return responseError(req, UPLOAD_DESTINATION, res, 500, ['error'], [err])
						}
						let r = flatObjectModel(PROP_FIELDS, newInstance);
						r.id = r._id = newInstance._id;
						return responseSuccess(res, [objectModelName], [r])
					})
				}
			}
			else{
				responseError(req, UPLOAD_DESTINATION, res, 404, ['error'], ['Không tìm thấy']);
			}
		})
	}
}

global.myCustomVars.duplicateHandler = duplicateHandler;

var chownHandler = function (options) {
	return function (req, res) {

		var ObjectModel = options.ObjectModel
		var UPLOAD_DESTINATION = options.UPLOAD_DESTINATION
		var objectModelIdParamName = options.objectModelIdParamName
		var objectBaseURL = options.objectBaseURL
		var objectModelName = options.objectModelName
		var PROP_FIELDS = options.PROP_FIELDS
		var PROP_FIELDS_OBJ = options.PROP_FIELDS_OBJ
		var LABEL = options.LABEL
		var objectModelLabel = options.objectModelLabel
		options.req = req;
		var nullParam = checkUnNullParams([objectModelIdParamName, 'approved'], req.body);

		if (nullParam){
			return responseError(req, '', res, 400, ['error'], ['Thiếu ' + nullParam])
		}
		async(() => {
			let oi = await (new Promise((resolve, reject) => {
				ObjectModel.findById(req.body[objectModelIdParamName], function (err, objectInstance) {
					if (err){
						responseError(req, UPLOAD_DESTINATION, res, 500, ['error'], ['Error while reading database']);
						return resolve(null);
					}
					if (objectInstance){
						if (objectInstance.deleted_at){
							Log.find({action: {$eq: 'delete'}, "obj1._id": {$eq: mongoose.Types.ObjectId(req.body[objectModelIdParamName])}}, function (err, logs) {
								if (err || (logs.length < 1)){
									console.log(err);
									responseError(req, UPLOAD_DESTINATION, res, 404, ['error'], ["Mẫu dữ liệu này đã bị xóa"]);
									return resolve(null)
								}
								// console.log(logs);
								responseError(req, UPLOAD_DESTINATION, res, 404, ['error'], ["Mẫu dữ liệu này đã bị xóa bởi " + logs[0].userFullName]);
								return resolve(null)
							})
						}
						else {
							return resolve(objectInstance)
						}
					}
					else{
						responseError(req, UPLOAD_DESTINATION, res, 404, ['error'], ['Không tìm thấy']);
						return resolve(null)
					}
				})
			}))
			if (!oi) {
				return;
			}
			let maDeTai = oi.maDeTai.maDeTai;
			if (maDeTai != req.user.maDeTai) {
				return responseError(req, UPLOAD_DESTINATION, res, 403, ['error'], ['Mẫu dữ liệu này thuộc mã đề tài ' + maDeTai + ', không thuộc quyền quản lý của bạn']);
			}
			if (oi.owner.userId == req.body.userId) {
				return responseError(req, UPLOAD_DESTINATION, res, 400, ['error'], ['Mẫu dữ liệu này hiện đang thuộc quyền quản lý của user ' + req.body.userId]);
			}
			let user = await (getUser(req.body.userId))
			if (!user) {
				return responseError(req, UPLOAD_DESTINATION, res, 400, ['error'], ['User không tồn tại'])
			}
			user = user.userNormal;
			if (user.maDeTai != req.user.maDeTai) {
				return responseError(req, UPLOAD_DESTINATION, res, 400, ['error'], ['User ' + user.fullname + ' không nằm trong đề tài mà bạn quản lý'])
			}
			// now we have: user.maDeTai == maDeTai == req.user.maDeTai
			let newLog = new Log();
			newLog.userId = req.session.userId;
			newLog.userFullName = req.user.fullname,
			newLog.action = 'chown',
			newLog.time = new Date(),
			newLog.objType = objectModelName,
			newLog.obj1 = JSON.parse(JSON.stringify(oi)),
			// newLog.obj2: Object,
			newLog.extra = {
				agent: req.headers['user-agent'],
				localIP: req.body.localIP,
				publicIP: getPublicIP(req)
			}
			oi.owner.userId = user.id
			oi.save((err, result) => {
				if (err) {
					console.log(err);
					return responseError(req, UPLOAD_DESTINATION, res, 500, ['error'], ['Có lỗi xảy ra, vui lòng thử lại sau'])
				}
				newLog.obj2 = JSON.parse(JSON.stringify(oi));
				newLog.save();
				return responseSuccess(res, [], [])
			})
		})()
	}
}

global.myCustomVars.chownHandler = chownHandler;

// hanle route: objectBaseURL + '/log/:logId/:position'
var getLogHandler = function (options) {
	return function (req, res) {
		var UPLOAD_DESTINATION = options.UPLOAD_DESTINATION;
		var objectBaseURL = options.objectBaseURL;
		var PROP_FIELDS = options.PROP_FIELDS;
		Log.findById(req.params.logId, function (err, log) {
			if (err){
				return responseError(req, UPLOAD_DESTINATION, res, 500, ['error'], ['Error while reading database']);
			}
			if (log){
				if ((log.action == 'update') && (req.params.position == 'diff')){
					// return responseSuccess(res, ['obj1', 'obj2'], [flatObjectModel(PROP_FIELDS, log.obj1), flatObjectModel(PROP_FIELDS, log.obj2)]);
					return res.render('display', {title: 'Các cập nhật', objectPath: objectBaseURL, count: 2, obj1: flatObjectModel(PROP_FIELDS, log.obj1), obj2: flatObjectModel(PROP_FIELDS, log.obj2), staticPath: UPLOAD_DESTINATION.substring(UPLOAD_DESTINATION.indexOf('public') + 'public'.length), props: propsName(PROP_FIELDS)});
				}

				switch (parseInt(req.params.position)){
					case 1:
						if ('obj1' in log){
							// return responseSuccess(res, ['animal'], [flatObjectModel(PROP_FIELDS, log.obj1)])
							return res.render('display', {title: 'Dữ liệu chi tiết', objectPath: objectBaseURL, count: 1, obj1: flatObjectModel(PROP_FIELDS, log.obj1), obj2: {}, staticPath: UPLOAD_DESTINATION.substring(UPLOAD_DESTINATION.indexOf('public') + 'public'.length), props: propsName(PROP_FIELDS)});
						}
						else{
							return responseError(req, UPLOAD_DESTINATION, res, 400, ['error'], ['Invalid object'])
						}
					case 2:
						if (('obj2' in log) && (log.obj2)){
							return res.render('display', {title: 'Dữ liệu chi tiết', objectPath: objectBaseURL, count: 1, obj1: flatObjectModel(PROP_FIELDS, log.obj2), staticPath: UPLOAD_DESTINATION.substring(UPLOAD_DESTINATION.indexOf('public') + 'public'.length), props: propsName(PROP_FIELDS)});
							// return responseSuccess(res, ['animal'], [flatObjectModel(PROP_FIELDS, log.obj2)])
						}
						else{
							return responseError(req, UPLOAD_DESTINATION, res, 400, ['error'], ['Invalid object'])
						}
					default:
						return responseError(req, UPLOAD_DESTINATION, res, 400, ['error'], ['Invalid object'])
				}
			}
			else {
				return responseError(req, UPLOAD_DESTINATION, res, 400, ['error'], ['Invalid logId'])
			}
		})
	}
}

global.myCustomVars.getLogHandler = getLogHandler;

var deleteHandler = function (options) {
	return function (req, res) {
		async(() => {
			var objectModelIdParamName = options.objectModelIdParamName;
			var UPLOAD_DESTINATION = options.UPLOAD_DESTINATION;
			var objectModelName = options.objectModelName;
			var objectModelIdParamName = options.objectModelIdParamName
			var ObjectModel = options.ObjectModel;
			var missingParam = checkRequiredParams([objectModelIdParamName], req.body);
			if (missingParam){
				return responseError(req, UPLOAD_DESTINATION, res, 400, ['error'], ['Thiếu ' + missingParam]);
			}

			var objectInstance = await(new Promise((resolve, reject) => {
				ObjectModel.findById(req.body[objectModelIdParamName], function (err, objectInstance) {
					// console.log('function');
					if (err){
						console.log(err);
						responseError(req, UPLOAD_DESTINATION, res, 500, ['error'], ['Error while reading database']);
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
				if ((objectInstance.owner.userId == req.user.id) && (req.user.maDeTai == objectInstance.maDeTai.maDeTai)){
					canDelete = true; // Nếu mẫu do chính user tạo, và mẫu vật nằm trong đề tài của user
					// Có thể sau khi user tạo mẫu ở đề tài A, sau đó user được phân sang đề tài B
					// => user không thể sửa, xóa mẫu vật do user tạo trong đề tài A trước đó
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
					return responseError(req, UPLOAD_DESTINATION, res, 403, ['error'], ['Bạn không có quyền xóa mẫu dữ liệu này'])
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
				return responseError(req, UPLOAD_DESTINATION, res, 400, ['error'], ['Invalid ' + objectModelIdParamName]);
			}
		})()
		// return res.end('ok');
	}
}

global.myCustomVars.deleteHandler = deleteHandler;

var deleteFileHander = options => {
	return (req, res, next) => {
		async(() => {
			let objectModelIdParamName = options.objectModelIdParamName
			let UPLOAD_DESTINATION = options.UPLOAD_DESTINATION
			let ObjectModel = options.ObjectModel
			let saveOrUpdate = options.saveOrUpdate;
			let PROP_FIELDS = options.PROP_FIELDS;
			let PROP_FIELDS_OBJ = options.PROP_FIELDS_OBJ;
			let form = options.form;
			// console.log(objectModelIdParamName);
			var missingParam = checkRequiredParams([objectModelIdParamName, 'randomStr', 'field', 'fileName'], req.body);
			if (missingParam){
				return responseError(req, UPLOAD_DESTINATION, res, 400, ['error'], ['Thiếu ' + missingParam]);  
			}
			// console.log(req.body.animalId);
			var objectModelId = '';
			try {
				// console.log(req.body[objectModelIdParamName]);
				objectModelId = mongoose.Types.ObjectId(req.body[objectModelIdParamName]);
			}
			catch (e){
				console.log(e);
				return responseError(req, UPLOAD_DESTINATION, res, 500, ['error'], [objectModelIdParamName + " không đúng"]);
			}
			var objectInstance = await(new Promise((resolve, reject) => {
				ObjectModel.findById(objectModelId, function (err, objectInstance) {
					if (err){
						console.log(err);
						responseError(req, UPLOAD_DESTINATION, res, 500, ['error'], ["Error while reading database"])
						resolve(null)
					}
					
					if (objectInstance && (!objectInstance.deleted_at)) {
						resolve(objectInstance);
					}

					else {
						responseError(req, UPLOAD_DESTINATION, res, 400, ['error'], [objectModelIdParamName + ' không đúng'])
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
				if ((objectInstance.owner.userId == req.user.id) && (req.user.maDeTai == objectInstance.maDeTai.maDeTai)){
					canEdit = true; // Nếu mẫu do chính user tạo, và mẫu vật nằm trong đề tài của user
					// Có thể sau khi user tạo mẫu ở đề tài A, sau đó user được phân sang đề tài B
					// => user không thể sửa, xóa mẫu vật do user tạo trong đề tài A trước đó
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
					return responseError(req, UPLOAD_DESTINATION, res, 403, ['error'], ['Bạn không có quyền sửa đổi mẫu dữ liệu này'])
				}

				// return saveOrUpdate(req, res, objectInstance, ACTION_EDIT);
				let oldFileName = objectInstance.id + STR_SEPERATOR + req.body.field + STR_SEPERATOR + req.body.fileName;
				if (!(PROP_FIELDS_OBJ[req.body.field])) {
					return res.status(400).json({
						status: 'error',
						error: 'invalid field'
					})
				}
				console.log(oldFileName);
				let arr = objectChild(objectInstance, PROP_FIELDS[PROP_FIELDS_OBJ[req.body.field]].schemaProp) [req.body.field];
				let pos = arr.indexOf(oldFileName);
				let savedFiles = [];
				if (pos < 0) {
					let files = []
					fs.readdirSync(path.join(__dirname, TMP_UPLOAD_DIR), {encoding: 'utf8'}).map((fileName) => {
						let prefix = req.body.randomStr + STR_SEPERATOR + req.body.field + STR_SEPERATOR;
						if (fileName.indexOf(prefix) == 0) {
							files.push(fileName.substring(fileName.lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length))
						}
					});
					arr.map(f => {
						savedFiles.push(f.split(STR_SEPERATOR)[f.split(STR_SEPERATOR).length - 1])
					})
					return res.status(400).json({
						status: 'error',
						error: 'file not found',
						files: files,
						savedFiles: savedFiles,
						form: form,
						id: objectInstance.id,
						randomStr: req.body.randomStr,
						field: req.body.field
					})
				}
				
				try {
					arr.splice(pos, 1);
					fs.unlinkSync(path.join(__dirname, UPLOAD_DESTINATION, oldFileName));
				} catch (e) {
					console.log(e);
				}

				objectInstance.save((err, oi) => {
					if (err) {
						console.log(err);
					}
					// TODO
					// Save log
					let files = []
					fs.readdirSync(path.join(__dirname, TMP_UPLOAD_DIR), {encoding: 'utf8'}).map((fileName) => {
						let prefix = req.body.randomStr + STR_SEPERATOR + req.body.field + STR_SEPERATOR;
						if (fileName.indexOf(prefix) == 0) {
							files.push(fileName.substring(fileName.lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length))
						}
					});
					arr.map(f => {
						savedFiles.push(f.split(STR_SEPERATOR)[f.split(STR_SEPERATOR).length - 1])
					})
					return responseSuccess(res, ['files', 'savedFiles', 'form', 'id', 'randomStr', 'field'], [files, savedFiles, form, objectInstance.id, req.body.randomStr, req.body.field]);
				})

			} else {
				return res.status(404).json({
					status: 'error',
					error: 'Not found'
				})
			}
		})();
	}
}

global.myCustomVars.deleteFileHander = deleteFileHander;

var putHandler = function (options) {
	return function (req, res, next) {
		// console.log(req.body);
		delete req.body.maDeTai;
		delete req.body.fApproved;

		async(() => {
			var objectModelIdParamName = options.objectModelIdParamName
			var UPLOAD_DESTINATION = options.UPLOAD_DESTINATION
			var ObjectModel = options.ObjectModel
			var saveOrUpdate = options.saveOrUpdate;
			// console.log(objectModelIdParamName);
			var missingParam = checkRequiredParams([objectModelIdParamName], req.body);
			if (missingParam){
				return responseError(req, UPLOAD_DESTINATION, res, 400, ['error'], ['Thiếu ' + missingParam]);  
			}
			// console.log(req.body.animalId);
			var objectModelId = '';
			try {
				// console.log(req.body[objectModelIdParamName]);
				objectModelId = mongoose.Types.ObjectId(req.body[objectModelIdParamName]);
			}
			catch (e){
				console.log(e);
				return responseError(req, UPLOAD_DESTINATION, res, 500, ['error'], [objectModelIdParamName + " không đúng"]);
			}
			var objectInstance = await(new Promise((resolve, reject) => {
				ObjectModel.findById(objectModelId, function (err, objectInstance) {
					if (err){
						console.log(err);
						responseError(req, UPLOAD_DESTINATION, res, 500, ['error'], ["Error while reading database"])
						resolve(null)
					}
					
					if (objectInstance && (!objectInstance.deleted_at)) {
						resolve(objectInstance);
					}

					else {
						responseError(req, UPLOAD_DESTINATION, res, 400, ['error'], [objectModelIdParamName + ' không đúng'])
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
				if ((objectInstance.owner.userId == req.user.id) && (req.user.maDeTai == objectInstance.maDeTai.maDeTai)){
					canEdit = true; // Nếu mẫu do chính user tạo, và mẫu vật nằm trong đề tài của user
					// Có thể sau khi user tạo mẫu ở đề tài A, sau đó user được phân sang đề tài B
					// => user không thể sửa, xóa mẫu vật do user tạo trong đề tài A trước đó
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
					return responseError(req, UPLOAD_DESTINATION, res, 403, ['error'], ['Bạn không có quyền sửa đổi mẫu dữ liệu này'])
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
	var UPLOAD_DESTINATION = options.UPLOAD_DESTINATION;
	return function (req, res, next) {
		var newInstance = new ObjectModel();

		if (!req.user.maDeTai){
			return responseError(req, UPLOAD_DESTINATION, res, 403, ['error'], ['Tài khoản của bạn chưa được liên kết với bất kỳ bảo tàng nào. Liên hệ chủ nhiệm đề tài để được cập nhật tài khoản.']);

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

var getPublicIP = function (req) {
	let publicIP = {
	}
	try {
		publicIP['x-forwarded-for'] = req.headers['x-forwarded-for']
	}
	catch (e){
		console.log(e);
	}
	try {
		publicIP['connection-remoteAddress'] = req.connection.remoteAddress
	}
	catch (e){
		console.log(e);
	}
	try {
		publicIP['socket-remoteAddress'] = req.socket.remoteAddress
	}
	catch (e){
		console.log(e);
	}
	try {
		publicIP['connection-socket-remoteAddress'] = req.connection.socket.remoteAddress;
	}
	catch (e){
		console.log(e);
	}
	return publicIP;
}
global.myCustomVars.getPublicIP = getPublicIP;

var getFieldsHandler = (options) => {
	var LABEL = options.LABEL;
	var PROP_FIELDS = options.PROP_FIELDS;
	return (req, res) => {
		res.json({
			status: 'success',
			fields: PROP_FIELDS.reduce((obj, curElement) => {
				let e = curElement;
				if (('type' in e) && (['Mixed', 'Unit'].indexOf(e.type) < 0) && (['maDeTai', 'fDiaDiemThuMau', 'fApproved'].indexOf(e.name) < 0)){
					obj[e.name] = LABEL[e.name];
				}
				return obj;
			}, {})
		})
	}
}
global.myCustomVars.getFieldsHandler = getFieldsHandler;

// ============= Generate Promise for async/await =======================

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
				result.sort((a, b) => {
					return a.localeCompare(b)
				})
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

var removeUserRoles = (userId, roles) => {
	return new Promise((resolve, reject) => {
		acl.removeUserRoles(userId, roles, (err) => {
			if (err){
				console.log(err);
				resolve({
					status: 'error',
					error: err
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

global.myCustomVars.promises.removeUserRoles = removeUserRoles;

var getUser = (userId) => {
	return new Promise((resolve, reject) => {
		mongoose.model('User').findById(userId, (err, user) => {
			if (err || !user){
				console.log(err);
				resolve(null);
			}
			else{
				let userMongoose = user;
				let userNormal = JSON.parse(JSON.stringify(user));
				let u = userNormal;
				u.id = u._id;
				acl.userRoles(u._id, (err, userRoles) => {
					// console.log('promised userRoles called');
					if (err){
						console.log(err);
						resolve({
							userNormal: userNormal,
							userMongoose: userMongoose
						})
					}
					else {
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
							else {
							}
						}
						mongoose.model('SharedData').findOne({}, (err, sharedData) => {
							if (!err && sharedData){
								for(let dt of sharedData.deTai){
									if (u.maDeTai == dt.maDeTai){
										u.deTai = dt.tenDeTai;
										break;
									}
								}
							}
							resolve({
								userNormal: userNormal,
								userMongoose: userMongoose
							})
						})
					}
				})
				

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
						u.id = u._id;
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
