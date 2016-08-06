app.config(['$locationProvider', '$routeProvider',function($locationProvider, $routeProvider) {
	$locationProvider.hashPrefix('!');

	$routeProvider
	.when('/login', {
		templateUrl: 'views/users/login.template.html'
	})
	.when('/dong-vat', {
		templateUrl: 'views/users/add-animal-form.template.html'
	})
	.otherwise({ redirectTo: '/login' })
}]);