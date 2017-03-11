var fs = require('fs-extra')
var path = require('path')

var cleanUser = false;
var cleanConfigFiles = false;
var cleanAutoCompletion = true;
var cleanData = true;

var mongoose = require('mongoose');
var configDB = require('./config/config').database;
var mongooseConnection = mongoose.connect(configDB.url);
require('./models/User.js')(mongoose);
require('./models/SharedData.js')(mongoose);


console.log('Initializing...');

console.log('Preparing config files...');

var files = [
	{
		example: 'config/roles.json.example',
		original: 'config/roles.json'
	},
	{
		example: 'app/service.js.example',
		original: 'app/service.js'
	},

]

if (cleanConfigFiles){
	files.map((file, index) => {
		try {
			fs.copySync(path.join(__dirname, file.example), path.join(__dirname, file.original))
			// console.log("success!")
		} catch (err) {
			console.error(err)
			process.exit(1)
		}
	});

	console.log('config files OK')
}

console.log('preparing DB...')

var async = require('asyncawait/async');
var await = require('asyncawait/await');
async(() => {
	
	var User = mongoose.model('User');
	var CryptoJS = require('crypto-js');
	var result = '';
	
	if (cleanUser){
		result = await(new Promise((resolve, reject) => {
			User.remove({}, (err) => {
				if (err){
					console.log(err);
					reject('error');
				}
				else{
					resolve('OK');
				}
			})
		}))

		if (result == 'OK'){
			console.log('clean User collection: OK');
		}
		else {
			process.exit(1);
		}

		try {
			fs.removeSync(path.join(__dirname, 'config/acl.json'))
		}
		catch (e){
			// console.log(e);
		}

		var users = [
			{
				username: 'museumtest@gmail.com',
				password: '123museumhust',
				fullname: 'Test Account',
				roles: ['content']
			},
			{
				username: 'kevinhoa95@gmail.com',
				password: 'museumhust1536',
				fullname: 'Hola',
				roles: ['content', 'admin']
			}
		]

		for(var i = 0; i < users.length; i++){
			var user = users[i];
			result = await(new Promise((resolve, reject) => {
				var newUser = new User();

				newUser.username = user.username;
				var l = 0;
				while (l < 1000){
					user.password = CryptoJS.MD5(user.password).toString();
					l++;
				}
				newUser.password = newUser.hashPassword(user.password);
				
				newUser.fullname = user.fullname;
				newUser.save(function (err, user) {
					if (err){
						console.log(err);
						reject('error while creating account ' + user.username);
					}
					else {
						resolve('OK')
					}
				})
			}))
			
			if (result == 'OK'){
				console.log(user.username + ' created')
			}
			else {
				console.log(result);
				process.exit(1);
			}

			result = await(new Promise((resolve, reject) => {
				User.findOne({username: user.username}, (err, _user) => {
					if (err){
						console.log(err);
						reject('error')
					}
					else {
						var data = {}
						try {
							data = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/acl.json')))
						}
						catch (e){
							// console.log(e)
						}
						data[_user._id] = {
							userId: _user._id,
							roles: user.roles
						}

						fs.writeFileSync(path.join(__dirname, 'config/acl.json'), JSON.stringify(data, null, 4))
						resolve('OK')
					}
				})
			}))

			if (result == 'OK'){
				console.log(user.username + ' configed')
			}
			else {
				console.log('error');
				process.exit(1);
			}
		}
	}

	if (cleanAutoCompletion){
		// Init AutoCompletion tables
		let models = [
			{
				modelName: 'Paleontological',
				fileName: 'models/PaleontologicalSchemaProps.json',
				data: {
					'loaiMauVat': [
						'Mẫu nghiên cứu',
						'Mẫu trưng bày',
						'Mẫu Type'
					],
					"coQuanNhapVatMau" : [ 
				        "Bảo tàng Thiên nhiên Việt Nam", 
				    ],
				    "trangThaiGiuMauDNA" : ["Khô"],
				    "boPhanLayMauDNA" : ["Thân"],
				    "coQuanXuLy" : [ 
				        "HUST"
				    ],
				    "coQuanToChucPhanTich" : [ 
				        
				        "BTTNVN", 
				        "Phòng Địa chất- BTTNVN"
				    ],
				    "thon" : [ 
				        "Suối Ke", 
				        "Đỉnh đèo Gia Luận, bên phải đường ô tô đi bến phà Gia Luận", 
				        "Đỉnh đèo Gia Luận", 
				        "bên phải đường ô tô đi bến phà Gia Luận"
				    ],
				    "xa" : [ 
				        
				        "14704", 
				        "13135", 
				        "11935"
				    ],
				    "huyen" : [  
				        "232", 
				        "662", 
				        
				    ],
				    "tinh" : [ 
				        "? undefined:undefined ?", 
				        "25", 
				        "67", 
				        "12", 
				        "36", 
				        "37", 
				        "34", 
				        "31", 
				    ],
				    "quocGia" : [ 
				        "VietNam", 
				        "Việt Nam"
				    ],
				    "coQuanThuMau" : [ 
				        "Bách Khoa", 
				        "KHMT Cổ Sinh 01"
				    ],
				    "duoiLoai" : [ 
				        "KHMT Cổ Sinh 01"
				    ],
				    "loai" : [ 
				        "Gigantoproductus cf. submaximus (Bolkhovitinova, 1932)"
				    ],
				    "giong" : [
				        "Triceratops", 
				        "Gigantoproductus Prentice, 1950", 
				        "Panthera", 
				        "Hổ", 
				        "KHMT01"
				    ],
				    "ho" : [ 
				        
				        "Loliginidae", 
				        "Gigantoproductidae Muir-Wood & Cooper, 1960"
				    ],
				    "lienHo" : [ 
				        "Productacea  Gray, 1840", 
				        "KHMT01"
				    ],
				    "phanHo" : [ 
				        "Ceratopsinae", 
				        "Gigantoproductidae Muir-Wood & Cooper, 1960", 
				        "KHMT01", 
				    ],
				    "bo" : [ 
				        "Productida Sarytcheva & Sokolskaya, 1959"
				    ],
				    "lop" : [ 
				        "Strophomenata Williams, Carlson, Bruton, Homer et Popov, 1996"
				    ],
				    "phanLop" : [ 
				        "KHMT01"
				    ],
				    "nganh" : [ 
				        "Tay cuộn (Brachiopoda) Duméril, 1806"
				    ],
				    "gioi" : [ 
				        "Động vật (Animalia) Linnaeus, 1758"
				    ],
				    "tenDongNghia" : [ 
				        "GIGANTOPRODUCTUS  CF.  SUBMAXIMUS (BOLKHOVITINOVA, 1932)"
				    ],
				    "vungGenPhanTich" : ["Gen gốc"],
				    "giaTriSuDung" : [ "Khoa học", "Y học", "Dinh dưỡng"
				    ],
				    "chi" : [ 
				        "KHMT Cổ Sinh 01"
				    ],
				    "chiGiong": [
				    	"Triceratops"
				    ],
				    "hinhThucNhapMau" : [ 
				        "Thu thập", 
				        "Hiến tặng"
				    ],
				    "noiLuuTruMau" : [ 
				        "BTTNVN", 
				    ]
				}
			},
			{
				modelName: 'Geological',
				fileName: 'models/GeologicalSchemaProps.json',
				data: {
					'loaiMauVat': [
						'Mẫu nghiên cứu',
						'Mẫu trưng bày',
						'Mẫu Type'
					],
					"coQuanNhapVatMau" : [ 
				        "Bảo tàng Thiên nhiên Việt Nam", 
				        "KHMT01"
				    ],
				    "trangThaiGiuMauDNA" : [ 
				        "ádfasdf"
				    ],
				    "boPhanLayMauDNA" : [ 
				        "Xương", 
				    ],
				    "coQuanXuLy" : [ 
				        "HUST", 
				        "KHMT01", 
				    ],
				    "coQuanToChucPhanTich" : [ 
				        "ICT HUST", 
				        "Vườn thú Hà Nội", 
				        "KHMT01", 
				    ],
				    "thon" : [ 
				        "Vũ Xá", 
				        "Vu Xa", 
				        "Trần Phú", 
				        "Thôn Nam", 
				        "Đỉnh đèo Gia Luận, bên phải đường ô tô đi bến phà Gia Luận", 
				        "KHMT01", 
				        "B1"
				    ],
				    "xa" : [ 
				        
				        "03979", 
				        "03982", 
				        "02716", 
				        "30577", 
				        "12745", 
				        "31594", 
				    ],
				    "huyen" : [ 
				        "327", 
				        "152", 
				        "101", 
				        "199", 
				        "339", 
				        "007", 
				        "356", 
				        "001", 
				    ],
				    "tinh" : [ 
				        "31", 
				        "33", 
				        "17", 
				        "11", 
				    ],
				    "quocGia" : [ 
				        "VietNam", 
				        "Việt Nam"
				    ],
				    "coQuanThuMau" : [ 
				        "HUST", 
				        "Vườn Thú Hà Nội", 
				        "KHMT01", 
				        "BTTNVN"
				    ],
				    "duoiLoai" : [ 
				        "KHMT01"
				    ],
				    "loai" : [ 
				        "T. horridus", 
				        "Gigantoproductus cf. submaximus (Bolkhovitinova, 1932)", 
				        "Panthera pardus", 
				        "KHMT01"
				    ],
				    "giong" : [ 
				        "Triceratops", 
				        "Gigantoproductus Prentice, 1950", 
				        "Panthera", 
				        "Hổ", 
				        "KHMT01"
				    ],
				    "toc" : [ 
				        "Tộc", 
				        "KHMT01"
				    ],
				    "phanHo" : [ 
				        "Ceratopsinae", 
				        "Gigantoproductidae Muir-Wood & Cooper, 1960", 
				        "KHMT01", 
				    ],
				    "ho" : [ 
				        "Ceratopsidae", 
				        "Gigantoproductidae Muir-Wood & Cooper, 1960", 
				        "Felidae", 
				        "Mèo", 
				        "KHMT01"
				    ],
				    "lienHo" : [ 
				        "Productacea  Gray, 1840", 
				        "KHMT01"
				    ],
				    "phanBo" : [ 
				        "Ceratopsia", 
				        "Productidina Waagen, 1883", 
				        "KHMT01"
				    ],
				    "bo" : [ 
				        "Ornithischia", 
				        "Productida Sarytcheva & Sokolskaya, 1959", 
				        "KHMT01"
				    ],
				    "phanLop" : [ 
				        "KHMT01"
				    ],
				    "lop" : [ 
				        "Sauropsida", 
				        "Strophomenata Williams, Carlson, Bruton, Homer et Popov, 1996", 
				        "Mammalia", 
				        "Có vú", 
				        "KHMT01", 
				    ],
				    "nganh" : [ 
				        "Chordata", 
				        "Tay cuộn (Brachiopoda) Duméril, 1806", 
				    ],
				    "gioi" : [ 
				        "Animalia", 
				        "Mặt ba sừng", 
				        "Động vật (Animalia) Linnaeus, 1758", 
				        "KHMT01", 
				    ],
				    "tenDongNghia" : [ 
				        "Mặt ba sừng", 
				        "Gigantoproductus cf. submaximus (Bolkhovitinova, 1932)", 
				    ],
				    "tenTheoBaoTang" : [],
				    "giaTriSuDung" : [ 
				        "Khoa học", 
				        "Y học", 
				    ],
				    "hinhThucNhapMau" : [ 
				        "Thu thập", 
				        "Hiến tặng", 
				    ],
				    "noiLuuTruMau" : [ 
				        "B1"
				    ]
				}
			},
			{
				modelName: 'Animal',
				fileName: 'models/AnimalSchemaProps.json',
				data: {
					'loaiMauVat': [
						'Mẫu nghiên cứu',
						'Mẫu trưng bày',
						'Mẫu Type'
					],
					"coQuanNhapVatMau" : [ 
				        "Bảo tàng Thiên nhiên Việt Nam", 
				        "KHMT01"
				    ],
				    "trangThaiGiuMauDNA" : [ 
				        "ádfasdf"
				    ],
				    "boPhanLayMauDNA" : [ 
				        "Xương", 
				    ],
				    "coQuanXuLy" : [ 
				        "HUST", 
				        "KHMT01", 
				    ],
				    "coQuanToChucPhanTich" : [ 
				        "ICT HUST", 
				        "Vườn thú Hà Nội", 
				        "KHMT01", 
				    ],
				    "thon" : [ 
				        "Vũ Xá", 
				        "Vu Xa", 
				        "Trần Phú", 
				        "Thôn Nam", 
				        "Đỉnh đèo Gia Luận, bên phải đường ô tô đi bến phà Gia Luận", 
				        "KHMT01", 
				        "B1"
				    ],
				    "xa" : [ 
				        
				        "03979", 
				        "03982", 
				        "02716", 
				        "30577", 
				        "12745", 
				        "31594", 
				    ],
				    "huyen" : [ 
				        "327", 
				        "152", 
				        "101", 
				        "199", 
				        "339", 
				        "007", 
				        "356", 
				        "001", 
				    ],
				    "tinh" : [ 
				        "31", 
				        "33", 
				        "17", 
				        "11", 
				    ],
				    "quocGia" : [ 
				        "VietNam", 
				        "Việt Nam"
				    ],
				    "coQuanThuMau" : [ 
				        "HUST", 
				        "Vườn Thú Hà Nội", 
				        "KHMT01", 
				        "BTTNVN"
				    ],
				    "duoiLoai" : [ 
				        "KHMT01"
				    ],
				    "loai" : [ 
				        "T. horridus", 
				        "Gigantoproductus cf. submaximus (Bolkhovitinova, 1932)", 
				        "Panthera pardus", 
				        "KHMT01"
				    ],
				    "giong" : [ 
				        "Triceratops", 
				        "Gigantoproductus Prentice, 1950", 
				        "Panthera", 
				        "Hổ", 
				        "KHMT01"
				    ],
				    "phanGiong": [
				    	"Triceratops"
				    ],
				    "toc" : [ 
				        "Tộc", 
				        "KHMT01"
				    ],
				    "phanHo" : [ 
				        "Ceratopsinae", 
				        "Gigantoproductidae Muir-Wood & Cooper, 1960", 
				        "KHMT01", 
				    ],
				    "ho" : [ 
				        "Ceratopsidae", 
				        "Gigantoproductidae Muir-Wood & Cooper, 1960", 
				        "Felidae", 
				        "Mèo", 
				        "KHMT01"
				    ],
				    "lienHo" : [ 
				        "Productacea  Gray, 1840", 
				        "KHMT01"
				    ],
				    "phanBo" : [ 
				        "Ceratopsia", 
				        "Productidina Waagen, 1883", 
				        "KHMT01"
				    ],
				    "bo" : [ 
				        "Ornithischia", 
				        "Productida Sarytcheva & Sokolskaya, 1959", 
				        "KHMT01"
				    ],
				    "phanLop" : [ 
				        "Phan Lop", 
				        "KHMT01"
				    ],
				    "lop" : [ 
				        "Sauropsida", 
				        "Strophomenata Williams, Carlson, Bruton, Homer et Popov, 1996", 
				        "Mammalia", 
				        "Có vú", 
				        "KHMT01", 
				    ],
				    "nganh" : [ 
				        "Chordata", 
				        "Tay cuộn (Brachiopoda) Duméril, 1806", 
				    ],
				    "gioi" : [ 
				        "Animalia", 
				        "Mặt ba sừng", 
				        "Động vật (Animalia) Linnaeus, 1758", 
				        "KHMT01", 
				    ],
				    "tenDongNghia" : [ 
				        "Mặt ba sừng", 
				        "Gigantoproductus cf. submaximus (Bolkhovitinova, 1932)", 
				    ],
				    "tenTheoBaoTang" : ["Mặt ba sừng"],
				    "giaTriSuDung" : [ 
				        "Khoa học", 
				        "Y học", 
				    ],
				    "hinhThucNhapMau" : [ 
				        "Thu thập", 
				        "Hiến tặng", 
				    ],
				    "noiLuuTruMau" : [ 
				        "B1"
				    ]
				}
			},
			{
				modelName: 'Soil',
				fileName: 'models/SoilSchemaProps.json',
				data: {
					'loaiMauVat': [
						'Mẫu nghiên cứu',
						'Mẫu trưng bày',
						'Mẫu Type'
					],
					"coQuanNhapVatMau" : [ 
				        "HUST", 
				        "Bảo tàng Thiên nhiên Việt Nam"
				    ],
				    "coQuanXuLy" : [ 
				        "SOICT", 
				        "Bảo Tàng Thiên Nhiên VN", 
				    ],
				    "coQuanToChucGiamDinh" : [ 
				        "Soict", 
				        "Bảo Tàng Thiên Nhiên VN"
				    ],
				    "thon" : [ 
				        "Đồ Sơn", 
				    ],
				    "xa" : [ 
				        "14266", 
				        "11455", 
				        "12043", 
				        "00028", 
				    ],
				    "huyen" : [ 
				        "366", 
				        "308", 
				        "326", 
				        "001", 
				    ],
				    "tinh" : [ 
				        "36", 
				        "31", 
				        "33", 
				    ],
				    "quocGia" : [ 
				        "VietNam", 
				        "Việt Nam"
				    ],
				    "coQuanThuMau" : [ 
				        "Bảo Tàng Thiên Nhiên VN", 
				    ],
				    "giaTriSuDung" : [ 
				        "Trưng bày"
				    ],
				    "noiLuuTruMau" : ["HUST", "B1"],
				    "hinhThucNhapMau" : [ 
				        "Thu thập", 
				        "Hiến tặng"
				    ]
				}
			},
			{
				modelName: 'Vegetable',
				fileName: 'models/VegetableSchemaProps.json',
				data: {
					'loaiMauVat': [
						'Mẫu nghiên cứu',
						'Mẫu trưng bày',
						'Mẫu Type'
					],
					"coQuanNhapVatMau" : [ 
				        "Bảo tàng Thiên nhiên Việt Nam"
				    ],
				    "coQuanXuLy" : [ 
				        "Bảo Tàng Thiên Nhiên VN"
				    ],
				    "coQuanToChucPhanTich" : [ 
				        "Viện sinh thái học miền nam", 
				        "Bảo tàng Thiên nhiên Việt Nam", 
				    ],
				    "thon" : [ 
				        "Thôn Nam", 
				        "Xóm 1"
				    ],
				    "xa" : [ 
				        "13549", 
				        "13021", 
				        "30808", 
				        "15622", 
				        "08908", 
				        "03004", 
				        "12442", 
				        "12523", 
				        "14803"
				    ],
				    "huyen" : [ 
				        "352", 
				        "342", 
				        "902", 
				        "396", 
				        "248", 
				        "088", 
				        "336", 
				    ],
				    "tinh" : [ 
				        "35", 
				        "34", 
				        "91", 
				        "38", 
				        "42"
				    ],
				    "quocGia" : [ 
				        "VietNam", 
				        "Việt Nam"
				    ],
				    "coQuanThuMau" : [ 
				        "Viện sinh thái học Miền Nam"
				    ],
				    "duoiLoai" : [ 
				        "Morinda tomentosa", 
				    ],
				    "loai" : [ 
				        "crenulatum", 
				        "Tarenna latifolia Pit.", 
				        "Morinda cochinchinensis", 
				    ],
				    "chi" : [ 
				        "Memecylon", 
				        "Pseuderanthemum", 
				        "Tarenna", 
				        "Morinda", 
				    ],
				    "tong" : [ 
				        "Melastomataceae"
				    ],
				    "phanHo" : [ 
				        "Rubiaceae1", 
				    ],
				    "ho" : [ 
				        "Melastomataceae", 
				        "ACANTHACEAE", 
				        "Rubiaceae", 
				        "Melastomataceaeilhb"
				    ],
				    "lienHo" : [ 
				        "Rubiaceae", 
				    ],
				    "phanBo" : [ 
				        "Gentianales", 
				    ],
				    "bo" : [ 
				        "Myrtales", 
				        "Scrophulariales", 
				        "Gentianales"
				    ],
				    "phanLop" : [ 
				        "KHMT01"
				    ],
				    "lop" : [ 
				        "Magnoliopsida", 
				        "Magnoliopsida1"
				    ],
				    "nganh" : [ 
				        "Magnoliophyta", 
				        "Angiospermae", 
				        "Angiospermae1", 
				    ],
				    "gioi" : [ 
				        "Plantae", 
				    ],
				    "tenDongNghia" : [ 
				        "Morinda tomentosa",
				    ],
				    "mauDNA" : [ 
				        "nước"
				    ],
				    "viTriLayMauDNA" : [ 
				        "lá"
				    ],
				    "giaTriSuDung" : [ 
				        "Dinh dưỡng", 
				        "Khoa học", 
				        "LÀM THUỐC", 
				    ],
				    "hinhThucNhapMau" : [ 
				        "Thu thập", 
				        "Hiến tặng"
				    ],
				    "noiLuuTruMau" : [ 
				        "BKHN"
				    ]
				}
			},
		]
		for (var i = 0; i < models.length; i++) {
			let model = models[i];
			// let ObjectModel          = mongoose.model(model.modelName);
			require('./models/' + model.modelName + 'AutoCompletion' + '.js')(mongoose);
			console.log('./models/' + model.modelName + 'AutoCompletion' + '.js');
			var AutoCompletion       = mongoose.model(model.modelName + 'AutoCompletion');
			let result = await(new Promise((resolve, reject) => {
				AutoCompletion.remove({}, (err) => {
					if (err){
						console.log(err);
						reject('err');
					}
					else {
						resolve('OK');
					}
				})
			}))
			if (result != 'OK'){
				continue;
			}
			console.log('Clean ' + model.modelName + ' AutoCompletion: OK');
			result = await(new Promise((resolve, reject) => {
				var ac = new AutoCompletion();
				let props = JSON.parse(fs.readFileSync(path.join(__dirname, model.fileName)));
				for(let prop of props){
					if (('autoCompletion' in prop) && (prop['autoCompletion'])){
						// console.log(prop.name)
						ac[prop.name] = []
					}
				}
				for(let data_ in model.data){
					ac[data_] = model.data[data_];
				}
				ac.save((error, autoCompletion) => {
					if (error){
						console.log(error);
						reject('err');
					}
					else {
						resolve('OK');
					}
				})
			}))
			if (result != 'OK'){
				continue
			}
			console.log(model.modelName + 'AutoCompletion: OK');
		}
		// End
	}

	if (cleanData){
		var result = await (new Promise((resolve, reject) => {
			var Data = mongoose.model('SharedData');
			Data.remove({}, (err) => {
				if (err){
					resolve('error');
				}
				else {
					var data = new Data();
					data.maDeTai = ['DT-001', 'DT-002']
					data.save((err) => {
						if (err){
							resolve('err')
						}
						else {
							resolve('OK')
						}
					})
				}
			})
		}))

		if (result == 'OK'){
			console.log('Clean Data OK')
		}
		else {
			console.log('Clean Data error')
		}
		
	}

	console.log('\nSuccess!\n')
	mongoose.connection.close();

})()
