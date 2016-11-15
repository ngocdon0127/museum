var express = require('express');
var router = express.Router();
var XLSX = require('xlsx');
var datenum                    = global.myCustomVars.datenum;
var sheet_from_array_of_arrays = global.myCustomVars.sheet_from_array_of_arrays;
var Workbook                   = global.myCustomVars.Workbook;

/* GET users listing. */
router.get('/wb', function(req, res, next) {

	

	// var workbook = new Workbook()
	// 	.addRowsToSheet("Main", [
	// 	  ["This is a merged cell"],
	// 	  [
	// 		{"v": "Blank"},
	// 		{"v": "Red", "s": {fill: { fgColor: { rgb: "FFFF0000"}}}},
	// 		{"v": "Green", "s": {fill: { fgColor: { rgb: "FF00FF00"}}}},
	// 		{"v": "Blue", "s": {fill: { fgColor: { rgb: "FF0000FF"}}}}
	// 	  ],
	// 	  [
	// 		{"v": "Default"},
	// 		{"v": "Arial", "s": {font: {name: "Arial", sz: 24}}},
	// 		{"v": "Times New Roman", "s": {font: {name: "Times New Roman", sz: 16}}},
	// 		{"v": "Courier New", "s": {font: {name: "Courier New", sz: 14}}}
	// 	  ],
	// 	  [
	// 		0.618033989,
	// 		{"v": 0.618033989},
	// 		{"v": 0.618033989, "t": "n"},
	// 		{"v": 0.618033989, "t": "n", "s": { "numFmt": "0.00%"}},
	// 		{"v": 0.618033989, "t": "n", "s": { "numFmt": "0.00%"}, fill: { fgColor: { rgb: "FFFFCC00"}}},
	// 		[(new Date()).toLocaleString()]
	// 	  ]
	// 	]).mergeCells("Main", {
	// 	  "s": {"c": 0, "r": 0 },
	// 	  "e": {"c": 2, "r": 0 }
	// 	}).finalize();
	// XLSX.writeFile(workbook, 'wb.xlsx');
	res.end("Done");
});

// router.get('/pdf', function (req, res, next) {
// 	var msopdf = require('node-msoffice-pdf');
// 	msopdf(null, function (err, office) {
// 		if (err){
// 			console.log(err);
// 			return res.end("err");
// 		}
// 		office.excel({input: "test.xlsx", output: "outfile.pdf"}, function (error, pdf) {
// 			if (error){
// 				console.log(error);
// 				return res.end("err1");
// 			}
// 			return res.end("OK");
// 		})
// 	})
// })

module.exports = router;
