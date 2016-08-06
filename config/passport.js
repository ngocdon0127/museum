var LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport, User) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
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
				return done(null, false, req.flash("loginMessage", "Invalid Email"));
			}
			if (!user.validPassword(password)){
				return done(null, false, req.flash("loginMessage", "Invalid password"));
			}
			done(null, user);
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
			var newUser = new User();

			// username + password can be passed as arguments.
			newUser.username = username;
			newUser.password = newUser.hashPassword(password);
			
			// But fullname must be access through request 's body.
			newUser.fullname = req.body.fullname;
			newUser.save(function (err, user) {
				if (err){
					throw err;
				}
				return done(null, user);
			})
		})
	}));
}