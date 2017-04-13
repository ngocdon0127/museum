var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('mongoose').model('User');
var mailconfig = require('../config/config').mailconfig;
var recaptcha = require('../config/config').recaptcha;
var randomstring = require("randomstring");
var rp = require('request-promise');

/* config gui mail */
const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport(mailconfig);

// var PERM_ADMIN = global.myCustomVars.PERM_ADMIN;
// var PERM_MANAGER = global.myCustomVars.PERM_MANAGER;
// var PERM_USER = global.myCustomVars.PERM_USER;

router.use((req, res, next) => {
	// if (req.path == '/logout'){
	// 	return next();
	// }
	// if (req.isAuthenticated()){
	// 	return res.redirect('/home')
	// }
	next();
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/auth/login');
});

router.get('/notme', (req, res, next) => {
	res.cookie('username', '');
	return res.redirect('/')
})

router.get("/login", function (req, res) {
	// console.log('COOKIE');
	// console.log(req.headers.cookie);
	// console.log('=========');
	// console.log(req.cookies);
	// console.log('COOKIE');
	let oldUser = req.cookies.username;
	if (req.cookies.username){
		User.findOne({username: oldUser}, (err, user) => {
			if (err || !user){
				res.cookie('username', '');
				res.render("login", {
					message: req.flash("loginMessage"), 
					title: "Login", 
					user: req.user, 
					path: '/auth/login',
					oldEmail: req.flash("oldEmail"),
					redirectBack: req.flash('redirectBack')
				});
			}
			else {
				// console.log(req.cookies.avatar);
				let avatar = '/admin/dist/img/user1-128x128.jpg';
				if (('avatar' in user) && ('original' in user.avatar) && (user.avatar.original)){
					avatar = '/' + user.avatar.original;
				}
				res.render("lockscreen", {
					message: req.flash("loginMessage"), 
					title: "Login", 
					oldUser: user,
					path: '/auth/login',
					oldEmail: req.flash("oldEmail"),
					avatar: avatar,
					redirectBack: req.flash('redirectBack')
				});
			}
		})
	}
	else {
		res.render("login", {
			message: req.flash("loginMessage"), 
			title: "Login", 
			user: req.user, 
			path: '/auth/login',
			oldEmail: req.flash("oldEmail"),
			redirectBack: req.flash('redirectBack')
		});
	}
});

// Dynamic redirect after logging in:
// 
// server.get('/auth/google', passport.authenticate('google'));
// 
// => Change to:
// 
// server.get('/auth/google', function(req, res, next){
//     passport.authenticate('google')(req, res, next);
// });

router.post("/login", function (req, res, next) {
	var redirectBack = (req.body.redirectBack) ? req.body.redirectBack : '/users/me';
	passport.authenticate('local-login', {
		successRedirect: redirectBack,
		failureRedirect: "login",
		failureFlash: true
	})(req, res, next) // Hay vcl. 
});

/* Phan reset account*/
router.get('/forgot-password', function(req, res){
	res.render('forgotPassword', {
		title : 'Forgot your password?',
		sitekey : recaptcha.sitekey
	});
});

router.post('/forgot-password', function(req, res){
	rp({
		url: 'https://www.google.com/recaptcha/api/siteverify',
		method: 'POST',
		form: { secret: recaptcha.secretkey, response : req.body['g-recaptcha-response'] },
		json : true
	})
	.then((body) => {
		if(body.success)
			return User.findOne({'username': req.body.email}).exec();
		else
			throw "Bạn là robot!";
	})
	.then((user) => {
		if(!user){
			throw "Không có tài khoản trong hệ thống!";
		}
		if(user.forgot_password.count > 5)
			throw "Bạn đã yêu cầu cấp lại mật khẩu quá số lần tối đa trong ngày!";
		let nextTimeRequest = new Date(user.forgot_password.lastTime.getTime() + 15 * user.forgot_password.count * 60000);
		let now = new Date();
		if(now <  nextTimeRequest)
			throw "Bạn cần đợi " + ((nextTimeRequest.getTime() - now.getTime()) / 60000).toFixed(0) + ' phút nữa mới có thể tiếp tục yêu cầu tạo lại mật khẩu.';
		user.forgot_password.count ++;
		user.forgot_password.lastTime = Date.now();
		user.forgot_password.key = randomstring.generate();
		return user.save();
	})
	.then((user) => {
		let key = user.forgot_password.key;
		let url = req.protocol + '://' + req.get('host') + "/auth/reset/" + user.username + "/" + key;
		let message = "<p>Bạn vừa yêu cầu thay đổi mật khẩu cho tài khoản " + user.fullname + '</p><br>';
		message += "<p>Nhấn vào liên kết bên dưới và làm theo hướng dẫn</p>";
		message += "<a href='" + url + "''>" + url + "</a>";

		// setup email data with unicode symbols
		let mailOptions = {
			from: '"Bảo tàng online"', // sender address
			to: user.username, // list of receivers
			subject: 'Khôi phục mật khẩu cho tài khoản baotangonline', // Subject line
			html: message // html body
		};

		// send mail with defined transport object
		transporter.sendMail(mailOptions, (error, info) => {
			if (error){
				console.log(error);
				res.render('message', {
					title: 'Thông báo',
					message: 'Có lỗi xảy ra trong quá trình gửi email. Vui lòng thử lại'
				})
				user.forgot_password.count--;
				user.forgot_password.key = randomstring.generate();
				user.forgot_password.lastTime = undefined;
				user.save();
			}
			else {
				console.log('Message %s sent: %s', info.messageId, info.response);
				res.render('message', {
					title: 'Thông báo',
					message: 'Thành công! Xem hòm thư và làm theo hướng dẫn để khôi phục mật khẩu'
				});
			}
		});
	})
	.catch((err) => {
		res.render('message', {
			title: 'Thông báo',
			message: 'Có lỗi xảy ra: ' + err
		});
	});

});

router.get('/reset/:email/:key', function(req, res){
	User.findOne({'username' : req.params.email, 'forgot_password.key' : req.params.key}, function(err, user){
		err && console.log(err);
		!user && console.log('invalid username');
		if(err || !user)
			res.send("Có lỗi xảy ra");
		else {
			res.render("resetPassword", {
				title : "Đặt lại mật khẩu",
				username : req.params.email,
				key : req.params.key
			});
		}
	});
});

router.post('/reset', function(req, res){
	let username = req.body.username;
	let key = req.body.key;
	let password = req.body.password;
	User.findOne({'username' : username, 'forgot_password.key' : key}, function(err, user){
		if(err || !user)
			res.send(JSON.stringify({err : 1, message : "Có lỗi xảy ra"}));
		else {
			user.forgot_password.key = undefined;
			user.password = user.hashPassword(password);
			user.save(function(err, updateUser){
				res.send(JSON.stringify({err : false, message : "Thay đổi mật khẩu thành công"}));
			});
		}
	});
});


/* het phan reset */


router.get("/failure", function (req, res) {
	res.end("failure");
});

router.get('/logout', function (req, res) {

	// logout passport
	req.logout();

	// logout acl
	delete req.session.userId;
	res.redirect('login');
})


router.get("/signup", function (req, res) {
	// Disable signup
	// return res.end("Chức năng đăng ký tạm thời bị tắt.\nLiên hệ chủ nhiệm đề tài để được cấp tài khoản.");
	res.render("signup", {message: req.flash("signupMessage"), title: "Register", user: req.user, path: '/auth/signup'})
});

// router.post('/signup', function (req, res) {
// 	return res.end("Chức năng đăng ký tạm thời bị tắt.\nLiên hệ chủ nhiệm đề tài để được cấp tài khoản.");
// })

router.post("/signup", passport.authenticate('local-signup', {
	successRedirect: '/auth/login',
	failureRedirect: 'signup',
	failureFlash: true
}));

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect("/users/login");
}

module.exports = router;