var LocalStrategy = require('passport-local').Strategy;
// var PERM_ACCESS_PAGE = 1000;

module.exports = function (passport, User) {
	// console.log('========================');
	// console.log('passport: ' + 'serializeUser called');
	// console.log('========================');
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		// console.log('========================');
		// console.log('passport: ' + 'deserializeUser called');
		// console.log('========================');
		User.findById(id, function (err, user) {
			// var u = JSON.parse(JSON.stringify(user));
			// delete u.password;
			done(err, user);
		})
	});

	passport.use("local-login", new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, function (req, username, password, done) {
		User.findOne({
			username: username
		}, function (err, user) {
			if (err){
				return done(err);
			}
			if (!user){
				return done(null, false, req.flash("loginMessage", "Sai thông tin đăng nhập"), req.flash("oldEmail", username));
			}
			if (!user.validPassword(password)){
				return done(null, false, req.flash("loginMessage", "Sai thông tin đăng nhập"), req.flash("oldEmail", username));
			}
			// if (user.permission < PERM_ACCESS_PAGE){
			// 	return done(null, false, req.flash('loginMessage', "Login successfully. But you do not have permission to access page. Contact Admin to update your account."));
			// }
			// login acl
			req.session.userId = user.id;

			// login passport
			done(null, user);
			user.lastLogin = new Date();
			user.save()
		})
	}));

	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		fullnameField: 'fullname',
		passReqToCallback: true
	}, function (req, username, password, done) {
		User.findOne({
			username: username
		}, function (err, user) {
			if (err){
				console.log("err");
				return done(err);
			}
			if (user){
				console.log("exist");
				return done(null, false, req.flash("signupMessage", "Email already exist."));
			}
			var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (!emailRegex.test(username)){
				console.log('invalid email');
				return done(null, false, req.flash('signupMessage', 'Invalid Email.'))
			}
			var newUser = new User();

			// username + password can be passed as arguments.
			newUser.username = username;
			newUser.password = newUser.hashPassword(password);
			
			// But fullname must be access through request 's body.
			newUser.fullname = req.body.fullname;
			// newUser.level = global.myCustomVars.PERM_USER;
			newUser.created_at = new Date();
			newUser.save(function (err, user) {
				if (err){
					throw err;
				}
				return done(null, false, req.flash('signupMessage', "Sign up successfully. But you cannot access page until Admin upgrades your account. "));
				// return done(null, user, req.flash('signupMessage', "Sign up successfully. But you cannot access page until Admin upgrades your account. "));
			})
		})
	}));

	passport.use("login-as", new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, function (req, username, password, done) {
		console.log('executing passport login-as');
		User.findById(req.query.userid, function (err, user) {
			if (err || !user){
				console.log(err);
				console.log(user);
				User.findById(req.session.userId, (err, user) => {
					if (err) {
						console.log(err);
						return done(err)
					}
					return done(null, user)
				})
				return done(err);
			}

			console.log(user);
			
			// login acl
			req.session.userId = user.id;

			// login passport
			done(null, user);
		})
	}));
}