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
	Log.find({userId: req.user.id}, {}, {sort: {time: -1}}, function (err, logs) {
		if (err){
			console.log(err);
			return res.status(500).json({
				status: 'error',
				error: 'Error while reading database'
			})
		}
		return res.status(200).json({
			status: 'success',
			logs: logs
		})
	})
})

router.get('/all', aclMiddleware('/log/all', 'view'), function (req, res, next) {
	var projection = {};
	if ('user' in req.query){
		projection.userId = req.query.user;
	}
	if ('action' in req.query){
		projection.action = req.query.action;
	}

	Log.find(projection, function (err, logs) {
		if (err){
			console.log(err);
			return res.status(500).json({
				status: 'error',
				error: 'Error while reading database'
			})
		}
		return res.status(200).json({
			status: 'success',
			logs: logs
		})
	})
})

function isLoggedIn (req, res, next) {
	if (!req.isAuthenticated()){
		return res.redirect('/auth/login');
	}
	return next();
}

module.exports = router;
