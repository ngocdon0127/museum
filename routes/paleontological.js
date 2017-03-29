var multer               = require('multer');
var fs                   = require('fs');
var path                 = require('path');
var UPLOAD_DEST_ANIMAL   = 'public/uploads/paleontological';
var upload               = multer({dest: UPLOAD_DEST_ANIMAL});
var mongoose             = require('mongoose');
var ObjectModel          = mongoose.model('Paleontological');
var AutoCompletion       = mongoose.model('PaleontologicalAutoCompletion');
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
var STR_SEPERATOR = global.myCustomVars.STR_SEPERATOR;

var PROP_FIELDS = JSON.parse(fs.readFileSync(path.join(__dirname, '../models/PaleontologicalSchemaProps.json')).toString());

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


var aclMiddlewareBaseURL   = '/content/co-sinh';
var objectModelName        = 'paleontological';
var objectModelNames       = 'paleontologicals';
var objectModelIdParamName = 'id';
var objectBaseURL          = '/co-sinh';
var objectModelLabel       = 'cổ sinh';

LABEL.objectModelLabel = objectModelLabel;

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

var postHandler = global.myCustomVars.postHandler;
router.post(objectBaseURL, aclMiddleware(aclMiddlewareBaseURL, 'create'),
	upload.fields(FILE_FIELDS.reduce(function (preArray, curElement) {
		preArray.push({name: curElement.name}); 
		return preArray;
	}, [])),
	postHandler({
		ObjectModel: ObjectModel,
		saveOrUpdate: saveOrUpdate,
		UPLOAD_DEST_ANIMAL: UPLOAD_DEST_ANIMAL
	})
)

var putHandler = global.myCustomVars.putHandler;
router.put(objectBaseURL, aclMiddleware(aclMiddlewareBaseURL, 'edit'), 
	upload.fields(FILE_FIELDS.reduce(function (preArray, curElement) {
		preArray.push({name: curElement.name}); 
		return preArray;
	}, [])),
	putHandler({
		objectModelIdParamName: objectModelIdParamName,
		UPLOAD_DEST_ANIMAL: UPLOAD_DEST_ANIMAL,
		ObjectModel: ObjectModel,
		saveOrUpdate: saveOrUpdate
	})
)


var getAllHandler = global.myCustomVars.getAllHandler;
router.get(objectBaseURL, aclMiddleware(aclMiddlewareBaseURL, 'view'), getAllHandler({
	ObjectModel: ObjectModel,
	UPLOAD_DEST_ANIMAL: UPLOAD_DEST_ANIMAL,
	objectModelNames: objectModelNames,
	PROP_FIELDS: PROP_FIELDS
}))

var getAutoCompletionHandler = global.myCustomVars.getAutoCompletionHandler;
router.get(objectBaseURL + '/auto', aclMiddleware(aclMiddlewareBaseURL, 'create'), getAutoCompletionHandler({
	AutoCompletion: AutoCompletion,
	UPLOAD_DEST_ANIMAL: UPLOAD_DEST_ANIMAL
}))

var getSingleHandler = global.myCustomVars.getSingleHandler;
router.get(objectBaseURL + '/:objectModelIdParamName', aclMiddleware(aclMiddlewareBaseURL, 'view'), getSingleHandler({
	ObjectModel: ObjectModel,
	UPLOAD_DEST_ANIMAL: UPLOAD_DEST_ANIMAL,
	objectModelIdParamName: objectModelIdParamName,
	objectBaseURL: objectBaseURL,
	objectModelName: objectModelName,
	PROP_FIELDS: PROP_FIELDS,
	LABEL: LABEL,
	objectModelLabel: objectModelLabel,
	paragraph: {
		text: [
		'PHIẾU CƠ SỞ DỮ LIỆU MẪU CỔ SINH HỌC', 
		// '(Ban hành kèm theo Công văn số:        /BTTNVN-DABSTMVQG, ngày         tháng          năm       )'
		],
		style: [
			{color: "000000", bold: true, font_face: "Times New Roman", font_size: 12},
			// {color: "000000", font_face: "Times New Roman", font_size: 12}
		]

	}
}))

var getLogHandler = global.myCustomVars.getLogHandler;
router.get(objectBaseURL + '/log/:logId/:position', getLogHandler({
	UPLOAD_DEST_ANIMAL: UPLOAD_DEST_ANIMAL,
	objectBaseURL,
	PROP_FIELDS
}))

var deleteHandler = global.myCustomVars.deleteHandler;
router.delete(objectBaseURL, aclMiddleware(aclMiddlewareBaseURL, 'delete'), deleteHandler({
	objectModelIdParamName: objectModelIdParamName,
	UPLOAD_DEST_ANIMAL: UPLOAD_DEST_ANIMAL,
	objectModelName: objectModelName,
	objectModelIdParamName: objectModelIdParamName,
	ObjectModel: ObjectModel
}))
}