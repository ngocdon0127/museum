var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var session = require("express-session");
var LocalStrategy = require("passport-local").Strategy;
var MongoStore = require('connect-mongo')(session);
var acl = require('acl');

var app = express();

global.myCustomVars = {};
global.myCustomVars.models = {};

var configDB = require('./config/config').database;
var mongooseConnection = mongoose.connect(configDB.url);

require('./models/User.js')(mongoose);

require('./models/Animal.js')(mongoose);
require('./models/AnimalAutoCompletion.js')(mongoose);

require('./models/Soil.js')(mongoose);
require('./models/SoilAutoCompletion.js')(mongoose);

require('./models/Geological.js')(mongoose);
require('./models/GeologicalAutoCompletion.js')(mongoose);

require('./models/Paleontological.js')(mongoose);
require('./models/PaleontologicalAutoCompletion.js')(mongoose);

require('./models/Vegetable.js')(mongoose);
require('./models/VegetableAutoCompletion.js')(mongoose);

require('./models/Log.js')(mongoose);
require('./models/SharedData.js')(mongoose);
require('./config/passport')(passport, mongoose.model('User'));


require('./init');

/**
 * Use routers
 */

var users = require('./routes/users');
var auth = require('./routes/auth');
var angular = require('./routes/angular');
var admin = require('./routes/admin')
var manager = require('./routes/manager')
var content = require('./routes/content');
var log = require('./routes/log.js');
var test = require('./routes/test.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	secret: "SecretKeyMy",
	resave: true,
	saveUninitialized: true,
	store: new MongoStore({mongooseConnection: mongoose.connection})
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());



// cross origin
// app.use(function (req, res, next) {
// 	res.header('Access-Control-Allow-Origin', "*");
// 	res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");
// 	// res.header('Access-Control-Allow-Credentials', true);
// 	next();
// });
// 

let timeCookie = 3 * 86400 * 1000; // 3 days

app.use(function (req, res, next) { // Để đây thì khi client request static files, hàm này sẽ không cần chạy.
	console.log(req.headers['user-agent']);
	if ('user' in req){
		console.log(req.user);
		res.cookie('username', req.user.username, {maxAge: timeCookie, httpOnly: true});
	}
	next();
})

var routes = require('./routes/index');
app.use('/', routes);

app.use('/users', users);
app.use('/auth', auth);
app.use('/app', angular);
app.use('/admin', admin);
app.use('/manager', manager);
app.use('/content', content);
app.use('/log', log);
app.use('/test', test);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === require('./config/config').environment.env) {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
