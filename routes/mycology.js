var multer               = require('multer');
var fs                   = require('fs');
var path                 = require('path');
var UPLOAD_DESTINATION   = 'public/uploads/mycology';
var upload               = multer({dest: UPLOAD_DESTINATION});
var mongoose             = require('mongoose');
var ObjectModel          = mongoose.model('Mycology');
var AutoCompletion       = mongoose.model('MycologyAutoCompletion');
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
var exportXLSX          = global.myCustomVars.exportXLSX;

// Get Global variables

var ACTION_CREATE = global.myCustomVars.ACTION_CREATE;
var ACTION_EDIT   = global.myCustomVars.ACTION_EDIT;
var STR_SEPARATOR = global.myCustomVars.STR_SEPARATOR;

var dictionary = {
	vi: JSON.parse(fs.readFileSync(path.join(__dirname, '../app/asset/lang/vi.json'))),
	en: JSON.parse(fs.readFileSync(path.join(__dirname, '../app/asset/lang/eng.json')))
}

// console.log(dictionary)
global.myCustomVars.dictionary = dictionary

var PROP_FIELDS = JSON.parse(fs.readFileSync(path.join(__dirname, '../models/MycologySchemaProps.json')).toString());

var PROP_FIELDS_OBJ = {};
var LABEL = {};

PROP_FIELDS.map(function (element, index) {
	PROP_FIELDS_OBJ[element.name] = index;
	LABEL[element.name] = element.label;
});

global.myCustomVars.models['nam'].PROP_FIELDS = PROP_FIELDS;
global.myCustomVars.models['nam'].PROP_FIELDS_OBJ = PROP_FIELDS_OBJ;
global.myCustomVars.models['nam'].UPLOAD_DESTINATION = UPLOAD_DESTINATION;

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

var aclMiddlewareBaseURL   = '/content/nam';
var objectModelName        = 'mycology';
var objectModelNames       = 'mycologies';
var objectModelIdParamName = 'id';
var objectBaseURL          = '/nam';
var objectModelLabel       = 'nấm';
var objectDictionaryCode   = 'myc';

const ROOT = path.join(__dirname, '../');

LABEL.objectModelLabel = objectModelLabel;

var bundle = {
	Log                    : Log,
	AutoCompletion         : AutoCompletion,
	ObjectModel            : ObjectModel,
	objectModelName        : objectModelName,
	objectModelNames       : objectModelNames,
	objectModelIdParamName : objectModelIdParamName,
	objectBaseURL          : objectBaseURL,
	PROP_FIELDS            : PROP_FIELDS,
	UPLOAD_DESTINATION     : UPLOAD_DESTINATION,
	PROP_FIELDS_OBJ        : PROP_FIELDS_OBJ,
	LABEL                  : LABEL,
	aclMiddlewareBaseURL   : aclMiddlewareBaseURL,
	objectModelLabel       : objectModelLabel
}

global.myCustomVars.models['nam'].bundle = bundle;

var saveOrUpdate           = global.myCustomVars.createSaveOrUpdateFunction(bundle);


// Change code above this line

// ==========================================

// Fixed Code

module.exports = function (router) {

var postHandler = global.myCustomVars.postHandler;
router.post(objectBaseURL, aclMiddleware(aclMiddlewareBaseURL, 'create'),
	upload.fields(FILE_FIELDS.reduce(function (preArray, curElement) {
		preArray.push({name: curElement.name}); 
		return preArray;
	}, [])),
	postHandler({
		ObjectModel: ObjectModel,
		saveOrUpdate: saveOrUpdate,
		UPLOAD_DESTINATION: UPLOAD_DESTINATION
	})
)

var putHandler = global.myCustomVars.putHandler;
router.put(objectBaseURL, aclMiddleware(aclMiddlewareBaseURL, 'edit'), 
	upload.fields(FILE_FIELDS.reduce(function (preArray, curElement) {
		preArray.push({name: curElement.name}); 
		return preArray;
	}, [])),
	(req, res, next) => {
		// need to clear flag here
		delete req.body.action;
		next();
	},
	putHandler({
		objectModelIdParamName: objectModelIdParamName,
		UPLOAD_DESTINATION: UPLOAD_DESTINATION,
		ObjectModel: ObjectModel,
		saveOrUpdate: saveOrUpdate
	})
)

router.put(objectBaseURL + '/preservation', aclMiddleware(aclMiddlewareBaseURL, 'preserve'), 
	upload.fields(FILE_FIELDS.reduce(function (preArray, curElement) {
		preArray.push({name: curElement.name}); 
		return preArray;
	}, [])),
	(req, res, next) => {
		// need to set flag here
		req.body.action = 'preservation';
		next();
	},
	putHandler({
		objectModelIdParamName: objectModelIdParamName,
		UPLOAD_DESTINATION: UPLOAD_DESTINATION,
		ObjectModel: ObjectModel,
		saveOrUpdate: saveOrUpdate
	})
)

var chownHandler = global.myCustomVars.chownHandler; // Only manager, admin
router.put(objectBaseURL + '/chown', aclMiddleware('/manager', 'edit'), 
	upload.fields(FILE_FIELDS.reduce(function (preArray, curElement) {
		preArray.push({name: curElement.name}); 
		return preArray;
	}, [])),
	chownHandler({
		ObjectModel: ObjectModel,
		UPLOAD_DESTINATION: UPLOAD_DESTINATION,
		objectModelIdParamName: objectModelIdParamName,
		objectBaseURL: objectBaseURL,
		objectModelName: objectModelName,
		PROP_FIELDS: PROP_FIELDS,
		PROP_FIELDS_OBJ: PROP_FIELDS_OBJ,
		LABEL: LABEL,
		objectModelLabel: objectModelLabel,
		aclMiddlewareBaseURL: aclMiddlewareBaseURL
	})
)


var getAllHandler = global.myCustomVars.getAllHandler;
router.get(objectBaseURL, aclMiddleware(aclMiddlewareBaseURL, 'view'), getAllHandler({
	ObjectModel: ObjectModel,
	UPLOAD_DESTINATION: UPLOAD_DESTINATION,
	objectModelName: objectModelName,
	objectModelNames: objectModelNames,
	PROP_FIELDS: PROP_FIELDS,
	PROP_FIELDS_OBJ: PROP_FIELDS_OBJ
}))

var getAutoCompletionHandler = global.myCustomVars.getAutoCompletionHandler;
router.get(objectBaseURL + '/auto', aclMiddleware(aclMiddlewareBaseURL, 'create'), getAutoCompletionHandler({
	AutoCompletion: AutoCompletion,
	UPLOAD_DESTINATION: UPLOAD_DESTINATION
}))

var getFieldsHandler = global.myCustomVars.getFieldsHandler;
router.get(objectBaseURL + '/fields', aclMiddleware(aclMiddlewareBaseURL, 'view'), getFieldsHandler({
	PROP_FIELDS: PROP_FIELDS,
	PROP_FIELDS_OBJ: PROP_FIELDS_OBJ,
	LABEL: LABEL,
}))

var searchHandler = global.myCustomVars.searchHandler;
router.get(objectBaseURL + '/search', aclMiddleware(aclMiddlewareBaseURL, 'view'), searchHandler({
	ObjectModel: ObjectModel,
	UPLOAD_DESTINATION: UPLOAD_DESTINATION,
	objectModelName: objectModelName,
	objectModelNames: objectModelNames,
	PROP_FIELDS: PROP_FIELDS,
	PROP_FIELDS_OBJ: PROP_FIELDS_OBJ
}))

var getSingleHandler = global.myCustomVars.getSingleHandler;
router.get(objectBaseURL + '/:objectModelIdParamName', aclMiddleware(aclMiddlewareBaseURL, 'view'), getSingleHandler({
	ObjectModel: ObjectModel,
	UPLOAD_DESTINATION: UPLOAD_DESTINATION,
	objectModelIdParamName: objectModelIdParamName,
	objectBaseURL: objectBaseURL,
	objectModelName: objectModelName,
	PROP_FIELDS: PROP_FIELDS,
	PROP_FIELDS_OBJ: PROP_FIELDS_OBJ,
	LABEL: LABEL,
	objectModelLabel: objectModelLabel,
	objectDictionaryCode: objectDictionaryCode,
	paragraph: {
		text: [
		'PHIẾU CƠ SỞ DỮ LIỆU MẪU NẤM', 
		// '(Ban hành kèm theo Công văn số:        /BTTNVN-DABSTMVQG, ngày         tháng          năm       )'
		],
		style: [
			{color: "000000", bold: true, font_face: "Times New Roman", font_size: 12}
			// {color: "000000", font_face: "Times New Roman", font_size: 12}
		]

	}
}))

var duplicateHandler = global.myCustomVars.duplicateHandler;
router.post(objectBaseURL + '/duplicate', aclMiddleware(aclMiddlewareBaseURL, 'view'), aclMiddleware(aclMiddlewareBaseURL, 'create'), duplicateHandler({
	ObjectModel: ObjectModel,
	UPLOAD_DESTINATION: UPLOAD_DESTINATION,
	objectModelIdParamName: objectModelIdParamName,
	objectBaseURL: objectBaseURL,
	objectModelName: objectModelName,
	PROP_FIELDS: PROP_FIELDS,
	PROP_FIELDS_OBJ: PROP_FIELDS_OBJ,
	LABEL: LABEL,
	objectModelLabel: objectModelLabel
}))

// Cái này để export file với các trường được chọn
router.post(objectBaseURL + '/:objectModelIdParamName', aclMiddleware(aclMiddlewareBaseURL, 'view'), getSingleHandler({
	ObjectModel: ObjectModel,
	UPLOAD_DESTINATION: UPLOAD_DESTINATION,
	objectModelIdParamName: objectModelIdParamName,
	objectBaseURL: objectBaseURL,
	objectModelName: objectModelName,
	PROP_FIELDS: PROP_FIELDS,
	PROP_FIELDS_OBJ: PROP_FIELDS_OBJ,
	LABEL: LABEL,
	objectModelLabel: objectModelLabel,
	paragraph: {
		text: [
		'PHIẾU CƠ SỞ DỮ LIỆU MẪU NẤM', 
		// '(Ban hành kèm theo Công văn số:        /BTTNVN-DABSTMVQG, ngày         tháng          năm       )'
		],
		style: [
			{color: "000000", bold: true, font_face: "Times New Roman", font_size: 12}
			// {color: "000000", font_face: "Times New Roman", font_size: 12}
		]

	}
}))

var getLogHandler = global.myCustomVars.getLogHandler;
router.get(objectBaseURL + '/log/:logId/:position', getLogHandler({
	UPLOAD_DESTINATION: UPLOAD_DESTINATION,
	objectBaseURL,
	objectDictionaryCode: objectDictionaryCode,
	PROP_FIELDS
}))

var deleteHandler = global.myCustomVars.deleteHandler;
router.delete(objectBaseURL, aclMiddleware(aclMiddlewareBaseURL, 'delete'), deleteHandler({
	objectModelIdParamName: objectModelIdParamName,
	UPLOAD_DESTINATION: UPLOAD_DESTINATION,
	objectModelName: objectModelName,
	objectModelIdParamName: objectModelIdParamName,
	ObjectModel: ObjectModel
}))

var deleteFileHander = global.myCustomVars.deleteFileHander; // Delete file in a field
router.delete(objectBaseURL + '/file', aclMiddleware(aclMiddlewareBaseURL, 'delete'), deleteFileHander({
	objectModelIdParamName: objectModelIdParamName,
	UPLOAD_DESTINATION: UPLOAD_DESTINATION,
	objectModelName: objectModelName,
	ObjectModel: ObjectModel,
	PROP_FIELDS: PROP_FIELDS,
	PROP_FIELDS_OBJ: PROP_FIELDS_OBJ,
	form: 'nam'
}))

router.delete(objectBaseURL + '/file/preservation', aclMiddleware(aclMiddlewareBaseURL, 'preserve'), 
	(req, res, next) => {
		req.body.action = 'preservation';
		next();
	}, deleteFileHander({
		objectModelIdParamName: objectModelIdParamName,
		UPLOAD_DESTINATION: UPLOAD_DESTINATION,
		objectModelName: objectModelName,
		ObjectModel: ObjectModel,
		PROP_FIELDS: PROP_FIELDS,
		PROP_FIELDS_OBJ: PROP_FIELDS_OBJ,
		form: 'nam'
	})
)

router.get(objectBaseURL + '/export/darwin', (req, res) => {
	require(path.join(ROOT, 'utils/makeDwCAFile/makeDCAFile'))(res, ObjectModel.modelName)
})
}