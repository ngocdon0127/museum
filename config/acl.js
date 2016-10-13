var fs = require('fs');
var path = require('path');

module.exports = function (acl) {

	// init roles
	roles = JSON.parse(fs.readFileSync(path.join(__dirname, 'roles.json')).toString());
	for (var i in roles) {
		var role = roles[i];
		for (var j = 0; j < role.allows.length; j++) {
			acl.allow(role.role, role.allows[j].resource, role.allows[j].actions);
		}
	}

	// assign users to roles
	var aclRules = JSON.parse(fs.readFileSync(path.join(__dirname, 'acl.json')).toString());
	for (var i in aclRules) {
		var rule = aclRules[i];
		for (var j = 0; j < rule.roles.length; j++) {
			acl.addUserRoles(rule.userId, rule.roles[j])
		}
	}
}