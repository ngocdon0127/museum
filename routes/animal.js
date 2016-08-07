var multer = require('multer');
var fs = require('fs');
var path = require('path');
var UPLOAD_DEST_ANIMAL = 'public/uploads/animal';
var upload = multer({dest: UPLOAD_DEST_ANIMAL});
var mongoose = require('mongoose');
var Animal = mongoose.model('Animal');

var IMG_FIELDS = [
	{name: 'hinhVe', animalSchemaProp: 'duLieuPhanTichMau.hinhVe'},
	{name: 'dinhKemXuLy', animalSchemaProp: 'xuLyCheTac.dinhKemXuLy'},
	{name: 'hinhAnhDinhKem', animalSchemaProp: ''},
	{name: 'dinhKemChayTrinhTuDNA', animalSchemaProp: ''},
	{name: 'dinhKemTrinhTuDNA', animalSchemaProp: ''}
];

var PROP_FIELDS = [
	{name: , animalSchemaProp: ''}
]

module.exports = function (router) {

router.post('/dong-vat', 
	upload.fields(IMG_FIELDS.reduce(function (preArray, curElement) {
		preArray.push({name: curElement.name}); 
		return preArray;
	}, [])), 
	function (req, res, next) {
		var newAnimal = new Animal();
		newAnimal.save(function (err, result) {
			if (err){
				console.log(err);
			}

			// rename images
			IMG_FIELDS.map(function (element) {
				if (element.animalSchemaProp && req.files[element.name]){
					rename(req.files[element.name], objectChild(newAnimal, element.animalSchemaProp), UPLOAD_DEST_ANIMAL, result.id);
				}
			})

			newAnimal.save(function (err, r) {
				if (err){
					console.log(err);
					res.status(500).json({
						status: 'error',
						error: 'Error while saving to database'
					})
				}
				res.status(200).json({
						status: 'success'
					})
			});
		})
})

}

function rename (curFiles, schemaField, position, mongoId) {
	console.log(schemaField);
	schemaField.splice(0, schemaField.length); // delete all old elements
	for (var i = 0; i < curFiles.length; i++) {
		var file = curFiles[i];
		try {
			var curPath = path.join(position, file.filename);
			var newFileName = mongoId + '_+_' + file.originalname;
			var newPath = path.join(position, newFileName);
			fs.renameSync(curPath, newPath);
			schemaField.push(mongoId + '_+_' + file.originalname);
		}
		catch (e){
			console.log(e);
		}
	}
}

function objectChild (object, tree) {
	var nodes = tree.trim().split('.');
	for (var i = 0; i < nodes.length; i++) {
		object = object[nodes[i]];
	}
	return object;
}