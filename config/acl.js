var fs = require('fs');
var path = require('path');

module.exports = function (acl) {

	// init roles
	roles = JSON.parse(fs.readFileSync(path.join(__dirname, 'acl.json')).toString());
	for (var i = 0; i < roles.length; i++) {
		var role = roles[i];
		for (var j = 0; j < role.allows.length; j++) {
			acl.allow(role.role, role.allows[j].resource, role.allows[j].actions);
		}
	}

	// asign users to roles
	acl.addUserRoles('57a5af51b89dbe602613affc', 'guest')
	acl.addUserRoles('57a6b435a8afadd42a8cabc5', 'guest')
}