var fs = require('fs-extra')
var path = require('path')

var UPLOAD_DESTINATION   = 'public/uploads/soil';
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

var ObjectModel          = mongoose.model('Soil');
var AutoCompletion       = mongoose.model('SoilAutoCompletion');
var User                 = mongoose.model('User');
var Log                  = mongoose.model('Log');

var PROP_FIELDS = JSON.parse(fs.readFileSync(path.join(__dirname, './models/SoilSchemaProps.json')).toString());

var PROP_FIELDS_OBJ = {};
var LABEL = {};

PROP_FIELDS.map(function (element, index) {
	PROP_FIELDS_OBJ[element.name] = index;
	LABEL[element.name] = element.label;
});

global.myCustomVars.models['tho-nhuong'].PROP_FIELDS = PROP_FIELDS;
global.myCustomVars.models['tho-nhuong'].PROP_FIELDS_OBJ = PROP_FIELDS_OBJ;
global.myCustomVars.models['tho-nhuong'].UPLOAD_DESTINATION = UPLOAD_DESTINATION;

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

var aclMiddlewareBaseURL   = '/content/tho-nhuong';
var objectModelName        = 'soil';
var objectModelNames       = 'soils';
var objectModelIdParamName = 'id';
var objectBaseURL          = '/tho-nhuong';
var objectModelLabel       = 'thổ nhưỡng';
var objectDictionaryCode   = 'land';

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

global.myCustomVars.models['tho-nhuong'].bundle = bundle;

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
		'PHIẾU CƠ SỞ DỮ LIỆU MẪU THỔ NHƯỠNG', 
		// '(Ban hành kèm theo Công văn số:        /BTTNVN-DABSTMVQG, ngày         tháng          năm       )'
		],
		style: [
			{color: "000000", bold: true, font_face: "Times New Roman", font_size: 12},
			// {color: "000000", font_face: "Times New Roman", font_size: 12}
		]

    },
    req: {}
}

var async = require('asyncawait/async');
var await = require('asyncawait/await');
let result = []
async(() => {
	
    const Soil = mongoose.model('Soil')
    let soils = []
    try {
        soils = await (Soil.find({"maDeTai.maDeTai": 'BSTMV.30/18-21', deleted_at: null}).exec())
        // soils = await (Soil.find({_id: mongoose.Types.ObjectId('5e5f304e803e1703bdaba5a3')}).exec())
        // soils = await (Soil.findById('5e5f304e803e1703bdaba5a3').exec())
    } catch (e) {
        console.log(e);
    }
    console.log(soils.length);
    let totalSuccess = 0
    let totalFailed = 0
    for(let i = 0; i < soils.length; i++) {
        let soil = soils[i]
        console.log('processing', i + 1, '/', soils.length);
        console.log(soil.soHieu.soHieuBTTNVN);

        let resultExportFile = await(global.myCustomVars.exportFilePromise(soil, options, 'docx'))
        console.log(resultExportFile.status);
        if (resultExportFile.status != 'success') {
            totalFailed++
            console.log('error processing', soil._id);
            continue
        }
        totalSuccess++
        let row = {
            id: soil._id + '',
            maDeTai: soil.maDeTai.maDeTai,
            tenVietNam: soil.tenMau.tenVietNam,
            soHieuBTTNVN: soil.soHieu.soHieuBTTNVN,
            soHieuBaoTangCS: soil.soHieu.soHieuBaoTangCS,
            soHieuThucDia: soil.soHieu.soHieuThucDia,
            statistics: resultExportFile.info.statistics
        }
        result.push(row)
    }

    fs.writeFileSync('result-export-nghiem-thu-de-tai.json', JSON.stringify(result, null, 2))
    console.log('totalSuccess', totalSuccess);
    console.log('totalFailed', totalFailed);
	
	mongoose.connection.close();

})

function generateCsvFile() {
    let data = JSON.parse(fs.readFileSync('result-export-nghiem-thu-de-tai.json'))
    let csvContent = `"STT","Mã đề tài","Số hiệu BTTNVN","Số hiệu Bảo tàng cơ sở","Tên Việt Nam","Số hiệu thực địa","Số trường bắt buộc đã nhập","Số trường bắt buộc","Số trường không bắt buộc đã nhập","Số trường không bắt buộc"\n`
    for(let i = 0; i < data.length; i++) {
        let row = data[i]
        csvContent += `${i + 1},"${row.maDeTai}","${row.soHieuBTTNVN}","${row.soHieuBaoTangCS}","${row.tenVietNam}","${row.soHieuThucDia}",${row.statistics.moneyPropFilled},${row.statistics.totalMoneyProp},${row.statistics.nonMoneyPropFilled},${row.statistics.totalNonMoneyProp}\n`
    }
    fs.writeFileSync('result-export-nghiem-thu-de-tai.csv', csvContent)
    console.log('done');
}


// generateCsvFile()