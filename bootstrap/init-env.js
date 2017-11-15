const path = require('path');
const ROOT = path.join(__dirname, '..');
const fs = require('fs');
const fsE = require('fs-extra');
const xss = require(path.join(ROOT, 'utils/xss'));
const TMP_UPLOAD_DIR = 'public/uploads/tmp';
global.myCustomVars.TMP_UPLOAD_DIR = TMP_UPLOAD_DIR;



// ============== Mongoose Model ================
var mongoose             = require('mongoose');
var Log                  = mongoose.model('Log');

// ============== Shared Variables ================

var ACTION_CREATE = 0;
var ACTION_EDIT = 1;
var STR_SEPARATOR = '_+_';
var STR_AUTOCOMPLETION_SEPARATOR = '_-_'; // Phải đồng bộ với biến cùng tên trong file app/service.js

global.myCustomVars.ACTION_CREATE = ACTION_CREATE;
global.myCustomVars.ACTION_EDIT = ACTION_EDIT;
global.myCustomVars.STR_SEPARATOR = STR_SEPARATOR;
global.myCustomVars.STR_AUTOCOMPLETION_SEPARATOR = STR_AUTOCOMPLETION_SEPARATOR;

const DATE_FULL = 0;
const DATE_MISSING_DAY = 1;
const DATE_MISSING_MONTH = 2;
const EXPORT_NULL_FIELD = true;

global.myCustomVars.DATE_FULL = DATE_FULL;
global.myCustomVars.DATE_MISSING_DAY = DATE_MISSING_DAY;
global.myCustomVars.DATE_MISSING_MONTH = DATE_MISSING_MONTH;
global.myCustomVars.EXPORT_NULL_FIELD = EXPORT_NULL_FIELD;


const ORIGIN_TIME = new Date('1970/1/1');
const NULL_TIMES = [ORIGIN_TIME.getTime(), 0];
global.myCustomVars.ORIGIN_TIME = ORIGIN_TIME;
global.myCustomVars.NULL_TIMES = NULL_TIMES;



// ============== Places ================
var CITIES = {};
var DISTRICTS = {};
var WARDS = {};
var tmpCities = JSON.parse(fs.readFileSync(path.join(ROOT, 'app', 'database', 'cities.json')));
for(let tc of tmpCities){
	CITIES[tc.id] = tc;
}
// console.log(CITIES)

var tmpDistricts = JSON.parse(fs.readFileSync(path.join(ROOT, 'app', 'database', 'districts.json')));
for(let td of tmpDistricts){
	DISTRICTS[td.id] = td;
}
// console.log(DISTRICTS)
var tmpWards = JSON.parse(fs.readFileSync(path.join(ROOT, 'app', 'database', 'wards.json')));
for(let tw of tmpWards){
	WARDS[tw.id] = tw;
}
// console.log(WARDS)

global.myCustomVars.CITIES = CITIES;
global.myCustomVars.DISTRICTS = DISTRICTS;
global.myCustomVars.WARDS = WARDS;




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

			var newFileName = mongoId + STR_SEPARATOR + schemaFieldName + STR_SEPARATOR + file.originalname;
			// var newFileName = mongoId + STR_SEPARATOR + file.originalname;
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
	let ommitedFields = {
		eGeoJSON: 1
	};
	_PROP_FIELDS.map(function (element) {
		if (ommitedFields.hasOwnProperty(element.name)) {
			return;
		}
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

// VD: Kinh độ, Vĩ độ: '1 ° 2 \' 3"'
function validateCoordinate(str) {
	if (!str || !((str + '').trim())) {
		return false;
	}
	str = (str + '').toLowerCase();
	let discreteCoor = /^ *(-?[0-9]+) *(°|độ) *([0-9]+) *('|phút) *([0-9]+) *("|giây)$/;
	let floatCoor = /^ *-?[0-9]+(\.[0-9]*)?$/
	return discreteCoor.test(str) || floatCoor.test(str);
}

global.myCustomVars.validateCoordinate = validateCoordinate;

function coordinatesStr2Float(str) {
	if (!str || !((str + '').trim())) {
		return 'invalid';
	}
	str = (str + '').toLowerCase();
	let discreteCoor = /^ *(-?[0-9]+) *(°|độ) *([0-9]+) *('|phút) *([0-9]+) *("|giây)$/;
	let floatCoor = /^ *-?[0-9]+(\.[0-9]*)?$/
	if (discreteCoor.test(str)) {
		let matches = str.match(discreteCoor);
		let partDo = parseInt(matches[1]);
		let partPhut = parseInt(matches[3]);
		let partGiay = parseInt(matches[5]);
		return (Math.abs(partDo) + partPhut / 60 + partGiay / 3600) * (partDo >= 0 ? 1 : -1);
	}
	if (floatCoor.test(str)) {
		return parseFloat(str)
	}
	return 'invalid'
}

global.myCustomVars.coordinatesStr2Float = coordinatesStr2Float;

function createSaveOrUpdateFunction (variablesBundle) {
	var Log = variablesBundle.Log;
	var AutoCompletion = variablesBundle.AutoCompletion;
	var objectModelName = variablesBundle.objectModelName;
	var objectModelNames = variablesBundle.objectModelNames;
	var objectModelIdParamName = variablesBundle.objectModelIdParamName;
	var objectBaseURL = variablesBundle.objectBaseURL;
	var _PROP_FIELDS = variablesBundle.PROP_FIELDS;
	var _PROP_FIELDS_OBJ = variablesBundle.PROP_FIELDS_OBJ
	var _LABEL = variablesBundle.LABEL;
	var _UPLOAD_DESTINATION = variablesBundle.UPLOAD_DESTINATION;
	// console.log(variablesBundle.UPLOAD_DESTINATION);
	// console.log(1);

	return function saveOrUpdate (req, res, objectInstance, action) {
		const F_ACTION_PRESERVATION = 'preservation'.localeCompare(req.body.action) == 0
		var PROP_FIELDS_OBJ = {};
		// console.log(req.body);
		let _s = new Date();
		for (let i = 0; i < Object.keys(req.body).length; i++) {
			let key = Object.keys(req.body)[i];
			req.body[key] = xss.filter(req.body[key])
			req.body[key] = xss.stripTags(req.body[key], ['img', 'a'])
		}
		let _f = new Date();
		console.log('time filter', Object.keys(req.body).length, 'fields:', (_f.getTime() - _s.getTime()));

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
			req.body.fLoadFromXLSX = req.body.fLoadFromXLSX == 1;
			objectInstance.flag ? 
				(objectInstance.flag = {fLoadFromXLSX: !!req.body.fLoadFromXLSX}) : 
				(objectInstance.flag.fLoadFromXLSX = !!req.body.fLoadFromXLSX)
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
			if (F_ACTION_PRESERVATION) {
				break;
			}
			if ((field.fieldName in req.body) && (req.body[field.fieldName])){
				req.body[field.fieldName] = parseFloat(req.body[field.fieldName]);
				if (req.body[field.fieldName] < 0) {
					return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], [field.fieldName + ' không được nhỏ hơn 0', field.fieldName]);
				}
			}
		}
		delete specialFields.unitFields;

		specialFields.coordinations = [
			{
				fieldName: 'kinhDo',
				min: -180,
				max: 180
			},
			{
				fieldName: 'viDo',
				min: -90,
				max: 90
			}
		]
		let geoJSON = {
			type: 'Point',
			coordinates: []
		}

		for(let field of specialFields.coordinations){
			if (F_ACTION_PRESERVATION) {
				break;
			}
			if ((field.fieldName in req.body) && (req.body[field.fieldName])){
				// console.log(req.body[field.fieldName]);
				// new
				req.body[field.fieldName] = req.body[field.fieldName].toLowerCase();
				let isValidCoor = validateCoordinate(req.body[field.fieldName]);
				if (!isValidCoor) {
					return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'],
						[_LABEL[field.fieldName] + ' không đúng định dạng', field.fieldName]);
				}
				let c_ = coordinatesStr2Float(req.body[field.fieldName]);
				if ((c_ < field.min) || (c_ > field.max)) {
					return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'],
						[`${_LABEL[field.fieldName]} phải nằm trong khoảng từ ${field.min} đến ${field.max}. Giá trị nhập vào: ${c_}`,
						field.fieldName]);
				}
				geoJSON.coordinates.push(c_);
				// end new
				// if (!(/^([0-9 \-]+)(°|độ)([0-9 \-]+)('|phút)([0-9 \-]+)("|giây)$/.test(req.body[field.fieldName].toLowerCase()))){
				// 	if (/^(.+)(°|độ)(.+)('|phút)(.+)("|giây)$/.test(req.body[field.fieldName].toLowerCase())) {
				// 		return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], [_LABEL[field.fieldName] + ' không đúng định dạng', field.fieldName]);
				// 	}
				// 	console.log('Tọa độ thực')
				// 	req.body[field.fieldName] = parseFloat(req.body[field.fieldName]);
				// }
				// else {
				// 	console.log('Tọa độ rời rạc')
				// 	req.body[field.fieldName] = req.body[field.fieldName].toLowerCase()
				// 	let matches = req.body[field.fieldName].match(/^([0-9 \-]+)(°|độ)([0-9 ]+)('|phút)([0-9 ]+)("|giây)$/);
				// 	if (!matches || (matches.length < 7)) {
				// 		return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], [_LABEL[field.fieldName] + ' không đúng định dạng', field.fieldName]);
				// 	}
				// 	// console.log(matches);
				// 	let partDo = parseInt(matches[1]);
				// 	let partPhut = parseInt(matches[3]);
				// 	let partGiay = parseInt(matches[5]);
				// 	// console.log(partDo);
				// 	// console.log(partPhut);
				// 	// console.log(partGiay);
				// 	if (!Number.isInteger(partDo) ||
				// 			!Number.isInteger(partPhut) ||
				// 			!Number.isInteger(partGiay)
				// 		){
				// 		return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], [_LABEL[field.fieldName] + ': Tọa độ phải là các số nguyên', field.fieldName])
				// 	}
				// }
			}
		}
		// console.log('============ GEOJSON ===========');
		// console.log(geoJSON);
		// console.log('============ /GEOJSON ===========');
		if (geoJSON.coordinates.length == 2) {
			if (objectInstance.extra) {
				objectInstance.extra.eGeoJSON = geoJSON;
			} else {
				objectInstance.extra = {
					eGeoJSON: geoJSON
				}
			}
		} else {
			if (objectInstance.extra) {
				objectInstance.extra.eGeoJSON = undefined;
				delete objectInstance.extra.eGeoJSON
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
			if (F_ACTION_PRESERVATION) {
				break;
			}
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
			if (F_ACTION_PRESERVATION && (!element.isPreservationField)) {
				continue;
			}
			
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
				case 'Unit':
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
								return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], [element.label + ' không được ngắn hơn ' + element.min + ' ký tự', element.name]);
							}
						}

						if ('max' in element){
							if (value.length > element.max){
								return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], [element.name + ' không được ngắn hơn ' + element.max + ' ký tự', element.name]);
							}
						}
						if ('regex' in element){
							var regex = new RegExp(element.regex, 'i');
							if (regex.test(value) === false){
								return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'],
									['Sai định dạng. Trường: ' + ((element.name in _LABEL) ? _LABEL[element.name] : element.name), element.name]);
							}
						}
						// if ('domain' in element) {
						// 	let domain = element.domain;
						// 	if (domain.indexOf(value) < 0) {
						// 		return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'],
						// 			[`Giá trị nhập vào không hợp lệ.\n\n
						// 			Trường: ${element.name in _LABEL ? _LABEL[element.name] : element.name}\n\n
						// 			Giá trị có thể nhận: "${domain.join('", "')}".\n\n
						// 			Giá trị nhập vào: "${value}"`, element.name]);
						// 	}
						// }
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
							return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], [element.label + ' không được nhỏ hơn ' + element.min, element.name]);
						}
					}

					if ('max' in element){
						if (parseFloat(req.body[element.name]) > element.max){
							return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'], [element.label + ' không được lớn hơn ' + element.max, element.name]);
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
					
					if (req.body[element.name]){
						// console.log(element.name, '"', req.body[element.name], '"');
						if (!(/^ *[0-9]+( *\/ *[0-9]+){0,2} *$/.test(req.body[element.name]))) {
							// console.log('here reject');
							return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'],
										['Định dạng ngày tháng phải theo khuôn mẫu dd/mm/yyyy', element.name])
						}
						// Preprocess Date: Change from '23/02/2017' to '2017/02/23'
						// Catch error later
						try {
							let dateValue_ = req.body[element.name].split('/');
							dateValue_ = dateValue_.filter(e => {
								let n = parseInt(e);
								return Number.isInteger(n) && (n > 0)
							})
							// console.log(dateValue_);
							let timeValue_ = [];
							// reject if req has more than 3 numbers
							if (dateValue_.length > 3){
								// console.log('dateValue_ len', dateValue_.length);
								return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'],
									['Định dạng ngày tháng phải theo khuôn mẫu dd/mm/yyyy.', element.name])
							}
							// 
							// now, allow to save and mark the flag
							// console.log(dateValue_);
							let dl = dateValue_.length;
							// console.log('dateValue_ len:', dl);
							// let flagMissingDateTime = DATE_FULL;
							// try {
							// 	flagMissingDateTime = objectInstance.flag.fMissingDateTime;
							// } catch (e) {
							// 	console.log(e);
							// }
							if (dl == 2) {
								// date: 12/2017 => 1/12/2017
								dateValue_.unshift('1'); // Chỉnh về ngày mùng 1 trong tháng
								// flagMissingDateTime = DATE_MISSING_DAY;
								timeValue_ = [DATE_MISSING_DAY + '', '0', '0'];
							} else if (dl == 1) {
								// date: 2017 => 1/1/2017
								dateValue_.unshift('1');
								dateValue_.unshift('1'); // Chỉnh về ngày 1 tháng 1 trong năm
								// flagMissingDateTime = DATE_MISSING_MONTH;
								timeValue_ = [DATE_MISSING_MONTH + '', '0', '0'];
							}
							// now we have dateValue_ is a 3-elements array.
							let _year = parseInt(dateValue_[2]);
							if ((_year < 1000) || (_year > 3000)) {
								return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'],
								['Năm phải trong khoảng 1000 - 3000. Giá trị nhập vào: ' + _year, element.name])
							}
							let _month = parseInt(dateValue_[1]);
							if ((_month < 1) || (_month > 12)) {
								return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'],
								['Tháng phải trong khoảng 1 - 12. Giá trị nhập vào: ' + _month, element.name])
							}
							let _day = parseInt(dateValue_[0]);
							if ((_day < 1) || (_day > 31)) {
								return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field'],
								['Ngày phải trong khoảng 1 - 31. Giá trị nhập vào: ' + _day, element.name])
							}
							// Use flag to mark Missing Date
							// if (objectInstance.flag) {
							// 	objectInstance.flag.fMissingDateTime = flagMissingDateTime
							// } else {
							// 	objectInstance.flag = {
							// 		fMissingDateTime: flagMissingDateTime
							// 	}
							// }
							// console.log(dateValue_);
							dateValue_.map((element, index) => {
								dateValue_[index] = element.trim();
							})
							dateValue_.reverse();
							// console.log(dateValue_);
							req.body[element.name] = dateValue_.join('/') + ' ' + ((timeValue_.length > 0) ? timeValue_.join(':') : '')
							// Use flag to mark Missing Date
							// req.body[element.name] = dateValue_.join('/')
							// console.log(req.body[element.name]);
						}
						catch (e){
							console.log(e)
						}
					}
					

					break;
				case 'File':
					if ('regex' in element){
						var regex = new RegExp(element.regex, 'i');
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
									return responseError(req, _UPLOAD_DESTINATION, res, 400, ['error', 'field', 'invalidFile'], ['Tên file trong trường không hợp lệ', element.name, file.originalname]);
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
										var regex = new RegExp(e.regex, 'i');
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
					var value_ = value.split(STR_AUTOCOMPLETION_SEPARATOR);
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
			if (F_ACTION_PRESERVATION && (!field.isPreservationField)) {
				return;
			}
			if (field.type == 'Unit'){
				// TODO unit
				if (field.name in req.body){
					let value_ = req.body[field.name]
					// console.log(value_);
					if ((value_.indexOf('undefined') >= 0) || (value_.indexOf('string') >= 0) || (value_.indexOf('?') >= 0)){
						// console.log('delete now: ' + field.name);
						req.body[field.name] = ''
					}
				}
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
				if (F_ACTION_PRESERVATION && (!element.isPreservationField)) {
					return;
				}
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
						// a new API is created to do that
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
					let prefix = req.body.randomStr + STR_SEPARATOR + element.name + STR_SEPARATOR;
					if (fileName.indexOf(prefix) == 0) {
						// fileName: 6d90732ef697bbf4f1248e1958ac1060_+_anhMauVat_+_18952851_2101188366876603_8950647639813852835_n.jpg
						// curFullName = [6d90732ef697bbf4f1248e1958ac1060, anhMauVat, 18952851_2101188366876603_8950647639813852835_n.jpg]
						let curFullName = fileName.split(STR_SEPARATOR);
						if (curFullName[1] in PROP_FIELDS_OBJ) {
							if (F_ACTION_PRESERVATION && (!_PROP_FIELDS[PROP_FIELDS_OBJ[curFullName[1]]].isPreservationField)) {
								return;
							}
							let f = false;
							if ('regex' in _PROP_FIELDS[PROP_FIELDS_OBJ[curFullName[1]]]) {
								let regex = new RegExp(_PROP_FIELDS[PROP_FIELDS_OBJ[curFullName[1]]].regex, 'i');
								if (regex.test(curFullName[2])) {
									f = true;
								}
							} else {
								f = true;
							}
							if (f) {
								curFullName[0] = result.id;
								let newFullName = curFullName.join(STR_SEPARATOR);
								fsE.moveSync(
									path.join(ROOT, TMP_UPLOAD_DIR, fileName),
									path.join(ROOT, _UPLOAD_DESTINATION, newFullName),
									{overwrite: true}
								);
								objectChild(objectInstance, element.schemaProp)[element.name].push(newFullName)
							}
						}
						
					}
				});
			})

			if (action == ACTION_CREATE){
				objectInstance.created_at = new Date();
			}
			else {
				objectInstance.updated_at = new Date();
			}
			if (!F_ACTION_PRESERVATION) {
				objectInstance.flag.fApproved = false; // normal edit by owner
			} else {
				// user in BTTNVN edit only preservation fields.
				// so, do nothing here.
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
				newLog.save(err => {
					if (err) {
						console.error('ERR: Save log failed. Try again');
						console.error(err);
						newLog.save(err_ => {
							if (err_) {
								console.error('ERR: Save log failed');
								console.error(err_);
								console.error(newLog);
							}
						})
					}
				});
				res.status(200).json({
					status: 'success'
				});
			});
		})
	}
}

global.myCustomVars.createSaveOrUpdateFunction = createSaveOrUpdateFunction;

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

