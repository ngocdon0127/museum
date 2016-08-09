module.exports = function (acl) {
	acl.allow('guest', '/test', 'view');
	acl.addUserRoles('57a5af51b89dbe602613affc', 'guest')
}