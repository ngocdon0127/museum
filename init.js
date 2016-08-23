
// ============== Init ACL =======================

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



// ============== Shared Functions ================

/**
 * Check required parameters
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


/**
 * Send error message to response when some action failure
 */

function responseError (res, errCode, errMessage) {
	return res.status(errCode).json({
		status: 'error',
		error: errMessage
	})
}

global.myCustomVars.responseError = responseError;


/**
 * When action success
 */

function responseSuccess (res, props, values) {
	if ((props instanceof Array) && (values instanceof Array) && (props.length == values.length)){
		var result = {};
		result.status = 'success';
		for (var i = 0; i < props.length; i++) {
			result[props[i]] = values[i];
		}
		return res.status(200).json(result);
	}
	return res.status(200).json({
		status: 'success',
	})
}

global.myCustomVars.responseSuccess = responseSuccess;