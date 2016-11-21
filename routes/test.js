var express = require('express');
var router = express.Router();
// var XLSX = require('xlsx');
// var datenum                    = global.myCustomVars.datenum;
// var sheet_from_array_of_arrays = global.myCustomVars.sheet_from_array_of_arrays;
// var Workbook                   = global.myCustomVars.Workbook;

/* GET users listing. */
router.get('/wb', function(req, res, next) {

	var officegen = require('officegen');
	var docx = officegen({
		type: 'docx',
		subjects: 'Mẫu phiếu dữ liệu',
	});

	docx.on('finalize', function (written) {
		console.log("Docx: written " + written + " bytes.");
	});

	docx.on('error', function (error) {
		console.log("Docx: Error");
		console.log(error);
		console.log("===");
	})

	// var pObj = docx.createP();
	// pObj.options.align = "justify";
	// pObj.addText("Nguyễn Ngọc Đôn\n", {color: 'ff0000', bold: true, font_face: 'Times New Roman'});
	// pObj.addText("Nguyễn Ngọc Đôn", {color: '00ff00', bold: true, font_face: 'Monospace', font_size: 40});
	
	var labelOpts = {
		// cellColWidth: 2261,
		// b:true,
		sz: '20',
		shd: {
			fill: "FFFFFF",
			// themeFill: "text1",
			// "themeFillTint": "30"
		},
		fontFamily: "Avenir Book",
		align: 'center'
	};

	var detailOpts = {
		// cellColWidth: 2261,
		// b:true,
		sz: '12',
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
			val: "No.",
			opts: labelOpts
		},
		{
			val: "Title1",
			opts: labelOpts
		},
		{
			val: "Title2",
			opts: labelOpts
		}
	],
	[
		{
			val: "No.",
			opts: labelOpts
		},
		{
			val: "Title1",
			opts: {
				// cellColWidth: 2261,
				// b:true,
				sz: '20',
				shd: {
					fill: "FFFFFF",
					// themeFill: "text1",
					// "themeFillTint": "30"
				},
				gridSpan: 2,
				fontFamily: "Avenir Book"
			}
		}
	]
	];

	var data = [
		[1,'All grown-ups were once children',''],
		[2,'there is no harm in putting off a piece of work until another day.',''],
		[3,'But when it is a matter of baobabs, that always means a catastrophe.',''],
		[4,'watch out for the baobabs!','END'],
	];

	// for(var i = 0; i < data.length; i++){
	// 	var row = data[i];
	// 	var dt = JSON.parse(JSON.stringify(detailOpts));
	// 	dt.cellColWidth = 1000;
	// 	table.push([
	// 	{
	// 		val: data[i][0],
	// 		opts: labelOpts
	// 	},
	// 	{
	// 		val: data[i][1],
	// 		opts: labelOpts
	// 	},
	// 	null
	// 	])
	// }

	var tableStyle = {
		// tableColWidth: 2261,
		tableSize: 100,
		// tableColor: "ada",
		tableAlign: "left",
		tableFontFamily: "Comic Sans MS",
		borders: true
	}

	docx.createTable (table, tableStyle);

	var fs = require('fs');
	var outputStream = fs.createWriteStream('test.docx');
	outputStream.on('close', function () {
		console.log('output done.');
		res.download('test.docx');
	});
	docx.generate(outputStream);


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
	// res.end("Done");
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
