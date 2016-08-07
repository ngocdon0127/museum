app.config(['$locationProvider', '$routeProvider',function($locationProvider, $routeProvider) {
	$locationProvider.hashPrefix('!');

	$routeProvider
	.when('/dong-vat', {
		templateUrl: 'views/users/add-animal-form.template.html',
		controller: 'AnimalFormCtrl'
	})
	.otherwise({ redirectTo: '/dong-vat' })
}]);