var express = require('express');
var router = express.Router();
var passport = require('passport');
var multer = require('multer');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Log = mongoose.model('Log');

var aclMiddleware = global.myCustomVars.aclMiddleware;


router.use(isLoggedIn);

/* GET home page. */
router.get('/', function(req, res, next) {
	var projection = {userId: req.user.id};

	if ('action' in req.query){
		projection.action = req.query.action;
	}

	if ('object' in req.query){
		var arr = [];
		arr.push(req.query.object);
		try {
			var mgOI = mongoose.Types.ObjectId(req.query.object);
			arr.push(mgOI)
		}
		catch (e){
			console.log(e);
		}
		projection['obj1._id'] = {$in: arr};
	}

	if ('type' in req.query){
		projection.objType = req.query.type;
	}

	Log.find(projection, {}, {sort: {time: -1}}, function (err, logs) {
		if (err){
			console.log(err);
			return res.status(500).json({
				status: 'error',
				error: 'Error while reading database'
			})
		}
		// return res.status(200).json({
		// 	status: 'success',
		// 	logs: logs,
		// 	path: '/log' + req.path,
		// })
		return res.render('log', {user: req.user, logs: logs, path: '/log' + req.path});
	})
})

router.get('/all', aclMiddleware('/log/all', 'view', '/log'), function (req, res, next) {
	var projection = {};
	if ('user' in req.query){
		projection.userId = req.query.user;
	}
	if ('action' in req.query){
		projection.action = req.query.action;
	}

	if ('object' in req.query){
		var arr = [];
		arr.push(req.query.object);
		try {
			var mgOI = mongoose.Types.ObjectId(req.query.object);
			arr.push(mgOI)
		}
		catch (e){
			console.log(e);
		}
		projection['obj1._id'] = {$in: arr};
	}

	if ('type' in req.query){
		projection.objType = req.query.type;
	}

	Log.find(projection, {}, {sort: {time: -1}}, function (err, logs) {
		if (err){
			console.log(err);
			return res.status(500).json({
				status: 'error',
				error: 'Error while reading database'
			})
		}
		// return res.status(200).json({
		// 	status: 'success',
		// 	logs: logs
		// })
		return res.render('log', {user: req.user, logs: logs, path: '/log' + req.path});
	})
})

function isLoggedIn (req, res, next) {
	if (!req.isAuthenticated()){
		return res.redirect('/auth/login');
	}
	return next();
}

module.exports = router;
