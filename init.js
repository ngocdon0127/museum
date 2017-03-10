
// ============== Init ACL =======================

var acl = require('acl');
acl = new acl(new acl.memoryBackend());
require('./config/acl.js')(acl);
var path = require('path');
var fs = require('fs');

function aclMiddleware (resource, action) {
	return function (req, res, next) {
		if (!('userId' in req.session)){
			return res.redirect('/home');
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
				return res.redirect('/home');
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
			var newFileName = mongoId + STR_SEPERATOR + file.originalname;
			var newPath = path.join(position, newFileName);
			fs.renameSync(curPath, newPath);
			schemaField.push(mongoId + STR_SEPERATOR + file.originalname);
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

		let specialFields = {};
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
			}
		]

		for(let field of specialFields.placeFields){
			if (field.fieldName in req.body){
				let value_ = req.body[field.fieldName]
				if ((value_.indexOf('undefined') >= 0) || (value_.indexOf('string') >= 0) || (value_.indexOf('?') >= 0)){
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
					rename(req.files[element.name], objectChild(objectInstance, element.schemaProp)[element.name], _UPLOAD_DEST_ANIMAL, result.id);
				}
			})

			if (action == ACTION_CREATE){
				objectInstance.created_at = new Date();
			}
			else {
				objectInstance.updated_at = new Date();
			}
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

	var async = require('asyncawait/async');
	var await = require('asyncawait/await');
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

		delete objectInstance.flag.fDiaDiemThuMau; // TODO: Don'y know why, check later
		for(var i = 0; i < PROP_FIELDS.length; i++){
			var field = PROP_FIELDS[i];
			// console.log(field.name);
			if (field.name == 'fDiaDiemThuMau'){
				// console.log('len: ' + PROP_FIELDS.length);
				PROP_FIELDS.splice(i, 1);
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
					flatOI[element.name] = flatOI[element.name].split(STR_AUTOCOMPLETION_SEPERATOR).join(', ');
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
					flatOI[f.fieldName] = flatOI[f.fieldName].split(STR_AUTOCOMPLETION_SEPERATOR).join(', ');
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

		pObj = docx.createP();
		pObj.options.align = "left";
		// pObj.addText(JSON.stringify(statistics, null, 4), {color: '000000', font_face: 'Times New Roman', font_size: 12});

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
				var cmd = 'libreoffice5.3 --invisible --convert-to pdf ' + tmpFileName;
				exec(cmd, function (err, stdout, stderr) {
					if (err){
						console.log(err);
						return res.end('err');
					}
					// console.log('---')
					// console.log(stdout);
					// console.log('---')
					// console.log(stderr);
					// console.log('---')
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

		delete objectInstance.flag.fDiaDiemThuMau;
		for(var i = 0; i < PROP_FIELDS.length; i++){
			var field = PROP_FIELDS[i];
			// console.log(field.name);
			if (field.name == 'fDiaDiemThuMau'){
				console.log('len: ' + PROP_FIELDS.length);
				PROP_FIELDS.splice(i, 1);
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
		var workbook = excelbuilder.createWorkbook('.', tmpFileName);
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
					flatOI[element.name] = flatOI[element.name].split(STR_AUTOCOMPLETION_SEPERATOR).join(', ');
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
					flatOI[f.fieldName] = flatOI[f.fieldName].split(STR_AUTOCOMPLETION_SEPERATOR).join(', ');
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