var multer               = require('multer');
var fs                   = require('fs');
var path                 = require('path');
var UPLOAD_DEST_ANIMAL   = 'public/uploads/geological';
var upload               = multer({dest: UPLOAD_DEST_ANIMAL});
var mongoose             = require('mongoose');
var ObjectModel          = mongoose.model('Geological');
var AutoCompletion       = mongoose.model('GeologicalAutoCompletion');
var User                 = mongoose.model('User');
var Log                  = mongoose.model('Log');

// Get shared functions
var aclMiddleware       = global.myCustomVars.aclMiddleware;
var checkRequiredParams = global.myCustomVars.checkRequiredParams;
var responseError       = global.myCustomVars.responseError;
var responseSuccess     = global.myCustomVars.responseSuccess;
var rename              = global.myCustomVars.rename;
var propsName           = global.myCustomVars.propsName;
var flatObjectModel     = global.myCustomVars.flatObjectModel;
var objectChild         = global.myCustomVars.objectChild;
var exportFile          = global.myCustomVars.exportFile;

// Get Global variables

var ACTION_CREATE = global.myCustomVars.ACTION_CREATE;
var ACTION_EDIT   = global.myCustomVars.ACTION_EDIT;
var STR_SEPERATOR = global.myCustomVars.STR_SEPERATOR;

var PROP_FIELDS = JSON.parse(fs.readFileSync(path.join(__dirname, '../models/GeologicalSchemaProps.json')).toString());

var PROP_FIELDS_OBJ = {};
var LABEL = {};

PROP_FIELDS.map(function (element, index) {
	PROP_FIELDS_OBJ[element.name] = index;
	LABEL[element.name] = element.label;
});

{
	var index = 0;
	while (true){
		if (PROP_FIELDS[index] && (PROP_FIELDS[index].type == 'Metadata')){
			PROP_FIELDS.splice(index, 1);
		}
		else {
			index++;
		}
		if (index >= PROP_FIELDS.length){
			break;
		}
	}
}

// File fields
var FILE_FIELDS = PROP_FIELDS.filter(function (element) {
	return !element.type.localeCompare('File')
});

var aclMiddlewareBaseURL   = '/content/dia-chat';
var objectModelName        = 'geological';
var objectModelNames       = 'geologicals';
var objectModelIdParamName = 'id';
var objectBaseURL          = '/dia-chat';
var objectModelLabel       = 'địa chất';

var bundle = {
	Log                    : Log,
	AutoCompletion         : AutoCompletion,
	objectModelName        : objectModelName,
	objectModelNames       : objectModelNames,
	objectModelIdParamName : objectModelIdParamName,
	objectBaseURL          : objectBaseURL,
	PROP_FIELDS            : PROP_FIELDS,
	UPLOAD_DEST_ANIMAL     : UPLOAD_DEST_ANIMAL
}

var saveOrUpdate           = global.myCustomVars.createSaveOrUpdateFunction(bundle);


// Change code above this line

// ==========================================

// Fixed Code

module.exports = function (router) {

router.post(objectBaseURL, aclMiddleware(aclMiddlewareBaseURL, 'create'),
	upload.fields(FILE_FIELDS.reduce(function (preArray, curElement) {
		preArray.push({name: curElement.name}); 
		return preArray;
	}, [])), 
	function (req, res, next) {
		var newAnimal = new ObjectModel();

		return saveOrUpdate(req, res, newAnimal, ACTION_CREATE);
})

router.put(objectBaseURL, aclMiddleware(aclMiddlewareBaseURL, 'edit'), 
	upload.fields(FILE_FIELDS.reduce(function (preArray, curElement) {
		preArray.push({name: curElement.name}); 
		return preArray;
	}, [])),
	function (req, res, next) {
		var missingParam = checkRequiredParams([objectModelIdParamName], req.body);
		if (missingParam){
			return responseError(req, UPLOAD_DEST_ANIMAL, res, 400, ['error'], ['Thiếu ' + objectModelIdParamName]);  
		}
		// console.log(req.body.animalId);
		var objectModelId = '';
		try {
			objectModelId = mongoose.Types.ObjectId(req.body[objectModelIdParamName]);
		}
		catch (e){
			console.log(e);
			return responseError(req, UPLOAD_DEST_ANIMAL, res, 500, ['error'], [objectModelIdParamName + " không đúng"]);
		}
		ObjectModel.findById(objectModelId, function (err, objectInstance) {
			if (err){
				console.log(err);
				return responseError(req, UPLOAD_DEST_ANIMAL, res, 500, ['error'], ["Error while reading database"])
			}
			
			if (objectInstance && (!objectInstance.deleted_at)) {
				return saveOrUpdate(req, res, objectInstance, ACTION_EDIT);
			}

			else {
				return responseError(req, UPLOAD_DEST_ANIMAL, res, 400, ['error'], [objectModelIdParamName + ' không đúng'])
			}
		})
})

router.get(objectBaseURL, aclMiddleware(aclMiddlewareBaseURL, 'view'), function (req, res) {
	ObjectModel.find({deleted_at: {$eq: null}}, function (err, objectInstances) {
		if (err){
			return responseError(req, UPLOAD_DEST_ANIMAL, res, 500, ['error'], ['Error while reading database']);
		}
		return responseSuccess(res, ['status', objectModelNames], ['success', objectInstances]);
	})
})

router.get(objectBaseURL + '/auto', aclMiddleware(aclMiddlewareBaseURL, 'create'), function (req, res) {
	// console.log(Object.keys(AutoCompletion.schema.paths));

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
})

router.get(objectBaseURL + '/:objectModelIdParamName', aclMiddleware(aclMiddlewareBaseURL, 'view'), function (req, res) {
	// console.log(ObjectId(req.params.animalId));
	// console.log(req.params.animalId);
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
				else if (req.query.display == 'docx'){
					
					var paragraph = {
						text: [
						'PHIẾU CƠ SỞ DỮ LIỆU MẪU ĐỊA CHẤT\n(ĐÁ, KHOÁNG SẢN, KHOÁNG VẬT)', 
						'(Ban hành kèm theo Công văn số:        /BTTNVN-DABSTMVQG, ngày         tháng          năm       )'
						],
						style: [
							{color: "000000", bold: true, font_face: "Times New Roman"},
							{color: "000000", font_face: "Times New Roman"}
						]

					}

					exportFile(objectInstance, PROP_FIELDS, ObjectModel, LABEL, res, paragraph);
					// return res.end("OK");
				}
				else {
					return responseSuccess(res, [objectModelName], [flatObjectModel(PROP_FIELDS, objectInstance)]);
				}
				
			}
		}
		else{
			responseError(req, UPLOAD_DEST_ANIMAL, res, 404, ['error'], ['Không tìm thấy']);
		}
	})
})

router.get(objectBaseURL + '/log/:logId/:position', function (req, res) {
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
})

router.delete(objectBaseURL, aclMiddleware(aclMiddlewareBaseURL, 'delete'), function (req, res) {
	var missingParam = checkRequiredParams([objectModelIdParamName], req.body);
	if (missingParam){
		return responseError(req, UPLOAD_DEST_ANIMAL, res, 400, ['error'], ['Thiếu ' + missingParam]);
	}

	ObjectModel.findById(req.body[objectModelIdParamName], function (err, objectInstance) {
		// console.log('function');
		if (err){
			console.log(err);
			return responseError(req, UPLOAD_DEST_ANIMAL, res, 500, ['error'], ['Error while reading database']);
		}
		if (objectInstance){
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
	})
	// return res.end('ok');
})

}