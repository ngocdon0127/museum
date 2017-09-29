const path = require('path');
const ROOT = path.join(__dirname, '..');

// ============== Init ACL =======================

var acl = require('acl');
acl = new acl(new acl.memoryBackend());
require(path.join(ROOT, 'config', 'acl.js'))(acl);

global.myCustomVars.acl = acl;

function aclMiddleware (resource, action, url) {
	var redirectURL = (url) ? url : '/home';
	return function (req, res, next) {
		if (!('userId' in req.session)){
			return res.redirect(redirectURL);
		}
		acl.isAllowed(req.session.userId, resource, action, function (err, result) {
			if (err){
				console.log(err);
			}
			// console.log('result: ', result);
			if (result){
				next();
			}
			else {
				return res.redirect(redirectURL);
			}
		});
	}
}

global.myCustomVars.aclMiddleware = aclMiddleware;