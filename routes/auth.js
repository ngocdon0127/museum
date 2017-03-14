var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('mongoose').model('User');

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