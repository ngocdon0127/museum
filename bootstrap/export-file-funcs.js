const fs = require('fs');
const fsE = require('fs-extra');
const path = require('path');
const ROOT = path.join(__dirname, '../');
const mongoose = require('mongoose');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
let acl = global.myCustomVars.acl;
let getPublicIP                = global.myCustomVars.getPublicIP;
let objectChild                = global.myCustomVars.objectChild;
let checkRequiredParams        = global.myCustomVars.checkRequiredParams;
let checkUnNullParams          = global.myCustomVars.checkUnNullParams;
let responseError              = global.myCustomVars.responseError;
let responseSuccess            = global.myCustomVars.responseSuccess;
let rename                     = global.myCustomVars.rename;
let propsName                  = global.myCustomVars.propsName;
let flatObjectModel            = global.myCustomVars.flatObjectModel;
let createSaveOrUpdateFunction = global.myCustomVars.createSaveOrUpdateFunction;

let ACTION_CREATE                = global.myCustomVars.ACTION_CREATE;
let ACTION_EDIT                  = global.myCustomVars.ACTION_EDIT;
let STR_SEPERATOR                = global.myCustomVars.STR_SEPERATOR;
let STR_AUTOCOMPLETION_SEPERATOR = global.myCustomVars.STR_AUTOCOMPLETION_SEPERATOR;
let ORIGIN_TIME                  = global.myCustomVars.ORIGIN_TIME;
let NULL_TIMES                   = global.myCustomVars.NULL_TIMES;
let DATE_FULL                    = global.myCustomVars.DATE_FULL;
let DATE_MISSING_DAY             = global.myCustomVars.DATE_MISSING_DAY;
let DATE_MISSING_MONTH           = global.myCustomVars.DATE_MISSING_MONTH;
let EXPORT_NULL_FIELD            = global.myCustomVars.EXPORT_NULL_FIELD;

let CITIES = global.myCustomVars.CITIES;
let DISTRICTS = global.myCustomVars.DISTRICTS;
let WARDS = global.myCustomVars.WARDS;

var exportFilePromise = (objectInstance, options, extension) => {
	let docxHTMLSource = fs.readFileSync(path.join(ROOT, 'templates', 'header.html')).toString('utf-8');
	let PROP_FIELDS = options.PROP_FIELDS;

	let ObjectModel = options.ObjectModel;
	let LABEL = options.LABEL;
	let UPLOAD_DESTINATION = options.UPLOAD_DESTINATION;
	let paragraph = options.paragraph;
	let objectModelName = options.objectModelName;
	let printedProperties = options.req.body;
	let IMG_MAX_WIDTH = 300;
	let IMG_MAX_HEIGHT = 300;
	let printAll = !(('body' in options.req) && (options.req.body.custom == 1))

	// const images = require('images');
	const images = require('image-size');
	// function to encode file data to base64 encoded string
	function base64_encode(file) {
		// read binary data
		var bitmap = fs.readFileSync(file);
		// convert binary data to base64 encoded string
		return new Buffer(bitmap).toString('base64');
	}
	let img2HTML = (imgpath, maxWidth, maxHeight) => {
		let image = images(imgpath);
		let width = image.width;
		let height = image.height;
		let newWidth = -1;
		let newHeight = -1;
		if ((width <= maxWidth) && (height <= maxHeight)){
			newWidth = width;
			newHeight = height;
		} else {
			if (width / maxWidth < height / maxHeight){
				// scale height
				let rate = height / maxHeight;
				// console.log('rate:', rate)
				newHeight = height / rate;
				newWidth = width / rate;
			} else {
				// scale width
				let rate = width / maxWidth;
				// console.log('rate:', rate)
				newHeight = height / rate;
				newWidth = width / rate;
			}
		}
		newWidth = Math.round(newWidth);
		newHeight = Math.round(newHeight);
		// console.log('new size:', newWidth, ' x ', newHeight);
		let base64str = base64_encode(imgpath);
		let extension = imgpath.substring(imgpath.lastIndexOf('.') + 1).toLowerCase();
		let MIME = {
			jpg: 'jpeg',
			jpeg: 'jpeg',
			gif: 'gif',
			png: 'png'
		}
		if (MIME.hasOwnProperty(extension)) {
			let mime = MIME[extension];
			return `<img src="data:image/${mime};base64,${base64str}" width='${newWidth}' height='${newHeight}'/>`
		} else {
			return ''
		}
	}
	return new Promise((RESOLVE, REJECT) => {
		async (function (){
			console.log("calling docx");
			
			// Tiền xử lý không đồng bộ.
			// Bắt buộc phải dùng Promise, async/await
			var re = await (new Promise(function (resolve, reject) {
				// console.log('dmm');
				setTimeout(function () {
					// console.log('hehe');
					resolve('ok')
				}, 1);
			}))
			
			// End of Tiền xử lý không đồng bộ

			var statistics = {
				totalMoneyProp: 0,
				totalNonMoneyProp: 0,
				moneyPropFilled: 0,
				nonMoneyPropFilled: 0,
				totalMoneyPropStr: '',
				totalNonMoneyPropStr: '',
				moneyPropFilledStr: '',
				nonMoneyPropFilledStr: ''
			};

			PROP_FIELDS = JSON.parse(JSON.stringify(PROP_FIELDS));

			/** Tiền xử lý Schema
			 * 1 vài thuộc tính phụ thuộc vào giá trị của 1 (hay nhiều) thuộc tính khác
			 * Ví dụ, Mẫu trên đất liền thì Quốc gia, Tỉnh, Huyện, Xã là các thuộc tính có *
			 * Nhưng Mẫu trên biển thì chỉ Quốc gia có *
			 * => Cần xử lý cập nhật lại các required fields trong PROP_FIELDS.
			 */

			// TODO: Có thể phải thực hiện bước này ngay khi load Model. Tính sau :v

			// DiaDiemThuMau

			if (objectInstance.flag.fDiaDiemThuMau == 'Trên biển'){
				for(var i = 0; i < PROP_FIELDS.length; i++){
					var field = PROP_FIELDS[i];
					if (['tinh', 'huyen', 'xa'].indexOf(field.name) >= 0){
						field.required = false;
						field.money = false;
						// console.log(field.name);
					}
				}
			}
			else if (objectInstance.flag.fDiaDiemThuMau == 'Trên đảo'){
				for(var i = 0; i < PROP_FIELDS.length; i++){
					var field = PROP_FIELDS[i];
					if (['huyen', 'xa'].indexOf(field.name) >= 0){
						field.required = false;
						field.money = false;
						// console.log(field.name);
					}
				}
			}
			else if (objectInstance.flag.fDiaDiemThuMau == 'Trên đất liền'){
				// Không cần làm gì, vì tinh, huyen, xa đã mặc định là money = true
			}

			try {
				// Quốc gia khác, không phải Việt Nam
				let qg = objectInstance.duLieuThuMau.diaDiemThuMau.quocGia;
				if ((qg) && (qg.trim()) && (qg.trim() != 'Việt Nam')){
					for(var i = 0; i < PROP_FIELDS.length; i++){
						var field = PROP_FIELDS[i];
						if (['tinh', 'huyen', 'xa'].indexOf(field.name) >= 0){
							field.required = false;
							field.money = false;
							// console.log(field.name);
						}
					}
				}
			}
			catch (e){
				console.log(e);
			}

			delete objectInstance.flag.fDiaDiemThuMau; // TODO: Don't know why, check later
			for(var i = 0; i < PROP_FIELDS.length; i++){
				var field = PROP_FIELDS[i];
				// console.log(field.name);
				if (field.name == 'fDiaDiemThuMau'){
					// console.log('len: ' + PROP_FIELDS.length);
					PROP_FIELDS.splice(i, 1); // Xóa nó đi để không tính vào phần thống kê bao nhiêu trường tính tiền, bao nhiêu trường không tính tiền. (Cuối file xuất ra)
					// console.log('len: ' + PROP_FIELDS.length);
					break;
				}
			}

			// resolve place id to string
			try {
				objectInstance.duLieuThuMau.diaDiemThuMau.tinh = CITIES[objectInstance.duLieuThuMau.diaDiemThuMau.tinh].name;
				objectInstance.duLieuThuMau.diaDiemThuMau.huyen = DISTRICTS[objectInstance.duLieuThuMau.diaDiemThuMau.huyen].name;
				objectInstance.duLieuThuMau.diaDiemThuMau.xa = WARDS[objectInstance.duLieuThuMau.diaDiemThuMau.xa].name;
			}

			catch (e){
				console.log(e);
				// do not care
			}

			// End of DiaDiemThuMau
			
			// fApproved
			
			for(var i = 0; i < PROP_FIELDS.length; i++){
				var field = PROP_FIELDS[i];
				// console.log(field.name);
				if (field.name == 'fApproved'){
					console.log('len: ' + PROP_FIELDS.length);
					PROP_FIELDS.splice(i, 1); // Xóa nó đi để không tính vào phần thống kê bao nhiêu trường tính tiền, bao nhiêu trường không tính tiền. (Cuối file xuất ra)
					console.log('len: ' + PROP_FIELDS.length);
					break;
				}
			}
			
			// End of fApproved
			
			// fMissingDateTime
			// for(var i = 0; i < PROP_FIELDS.length; i++){
			// 	var field = PROP_FIELDS[i];
			// 	// console.log(field.name);
			// 	if (field.name == 'fMissingDateTime'){
			// 		console.log('len: ' + PROP_FIELDS.length);
			// 		PROP_FIELDS.splice(i, 1); // Xóa nó đi để không tính vào phần thống kê bao nhiêu trường tính tiền, bao nhiêu trường không tính tiền. (Cuối file xuất ra)
			// 		console.log('len: ' + PROP_FIELDS.length);
			// 		break;
			// 	}
			// }
			// End of fMissingDateTime


			// delete objectInstance.flag;

			/**
			 * End of Tiền xử lý Schema
			 */

			function display(obj){
				// console.log(staticPath)
				// console.log(count)
				if (obj instanceof Array){
					// var result =  obj.reduce(function (preStr, curElement, curIndex){
					// 	// console.log(curElement.split('_+_')[1]);
					// 	// preStr += curElement.split('_+_')[1];
					// 	preStr += curElement.substring(curElement.lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length);
					// 	if (curIndex < obj.length - 1){
					// 		preStr += ', \n\n';
					// 	}
					// 	return preStr;
					// }, '');
					// return result;
					return (obj.length < 1) ? '' : obj;
				}
				else if (obj instanceof Date){
					if (NULL_TIMES.indexOf(obj.getTime()) >= 0) {
						return '';
					}
					let h = obj.getHours();
					if (h == 2) {
						return obj.getFullYear()
					}
					if (h == 1) {
						return [obj.getMonth() + 1, obj.getFullYear()].join(' / ')
					}
					return [obj.getDate(), obj.getMonth() + 1, obj.getFullYear()].join(' / ')
				}
				// Need to escape to prevent injected HTML + JS
				return obj;
			}


			var curProp = '';
			var addPropRow = true;

			function inOrder (tree) {
				if (!tree){
					return;
				}
				if (tree instanceof Function){
					return;
				}
				if (typeof(tree) == 'string'){
					return;
				}
				for(var i = 0; i < Object.keys(tree).length; i++){
					var prop = Object.keys(tree)[i];
					// console.log(stt + ' : ' + prop + ' : ' + curDeep);
					// Add data to docx object
					var p;
					switch (curDeep){
						case 0:
							addPropRow = true;
							// Label
							try{
								p = LABEL[prop];
							}
							catch (e){
								console.log(e);
								// Do not care;
								// break;
							}
							var row = [
								{
									val: p,
									opts: rowSpanOpts
								},
								{
									val: '',
									opts: rowSpanOpts
								},
								{
									val: '',
									opts: rowSpanOpts
								},
								{
									val: '',
									opts: rowSpanOpts
								}
							];
							// table.push(row);
							docxHTMLSource += `
								<tr>
									<td colspan="4" class="bg td"><p class="tnr lb"><b>${p}</b></p></td>
								</tr>
							`
							
							break;
						case 1:
							stt++;
							curProp = prop;
							addPropRow = true;
							// console.log('printing ' + prop);
							// var value = flatOI[prop];
							// if ((flatOI[prop] instanceof Object) && (Object.keys(flatOI[prop]) > 0)){
							// 	value = JSON.stringify(flatOI[prop]);
							// }
							// if ((flatOI[prop] instanceof Object) && (Object.keys(flatOI[prop]) < 1)){
							// 	value = '';
							// }
							var value = display(flatOI[prop]);
							try{

								if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].label){
									p = PROP_FIELDS[PROP_FIELDS_OBJ[prop]].label
								}

								if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].money){
									statistics.totalMoneyProp++;
									statistics.totalMoneyPropStr += ' ' + prop;
									p += ' (*) '
								}
								else {
									statistics.totalNonMoneyProp++;
									statistics.totalNonMoneyPropStr += ' ' + prop;
								}
							}
							catch (e){
								// console.log(e);
								// Do not care;
								// console.log(prop + ' : index : ' + PROP_FIELDS_OBJ[prop])
							}

							
							var row = [
								{
									val: stt,
									opts: labelOpts
								},
								{
									val: p,
									opts: detailOpts
								},
								{
									val: value,
									opts: detailOpts
								},
								{
									val: '',
									opts: detailOpts
								}
							]
							if ((EXPORT_NULL_FIELD && (prop in PROP_FIELDS_OBJ)) || value) {
								if (printAll || (prop in printedProperties)){
									// table.push(row);
									if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].type !== 'File'){
										docxHTMLSource += `
										<tr>
											<td class="td"><p class="tnrlb">${stt}</p></td>
											<td class="td"><p class="tnr">${p}</p></td>
											<td class="td"><p class="tnr">${value ? value : ''}</p></td>
											<td class="td"></td>
										</tr>
										`
									} else {
										let td = ``;
										for(let iidx = 0; iidx < value.length; iidx++) {
											if (['jpg', 'jpeg', 'gif', 'png', 'tif', 'tiff', 'raw', 'bmp', 'bpg', 'eps'].indexOf(value[iidx].substring(value[iidx].lastIndexOf('.') + 1).toLowerCase()) >= 0) {
												try {
													td += img2HTML(path.join(ROOT, UPLOAD_DESTINATION, value[iidx]), IMG_MAX_WIDTH, IMG_MAX_HEIGHT) + '<br /><br />\n\n';
												} catch (e) {
													console.log(e);
													td += '<p class="tnr">' + display(value[iidx].substring(value[iidx].lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length)) + '</p>'
												}
											} else {
												td += '<p class="tnr">' + display(value[iidx].substring(value[iidx].lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length)) + '</p>'
											}
										}
										docxHTMLSource += `
										<tr>
											<td class="td"><p class="tnrlb">${stt}</p></td>
											<td class="td"><p class="tnr">${p}</p></td>
											<td class="td">${td}</td>
											<td class="td"></td>
										</tr>
										`
									}
									
								}
							}
							if (value){
								if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].money){
									statistics.moneyPropFilled++;
									statistics.moneyPropFilledStr += ' ' + prop;
								}
								else {
									statistics.nonMoneyPropFilled++;
									statistics.nonMoneyPropFilledStr += ' ' + prop;
								}
							}
							break;
						case 2:
							// var value = flatOI[prop];
							// if ((flatOI[prop] instanceof Object) && (Object.keys(flatOI[prop]) > 0)){
							// 	value = JSON.stringify(flatOI[prop]);
							// }
							// if ((flatOI[prop] instanceof Object) && (Object.keys(flatOI[prop]) < 1)){
							// 	value = '';
							// }
							var value = display(flatOI[prop]);
							try{

								if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].label){
									p = PROP_FIELDS[PROP_FIELDS_OBJ[prop]].label
								}

								if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].money){
									statistics.totalMoneyProp++;
									statistics.totalMoneyPropStr += ' ' + prop;
									p += ' (*) '
								}
								else {
									statistics.totalNonMoneyProp++;
									statistics.totalNonMoneyPropStr += ' ' + prop;
								}
							}
							catch (e){
								console.log(e);
								// Do not care;
								// console.log(prop + ' : index : ' + PROP_FIELDS_OBJ[prop])
							}
							var row = null;
							// Xử lý có thêm 1 dòng cho các thuộc tính mixed hay không.
							// Có thể cứ in ()
							// hoặc là xét xem các thuộc tính con có giá trị thì mới in
							let subProps;
							let flagHasRealChildren = false; // Oánh dấu nếu thuộc tính này có các thuộc tính con thực sự có gía trị
							if (curProp.indexOf('Mixed') >= 0){
								let element_ = PROP_FIELDS[PROP_FIELDS_OBJ[curProp.substring(0, curProp.length - 5)]]
								subProps = element_.subProps;
								// Với curPop == 'kichThuocMau', subProps = ['chieuCao', 'chieuRong', 'chieuDai', 'trongLuong', 'theTich']
								// Tiện vl. :-D
							}
							else {
								// console.log('get', curProp);
								subProps = [];
								for(let k in flatOI){
									try {
										if (PROP_FIELDS[PROP_FIELDS_OBJ[k]].schemaProp.indexOf('.' + curProp) >= 0){
											subProps.push(k);
										}
									}
									catch (e){
										// console.log(e);
									}
								}
							}
							// console.log(subProps);
							if (subProps instanceof Array){
								for(let j = 0; j < subProps.length; j++){
									let sp = subProps[j];
									// TODO 2283 CHECK PRINT OR NOT
									if ((EXPORT_NULL_FIELD || display(flatOI[sp])) && (printAll || (sp in printedProperties))){
									// if (printAll || ((EXPORT_NULL_FIELD || display(flatOI[sp])) && (sp in printedProperties))) {
										flagHasRealChildren = true;
										break;
									}
								}
							}
							else {
								flagHasRealChildren = true;
							}
							if (addPropRow && flagHasRealChildren){
								// Thêm 1 dòng cho các thể loại: Thông tin khác, Phân bố Việt Nam, các thuộc tính mixed
								try{
									curProp = LABEL[curProp];
								}
								catch (e){
									console.log(e);
									// Do not care;
									// break;
								}
								row = [
									{
										val: stt,
										opts: labelOpts
									},
									{
										val: curProp,
										opts: detailOpts
									},
									{
										val: '',
										opts: detailOpts
									},
									{
										val: '',
										opts: detailOpts
									}
								]
								// table.push(row);
								docxHTMLSource += `
									<tr>
										<td class="td"><p class="tnrlb">${stt}</p></td>
										<td class="td"><p class="tnr">${curProp}</p></td>
										<td class="td"><p class="tnr"></p></td>
										<td class="td"></td>
									</tr>
									`
								addPropRow = false;
							} else {
								// console.log('khong in', curProp, 'prop row', addPropRow);
							}
							
							row = [
								{
									val: '',
									opts: labelOpts
								},
								{
									val: p,
									opts: detailItalicOpts
								},
								{
									val: value,
									opts: detailOpts
								},
								{
									val: '',
									opts: detailOpts
								}
							]
							if (EXPORT_NULL_FIELD || value) {
								if (printAll || (prop in printedProperties)){
									// table.push(row);
									// docxHTMLSource += `
									// <tr>
									// 	<td class="td"><p class="ct tnr lb"></p></td>
									// 	<td class="td"><p class="tnri">${p}</p></td>
									// 	<td class="td"><p class="tnr">${value}</p></td>
									// 	<td class="td"></td>
									// </tr>
									// `
									if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].type !== 'File'){
										docxHTMLSource += `
										<tr>
											<td class="td"><p class="ct tnr lb"></p></td>
											<td class="td"><p class="tnri">${p}</p></td>
											<td class="td"><p class="tnr">${value ? value : ''}</p></td>
											<td class="td"></td>
										</tr>
										`
									} else {
										let td = ``;
										if (!(value instanceof Array)) {
											value = []
										}
										for(let iidx = 0; iidx < value.length; iidx++) {
											if (['jpg', 'jpeg', 'gif', 'png', 'tif', 'tiff', 'raw', 'bmp', 'bpg', 'eps'].indexOf(value[iidx].substring(value[iidx].lastIndexOf('.') + 1).toLowerCase()) >= 0) {
												try {
													td += img2HTML(path.join(ROOT, UPLOAD_DESTINATION, value[iidx]), IMG_MAX_WIDTH, IMG_MAX_HEIGHT) + '<br /><br />\n\n';
												} catch (e) {
													console.log(e);
													td += '<p class="tnr">' + display(value[iidx].substring(value[iidx].lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length)) + '</p>'
												}
											} else {
												td += '<p class="tnr">' + display(value[iidx].substring(value[iidx].lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length)) + '</p>'
											}
											// td +=  '<img src="" >\n';
										}
										docxHTMLSource += `
										<tr>
											<td class="td"><p class="ct tnr lb"></p></td>
											<td class="td"><p class="tnri">${p}</p></td>
											<td class="td">${td}</td>
											<td class="td"></td>
										</tr>
										`
									}
								}
							}
							if (value){
								if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].money){
									statistics.moneyPropFilled++;
									statistics.moneyPropFilledStr += ' ' + prop;
								}
								else {
									statistics.nonMoneyPropFilled++;
									statistics.nonMoneyPropFilledStr += ' ' + prop;
								}
							}
							break;
					}

					// console.log('inc curDeep');
					
					// stt++;
					curDeep++;
					inOrder(tree[prop]);
					curDeep--;
				}
			}

			var fs = require('fs');
			// var officegen = require('officegen');
			// var docx = officegen({
			// 	type: 'docx',
			// 	subjects: 'Mẫu phiếu dữ liệu',
			// 	orientation: 'landscape'
			// 	// orientation: 'portrait'
			// });

			// docx.on('finalize', function (written) {
			// 	console.log("Docx: written " + written + " bytes.");
			// });

			// docx.on('error', function (error) {
			// 	console.log("Docx: Error");
			// 	console.log(error);
			// 	console.log("===");
			// })

			docxHTMLSource += '<div class="row" id="pcsdl-title">';
			for(var i = 0; i < paragraph.text.length; i++){
				docxHTMLSource += `<p class="ptitle">${paragraph.text[i]}</p>`
				// var pObj = docx.createP();
				// pObj.options.align = "center";
				// pObj.addText(paragraph.text[i] + '\n\n', paragraph.style[i]);
			}

			var flatOI = flatObjectModel(PROP_FIELDS, objectInstance);

			// var pObj = docx.createP();
			// pObj.options.align = "center";
			// pObj.addText('Mã đề tài: ' + display(flatOI.maDeTai), {color: '000000', bold: true, font_face: 'Times New Roman', font_size: 12});
			docxHTMLSource += `<p class='ptitle'>Mã đề tài: ${display(flatOI.maDeTai)}</p>`
			docxHTMLSource += '</div>';

			var rowSpanOpts = {
				// cellColWidth: 2261,
				b:true,
				sz: '24',
				align: 'center',
				shd: {
					fill: "CCCCCC",
					// themeFill: "text1",
					// "themeFillTint": "30"
				},
				// gridSpan: 3,
				fontFamily: "Times New Roman"
			};

			var labelOpts = {
				cellColWidth: 500,
				b:true,
				sz: '24',
				align: 'center',
				shd: {
					fill: "FFFFFF",
					// themeFill: "text1",
					// "themeFillTint": "30"
				},
				fontFamily: "Times New Roman"
			};

			var detailOpts = {
				// cellColWidth: 2261,
				// b:true,
				sz: '24',
				shd: {
					fill: "FFFFFF",
					// themeFill: "text1",
					// "themeFillTint": "30"
				},
				fontFamily: "Times New Roman"
			};

			var detailItalicOpts = {
				// cellColWidth: 2261,
				sz: '22',
				bold: true,
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
					val: "STT",
					opts: labelOpts
				},
				{
					val: "Trường dữ liệu",
					opts: labelOpts
				},
				{
					val: "Nội dung",
					opts: labelOpts
				},
				{
					val: "Ghi chú",
					opts: labelOpts
				}
			]];

			// Delete Unit fields
			PROP_FIELDS.map(function (field) {
				if (field.type == 'Unit' && flatOI[field.name.substring('donVi_'.length)] && flatOI[field.name]){
					flatOI[field.name.substring('donVi_'.length)] += ' ' + flatOI[field.name];
					flatOI[field.name.substring('donVi_'.length)].trim();
					return;
				}
			})

			{
				var index = 0;
				while (true){
					if (PROP_FIELDS[index] && (PROP_FIELDS[index].type == 'Unit')){
						PROP_FIELDS.splice(index, 1);
					}
					else {
						index++;
					}
					if (index >= PROP_FIELDS.length){
						break;
					}
				} // Delete Unit fields

				PROP_FIELDS.map(function (element, index) {
					if (element.type == 'Mixed'){
						var sp_ = element.subProps;
						var index = 0;
						while (true){
							if (sp_[index].indexOf('donVi_') >= 0){
								sp_.splice(index, 1);
							}
							else {
								index++;
							}
							if (index >= sp_.length){
								break;
							}
						}
					}
				}) // Delete subProps
			}

			var PROP_FIELDS_OBJ = {};

			PROP_FIELDS.map(function (element, index) {
				PROP_FIELDS_OBJ[element.name] = index;
			});

			// Một số trường như loaiMauVat, giaTriSuDung cho phép nhiều thuộc tính, cần loại bỏ STR_AUTOCOMPLETION_SEPERATOR (thường là _-_)

			PROP_FIELDS.map((element, index) => {
				if (('autoCompletion' in element) && (element.autoCompletion)){
					try {
						// flatOI[element.name] = flatOI[element.name].split(STR_AUTOCOMPLETION_SEPERATOR).join(', ');
						flatOI[element.name] = flatOI[element.name].replace(new RegExp(STR_AUTOCOMPLETION_SEPERATOR, 'g'), ', ');
					}
					catch (e){
						console.log(e);
					}
				}
			})

			{
				// Trường đặc biệt: Không AutoCompletion nhưng cho phép chọn nhiều mục 
				// => Cũng cần loại bỏ STR_AUTOCOMPLETION_SEPERATOR
				// Bọc trong ngoặc cho đỡ trùng tên biến :v
				let fields = [
					{
						fieldName: 'loaiMauVat'
					}
				]

				for(let f of fields){
					try {
						// flatOI[f.fieldName] = flatOI[f.fieldName].split(STR_AUTOCOMPLETION_SEPERATOR).join(', ');
						flatOI[f.fieldName] = flatOI[f.fieldName].replace(new RegExp(STR_AUTOCOMPLETION_SEPERATOR, 'g'), ', ');
					}
					catch (e){
						console.log(e);
					}

				}
			}

			// End of STR_AUTOCOMPLETION_SEPERATOR
			
			// Reconstruct tree
			var oi = {};
			PROP_FIELDS.map(function (field) {

				if ((field.type == 'Mixed') || (field.name == 'maDeTai')){
					if (field.money){
						statistics.totalMoneyProp++;
						statistics.totalMoneyPropStr += ' ' + field.name;
					}
					else {
						statistics.totalNonMoneyProp++;
						statistics.totalNonMoneyPropStr += ' ' + field.name;
					}
					
					if (field.name == 'maDeTai'){
						if (flatOI.maDeTai){
							if (field.money){
								statistics.moneyPropFilled++;
								statistics.moneyPropFilledStr += ' maDeTai';
							}
							else {
								statistics.nonMoneyPropFilled++;
								statistics.nonMoneyPropFilledStr += ' maDeTai';
							}
						}
					}
					else {
						var sp_ = field.subProps;
						var flag = false;
						// console.log('checking mixed: ' + field.name)
						for(var i = 0; i < sp_.length; i++){

							// console.log(sp_[i] + ' : "' + flatOI[sp_[i]] + '"')
							if (flatOI[sp_[i]]){
								// Nếu flatOI[sp_[i]] là Object Array, tuy không có dữ liệu nhưng vẫn có method
								// Khi đó 
								// flag = true;
								// break;
								var val = JSON.parse(JSON.stringify(flatOI[sp_[i]]));
								// var val = flatOI[sp_[i]];
								if ((val instanceof Array) || (val instanceof Object)){
									// console.log(sp_[i] + ' : "' + flatOI[sp_[i]] + '" true ' + typeof(flatOI[sp_[i]]))
									if ((val instanceof Array) && (val.length > 0)){
										// console.log('Array length: ' + val.length)
										flag = true;
										break;
									}
									if ((val instanceof Object) && (Object.keys(val).length > 0)){
										// console.log('Object keys length: ' + Object.keys(val))
										flag = true;
										break;
									}
								}
								else {
									flag = true;
									break;
								}
							}
						}
						if (flag){
							if (field.money){
								statistics.moneyPropFilled++;
								statistics.moneyPropFilledStr += ' ' + field.name;
								console.log('adding money prop filled: ' + field.name);
							}
							else {
								statistics.nonMoneyPropFilled++;
								statistics.nonMoneyPropFilledStr += ' ' + field.name;
								console.log('adding non money prop filled: ' + field.name);
							}
						}
						
					}
				}

				if (field.type == 'Mixed'){
					// Do not add Mixed property to tree
					// Mixed property has it's own name.
					// Ex: phanBoVietNam => phanBoVietNameMixed

					// But we need to add it to statistics. Add above.
					return;
				}
				if (field.name != 'maDeTai'){
					objectChild(oi, field.schemaProp)[field.name] = {};
				}
				
				// console.log(oi);
			});

			var curDeep = 0;
			var stt = 0;
			
			docxHTMLSource += `
				<table id='maintable'>
					<tbody>
						<tr>
							<th class="td-stt"><p class="ct tnr lb">STT</p></th>
							<th class="td-field"><p class="ct tnr lb">Trường dữ liệu</p></th>
							<th class="td-value"><p class="ct tnr lb">Nội dung</p></th>
							<th class="td-note"><p class="ct tnr lb">Ghi chú</p></th>
						</tr>
			`
			

			inOrder(oi);

			var tableStyle = {
				tableColWidth: 3200,
				// tableSize: 200,
				// tableColor: "ada",
				tableAlign: "left",
				tableFontFamily: "Times New Roman",
				borders: true
			}

			// docx.createTable (table, tableStyle);

			// Những trường con của các trường Mixed luôn có money = false
			// => Chúng luôn được thêm vào:
			// statistics.totalNonMoneyProp, statistics.totalNonMoneyPropStr, statistics.nonMoneyPropFilled, statistics.nonMoneyPropFilledStr
			// Cần loại bỏ:

			PROP_FIELDS.map(function (field) {
				if (field.type == 'Mixed'){
					var sp_ = field.subProps;
					statistics.totalNonMoneyProp -= sp_.length;

					for(var i = 0; i < sp_.length; i++){
						if (statistics.nonMoneyPropFilledStr.indexOf(sp_[i]) >= 0){
							statistics.nonMoneyPropFilled--;
						}
						statistics.totalNonMoneyPropStr = statistics.totalNonMoneyPropStr.replace(sp_[i], '');
						statistics.nonMoneyPropFilledStr = statistics.nonMoneyPropFilledStr.replace(sp_[i], '');
					}
				}
			})

			docxHTMLSource += `</tbody></table>`

			// pObj = docx.createP();
			// pObj.options.align = "left";
			// pObj.addText('', {color: '000000', bold: true, font_face: 'Times New Roman', font_size: 12});
			docxHTMLSource += '<p class="tnr b"></p><br />'

			// statistics
			// pObj = docx.createP();
			// pObj.options.align = "left";
			// pObj.addText('Số trường bắt buộc đã nhập: ' + statistics.moneyPropFilled + '/' + statistics.totalMoneyProp + '.', {color: '000000', font_face: 'Times New Roman', font_size: 12});
			docxHTMLSource += `<p class="tnr b">Số trường bắt buộc đã nhập: ${statistics.moneyPropFilled}/${statistics.totalMoneyProp}.</p>`

			// pObj = docx.createP();
			// pObj.options.align = "left";
			// pObj.addText('Số trường không bắt buộc đã nhập: ' + statistics.nonMoneyPropFilled + '/' + statistics.totalNonMoneyProp + '.', {color: '000000', font_face: 'Times New Roman', font_size: 12});
			docxHTMLSource += `<p class="tnr b">Số trường không bắt buộc đã nhập: ${statistics.nonMoneyPropFilled}/${statistics.totalNonMoneyProp}.</p>`

			
			try {
				// pObj = docx.createP();
				// pObj.options.align = "left";
				// pObj.addText('Phê duyệt: ' + (objectInstance.flag.fApproved ? 'Đã phê duyệt' : 'Chưa phê duyệt'), {color: '000000', font_face: 'Times New Roman', font_size: 12});
				docxHTMLSource += `<p class='tnr'>Phê duyệt: ${(objectInstance.flag.fApproved ? 'Đã phê duyệt' : 'Chưa phê duyệt')}</p>`
			}
			catch (e){
				console.log(e);
			}
			// var fs = require('fs');
			var tmpFileName = (new Date()).getTime() + '.tmp.docx';
			/*
			var outputStream = fs.createWriteStream(path.join(ROOT, tmpFileName));
			outputStream.on('close', function () {
				console.log('output done.');
				// console.log(LABEL);
				var outputFileName = 'PCSDL';
				try {
					if (LABEL.objectModelLabel){
						outputFileName += '_' + LABEL.objectModelLabel;
					}
					if (flatOI.tenVietNam){
						outputFileName += '_' + flatOI.tenVietNam;
					}
					if (flatOI.soHieuBaoTangCS){
						outputFileName += '_' + flatOI.soHieuBaoTangCS;
					}
				}
				catch (e){
					console.log(e);
				}
				if (extension == 'docx'){
					outputFileName += '.docx';
					// res.download(path.join(ROOT, tmpFileName), outputFileName, function (err) {
					// 	try {
					// 		fs.unlinkSync(path.join(ROOT, tmpFileName));
					// 	}
					// 	catch (e){
					// 		console.log(e);
					// 	}
					// });
					RESOLVE({
						status: 'success',
						absoluteFilePath: {
							docx: path.join(ROOT, tmpFileName)
						},
						outputFileName: {
							docx: outputFileName
						}
					})
				}
				else if (extension == 'pdf'){
					console.log('pdf');
					outputDocxFileName = outputFileName + '.docx';
					outputFileName += '.pdf';
					var exec = require('child_process').exec;
					var cmd = 'cd ' + __dirname + ' && ' + require('./config/config.js').libreoffice + ' --invisible --convert-to pdf ' + tmpFileName;
					console.log('starting: ' + cmd);
					console.log(objectInstance.id);
					exec(cmd, function (err, stdout, stderr) {
						if (err){
							console.log(err);
							try {
								fs.unlinkSync(path.join(ROOT, tmpFileName));
							}
							catch (e){
								console.log(e);
							}
							RESOLVE({
								status: 'error',
								error: 'error while converting to pdf'
							})
						}
						console.log('--out-')
						console.log(stdout);
						console.log('--err-')
						console.log(stderr);
						console.log('--end-')
						pdfFileName = tmpFileName.substring(0, tmpFileName.length - 'docx'.length) + 'pdf';
						// console.log(pdfFileName);
						// console.log(outputFileName);
						// res.download(path.join(ROOT, pdfFileName), outputFileName, function (err) {
							// try {
								// fs.unlinkSync(path.join(ROOT, pdfFileName));
								// fs.unlinkSync(path.join(ROOT, tmpFileName)); 
							// }
							// catch (e){
							// 	console.log(e);
							// }
						// });
						RESOLVE({
							status: 'success',
							absoluteFilePath: {
								docx: path.join(ROOT, tmpFileName),
								pdf: path.join(ROOT, pdfFileName),
							},
							outputFileName: {
								docx: outputDocxFileName,
								pdf: outputFileName
							}
						})
					})
					// return res.end("ok")

				}
				// res.end("OK");
			});
			docx.generate(outputStream); */
			docxHTMLSource += fs.readFileSync(path.join(ROOT, 'templates', 'footer.html'));
			var HtmlDocx = require('html-docx-js');
			// var docx = HtmlDocx.asBlob(docxHTMLSource, {orientation: 'portrait'});
			var docx = HtmlDocx.asBlob(docxHTMLSource, {orientation: 'landscape'});
			// fs.writeFileSync('out.html', docxHTMLSource);
			var outputFileName = 'PCSDL';
			try {
				if (LABEL.objectModelLabel){
					outputFileName += '_' + LABEL.objectModelLabel;
				}
				if (flatOI.tenVietNam){
					outputFileName += '_' + flatOI.tenVietNam;
				}
				if (flatOI.soHieuBaoTangCS){
					outputFileName += '_' + flatOI.soHieuBaoTangCS;
				}
			}
			catch (e){
				console.log(e);
			}
			outputFileName = outputFileName.replace(/[\/\\'":\*\?<>\|`]/g, '');
			fs.writeFile(tmpFileName, docx, function(err) {
				if (err) throw err;
				if (extension == 'docx'){
					outputFileName += '.docx';
					// res.download(path.join(ROOT, tmpFileName), outputFileName, function (err) {
					// 	try {
					// 		fs.unlinkSync(path.join(ROOT, tmpFileName));
					// 	}
					// 	catch (e){
					// 		console.log(e);
					// 	}
					// });
					// console.log(outputFileName);
					RESOLVE({
						status: 'success',
						absoluteFilePath: {
							docx: path.join(ROOT, tmpFileName)
						},
						outputFileName: {
							docx: encodeURIComponent(outputFileName)
						}
					})
				}
				else if (extension == 'pdf'){
					console.log('pdf');
					const HTMLPDF = require('html-pdf');
					outputDocxFileName = outputFileName + '.docx';
					outputFileName += '.pdf';
					pdfFileName = tmpFileName.substring(0, tmpFileName.length - 'docx'.length) + 'pdf';
					HTMLPDF.create(docxHTMLSource, {format: 'A4', orientation: 'landscape', border: "1cm"}).toFile(pdfFileName, (err, result) => {
						console.log('create pdf done');
						if (err){
							console.log(err);
							try {
								fs.unlinkSync(path.join(ROOT, tmpFileName));
							}
							catch (e){
								console.log(e);
							}
							RESOLVE({
								status: 'error',
								error: 'error while converting to pdf'
							})
						}
						RESOLVE({
							status: 'success',
							absoluteFilePath: {
								docx: path.join(ROOT, tmpFileName),
								pdf: path.join(ROOT, pdfFileName),
							},
							outputFileName: {
								docx: encodeURIComponent(outputDocxFileName),
								pdf: encodeURIComponent(outputFileName)
							}
						})
					})
					// var exec = require('child_process').exec;
					// var cmd = 'cd ' + __dirname + ' && ' + require('./config/config.js').libreoffice + ' --invisible --convert-to pdf ' + tmpFileName;
					// console.log('starting: ' + cmd);
					console.log(objectInstance.id);
					/*
					exec(cmd, function (err, stdout, stderr) {
						if (err){
							console.log(err);
							try {
								fs.unlinkSync(path.join(ROOT, tmpFileName));
							}
							catch (e){
								console.log(e);
							}
							RESOLVE({
								status: 'error',
								error: 'error while converting to pdf'
							})
						}
						console.log('--out-')
						console.log(stdout);
						console.log('--err-')
						console.log(stderr);
						console.log('--end-')
						
						// console.log(pdfFileName);
						// console.log(outputFileName);
						// res.download(path.join(ROOT, pdfFileName), outputFileName, function (err) {
							// try {
								// fs.unlinkSync(path.join(ROOT, pdfFileName));
								// fs.unlinkSync(path.join(ROOT, tmpFileName)); 
							// }
							// catch (e){
							// 	console.log(e);
							// }
						// });
						RESOLVE({
							status: 'success',
							absoluteFilePath: {
								docx: path.join(ROOT, tmpFileName),
								pdf: path.join(ROOT, pdfFileName),
							},
							outputFileName: {
								docx: outputDocxFileName,
								pdf: outputFileName
							}
						})
					}) */
					// return res.end("ok")

				}
			});


			// Assume objectInstance is a tree (JSON),
			// with depth <= 3
		})();
	})
}

function exportFile (objectInstance, options, res, extension) {
	// console.log(options);
	async (() => {
		let result = await (exportFilePromise(objectInstance, options, extension));
		// console.log(result);
		if (result.status == 'success'){
			if (['docx', 'pdf'].indexOf(extension) >= 0){
				res.download(result.absoluteFilePath[extension], result.outputFileName[extension], function (err) {
					try {
						fs.unlinkSync(result.absoluteFilePath[extension]);
						fs.unlinkSync(result.absoluteFilePath.docx); // nếu extension là pdf thì cần xóa cả file này
					}
					catch (e){
						console.log(e);
					}
				});
			}
			else {
				return res.end('invalid extension');
			}
		}
		else {
			return res.end('err')
		}
	})()
}

global.myCustomVars.exportFile = exportFile;

var exportXLSXPromise = (objectInstance, options, extension) => {
	let PROP_FIELDS = options.PROP_FIELDS;
	let ObjectModel = options.ObjectModel;
	let LABEL = options.LABEL;
	let paragraph = options.paragraph;
	let objectModelName = options.objectModelName;
	let printedProperties = options.req.body;
	let printAll = !(('body' in options.req) && (options.req.body.custom == 1))

	return new Promise((RESOLVE, REJECT) => {
		async (function (){
			console.log("calling xlsx");

			// Tiền xử lý không đồng bộ.
			// Bắt buộc phải dùng Promise, async/await
			var re = await (new Promise(function (resolve, reject) {
				// console.log('dmm');
				setTimeout(function () {
					// console.log('hehe');
					resolve('ok')
				}, 1);
			}))
			
			// End of Tiền xử lý không đồng bộ

			function setCell(sheet, col, row, value, format) {
				sheet.set(col, row, value);
				sheet.font(col, row, format);
				// sheet.border(col, row, {top: 'thin', right: 'thin', bottom: 'thin', left: 'thin'})
			}

			function addEntireRow(sheet, value, format) {
				sheet.merge({row: sheetRowIndex, col: 1}, {row: sheetRowIndex, col: _NUM_COL});
				setCell(sheet, 1, sheetRowIndex, value, format);
				sheetRowIndex++;
			}

			var statistics = {
				totalMoneyProp: 0,
				totalNonMoneyProp: 0,
				moneyPropFilled: 0,
				nonMoneyPropFilled: 0,
				totalMoneyPropStr: '',
				totalNonMoneyPropStr: '',
				moneyPropFilledStr: '',
				nonMoneyPropFilledStr: ''
			};

			PROP_FIELDS = JSON.parse(JSON.stringify(PROP_FIELDS));

			/** Tiền xử lý Schema
			 * 1 vài thuộc tính phụ thuộc vào giá trị của 1 (hay nhiều) thuộc tính khác
			 * Ví dụ, Mẫu trên đất liền thì Quốc gia, Tỉnh, Huyện, Xã là các thuộc tính có *
			 * Nhưng Mẫu trên biển thì chỉ Quốc gia có *
			 * => Cần xử lý cập nhật lại các required fields trong PROP_FIELDS.
			 */

			// TODO: Có thể phải thực hiện bước này ngay khi load Model. Tính sau :v

			// DiaDiemThuMau

			if (objectInstance.flag.fDiaDiemThuMau == 'Trên biển'){
				for(var i = 0; i < PROP_FIELDS.length; i++){
					var field = PROP_FIELDS[i];
					if (['tinh', 'huyen', 'xa'].indexOf(field.name) >= 0){
						field.required = false;
						field.money = false;
						// console.log(field.name);
					}
				}
			}
			else if (objectInstance.flag.fDiaDiemThuMau == 'Trên đảo'){
				for(var i = 0; i < PROP_FIELDS.length; i++){
					var field = PROP_FIELDS[i];
					if (['huyen', 'xa'].indexOf(field.name) >= 0){
						field.required = false;
						field.money = false;
						// console.log(field.name);
					}
				}
			}
			else if (objectInstance.flag.fDiaDiemThuMau == 'Trên đất liền'){
				// Không cần làm gì, vì tinh, huyen, xa đã mặc định là money = true
				
			}

			try {
				// Quốc gia khác, không phải Việt Nam
				let qg = objectInstance.duLieuThuMau.diaDiemThuMau.quocGia;
				if ((qg) && (qg.trim()) && (qg.trim() != 'Việt Nam')){
					for(var i = 0; i < PROP_FIELDS.length; i++){
						var field = PROP_FIELDS[i];
						if (['tinh', 'huyen', 'xa'].indexOf(field.name) >= 0){
							field.required = false;
							field.money = false;
							// console.log(field.name);
						}
					}
				}
			}
			catch (e){
				console.log(e);
			}

			delete objectInstance.flag.fDiaDiemThuMau;
			for(var i = 0; i < PROP_FIELDS.length; i++){
				var field = PROP_FIELDS[i];
				// console.log(field.name);
				if (field.name == 'fDiaDiemThuMau'){
					console.log('len: ' + PROP_FIELDS.length);
					PROP_FIELDS.splice(i, 1); // Xóa nó đi để không tính vào phần thống kê bao nhiêu trường tính tiền, bao nhiêu trường không tính tiền. (Cuối file xuất ra)
					console.log('len: ' + PROP_FIELDS.length);
					break;
				}
			}

			// resolve place id to string
			try {
				objectInstance.duLieuThuMau.diaDiemThuMau.tinh = CITIES[objectInstance.duLieuThuMau.diaDiemThuMau.tinh].name;
				objectInstance.duLieuThuMau.diaDiemThuMau.huyen = DISTRICTS[objectInstance.duLieuThuMau.diaDiemThuMau.huyen].name;
				objectInstance.duLieuThuMau.diaDiemThuMau.xa = WARDS[objectInstance.duLieuThuMau.diaDiemThuMau.xa].name;
			}

			catch (e){
				console.log(e);
				// do not care
			}

			

			// End of DiaDiemThuMau


			// fApproved
			
			for(var i = 0; i < PROP_FIELDS.length; i++){
				var field = PROP_FIELDS[i];
				// console.log(field.name);
				if (field.name == 'fApproved'){
					console.log('len: ' + PROP_FIELDS.length);
					PROP_FIELDS.splice(i, 1); // Xóa nó đi để không tính vào phần thống kê bao nhiêu trường tính tiền, bao nhiêu trường không tính tiền. (Cuối file xuất ra)
					console.log('len: ' + PROP_FIELDS.length);
					break;
				}
			}
			
			// End of fApproved
			

			// fMissingDateTime
			// for(var i = 0; i < PROP_FIELDS.length; i++){
			// 	var field = PROP_FIELDS[i];
			// 	// console.log(field.name);
			// 	if (field.name == 'fMissingDateTime'){
			// 		console.log('len: ' + PROP_FIELDS.length);
			// 		PROP_FIELDS.splice(i, 1); // Xóa nó đi để không tính vào phần thống kê bao nhiêu trường tính tiền, bao nhiêu trường không tính tiền. (Cuối file xuất ra)
			// 		console.log('len: ' + PROP_FIELDS.length);
			// 		break;
			// 	}
			// }
			// End of fMissingDateTime

			// delete objectInstance.flag;
			/**
			 * End of Tiền xử lý Schema
			 */

			function display(obj){
				// console.log(staticPath)
				// console.log(count)
				if (obj instanceof Array){
					var result =  obj.reduce(function (preStr, curElement, curIndex){
						// console.log(curElement.split('_+_')[1]);
						// preStr += curElement.split('_+_')[1];
						preStr += curElement.substring(curElement.lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length);
						if (curIndex < obj.length - 1){
							preStr += ', \n\n';
						}
						return preStr;
					}, '');
					return result;
				}
				else if (obj instanceof Date){
					if (NULL_TIMES.indexOf(obj.getTime()) >= 0) {
						return '';
					}
					let h = obj.getHours();
					if (h == 2) {
						return obj.getFullYear()
					}
					if (h == 1) {
						return [obj.getMonth() + 1, obj.getFullYear()].join(' / ')
					}
					return [obj.getDate(), obj.getMonth() + 1, obj.getFullYear()].join(' / ')
				}
				// Need to escape to prevent injected HTML + JS
				return obj;
			}


			var curProp = '';
			var addPropRow = true;

			function inOrder (tree) {
				if (!tree){
					return;
				}
				if (tree instanceof Function){
					return;
				}
				if (typeof(tree) == 'string'){
					return;
				}
				for(var i = 0; i < Object.keys(tree).length; i++){
					var prop = Object.keys(tree)[i];
					// console.log(stt + ' : ' + prop + ' : ' + curDeep);
					// Add data to docx object
					var p;
					switch (curDeep){
						case 0:
							addPropRow = true;
							// Label
							try{
								p = LABEL[prop];
							}
							catch (e){
								console.log(e);
								// Do not care;
								// break;
							}
							


							setCell(sheet, 1, sheetRowIndex, p, labelOpts);
							sheet.merge({row: sheetRowIndex, col: 1}, {row: sheetRowIndex, col: _NUM_COL});
							sheet.align(1, sheetRowIndex, 'left');
							// sheet.fill(1, sheetRowIndex, {type: 'lightGrid', fgColor: 'FFFFFF00', bgColor: 'FFFFFF00'})
							// sheet.fill(1, sheetRowIndex, {fgColor:8,bgColor:64});
							sheetRowIndex++;
							break;
						case 1:
							stt++;
							curProp = prop;
							addPropRow = true;
							
							var value = display(flatOI[prop]);
							try{

								if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].label){
									p = PROP_FIELDS[PROP_FIELDS_OBJ[prop]].label
								}

								if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].money){
									statistics.totalMoneyProp++;
									statistics.totalMoneyPropStr += ' ' + prop;
									p += ' (*) '
								}
								else {
									statistics.totalNonMoneyProp++;
									statistics.totalNonMoneyPropStr += ' ' + prop;
								}
							}
							catch (e){
								// console.log(e);
								// Do not care;
								// console.log(prop + ' : index : ' + PROP_FIELDS_OBJ[prop])
							}

							
							if ((EXPORT_NULL_FIELD && (prop in PROP_FIELDS_OBJ)) || value) {
								if (printAll || (prop in printedProperties)){
									setCell(sheet, 1, sheetRowIndex, stt, labelOpts);
									setCell(sheet, 2, sheetRowIndex, p, detailOpts);
									setCell(sheet, 3, sheetRowIndex, value ? require('cheerio').load('<span>' + value + '</span>').text() : '', detailOpts);
									sheetRowIndex++;
								}
							}

							if (value){
								if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].money){
									statistics.moneyPropFilled++;
									statistics.moneyPropFilledStr += ' ' + prop;
								}
								else {
									statistics.nonMoneyPropFilled++;
									statistics.nonMoneyPropFilledStr += ' ' + prop;
								}
							}
							break;
						case 2:
							
							var value = display(flatOI[prop]);
							try{

								if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].label){
									p = PROP_FIELDS[PROP_FIELDS_OBJ[prop]].label
								}

								if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].money){
									statistics.totalMoneyProp++;
									statistics.totalMoneyPropStr += ' ' + prop;
									p += ' (*) '
								}
								else {
									statistics.totalNonMoneyProp++;
									statistics.totalNonMoneyPropStr += ' ' + prop;
								}
							}
							catch (e){
								console.log(e);
								// Do not care;
								// console.log(prop + ' : index : ' + PROP_FIELDS_OBJ[prop])
							}
							var row = null;
							// Xử lý có thêm 1 dòng cho các thuộc tính mixed hay không.
							// Có thể cứ in ()
							// hoặc là xét xem các thuộc tính con có gía trị thì mới in
							let subProps;
							let flagHasRealChildren = false; // Óanh dấu nếu thuộc tính này có các thuộc tính con thực sự có gía trị
							if (curProp.indexOf('Mixed') >= 0){
								let element_ = PROP_FIELDS[PROP_FIELDS_OBJ[curProp.substring(0, curProp.length - 5)]]
								subProps = element_.subProps;
								// Với curPop == 'kichThuocMau', subProps = ['chieuCao', 'chieuRong', 'chieuDai', 'trongLuong', 'theTich']
								// Tiện vl. :-D
							}
							else {
								// console.log('get', curProp);
								subProps = [];
								for(let k in flatOI){
									try {
										if (PROP_FIELDS[PROP_FIELDS_OBJ[k]].schemaProp.indexOf('.' + curProp) >= 0){
											subProps.push(k);
										}
									}
									catch (e){
										// console.log(e);
									}
								}
							}
							if (subProps instanceof Array){
								for(let j = 0; j < subProps.length; j++){
									let sp = subProps[j];
									// TODO 1212 CHECK PRINT OR NOT
									if ((EXPORT_NULL_FIELD || display(flatOI[sp])) && (printAll || (sp in printedProperties))){
										flagHasRealChildren = true;
										break;
									}
								}
							}
							else {
								flagHasRealChildren = true;
							}
							if (addPropRow && flagHasRealChildren){
								try{
									curProp = LABEL[curProp];
								}
								catch (e){
									console.log(e);
									// Do not care;
									// break;
								}
								setCell(sheet, 1, sheetRowIndex, stt, labelOpts);
								setCell(sheet, 2, sheetRowIndex, curProp, detailOpts);
								sheetRowIndex++;

								addPropRow = false;
							}
							
							
							// console.log(p + ' : ' + value)
							if (EXPORT_NULL_FIELD || value) {
								if (printAll || (prop in printedProperties)){
									setCell(sheet, 2, sheetRowIndex, p, detailItalicOpts);
									setCell(sheet, 3, sheetRowIndex, value ? require('cheerio').load('<span>' + value + '</span>').text() : '', detailOpts);
									sheetRowIndex++;
								}
							}
							if (value){
								if (PROP_FIELDS[PROP_FIELDS_OBJ[prop]].money){
									statistics.moneyPropFilled++;
									statistics.moneyPropFilledStr += ' ' + prop;
								}
								else {
									statistics.nonMoneyPropFilled++;
									statistics.nonMoneyPropFilledStr += ' ' + prop;
								}
							}
							break;
					}

					// console.log('inc curDeep');
					
					// stt++;
					curDeep++;
					inOrder(tree[prop]);
					curDeep--;
				}
			}

			// Templates
			var rowSpanOpts = {
				// cellColWidth: 2261,
				b:true,
				sz: '24',
				align: 'center',
				shd: {
					fill: "CCCCCC",
					// themeFill: "text1",
					// "themeFillTint": "30"
				},
				// gridSpan: 3,
				fontFamily: "Times New Roman"
			};

			var labelOpts = {
				bold: true,
				align: 'center',
				name: "Times New Roman",
				scheme: '-', // Phải có cái này thì mới chuyển thành font Times New Roman.
				sz: 12
			};

			var detailOpts = {
				// cellColWidth: 2261,
				// b:true,
				sz: '12',
				name: "Times New Roman",
				scheme: '-',
				family: '3',
			};

			var detailItalicOpts = {
				// cellColWidth: 2261,
				// b:true,
				sz: '12',
				name: "Times New Roman",
				scheme: '-',
				family: '3',
				iter: true
			};
			// End

			var excelbuilder = require('msexcel-builder');
			var tmpFileName = (new Date()).getTime() + '.tmp.xlsx';
			var workbook = excelbuilder.createWorkbook(path.join(ROOT), tmpFileName);
			var _NUM_ROW = 200;
			var _NUM_COL = 4;
			var sheet = workbook.createSheet('PCSDL', _NUM_COL, _NUM_ROW);
			sheet.width(1, 10);
			sheet.width(2, 20);
			sheet.width(3, 30);
			sheet.width(4, 20);
			// wrap + border all
			for(var i = 1; i <= _NUM_COL; i++){
				for(var j = 1; j <= _NUM_ROW; j++){
					sheet.wrap(i, j, true);
				}
			}
			// end of wrap all
			for(var i = 0; i < _NUM_ROW; i++){
				sheet.align(1, i, 'center');
				sheet.valign(1, i, 'center');
			}

			var sheetRowIndex = 1;
			var sheetColIndex = 0;

			for(var i = 0; i < paragraph.text.length; i++){
				
				sheet.merge({row: sheetRowIndex, col: 1}, {row: sheetRowIndex, col: 4});
				setCell(sheet, 1, sheetRowIndex, paragraph.text[i], {name: 'Times New Roman', sz: '12', family: '3', scheme: '-', bold: true, iter: 'false'});
				sheet.height(sheetRowIndex, 50);
				sheetRowIndex++;

			}

			var flatOI = flatObjectModel(PROP_FIELDS, objectInstance);

			

			sheet.merge({row: sheetRowIndex, col: 1}, {row: sheetRowIndex, col: 4});
			console.log('merged: ' + sheetRowIndex + ', 1 and ' + sheetRowIndex + ', 4.')
			setCell(sheet, 1, sheetRowIndex, 'Mã đề tài: ' + display(flatOI.maDeTai), detailOpts);
			sheet.font({col: 1, row: sheetRowIndex}, {bold: true, name: 'Times New Roman', sz: 12});
			sheet.height(sheetRowIndex, 50);
			sheetRowIndex++;

			setCell(sheet, 1, sheetRowIndex, 'STT', labelOpts);
			setCell(sheet, 2, sheetRowIndex, 'Trường dữ liệu', labelOpts);
			setCell(sheet, 3, sheetRowIndex, 'Nội dung', labelOpts);
			setCell(sheet, 4, sheetRowIndex, 'Ghi chú', labelOpts);
			sheetRowIndex++;


			// Delete Unit fields
			PROP_FIELDS.map(function (field) {
				if (field.type == 'Unit' && flatOI[field.name.substring('donVi_'.length)] && flatOI[field.name]){
					flatOI[field.name.substring('donVi_'.length)] += ' ' + flatOI[field.name];
					flatOI[field.name.substring('donVi_'.length)].trim();
					return;
				}
			})

			{
				var index = 0;
				while (true){
					if (PROP_FIELDS[index] && (PROP_FIELDS[index].type == 'Unit')){
						PROP_FIELDS.splice(index, 1);
					}
					else {
						index++;
					}
					if (index >= PROP_FIELDS.length){
						break;
					}
				} // Delete Unit fields

				PROP_FIELDS.map(function (element, index) {
					if (element.type == 'Mixed'){
						var sp_ = element.subProps;
						var index = 0;
						while (true){
							if (sp_[index].indexOf('donVi_') >= 0){
								sp_.splice(index, 1);
							}
							else {
								index++;
							}
							if (index >= sp_.length){
								break;
							}
						}
					}
				}) // Delete subProps
			}

			var PROP_FIELDS_OBJ = {};

			PROP_FIELDS.map(function (element, index) {
				PROP_FIELDS_OBJ[element.name] = index;
			});

			// Một số trường như loaiMauVat, giaTriSuDung cho phép nhiều thuộc tính, cần loại bỏ STR_AUTOCOMPLETION_SEPERATOR (thường là _-_)

			PROP_FIELDS.map((element, index) => {
				if (('autoCompletion' in element) && (element.autoCompletion)){
					try {
						// flatOI[element.name] = flatOI[element.name].split(STR_AUTOCOMPLETION_SEPERATOR).join(', ');
						flatOI[element.name] = flatOI[element.name].replace(new RegExp(STR_AUTOCOMPLETION_SEPERATOR, 'g'), ', ');
					}
					catch (e){
						console.log(e);
					}
				}
			})

			{
				// Trường đặc biệt: Không AutoCompletion nhưng cho phép chọn nhiều mục 
				// => Cũng cần loại bỏ STR_AUTOCOMPLETION_SEPERATOR
				// Bọc trong ngoặc cho đỡ trùng tên biến :v
				let fields = [
					{
						fieldName: 'loaiMauVat'
					}
				]

				for(let f of fields){
					try {
						// flatOI[f.fieldName] = flatOI[f.fieldName].split(STR_AUTOCOMPLETION_SEPERATOR).join(', ');
						flatOI[f.fieldName] = flatOI[f.fieldName].replace(new RegExp(STR_AUTOCOMPLETION_SEPERATOR, 'g'), ', ');
					}
					catch (e){
						console.log(e);
					}
				}
			}

			// End of STR_AUTOCOMPLETION_SEPERATOR
			
			// Reconstruct tree
			var oi = {};
			PROP_FIELDS.map(function (field) {

				if ((field.type == 'Mixed') || (field.name == 'maDeTai')){
					if (field.money){
						statistics.totalMoneyProp++;
						statistics.totalMoneyPropStr += ' ' + field.name;
					}
					else {
						statistics.totalNonMoneyProp++;
						statistics.totalNonMoneyPropStr += ' ' + field.name;
					}
					
					if (field.name == 'maDeTai'){
						if (flatOI.maDeTai){
							if (field.money){
								statistics.moneyPropFilled++;
								statistics.moneyPropFilledStr += ' maDeTai';
							}
							else {
								statistics.nonMoneyPropFilled++;
								statistics.nonMoneyPropFilledStr += ' maDeTai';
							}
						}
					}
					else {
						var sp_ = field.subProps;
						var flag = false;
						// console.log('checking mixed: ' + field.name)
						for(var i = 0; i < sp_.length; i++){

							// console.log(sp_[i] + ' : "' + flatOI[sp_[i]] + '"')
							if (flatOI[sp_[i]]){
								// Nếu flatOI[sp_[i]] là Object Array, tuy không có dữ liệu nhưng vẫn có method
								// Khi đó 
								// flag = true;
								// break;
								var val = JSON.parse(JSON.stringify(flatOI[sp_[i]]));
								// var val = flatOI[sp_[i]];
								if ((val instanceof Array) || (val instanceof Object)){
									// console.log(sp_[i] + ' : "' + flatOI[sp_[i]] + '" true ' + typeof(flatOI[sp_[i]]))
									if ((val instanceof Array) && (val.length > 0)){
										// console.log('Array length: ' + val.length)
										flag = true;
										break;
									}
									if ((val instanceof Object) && (Object.keys(val).length > 0)){
										// console.log('Object keys length: ' + Object.keys(val))
										flag = true;
										break;
									}
								}
								else {
									flag = true;
									break;
								}
							}
						}
						if (flag){
							if (field.money){
								statistics.moneyPropFilled++;
								statistics.moneyPropFilledStr += ' ' + field.name;
								console.log('adding money prop filled: ' + field.name);
							}
							else {
								statistics.nonMoneyPropFilled++;
								statistics.nonMoneyPropFilledStr += ' ' + field.name;
								console.log('adding non money prop filled: ' + field.name);
							}
						}
						
					}
				}

				if (field.type == 'Mixed'){
					// Do not add Mixed property to tree
					// Mixed property has it's own name.
					// Ex: phanBoVietNam => phanBoVietNameMixed

					// But we need to add it to statistics. Add above.
					return;
				}
				if (field.name != 'maDeTai'){
					objectChild(oi, field.schemaProp)[field.name] = {};
				}
				
				// console.log(oi);
			});

			var curDeep = 0;
			var stt = 0;
			
			

			inOrder(oi);

			// Những trường con của các trường Mixed luôn có money = false
			// => Chúng luôn được thêm vào:
			// statistics.totalNonMoneyProp, statistics.totalNonMoneyPropStr, statistics.nonMoneyPropFilled, statistics.nonMoneyPropFilledStr
			// Cần loại bỏ:

			PROP_FIELDS.map(function (field) {
				if (field.type == 'Mixed'){
					var sp_ = field.subProps;
					statistics.totalNonMoneyProp -= sp_.length;

					for(var i = 0; i < sp_.length; i++){
						if (statistics.nonMoneyPropFilledStr.indexOf(sp_[i]) >= 0){
							statistics.nonMoneyPropFilled--;
						}
						statistics.totalNonMoneyPropStr = statistics.totalNonMoneyPropStr.replace(sp_[i], '');
						statistics.nonMoneyPropFilledStr = statistics.nonMoneyPropFilledStr.replace(sp_[i], '');
					}
				}
			})

			// Make sure that all above cells has border

			for(var i = 3; i < sheetRowIndex; i++){
				for(var j = 0; j <= _NUM_COL; j++){
					sheet.border(j, i, {top: 'thin', right: 'thin', bottom: 'thin', left: 'thin'});
				}
			}


			addEntireRow(sheet, '', {})

			sheet.align(1, sheetRowIndex, 'left');
			addEntireRow(sheet,
				'Số trường bắt buộc đã nhập: ' + statistics.moneyPropFilled + '/' + statistics.totalMoneyProp + '.', {
				name: 'Times New Roman',
				sz: 12,
				scheme: '-'
			})


			sheet.align(1, sheetRowIndex, 'left');
			addEntireRow(sheet,
				'Số trường không bắt buộc đã nhập: ' + statistics.nonMoneyPropFilled + '/' + statistics.totalNonMoneyProp + '.', {
				name: 'Times New Roman',
				sz: 12,
				scheme: '-'
			})

			try {
				sheet.align(1, sheetRowIndex, 'left');
				addEntireRow(sheet,
					'Phê duyệt: ' + (objectInstance.flag.fApproved ? 'Đã phê duyệt' : 'Chưa phê duyệt') , {
					name: 'Times New Roman',
					sz: 12,
					scheme: '-'
				})
			}
			catch (e){
				console.log(e);
			}
			workbook.save(function (err) {
				if (err){
					console.log(err);
					// return res.end('err');
					RESOLVE({
						status: 'error',
						error: 'error while saving workbook'
					})
				}
				console.log('output done.');
				// console.log(LABEL);
				var outputFileName = 'PCSDL';
				try {
					if (LABEL.objectModelLabel){
						outputFileName += '_' + LABEL.objectModelLabel;
					}
					if (flatOI.tenVietNam){
						outputFileName += '_' + flatOI.tenVietNam;
					}
					if (flatOI.soHieuBaoTangCS){
						outputFileName += '_' + flatOI.soHieuBaoTangCS;
					}
				}
				catch (e){
					console.log(e);
				}
				outputFileName = outputFileName.replace(/[\/\\'":\*\?<>\|`]/g, '');
				if (extension == 'xlsx'){
					outputFileName += '.xlsx';
					// res.download(path.join(ROOT, tmpFileName), outputFileName, function (err) {
					// 	try {
					// 		fs.unlinkSync(path.join(ROOT, tmpFileName));
					// 	}
					// 	catch (e){
					// 		console.log(e);
					// 	}
					// });
					
					RESOLVE({
						status: 'success',
						absoluteFilePath: {
							xlsx: path.join(ROOT, tmpFileName)
						} ,
						outputFileName: {
							xlsx: encodeURIComponent(outputFileName)
						}
					})
				}
			});
			// Assume objectInstance is a tree (JSON),
			// with depth <= 3
		})();
	})
}

function exportXLSX (objectInstance, options, res, extension) {
	async(() => {
		let result = await (exportXLSXPromise(objectInstance, options, extension));
		if (result.status == 'success'){
			res.download(result.absoluteFilePath.xlsx, result.outputFileName.xlsx, function (err) {
				try {
					fs.unlinkSync(result.absoluteFilePath.xlsx);
				}
				catch (e){
					console.log(e);
				}
			});
		}
		else {
			return res.end('error')
		}
	})();
}

global.myCustomVars.exportXLSX = exportXLSX;

var exportZipPromise = (objectInstance, options, extension) => {
	let PROP_FIELDS = options.PROP_FIELDS;
	let ObjectModel = options.ObjectModel;
	let LABEL = options.LABEL;
	let paragraph = options.paragraph;
	let objectModelName = options.objectModelName;

	return new Promise((RESOLVE, REJECT) => {
		async(() => {
			let exec = require('child_process').exec;
			let d = new Date();
			let tmpFolderName = 'tmp' + d.getTime();
			let absoluteFolderPath = path.join(ROOT, 'tmp', tmpFolderName);
			fs.mkdirSync(absoluteFolderPath);
			// console.log(result);
			// return res.end('ok')
			
			// Export DOCX + PDF
			let result = await (exportFilePromise(objectInstance, options, 'pdf'));
			// console.log(result);
			if (result.status != 'success'){
				return RESOLVE({
					status: 'error',
					error: result.error
				})
			}
			let fileName = result.outputFileName.docx;
			let r = result;
			console.log(r);
			fs.renameSync(r.absoluteFilePath.docx, path.join(ROOT, 'tmp', tmpFolderName, decodeURIComponent(r.outputFileName.docx)));
			fs.renameSync(r.absoluteFilePath.pdf, path.join(ROOT, 'tmp', tmpFolderName, decodeURIComponent(r.outputFileName.pdf)));
			// End of Export DOCX, PDF

			// Export XLSX
			// result = await (exportXLSXPromise(objectInstance, options, 'xlsx'));
			// // console.log(result);
			// if (result.status != 'success'){
			// 	return RESOLVE({
			// 		status: 'error',
			// 		error: result.error
			// 	})
			// }
			// fs.renameSync(result.absoluteFilePath.xlsx, path.join(ROOT, 'tmp', tmpFolderName, decodeURIComponent(result.outputFileName.xlsx)));
			// End of Export XLSX

			let flatOI = flatObjectModel(PROP_FIELDS, objectInstance);
			// console.log('here process flatOI ' + Object.keys(flatOI).length);
			for(let i in flatOI){
				let arrFiles = flatOI[i];
				if (arrFiles instanceof Array){
					// console.log('processing files ' + arrFiles);
					arrFiles.map((file) => {
						try {
							fsE.copySync(
								path.join(ROOT, options.UPLOAD_DESTINATION, file), 
								path.join(
									ROOT, 
									'tmp',
									tmpFolderName, 
									file.substring(file.lastIndexOf(STR_SEPERATOR) + STR_SEPERATOR.length)
								)
							);
						}
						catch (e){
							console.log(e);
						}
					})
				}
			}
			return RESOLVE({
				status: 'success',
				absoluteFolderPath: path.join(ROOT, 'tmp', tmpFolderName),
				tmpFolderName: tmpFolderName,
				fileName: fileName.substring(0, fileName.lastIndexOf('.')) ,
				flatOI: flatOI
			})
		})();
	})
}

function exportZip (objectInstance, options, res, extension) {
	async(() => {
		let result = await (exportZipPromise(objectInstance, options, extension));
		if (result.status == 'success'){
			let absoluteFolderPath = result.absoluteFolderPath;
			let d = new Date();
			let wrapperName = 'PCSDL_export-' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '_' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds();

			// wrapperName có prefix 'PCSDL_' là để client download file cho tiện. Xem app/service.js

			
			fs.mkdirSync(path.join(ROOT, 'tmp', wrapperName));
			let exec = require('child_process').exec;
			let fileName = decodeURIComponent(result.fileName);

			fs.renameSync(absoluteFolderPath, path.join(ROOT, 'tmp', wrapperName, fileName));
			cmd = 'cd "' + path.join(ROOT, 'tmp') + '" && zip -r "' + wrapperName + '.zip" "' + wrapperName + '"';
			
			result = await (new Promise((resolve, reject) => {
				exec(cmd, function (err, stdout, stderr) {
					if (err){
						console.log(err);
						resolve({
							status: 'error',
							error: 'error while zipping folder'
						})
					}
					else {
						resolve({
							status: 'success'
						})
					}
				})
			}))
			if (result.status != 'success'){
				return res.end('error')
			}
			return res.download(path.join(ROOT, 'tmp', wrapperName + '.zip'), err => {
				if (err){
					console.log(err);
					return res.end(err);
				}
				try {
					fsE.removeSync(path.join(ROOT, 'tmp', wrapperName + '.zip'));
					fsE.removeSync(path.join(ROOT, 'tmp', wrapperName));
				}
				catch (e){
					console.log(e);
				}
			})
		}
		else {
			return res.end('error')
		}
	})();
}

global.myCustomVars.exportZip = exportZip;