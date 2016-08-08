app.config(['$locationProvider', '$routeProvider',function($locationProvider, $routeProvider) {
	$locationProvider.hashPrefix('!');

	$routeProvider
	.when('/dong-vat', {
		templateUrl: 'views/users/add-animal-form.template.html',
		controller: 'AnimalFormCtrl'
	})
	.when('/thuc-vat', {
		templateUrl: 'views/users/add-vegetable-form.template.html',
		controller: 'VegetableFormCtrl'
	})
	.otherwise({ redirectTo: '/dong-vat' })
}]);