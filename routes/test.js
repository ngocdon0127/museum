var express = require('express');
var router = express.Router();
var path = require('path');
var officegen = require('officegen');
var docx = officegen({
	type: 'docx',
	subjects: 'Mẫu phiếu dữ liệu',
	// orientation: 'landscape'
	orientation: 'portrait'
});
var fs = require('fs');
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

router.get('/json', function (req, res, next) {
	var table = [
	    [{
	        val: "No.",
	        opts: {
	            cellColWidth: 4261,
	            b:true,
	            sz: '48',
	            shd: {
	                fill: "7F7F7F",
	                themeFill: "text1",
	                "themeFillTint": "80"
	            },
	            fontFamily: "Avenir Book"
	        }
	    },{
	        val: "Title1",
	        opts: {
	            b:true,
	            u: true,
	            color: "A00000",
	            align: "right",
	            shd: {
	                fill: "92CDDC",
	                themeFill: "text1",
	                "themeFillTint": "80"
	            }
	        }
	    },{
	        val: "Title2",
	        opts: {
	            align: "center",
	            cellColWidth: 42,
	            b:true,
	            sz: '48',
	            shd: {
	                fill: "92CDDC",
	                themeFill: "text1",
	                "themeFillTint": "80"
	            }
	        }
	    }],
	    [1,'All grown-ups were once children',''],
	    [2,'there is no harm in putting off a piece of work until another day.',''],
	    [3,'But when it is a matter of baobabs, that always means a catastrophe.',''],
	    [4,'watch out for the baobabs!','END'],
	]

	var tableStyle = {
	    tableColWidth: 4261,
	    tableSize: 24,
	    tableColor: "ada",
	    tableAlign: "left",
	    tableFontFamily: "Comic Sans MS"
	}

	var data = [[{
	        type: "text",
	        val: "Simple"
	    }, {
	        type: "text",
	        val: " with color",
	        opt: { color: '000088' }
	    }, {
	        type: "text",
	        val: "  and back color.",
	        opt: { color: '00ffff', back: '000088' }
	    }, {
	        type: "linebreak"
	    }, {
	        type: "text",
	        val: "Bold + underline",
	        opt: { bold: true, underline: true }
	    }], {
	        type: "horizontalline"
	    }, [{ backline: 'EDEDED' }, {
	        type: "text",
	        val: "  backline text1.",
	        opt: { bold: true }
	    }, {
	        type: "text",
	        val: "  backline text2.",
	        opt: { color: '000088' }
	    }], {
	        type: "text",
	        val: "Left this text.",
	        lopt: { align: 'left' }
	    }, {
	        type: "text",
	        val: "Center this text.",
	        lopt: { align: 'center' }
	    }, {
	        type: "text",
	        val: "Right this text.",
	        lopt: { align: 'right' }
	    }, {
	        type: "text",
	        val: "Fonts face only.",
	        opt: { font_face: 'Arial' }
	    }, {
	        type: "text",
	        val: "Fonts face and size.",
	        opt: { font_face: 'Arial', font_size: 40 }
	    }, {
	        type: "table",
	        val: table,
	        opt: tableStyle
	    }, [{ // arr[0] is common option.
	        align: 'right'
	    }, {
	        type: "text",
	        val: 'hihi'
	    },{
	        type: "text",
	        val: 'hihi1'
	    }], {
	        type: "pagebreak"
	    }
	]

	docx.createByJson(data);

	var tmpFileName = (new Date()).getTime() + '.tmp.docx';
	var outputStream = fs.createWriteStream(path.join(__dirname, tmpFileName));
	outputStream.on('close', function () {
		console.log('output done.');
		// console.log(LABEL);
		var outputFileName = 'PCSDL';
		
		var extension = 'docx';
		if (extension == 'docx'){
			outputFileName += '.docx';
			res.download(path.join(__dirname, tmpFileName), outputFileName, function (err) {
				fs.unlink(path.join(__dirname, tmpFileName));
			});
		}
		else if (extension == 'pdf'){
			console.log('pdf');
			outputFileName += '.pdf';
			var exec = require('child_process').exec;
			var cmd = 'libreoffice --invisible --convert-to pdf ' + tmpFileName;
			exec(cmd, function (err, stdout, stderr) {
				if (err){
					console.log(err);
					return res.end('err');
				}
				// console.log('---')
				// console.log(stdout);
				// console.log('---')
				// console.log(stderr);
				// console.log('---')
				pdfFileName = tmpFileName.substring(0, tmpFileName.length - 'docx'.length) + 'pdf';
				// console.log(pdfFileName);
				// console.log(outputFileName);
				res.download(path.join(__dirname, pdfFileName), outputFileName, function (err) {
					fs.unlink(path.join(__dirname, pdfFileName));
					fs.unlink(path.join(__dirname, tmpFileName));
				});
			})
			// return res.end("ok")

		}
		// res.end("OK");
	});
	docx.generate(outputStream);
})

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
