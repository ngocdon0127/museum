var fs = require('fs-extra')
var path = require('path')

var UPLOAD_DESTINATION   = 'public/uploads/vegetable';
var mongoose = require('mongoose');
var CryptoJS = require('crypto-js');
var configDB = require('./config/config').database;
var mongooseConnection = mongoose.connect(configDB.url);
require('./models/User.js')(mongoose);
require('./models/SharedData.js')(mongoose);

global.myCustomVars = {};
global.myCustomVars.models = {};

require('./models/Animal.js')(mongoose);
require('./models/AnimalAutoCompletion.js')(mongoose);
require('./models/Soil.js')(mongoose);
require('./models/SoilAutoCompletion.js')(mongoose);

require('./models/Geological.js')(mongoose);
require('./models/GeologicalAutoCompletion.js')(mongoose);

require('./models/Paleontological.js')(mongoose);
require('./models/PaleontologicalAutoCompletion.js')(mongoose);

require('./models/Vegetable.js')(mongoose);
require('./models/VegetableAutoCompletion.js')(mongoose);

require('./models/Mycology.js')(mongoose);
require('./models/MycologyAutoCompletion.js')(mongoose);
require('./models/Log.js')(mongoose);

require('./bootstrap');

var ObjectModel          = mongoose.model('Mycology');
var AutoCompletion       = mongoose.model('MycologyAutoCompletion');
var User                 = mongoose.model('User');
var Log                  = mongoose.model('Log');

var PROP_FIELDS = JSON.parse(fs.readFileSync(path.join(__dirname, './models/MycologySchemaProps.json')).toString());

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

let options = {
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

	},
    req: {}
}

var async = require('asyncawait/async');
var await = require('asyncawait/await');
let result = []

if (process.argv.length < 3) {
    console.log('Missing maDeTai');
    process.exit(1)
}

if (process.argv.length < 4) {
    console.log('Missing command');
    process.exit(1)
}

let maDeTaiToExport = process.argv[2]

let exportDbToJson = async(() => {

    const User = mongoose.model('User')
    let users = []
    try {
        users = await (User.find().exec())
    } catch (e) {
        console.log(e);
        return
    }
    let userEmails = {}
    for(let user of users) {
        userEmails[user._id + ''] = user.username
    }
	
    const Mycology = mongoose.model('Mycology')
    let objectModelArr = []
    try {
        objectModelArr = await (Mycology.find({"maDeTai.maDeTai": maDeTaiToExport, deleted_at: null}).exec())
        // objectModelArr = await (Mycology.find({_id: mongoose.Types.ObjectId('5e5f304e803e1703bdaba5a3')}).exec())
        // objectModelArr = await (Vegetable.findById('5e5f304e803e1703bdaba5a3').exec())
    } catch (e) {
        console.log(e);
    }
    console.log(objectModelArr.length);
    let totalSuccess = 0
    let totalFailed = 0
    for(let i = 0; i < objectModelArr.length; i++) {
        let instance = objectModelArr[i]
        console.log('processing', i + 1, '/', objectModelArr.length);
        console.log(instance.soHieu.soHieuBTTNVN);

        let resultExportFile = await(global.myCustomVars.exportFilePromise(instance, options, 'docx'))
        console.log(resultExportFile.status);
        if (resultExportFile.status != 'success') {
            totalFailed++
            console.log('error processing', instance._id);
            continue
        }
        totalSuccess++
        let createdBy = ''
        if (instance.created_by) {
            createdBy = userEmails[instance.created_by.userId] ? userEmails[instance.created_by.userId] : instance.created_by.userFullName
        }
        let row = {
            id: instance._id + '',
            createdBy: createdBy,
            maDeTai: instance.maDeTai.maDeTai,
            tenVietNam: instance.tenMau.tenVietNam,
            soHieuBTTNVN: instance.soHieu.soHieuBTTNVN,
            soHieuBaoTangCS: instance.soHieu.soHieuBaoTangCS,
            soHieuThucDia: instance.soHieu.soHieuThucDia,
            statistics: resultExportFile.info.statistics
        }
        result.push(row)
    }

    fs.writeFileSync(path.join(__dirname, 'exports', `result-export-nghiem-thu-de-tai-nam-${convertFileName(maDeTaiToExport)}.json`), JSON.stringify(result, null, 2))
    console.log('totalSuccess', totalSuccess);
    console.log('totalFailed', totalFailed);
	
	mongoose.connection.close();

})


function generateCsvFile() {
    let data = JSON.parse(fs.readFileSync(path.join(__dirname, 'exports', `result-export-nghiem-thu-de-tai-nam-${convertFileName(maDeTaiToExport)}.json`)))
    let csvContent = `"STT","Mã đề tài","Người tạo","Số hiệu BTTNVN","Số hiệu Bảo tàng cơ sở","Tên Việt Nam","Số hiệu thực địa","Số trường bắt buộc đã nhập","Số trường bắt buộc","Số trường không bắt buộc đã nhập","Số trường không bắt buộc"\n`
    for(let i = 0; i < data.length; i++) {
        let row = data[i]
        csvContent += `${i + 1},"${row.maDeTai}","${row.createdBy}","${row.soHieuBTTNVN}","${row.soHieuBaoTangCS}","${row.tenVietNam}","${row.soHieuThucDia}",${row.statistics.moneyPropFilled},${row.statistics.totalMoneyProp},${row.statistics.nonMoneyPropFilled},${row.statistics.totalNonMoneyProp}\n`
    }
    fs.writeFileSync(path.join(__dirname, 'exports', `result-export-nghiem-thu-de-tai-nam-${convertFileName(maDeTaiToExport)}.csv`), csvContent)
    console.log('done');
    mongoose.connection.close();
}


// generateCsvFile()

function convertFileName(str) {
    // return str
    str += ''
    // str = str.replace(/[^a-zA-Z0-9-_.]/g, '-').replace(/-{2,}/g, '-')
    str = str.replace(/[\/\\\?\!@#\$%\^&*\[\]<>\'\"~\r\n\t]/g, '-').replace(/-{2,}/g, '-')
    return str
}

// console.log(process.argv);

if (process.argv[3] == 'db-to-json') {
    exportDbToJson()
} else if (process.argv[3] == 'json-to-csv') {
    generateCsvFile()
} else {
    console.log('Invalid command');
}