var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('mongoose').model('User');
var randomstring = require("randomstring");

/* config gui mail */
const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'chienminhnguyen196@gmail.com',
        pass: 'nqmpkpxvpjydtgxv'
    }
});





// var PERM_ADMIN = global.myCustomVars.PERM_ADMIN;
// var PERM_MANAGER = global.myCustomVars.PERM_MANAGER;
// var PERM_USER = global.myCustomVars.PERM_USER;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/auth/login');
});

router.get("/login", function (req, res) {
	res.render("login", {
		message: req.flash("loginMessage"), 
		title: "Login", 
		user: req.user, 
		path: '/auth/login',
		oldEmail: req.flash("oldEmail"),
		redirectBack: req.flash('redirectBack')
	});
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
	var redirectBack = (req.body.redirectBack) ? req.body.redirectBack : '/home';
	passport.authenticate('local-login', {
		successRedirect: redirectBack,
		failureRedirect: "login",
		failureFlash: true
	})(req, res, next) // Hay vcl. 
});

/* Phan reset account*/
router.get('/forgot-password', function(req, res){
	res.render('forgotPassword', {
		title : 'Forgot your password?'
	});
});

router.post('/forgot-password', function(req, res){
	var email = req.body.email;
	User.findOne({'username' : email}, function(err, user){
		if(err || !user)
			res.send(JSON.stringify({err : 1, message : "Không tồn tại email này trong hệ thống!"}));
		else {
			var key = randomstring.generate();
			user.resetKey = key;
			user.save();
			
			let url = req.protocol + '://' + req.get('host') + "/auth/reset/" + user.username + "/" + key;
			let message = "<p>Bạn vừa thay đổi mật khẩu cho tài khoản " + user.fullname + "</p><br>";
			message += "<a href='" + url + "''>" + url + "</a>";

			// setup email data with unicode symbols
			let mailOptions = {
			    from: '"Bảo tàng online" <foo@blurdybloop.com>', // sender address
			    to: 'nguyenminhchien1996bg@gmail.com', // list of receivers
			    subject: 'Thay đổi mật khẩu cho tài khoản baotangonline', // Subject line
			    html: message // html body
			};

			// send mail with defined transport object
			transporter.sendMail(mailOptions, (error, info) => {
			    if (error) {
			        return console.log(error);
			    }
			    console.log('Message %s sent: %s', info.messageId, info.response);
			});


			res.send(JSON.stringify({err : false, message : "Thành công! Xem hòm thư và làm theo hướng dẫn để khôi phục mật khẩu"}));
		}
	});
	// res.send(req.body.email);
});

router.get('/reset/:email/:key', function(req, res){
	User.findOne({'username' : req.params.email, 'resetKey' : req.params.key}, function(err, user){
		if(err || !user)
			res.send("Có lỗi xảy ra");
		else {
			res.render("resetPassword", {
				title : "Thay đổi mật khẩu",
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
	User.findOne({'username' : username, 'resetKey' : key}, function(err, user){
		if(err || !user)
			res.send(JSON.stringify({err : 1, message : "Có lỗi xảy ra"}));
		else {
			user.resetKey = undefined;
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

router.get('/settings', isLoggedIn, function (req, res, next) {
	res.render('settings', {title: 'Settings', user: req.user});
})

router.post('/settings', isLoggedIn, function (req, res, next) {
	User.findById(req.user, function (err, user) {
		if (err || !user){
			console.log(err);
			return res.redirecr('/book/mybooks');
		}
		user.fullname = req.body.fullname;
		user.city = req.body.city;
		user.state = req.body.state;
		user.save(function (err) {
			return res.redirect('/book/mybooks');
		})
	})
})

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect("/users/login");
}

module.exports = router;