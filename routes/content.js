var express          = require('express');
var router           = express.Router();
var passport         = require('passport');
var multer           = require('multer');
const TMP_UPLOAD_DIR = 'public/uploads/tmp';
var upload           = multer({dest: TMP_UPLOAD_DIR})
const path           = require('path');
const fs             = require('fs');
const fsE            = require('fs-extra');
const ROOT           = path.join(__dirname, '../')
const mongoose       = require('mongoose');
const async          = require('asyncawait/async');
const await          = require('asyncawait/await');
const acl = global.myCustomVars.acl;


// public route
router.get('/approved', (req, res) => {
  async(() => {
    let hasTextQuery = req.query.q && req.query.q.trim();
    let MAX_RESULTS = 20;
    let models = [
      {modelName: 'co-sinh', modelTitle: 'Cổ sinh'},
      {modelName: 'dia-chat', modelTitle: 'Địa chất'},
      {modelName: 'dong-vat', modelTitle: 'Động vật'},
      {modelName: 'tho-nhuong', modelTitle: 'Thổ nhưỡng'},
      {modelName: 'thuc-vat', modelTitle: 'Thực vật'},
      {modelName: 'nam', modelTitle: 'Nấm' }
    ]
    if (req.query.model) {
      let searchIn = req.query.model.split(',')
      // console.log(searchIn);
      models = models.filter(model => {
        for(let i = 0; i < searchIn.length; i++) {
          let si = searchIn[i].trim();
          // console.log(si);
          if (si) {
            si = si.toLowerCase();
            // console.log(si, model.modelTitle.toLowerCase());
            if (si.localeCompare(model.modelTitle.toLowerCase()) == 0) {
              return true
            }
          }
        }
        return false;
      })
      delete req.query.model
    }
    // console.log(models);
    let approvedSamples = []
    for(model of models) {

      let bundle = global.myCustomVars.models[model.modelName].bundle;
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
      let selection = {deleted_at: {$eq: null}, 'flag.fApproved': true};
      // ObjectModel.find(selection, {}, {skip: 0, limit: 10, sort: {created_at: -1}}, function (err, objectInstances) {
      // Filter
      let PROP_FIELDS_OBJ = bundle.PROP_FIELDS_OBJ;
      let PROP_FIELDS = bundle.PROP_FIELDS;
      let dateMatch = [];
      // console.log(selection);
      let ObjectModel = bundle.ObjectModel;
      
      let result = await (new Promise((resolve, reject) => {
        // ObjectModel.aggregate([
        //  {$match: selection},
        //  {$group: {_id: {$meta: 'textScore'}, samples: {$push: '$$CURRENT'}, sid: {$first: '$_id'}, name: {$push: '$tenMau.tenVietNam'}, fname: {$first: '$tenMau.tenVietNam'}, c: {$sum: 1}}},
        //  // {$group: {_id: {$meta: 'textScore'}, samples: {$push: '$$CURRENT'}, sid: {$first: '$_id'}, name: {$push: '$tenMau.tenVietNam'}, fname: {$first: '$tenMau.tenVietNam'}, c: {$sum: 1}}},
        //  {$sort: {_id: -1}}], (err, aggs) => {
        ObjectModel.find(selection, {}, {sort: {updated_at: -1, created_at: -1}}, (err, samples) => {
            if (err) {
              console.log(err);
              return resolve([])
            }
            let r = [];
            let c = 0;
            samples.map((sample, idx) => {
                let id = sample._id;
                let created_at = sample.created_at;
                let updated_at = sample.updated_at;
                sample =  flatObjectModel(PROP_FIELDS, sample);
                sample._id = id;
                sample.id = id;
                sample.created_at = created_at;
                sample.updated_at = updated_at;
                sample.model = model.modelTitle
                r.push(sample)
              })
            return resolve(r)
          }
        )
      }))
      approvedSamples = approvedSamples.concat(result)
    }

    return res.status(200).json({
      status: 'success',
      total: approvedSamples.length,
      approvedSamples: approvedSamples
    })
  })()
})

router.use(isLoggedIn);

var STR_SEPARATOR = global.myCustomVars.STR_SEPARATOR;

var flatObjectModel = global.myCustomVars.flatObjectModel;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.end("up content");
});

// handle data for animal form
require('./animal.js')(router);

// handle data for soil form
require('./soil.js')(router);

// handle data for geological form
require('./geological.js')(router);

// handle data for paleontological form
require('./paleontological.js')(router);

// handle data for vegetable form
require('./vegetable.js')(router);

// handle data for mycology form
require('./mycology.js')(router);

// handle download request.
// 
// =================== NEED TO BE CHECKED VERY CAREFULLY. =====================
// =================== TO PREVENT DOWNLOADING SOURCE CODE. =====================
// 
router.get('/download/*', function (req, res, next) {
  var path = require('path');
  console.log(req.path);
  var regex = new RegExp('^\/download\/uploads.*$');
  var p = decodeURIComponent(req.path);
  if (p.indexOf('..') >= 0){
    return res.status(400).end('nice try.');
  }
  if (regex.test(p)){
    var fileLocation = p.substring('/download/'.length);
    console.log(path.join(ROOT, 'public', fileLocation));
    try{
      // fileLocation: /uploads/animal/58d79d38e2058328e82fd863_+_anhMauVat_+_Anh_1.png
      // filename: Anh_1.png
      let parts = fileLocation.split(STR_SEPARATOR);
      if (fs.existsSync(path.join(ROOT, 'public', fileLocation))) {
        res.download(path.join(ROOT, 'public', fileLocation), parts[parts.length - 1]);
      }
      else {
        return res.status(404).end('File not found')
      }
    }
    catch (e){
      console.log(e);
      return res.status(404).end('File not found')
    }
  }
  else {
    return res.status(400).end('Invalid file path ' + p);
  }
  
  // res.end('ok');
})

// upload files to tmp folders. move to real folder later.
router.get('/instant-upload', (req, res) => {
  res.render('instant-upload', {
    user: req.user,
    sidebar: {
      active: 'profile'
    },
  });
})

router.post('/instant-upload', upload.fields([{name: 'tmpfiles'}]), (req, res) => {
  console.log(req.files);
  console.log(req.body);
  let PROP_FIELDS_OBJ = global.myCustomVars.models[req.body.form].PROP_FIELDS_OBJ;
  let PROP_FIELDS = global.myCustomVars.models[req.body.form].PROP_FIELDS;
  if (!(req.body.field in PROP_FIELDS_OBJ)) {
    return res.json({
      status: 'success',
      field: req.body.field,
      randomStr: req.body.randomStr,
      files: [],
      savedFiles: [],
      id: req.body.id,
      form: req.body.form,
      warning: 'Invalid field'
    })
  }

  let invalidFiles = [];

  if ('regex' in PROP_FIELDS[PROP_FIELDS_OBJ[req.body.field]]) {
    for (let i = 0; i < req.files.tmpfiles.length; i++) {
      let file = req.files.tmpfiles[i];
      var regex = new RegExp(PROP_FIELDS[PROP_FIELDS_OBJ[req.body.field]].regex, 'i');
      if (!(regex.test(file.originalname))){

        // Opt1: Xóa hết tất cả các file vừa tải lên nếu có 1 file sai định dạng,
        //       sau đó thông báo lỗi xuống FE
        // 
        // for (let file of req.files.tmpfiles) {
        //  try {
        //    fsE.removeSync(path.join(ROOT, file.path))
        //  } catch (e) {
        //    console.log(e);
        //  }
        // }
        // 
        // Opt2: Tự động xóa các file không đúng định dạng, coi như ko có gì xảy ra
        // 
        try {
          fsE.removeSync(path.join(ROOT, file.path))
          invalidFiles.push(file.originalname);
        } catch (e) {
          console.log(e);
        } finally {
          req.files.tmpfiles.splice(i, 1);
          i--;
        }
      }
    }
  }

  
   /* { fieldname: 'tmpfiles',
       originalname: '851575_126362140881916_1086262136_n.png',
       encoding: '7bit',
       mimetype: 'image/png',
       destination: 'public/uploads/tmp',
       filename: '1370080d63c024328a49fb7cc56aa2b5',
       path: 'public\\uploads\\tmp\\1370080d63c024328a49fb7cc56aa2b5',
       size: 8752 }, */
    req.files.tmpfiles.map(cur => {
    try {
      // Xóa bỏ 2 hoặc nhiều dấu chấm liền nhau. Đề phòng lỗi khi nó cố tình download file ngoài thư mục public
      // while (cur.originalname.indexOf('..') >= 0){
      //  cur.originalname = cur.originalname.replace('..', '.');
      // }
      cur.originalname = cur.originalname.replace(/\.{2,}/g, '.');
      fsE.moveSync(path.join(ROOT, TMP_UPLOAD_DIR, cur.filename),
        path.join(ROOT, 
          TMP_UPLOAD_DIR,
          req.body.randomStr + STR_SEPARATOR + req.body.field + STR_SEPARATOR + cur.originalname
        )
      );
    }
    catch (e) {
      console.log(e);
    }
  })
  let files = []
  fs.readdirSync(path.join(ROOT, TMP_UPLOAD_DIR), {encoding: 'utf8'}).map((fileName) => {
    let prefix = req.body.randomStr + STR_SEPARATOR + req.body.field + STR_SEPARATOR;
    if (fileName.indexOf(prefix) == 0) {
      files.push(fileName.substring(fileName.lastIndexOf(STR_SEPARATOR) + STR_SEPARATOR.length))
    }
  });
  let savedFiles = []
  // TODO
  let models = {
    'co-sinh': mongoose.model('Paleontological'),
    'dia-chat': mongoose.model('Geological'),
    'dong-vat': mongoose.model('Animal'),
    'tho-nhuong': mongoose.model('Soil'),
    'thuc-vat': mongoose.model('Vegetable'),
    'nam': mongoose.model('Mycology'),
  }
  if (req.body.id && req.body.form && (req.body.form in models)) {
    // get all current saved files in the object
    let model = models[req.body.form];
    model.findById(req.body.id, (err, objectInstance) => {
      if (!err && objectInstance) {
        let UPLOAD_DESTINATION = global.myCustomVars.models[req.body.form].UPLOAD_DESTINATION;
        let objectChild = global.myCustomVars.objectChild;
        let arr = []
        if (req.body.field in PROP_FIELDS_OBJ) {
          arr = objectChild(objectInstance, PROP_FIELDS[PROP_FIELDS_OBJ[req.body.field]].schemaProp)[req.body.field];
          console.log('savedFiles');
          console.log(arr);
          arr.map(f => {
            savedFiles.push(f.split(STR_SEPARATOR)[f.split(STR_SEPARATOR).length - 1])
          })
        } else {
          console.log(req.body.field, 'not in', 'PROP_FIELDS_OBJ');
        }
      } else {
        console.log(err);
      }
      return res.json({
        status: 'success',
        field: req.body.field,
        randomStr: req.body.randomStr,
        files: files,
        savedFiles: savedFiles,
        id: req.body.id,
        form: req.body.form,
        warning: (invalidFiles.length > 0) ? ('Các file không đúng định dạng đã tự được loại bỏ: ' + invalidFiles.join(', ')) : ''
      })
    })
  } else {
    return res.json({
      status: 'success',
      field: req.body.field,
      randomStr: req.body.randomStr,
      files: files,
      savedFiles: savedFiles,
      id: req.body.id,
      form: req.body.form,
      warning: (invalidFiles.length > 0) ? ('Các file không đúng định dạng đã tự được loại bỏ: ' + invalidFiles.join(', ')) : ''
    })
  }
  // return res.json({
  //  status: 'success',
  //  field: req.body.field,
  //  randomStr: req.body.randomStr,
  //  files: files
  // })
})

router.delete('/instant-upload', upload.fields([{name: 'tmpfiles'}]), (req, res) => {
  console.log(req.files);
  console.log(req.body);
  try {
    fsE.removeSync(path.join(ROOT,
      TMP_UPLOAD_DIR, req.body.randomStr + STR_SEPARATOR + req.body.field + STR_SEPARATOR + req.body.fileName
    ))
  } catch (e) {
    console.log(e);
  }
  let files = []
  fs.readdirSync(path.join(ROOT, TMP_UPLOAD_DIR), {encoding: 'utf8'}).map((fileName) => {
    let prefix = req.body.randomStr + STR_SEPARATOR + req.body.field + STR_SEPARATOR;
    if (fileName.indexOf(prefix) == 0) {
      files.push(fileName.substring(fileName.lastIndexOf(STR_SEPARATOR) + STR_SEPARATOR.length))
    }
  });
  let savedFiles = []
  // TODO
  let models = {
    'co-sinh': mongoose.model('Paleontological'),
    'dia-chat': mongoose.model('Geological'),
    'dong-vat': mongoose.model('Animal'),
    'tho-nhuong': mongoose.model('Soil'),
    'thuc-vat': mongoose.model('Vegetable'),
    'nam': mongoose.model('Mycology'),
  }
  if (req.body.id && req.body.form && (req.body.form in models)) {
    // get all current saved files in the object
    let model = models[req.body.form];
    model.findById(req.body.id, (err, objectInstance) => {
      if (!err && objectInstance) {
        let PROP_FIELDS_OBJ = global.myCustomVars.models[req.body.form].PROP_FIELDS_OBJ;
        let PROP_FIELDS = global.myCustomVars.models[req.body.form].PROP_FIELDS;
        let UPLOAD_DESTINATION = global.myCustomVars.models[req.body.form].UPLOAD_DESTINATION;
        let objectChild = global.myCustomVars.objectChild;
        let arr = []
        if (req.body.field in PROP_FIELDS_OBJ) {
          arr = objectChild(objectInstance, PROP_FIELDS[PROP_FIELDS_OBJ[req.body.field]].schemaProp)[req.body.field];
          console.log('savedFiles');
          console.log(arr);
          arr.map(f => {
            savedFiles.push(f.split(STR_SEPARATOR)[f.split(STR_SEPARATOR).length - 1])
          })
        } else {
          console.log(req.body.field, 'not in', 'PROP_FIELDS_OBJ');
        }
      } else {
        console.log(err);
      }
      return res.json({
        status: 'success',
        field: req.body.field,
        randomStr: req.body.randomStr,
        files: files,
        savedFiles: savedFiles,
        id: req.body.id,
        form: req.body.form
      })
    })
  } else {
    return res.json({
      status: 'success',
      field: req.body.field,
      randomStr: req.body.randomStr,
      files: files,
      savedFiles: savedFiles,
      id: req.body.id,
      form: req.body.form
    })
  }
})

router.get('/search', (req, res) => {
  async(() => {
    let hasTextQuery = req.query.q && req.query.q.trim();
    let MAX_RESULTS = 20;
    let models = [
      {modelName: 'co-sinh', modelTitle: 'Cổ sinh'},
      {modelName: 'dia-chat', modelTitle: 'Địa chất'},
      {modelName: 'dong-vat', modelTitle: 'Động vật'},
      {modelName: 'tho-nhuong', modelTitle: 'Thổ nhưỡng'},
      {modelName: 'thuc-vat', modelTitle: 'Thực vật'},
      {modelName: 'nam', modelTitle: 'Nấm' }
    ]
    if (req.query.model) {
      let searchIn = req.query.model.split(',')
      // console.log(searchIn);
      models = models.filter(model => {
        for(let i = 0; i < searchIn.length; i++) {
          let si = searchIn[i].trim();
          // console.log(si);
          if (si) {
            si = si.toLowerCase();
            // console.log(si, model.modelTitle.toLowerCase());
            if (si.localeCompare(model.modelTitle.toLowerCase()) == 0) {
              return true
            }
          }
        }
        return false;
      })
      delete req.query.model
    }
    // console.log(models);
    let aggregations = []
    for(model of models) {

      let bundle = global.myCustomVars.models[model.modelName].bundle;
      // console.log(bundle);
      let allowView = await (new Promise((resolve, reject) => {
        // console.log('checking', req.session.userId, bundle.aclMiddlewareBaseURL);
        acl.isAllowed(req.session.userId, bundle.aclMiddlewareBaseURL, 'view', (err, result) => {
          if (err) {
            console.log(err);
            return resolve(false);
          }
          return resolve(result)
        })
      }))
      if (!allowView) {
        continue;
      }
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
      let selection = {deleted_at: {$eq: null}};
      // Default. User chỉ có thể xem những phiếu do chính mình tạo
      // selection['owner.userId'] = req.user._id;  => cái này là kiểu ObjectId, không phải String.
      selection['owner.userId'] = req.session.userId; // => cái này mới là String. dcm, WASTED 1 HOUR HERE

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
      let PROP_FIELDS_OBJ = bundle.PROP_FIELDS_OBJ;
      let PROP_FIELDS = bundle.PROP_FIELDS;
      let dateMatch = [];
      let aggArr = [{$match: selection}];
      for (let p in req.query) {
        if (p == 'q') {
          continue;
        }
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
            } else if (prop.type == 'Date') {
              let dateRange = req.query[p]; // 1999-2017
              let _matches = dateRange.match(/^\s*(\d+)\s*,\s*(\d+)\s*$/);
              if (_matches && (_matches.length == 3)) {
                let minYear = parseInt(_matches[1])
                let maxYear = parseInt(_matches[2])
                if (Number.isInteger(minYear) && Number.isInteger(maxYear)) { // ??? is it neccessary?
                  let m = {};
                  m[`${prop.schemaProp}.${p}`] = {$ne: null};
                  dateMatch.push({$match: m});
                  let af = {score: hasTextQuery ? {$meta: 'textScore'} : 1};
                  af[`${p}_year`] = {$year: `$${prop.schemaProp}.${p}`};
                  dateMatch.push({$addFields: af})
                  let mY = {};
                  mY[`${p}_year`] = {$lte: maxYear, $gte: minYear}
                  dateMatch.push({$match: mY});
                }
              }
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
      aggArr = aggArr.concat(dateMatch)
      if (hasTextQuery) {
        selection['$text'] = {
          '$search': req.query.q
        }
      }

      if(req.query.geoJsonObject){
        var geoJsonObject = JSON.parse(req.query.geoJsonObject);
        selection['extra.eGeoJSON.coordinates'] = {
          $geoWithin: {
            $geometry: geoJsonObject.geometry
          }
        }
      }
      // console.log(selection);
      let ObjectModel = bundle.ObjectModel;
      if (hasTextQuery) {
        aggArr.push({$group: {_id: {$meta: 'textScore'}, samples: {$push: '$$CURRENT'}, sid: {$first: '$_id'}, name: {$push: '$tenMau.tenVietNam'}, fname: {$first: '$tenMau.tenVietNam'}, c: {$sum: 1}}})
      } else {
        // Tất cả các mẫu đều đưọc đánh 1 điểm
        aggArr.push({$group: {_id: 1, samples: {$push: '$$CURRENT'}, sid: {$first: '$_id'}, name: {$push: '$tenMau.tenVietNam'}, fname: {$first: '$tenMau.tenVietNam'}, c: {$sum: 1}}})
      }
      
      aggArr.push({$sort: {_id: -1}});
      console.log(JSON.stringify(aggArr));
      let result = await (new Promise((resolve, reject) => {
        // ObjectModel.aggregate([
        //  {$match: selection},
        //  {$group: {_id: {$meta: 'textScore'}, samples: {$push: '$$CURRENT'}, sid: {$first: '$_id'}, name: {$push: '$tenMau.tenVietNam'}, fname: {$first: '$tenMau.tenVietNam'}, c: {$sum: 1}}},
        //  // {$group: {_id: {$meta: 'textScore'}, samples: {$push: '$$CURRENT'}, sid: {$first: '$_id'}, name: {$push: '$tenMau.tenVietNam'}, fname: {$first: '$tenMau.tenVietNam'}, c: {$sum: 1}}},
        //  {$sort: {_id: -1}}], (err, aggs) => {
        ObjectModel.aggregate(aggArr, (err, aggs) => {
            if (err) {
              console.log(err);
              return resolve([])
            }
            let r = [];
            let c = 0;
            for (let i = 0; i < aggs.length; i++) {
              if (c > MAX_RESULTS) {
                break;
              }
              r.push({
                score: aggs[i]._id,
                model: model.modelTitle,
                samples: aggs[i].samples
              })
              c += aggs[i].samples.length
            }
            r.map(r_ => {
              r_.samples.map((sample, idx) => {
                let id = sample._id;
                let created_at = sample.created_at;
                sample =  flatObjectModel(PROP_FIELDS, sample);
                sample._id = id;
                sample.id = id;
                sample.created_at = created_at;
                r_.samples[idx] = sample;
              })
            })
            return resolve(r)
          }
        )
      }))
      aggregations = aggregations.concat(result);
    }
    aggregations.sort((a, b) => {
      return b.score - a.score;
    })
    // return res.json({
    //  aggregations: aggregations
    // })
    let matchedSamples = [];
    for (let i = 0; i < aggregations.length; i++) {
      let agg = aggregations[i];
      if (matchedSamples.length > MAX_RESULTS) {
        break;
      }
      agg.samples.map(sample => {
        sample.model = agg.model;
        matchedSamples.push(sample)
      })
    }
    return res.status(200).json({
      status: 'success',
      total: matchedSamples.length,
      matchedSamples: matchedSamples
    })
  })()
})

function isLoggedIn (req, res, next) {
  if (!req.isAuthenticated()){
    return res.redirect('/auth/login');
  }
  return next();
}
router.get('/get-random/:num', (req, res) => {
  let numRandom = Number(req.params.num);
  const MAX_RESULTS = 30;
  if(isNaN(numRandom) || numRandom > MAX_RESULTS){
    return res.status(400).json({
      status: 'error',
      total: 0,
      data: [],
      message: "Bad request"
    })
  }

  let models = [
    {modelName: 'co-sinh', modelTitle: 'Cổ sinh', enName : 'paleontological'},
    {modelName: 'dia-chat', modelTitle: 'Địa chất', enName : 'geological'},
    {modelName: 'dong-vat', modelTitle: 'Động vật', enName : 'animal'},
    {modelName: 'tho-nhuong', modelTitle: 'Thổ nhưỡng', enName : 'soil'},
    {modelName: 'thuc-vat', modelTitle: 'Thực vật', enName : 'vegetable'},
    {modelName: 'nam', modelTitle: 'Nấm', enName: 'mycology' }
  ]
  async(() => {
    let randomObjArr = [];
    for(model of models) {
      let bundle = global.myCustomVars.models[model.modelName].bundle;
      let ObjectModel = bundle.ObjectModel;
      let result = await(new Promise((resolve, reject)=>{
        ObjectModel.aggregate([
          {$match : {
            'deleted_at': {$eq: null},
            'media.anhMauVat': {$not: {$size: 0}}
          }},
          { $sample: { size: numRandom } },
          // { $project : {
          //   img : 
          // }},
          { $project : {
            imgUrl : {$concat : ['/uploads/', model.enName, '/', {$arrayElemAt : ['$media.anhMauVat', 0]}]},
            url : {$concat : ['/content/', model.modelName, '/']},
            caption : '$tenMau.tenVietNam'
          }}
        ], (err, data)=>{
          if(err){
            console.log(err);
            resolve([]);
          } else {
            // console.log(data);
            resolve(data);
          }
        })
      }));
      // console.log(result);
      randomObjArr = randomObjArr.concat(result);
      // console.log(randomObjArr);
    }

    function getRandomSubarray(arr, size) {
      var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
      while (i-- > min) {
          index = Math.floor((i + 1) * Math.random());
          temp = shuffled[index];
          shuffled[index] = shuffled[i];
          shuffled[i] = temp;
      }
      return shuffled.slice(min);
    }
    randomObjArr = getRandomSubarray(randomObjArr, numRandom);
    randomObjArr.forEach(function(element) {
      element.url = element.url + element._id.toString();
    });

    // console.log(randomObjArr);
    return res.status(200).json({
      status: 'success',
      total: randomObjArr.length,
      data: randomObjArr
    })
  })();
});

module.exports = router;
