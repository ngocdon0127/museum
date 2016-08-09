module.exports = function (acl) {
	acl.allow('guest', '/test', ['view', 'edit']);
	acl.allow('content', '/test', ['edit']);
	acl.addUserRoles('57a5af51b89dbe602613affc', 'guest')
	acl.addUserRoles('57a6b435a8afadd42a8cabc5', 'guest')
}