var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var fs = require('fs');
var path = require('path');
var multer = require('multer');
var uploads = multer({dest: 'public/uploads/animal'});

var aclMiddleware = global.myCustomVars.aclMiddleware;
var acl = global.myCustomVars.acl;

var PROMISES = global.myCustomVars.promises;

router.use(function (req, res, next) {
	console.log(req.url);
	next();
})

var async = require('asyncawait/async')
var await = require('asyncawait/await')

router.post('/dmm', (req, res) => {
	console.log('=====');
	console.log(req.body);
	console.log('=====');
	return res.end('ok')
})

router.get('/leaflet', (req, res) => {
	return res.render('leaflet')
})

router.get('/agent', (req, res) => {
	let agent = req.headers['user-agent'];
	let uap = require('ua-parser');
	let eua = require('express-useragent');
	let ua = require('useragent');
	let result = {}
	result['ua-parser'] = uap.parse(agent);
	result['useragent'] = ua.parse(agent)
	try {
		result['x-forwarded-for'] = req.headers['x-forwarded-for']; 
	    result['connection.remoteAddress'] = req.connection.remoteAddress
	    result['socket.remoteAddress'] = req.socket.remoteAddress
	    result['connection.socket.remoteAddress;'] = req.connection.socket.remoteAddress;
	}
	catch (e){
		console.log(e);
	}
	return res.json(result)
})

router.get('/home', isLoggedIn, function (req, res) {
	// res.render('home', {user: req.user, path: req.path});
	acl.isAllowed(req.session.userId, '/app', 'view', function (err, result) {
			if (err){
				console.log(err);
				res.set('Content-Type', 'text/html; charset=utf8');
				return res.end('Có lỗi xảy ra.')
			}
			// console.log('result: ', result);
			if (result){
				return res.redirect('/app')
			}
			else {
				res.set('Content-Type', 'text/html; charset=utf8');
				return res.end(`
					<body vlink='blue'>
						<center style='margin-top: 50px'>
							<h2>Tài khoản của bạn chưa được cấp phát (hoặc đã bị thu hồi) quyền nhập liệu.<h2>
							<h2>Vui lòng liên hệ Chủ nhiệm đề tài để được hỗ trợ.</h2>
							<h3><a style='text-decoration: none' href="/users/me">Trang cá nhân</a><br><a style='text-decoration: none' href="/auth/logout">Đăng xuất</a></h3>
						</center>
					</body>
				`);
			}
		});
	// res.redirect('/app/#!/');
})

/**
 * Render homepage for guest
 * @param  {[type]} '/homepage'         path
 */
router.get('/homepage', (req, res) => {
	if (['en', 'vi'].indexOf(req.query.lang) < 0) {
		return res.redirect('/homepage?lang=vi')
	}
  let numRandom = 12;

  let models = [
    {modelName: 'co-sinh', modelTitle: 'Cổ sinh', enName : 'paleontological'},
    {modelName: 'dia-chat', modelTitle: 'Địa chất', enName : 'geological'},
    {modelName: 'dong-vat', modelTitle: 'Động vật', enName : 'animal'},
    {modelName: 'tho-nhuong', modelTitle: 'Thổ nhưỡng', enName : 'soil'},
    {modelName: 'thuc-vat', modelTitle: 'Thực vật', enName : 'vegetable'}
  ]
  async(() => {
    let randomObjArr = [];
    for(model of models) {
			// break;
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
    try {
			randomObjArr = getRandomSubarray(randomObjArr, numRandom);
			randomObjArr.forEach(function(element) {
				element.url = element.url + element._id.toString();
			});
		} catch (e) {
			console.log(e);
		}

		console.log(randomObjArr);
		let text = {
			vi: {
				LANG_CODE: 'vi',
				HOME_PAGE: 'Trang chủ',
				ADD_SPECIMEN: 'Thêm mẫu vật',
				PALEONTOLOGY: 'Cổ sinh',
				GEOLOGY: 'Địa chất',
				ZOOLOGICAL: 'Động vật',
				PEDOLOGICAL: 'Thổ nhưỡng',
				BOTANICAL: 'Thực vật',
				COLLECTION_MANAGEMENT: 'Quản lý mẫu vật',
				PALEONTOLOGY_SPECIMEN: 'Mẫu cổ sinh',
				GEOLOGICAL_SPECIMEN: 'Mẫu địa chất',
				ZOOLOGICAL_SPECIMEN: 'Mẫu động vật',
				PEDOLOGICAL_SPECIMEN: 'Mẫu thổ nhưỡng',
				BOTANICAL_SPECIMEN: 'Mẫu thực vật',
				QUERY: 'Truy vấn',
				DATA_QUERY: 'Truy vấn dữ liệu',
				MAP_QUERY: 'Truy vấn bản đồ',
				ENTRY_HISTORY: 'Lịch sử nhập liệu',
				REPORT: 'Báo cáo',
				STATISTIC: 'Thống kê',
				DOCUMENT: 'Tài liệu',
				LOG_IN: 'Đăng nhập',
				LOG_OUT: 'Đăng xuất',
				CONTACT: 'Liên hệ: Bảo Tàng Thiên Nhiên Việt Nam',
				ADDRESS: 'Địa chỉ: Số 18 Hoàng Quốc Việt - Cầu Giấy - Hà Nội',
				PHONE: 'ĐT: (+84-24) 3756 8328 - Fax: (+84-24) 3756 8328',
				EMAIL: 'Email: vnmn@vnmn.vast.vn - Facebook: www.facebook.com/baotangthiennhien/',
				FACILITY_NAME: 'Bảo Tàng Thiên Nhiên Việt Nam',
				NATIONAL_SPECIMEN_COLLECTION: 'Bộ Sưu Tập Mẫu Vật Quốc Gia',
				ABOUT_VIETNAM_NATURE: 'Về Thiên Nhiên Việt Nam',
			},
			en: {
				LANG_CODE: 'en',
				HOME_PAGE: 'Main page',
				ADD_SPECIMEN: 'Add specimen',
				PALEONTOLOGY: 'Paleontology',
				GEOLOGY: 'Geology',
				ZOOLOGICAL: 'Zoology',
				PEDOLOGICAL: 'Pedology',
				BOTANICAL: 'Botany',
				COLLECTION_MANAGEMENT: 'Collection Management',
				PALEONTOLOGY_SPECIMEN: 'Paleontological specimen',
				GEOLOGICAL_SPECIMEN: 'Geological specimen',
				ZOOLOGICAL_SPECIMEN: 'Zoological specimen',
				PEDOLOGICAL_SPECIMEN: 'Pedological specimen',
				BOTANICAL_SPECIMEN: 'Botanical specimen',
				QUERY: 'Query',
				DATA_QUERY: 'Data query',
				MAP_QUERY: 'Map query',
				ENTRY_HISTORY: 'Entry history',
				REPORT: 'Report',
				STATISTIC: 'Statistic',
				DOCUMENT: 'Document',
				LOG_IN: 'Log in',
				LOG_OUT: 'Log out',
				CONTACT: 'Contact: Vietnam National Museum of Nature',
				ADDRESS: 'Address: No. 18 Hoang Quoc Viet - Cau Giay - Hanoi',
				PHONE: 'Phone: (+84-24) 3756 8328 - Fax: (+84-24) 3756 8328',
				EMAIL: 'Email: vnmn@vnmn.vast.vn - Facebook: www.facebook.com/baotangthiennhien/',
				FACILITY_NAME: 'Vietnam National Museum of Nature',
				NATIONAL_SPECIMEN_COLLECTION: 'National Specimen Collection',
				ABOUT_VIETNAM_NATURE: 'About Vietnam Nature',
			}
		}
    return res.render('guest-home', {
    	total: randomObjArr.length,
			data: randomObjArr,
			TEXT: text[req.query.lang]
    })
    // return res.status(200).json({
    //   status: 'success',
    //   total: randomObjArr.length,
    //   data: randomObjArr
    // })
  })();
});

router.get('/test', isLoggedIn, aclMiddleware('/test', 'view'), function (req, res, next) {
	
	acl.userRoles(req.session.userId, (err, roles) => {
		if (err){
			console.log(err);
			res.json({
				status: 'error'
			})
		}
		else {
			res.json({
				roles: roles
			})
		}
	})
	
})

router.get('/config', aclMiddleware('/config', 'view'), function (req, res, next) {
	async(() => {
		var aclRules = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl.json')).toString());
		var roles = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/roles.json')).toString());
		var cores = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl-core.json')).toString())
		var myRoles = await(PROMISES.getUserRoles(req.session.userId));
		var result = {};
		let users = await(PROMISES.getUsers()).usersNormal;
		let me = JSON.parse(JSON.stringify(req.user));
		delete me.level;
		delete me.password;
		result.users = {};
		for (var i = 0; i < users.length; i++) {
			let u = users[i];
			if (u.id == req.session.userId){
				me.level = u.level;
			}
			let canSeeThisUser = false;
			if (myRoles.indexOf('admin') >= 0){
				canSeeThisUser = true;
			}
			else { // I'm an manager
				
				let userRoles = await(PROMISES.getUserRoles(u.id));
				if (userRoles.indexOf('admin') >= 0){
					// I can't see any admin in this view
					canSeeThisUser = false;
				}
				else {
					// But i can see all the managers and the users which have the same MaDeTai with me
					if (users[i].maDeTai && (users[i].maDeTai == req.user.maDeTai)){
						canSeeThisUser = true;
					}
				}
			}

			if (!canSeeThisUser){
				continue;
			}
			var user = {};
			user.id = u.id;
			user.fullname = u.fullname;
			user.username = u.username;
			user.lastLogin = u.lastLogin;
			// user.email = users[i].email;
			result.users[user.id] = user;
		}
		
		var showAllRoles = false;
		if (myRoles.indexOf('admin') >= 0){
			showAllRoles = true;
		}
		result.roles = [];
		for (var i in roles) {
			var r = {};
			r.role = roles[i].role;
			r.rolename = roles[i].rolename;
			let canSee = (req.user.maDeTai == roles[i].maDeTai) || showAllRoles;
			if (canSee){
				result.roles.push(r);
			}
			else {
				// result.roles.push(r); // will be commented out
			}
		}
		result.aclRules = {};
		for (var i in aclRules) {
			result.aclRules[aclRules[i].userId] = [];
			for (var j = 0; j < aclRules[i].roles.length; j++) {
				result.aclRules[aclRules[i].userId].push(aclRules[i].roles[j]);
			}
		}
		// return res.json({
		// 	users: result.users,
		// 	roles: result.roles,
		// 	aclRules: result.aclRules,
		// 	user: req.user,
		// 	path: req.path
		// })
		res.render('manager/userpermissions', {
		// res.render('config', {
			users: result.users,
			roles: result.roles,
			cores: cores,
			aclRules: result.aclRules,
			user: me,
			path: req.path,
			sidebar: {
				active: 'config'
			}
		});
	})()
})

router.get('/config/roleTooltip', aclMiddleware('/config', 'view'), function (req, res, next) {
	var role = req.query.role;
	// console.log(role);
	var roles = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/roles.json')).toString());
	async(() => {
		let canView = false;
		let userRoles = await(PROMISES.getUserRoles(req.session.userId));
		if (userRoles.indexOf('admin') >= 0){
			// console.log('admin can view role ' + role);
			canView = true;
		}
		if ((userRoles.indexOf('manager') >= 0) && (roles[role].maDeTai == req.user.maDeTai)){
			// console.log('manager can view role ' + role);
			canView = true;
		}
		if (!canView){
			return res.status(403).end('Nothing to see here.')
		}
		let sharedData = await(PROMISES.getSharedData());
		let map = {}
		for(let dt of sharedData.deTai){
			map[dt.maDeTai] = dt.tenDeTai;
		}
		// return res.json(map)
		for (let role in roles){
			try {
				roles[role].tenDeTai = map[roles[role].maDeTai]
				// roles[role].tenDeTai = 'dmm'
			}
			catch (e){
				console.log(e);
			}
		}
		// return res.json(roles[role])
		return res.render('roleTooltip', {
			role: roles[role]
		});
	})()
	
})

router.post('/config', uploads.single('photo'), aclMiddleware('/config', 'create'), function (req, res, next){
	// Cập nhật role cho user
	async(() => {
		console.log('---');
		console.log(req.body);
		// console.log(JSON.parse(req.body));
		console.log('---');
		var userRoles = await(PROMISES.getUserRoles(req.body.userid));
		var myRoles = await(PROMISES.getUserRoles(req.session.userId));
		User.findById(req.body.userid, function (err, user) {
			async(() => {
				if (err){
					console.log(err);
					return res.status(403).json({
						status: 'error',
						error: 'You don\'t have permission to access this page'
					})
				}
				if (user){
					if (!user.maDeTai){
						return res.status(400).json({
							status: 'error',
							error: 'Không thể cấp phát quyền cho Pending User. Cần phải phân user này vào 1 đề tài nào đó trước.'
						})
					}
					var canContinue = false;
					var self = (req.body.userid == req.session.userId) ? 1 : 0;
					var mr = (myRoles.indexOf('admin') >= 0) ? 0 : 
						((myRoles.indexOf('manager') >= 0) ? 1 : 2);
					var ur = (userRoles.indexOf('admin') >= 0) ? 0 : 
						((userRoles.indexOf('manager') >= 0) ? 1 : 2);
					var emdt = (user.maDeTai == req.user.maDeTai) ? 1 : 0;
					var mark = [
						[ // mark[0] <=> cấp quyền cho tài khoản khác
							[ // mark[][0] <=> mình là admin
								[ // mark[][][0] <=> nó cũng là admin
									{val: false, msg: 'Không thể chỉnh sửa quyền của admin khác'},
									{val: false, msg: 'Không thể chỉnh sửa quyền của admin khác'},
								],
								[ // mark[][][1] <=> Nó là manager
									{val: true, msg: ''},
									{val: true, msg: ''},
									{val: true, msg: ''}
								],
								[ // mark[][][2] <=> Nó là dân thường
									{val: true, msg: ''},
									{val: true, msg: ''},
									{val: true, msg: ''}
								]
							], 
							[ // mark[][1] <=> mình là manager
								[ // mark[][][0] <=> nó là admin
									{val: false, msg: 'Không thể chỉnh sửa quyền của 1 admin'},
									{val: false, msg: 'Không thể chỉnh sửa quyền của 1 admin'},
								],
								[ // mark[][][1] <=> Nó là manager
									{val: false, msg: 'Không thể chỉnh sửa quyền của 1 manager khác'},
									{val: false, msg: 'Không thể chỉnh sửa quyền của 1 manager khác'}
								],
								[ // mark[][][2] <=> Nó là dân thường
									{val: false, msg: 'User này không do bạn quản lý'},
									{val: true, msg: ''}
								]
							], 
							[ // mark[][2] <=> mình là dân thường. BTW, dân thường không thể vào route này.
								[ // mark[][][2] <=> Nó là dân thường
									{val: false, msg: ''},
									{val: false, msg: ''}
								]
							]
						],
						[ // mark[1] <=> cấp quyền cho chính mình
							[
								[{val: true, msg: ''}, {val: true, msg: ''}], 
								[{val: true, msg: ''}, {val: true, msg: ''}], 
								[{val: true, msg: ''}, {val: true, msg: ''}]
							], [
								[{val: true, msg: ''}, {val: true, msg: ''}], 
								[{val: true, msg: ''}, {val: true, msg: ''}], 
								[{val: true, msg: ''}, {val: true, msg: ''}]
							], [
								[{val: true, msg: ''}, {val: true, msg: ''}], 
								[{val: true, msg: ''}, {val: true, msg: ''}], 
								[{val: true, msg: ''}, {val: true, msg: ''}]
							]
						]
					]
					if (!mark[self][mr][ur][emdt].val){
						return res.status(403).json({
							status: 'error',
							error: mark[self][mr][ur][emdt].msg
						})
					}
					var roles = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/roles.json')).toString());
					var newRoles = [];
					
					for (var i in roles){
						var r = roles[i].role;
						if ((['admin', 'manager'].indexOf(r) < 0) && (r in req.body) && (req.body[r] == 'on')){
							// Không thể cấp phát quyền admin, manager tại route này ('/config')
							// Chỉ admin mới có thể cấp phát quyền admin, manager tại route '/admin/...'
							var canAssignRole = false;
							
							if ((myRoles.indexOf('admin') >= 0) && (roles[i].maDeTai == user.maDeTai)){
								canAssignRole = true;
							}
							if ((user.maDeTai == req.user.maDeTai) && (roles[i].maDeTai == user.maDeTai)){
								// Tránh manager của đề tài này cấp phát quyền trong đề tài mình cho user trong đề tài khác
								canAssignRole = true;

							}
							if (canAssignRole){
								newRoles.push(r);
							}
						}
					}
					var aclRules = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl.json')).toString());
					if (!(user.id in aclRules)){
						aclRules[user.id] = {};
						aclRules[user.id].userId = user.id;
						aclRules[user.id].roles = []
					}

					aclRules[user.id].roles = aclRules[user.id].roles.filter((r, index) => {
						return ['admin', 'manager'].indexOf(r) >= 0; // Chỉ giữ lại 2 roles: admin, manager nếu đã có từ trước.
					})
					
					for(let nr of newRoles){
						// Phải giữ lại roles cũ, trong trường hợp tài khoản đã là Admin hoặc Manager.
						if (aclRules[user.id].roles.indexOf(nr) < 0){
							aclRules[user.id].roles.push(nr)
						}
					}
					fs.writeFileSync(path.join(__dirname, '../config/acl.json'), JSON.stringify(aclRules, null, 4));
					console.log("OK. restarting server");
					process.send({actionType: 'restart', target: 'all'});
					// return restart(res);
					return res.status(200).json({
						status: 'success'
					})
				}
				else {
					return res.status(400).json({
						status: 'error',
						error: 'Invalid userid'
					})
				}
			})()
		})
	})()
})

router.post('/config/roles', uploads.single('photo'), aclMiddleware('/config', 'create'), function (req, res, next) {
	// Tạo role mới
	console.log(req.body);
	var rolename = req.body.rolename.trim();
	rolename = rolename.replace(/\r+\n+/g, ' ');
	rolename = rolename.replace(/ {2,}/g, ' ');
	if (!req.user.maDeTai){
		return res.status(403).json({
			status: 'error',
			error: 'Tài khoản của bạn chưa được phân vào đề tài nào. Liên hệ Admin để được hỗ trợ.'
		})
	}
	var role = req.user.maDeTai + '_' + req.body.side + '_' + rolename;
	role = role.toLowerCase(); 
	role = role.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a"); 
	role = role.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e"); 
	role = role.replace(/ì|í|ị|ỉ|ĩ/g, "i"); 
	role = role.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o"); 
	role = role.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u"); 
	role = role.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y"); 
	role = role.replace(/đ/g, "d"); 
	role = role.replace(/[^a-z0-9-._]/g, "-");
	var aclRules = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl.json')).toString());
	var roles = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/roles.json')).toString());
	var cores = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl-core.json')))

	if (role in roles){
		return res.status(400).json({
			status: 'error',
			error: 'Trùng tên role'
		})
	}
	if (!cores.resources.hasOwnProperty(req.body.side)){
		return res.status(400).json({
			status: 'error',
			error: 'Mẫu được chọn không tồn tại'
		})
	}
	var r = {}
	r.maDeTai = req.user.maDeTai;
	r.role = role;
	r.rolename = rolename;
	r.allows = [
		{
			resource: '/app',
			actions: ['view']
		},
		{
			resource: cores.resources[req.body.side].url,
			resourceId: req.body.side,
			resourceName: cores.resources[req.body.side].resourceName,
			actions: []
		}
	];
	var actions = ['view', 'create', 'edit', 'delete'];
	for (var i = 0; i < actions.length; i++) {
		var act = actions[i];
		if ((act in req.body) && (req.body[act] == 'on')){
			r.allows[1].actions.push(act);
		}
	}
	if ((r.allows[1].actions.indexOf('edit') >= 0) && (r.allows[1].actions.indexOf('view') < 0)) {
		// If a role can edit, it can view, too.
		r.allows[1].actions.push('view');
	}

	roles[role] = r;
	// console.log(r);
	fs.writeFileSync(path.join(__dirname, '../config/roles.json'), JSON.stringify(roles, null, 4));

	process.send({actionType: 'restart', target: 'all'});
	return res.status(200).json({
		status: 'success'
	})

	// return restart(res);
})

router.post('/config/roles/delete', uploads.single('photo'), aclMiddleware('/config', 'delete'), function (req, res, next) {
	async(() => {
		var aclRules = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl.json')).toString());
		var roles = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/roles.json')).toString());
		var cores = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/acl-core.json')).toString());
		var role = req.body.deleteRole;
		console.log(role);
		if ((role == 'admin') || (role == 'manager') || (role == 'vnmnstaff')){
			return res.status(403).json({
				status: 'error',
				error: 'Không thể xóa cấp ' + role
			})
		}
		if (role in roles){
			let mdtRole = roles[role].maDeTai;
			let canDeleteRole = false;
			let userRoles = await(PROMISES.getUserRoles(req.session.userId));
			if (userRoles.indexOf('admin') >= 0){
				canDeleteRole = true;
			}
			if (mdtRole == req.user.maDeTai){
				canDeleteRole = true;
			}
			if (!canDeleteRole){
				return res.status(403).json({
					status: 'error',
					error: 'Không thể xóa. Loại quyền này không thuộc quyền quản lý của bạn'
				})
			}
			delete roles[role];
			fs.writeFileSync(path.join(__dirname, '../config/roles.json'), JSON.stringify(roles, null, 4));
			for (var userId in aclRules){
				
				while (true){
					var index = aclRules[userId].roles.indexOf(role);
					if (index < 0){
						break;
					}
					aclRules[userId].roles.splice(index, 1);
				}
			}
			fs.writeFileSync(path.join(__dirname, '../config/acl.json'), JSON.stringify(aclRules, null, 4));
			process.send({actionType: 'restart', target: 'all'});
			return res.status(200).json({
				status: 'success'
			})
			// return restart(res);
		}
		else {
			return res.status(400).json({
				status: 'error',
				error: 'Role không hợp lệ'
			})
		}
	})()
	
})

// router.get('/test', function (req, res, next) {
// 	res.end("hehe");
// })

/* GET home page. */
router.get('/', function(req, res, next) {
	if (!req.isAuthenticated()){
		return res.redirect('/homepage');
	}
	return res.redirect('/home')
});


function isLoggedIn (req, res, next) {
	if (!req.isAuthenticated()){
		return res.redirect('/auth/login');
	}
	return next();
}

var restart = global.myCustomVars.restart;

module.exports = router;