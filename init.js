/**
 * Init ACL
 */

var acl = require('acl');
acl = new acl(new acl.memoryBackend());
require('./config/acl.js')(acl);

function aclMiddleware (resource, action) {
	return function (req, res, next) {
		if (!('userId' in req.session)){
			return res.redirect('/home');
		}
		acl.isAllowed(req.session.userId, resource, action, function (err, result) {
			if (err){
				console.log(err);
			}
			console.log('result: ', result);
			if (result){
				next();
			}
			else {
				return res.redirect('/home');
			}
		});
	}
}

global.myCustomVars.aclMiddleware = aclMiddleware;


/**
 * Shared Functions
 */

function checkRequiredParams (requiredParams, object) {
	if (requiredParams instanceof Array){
		for (var i = 0; i < requiredParams.length; i++) {
			if (!(requiredParams[i] in object)){
				return requiredParams[i];
			}
		}
	}
	return false;
}

global.myCustomVars.checkRequiredParams = checkRequiredParams;