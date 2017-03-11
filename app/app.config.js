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
	.when('/dia-chat', {
		templateUrl: 'views/users/add-geological-form.template.html',
		controller: 'GeologicalFormCtrl'
	})
	.when('/tho-nhuong', {
		templateUrl: 'views/users/add-land-form.template.html',
		controller: 'LandFormCtrl'
	})
	.when('/co-sinh', {
		templateUrl: 'views/users/add-paleontological-form.template.html',
		controller: 'PaleontologicalFormCtrl'
	})
	.when('/dong-vat/chinh-sua/:id', {
		templateUrl: 'views/users/edit/edit-animal-form.template.html',
		controller: 'EditAnimalFormCtrl'
	})
	.when('/thuc-vat/chinh-sua/:id', {
		templateUrl: 'views/users/edit/edit-vegetable-form.template.html',
		controller: 'EditVegetableFormCtrl'
	})
	.when('/co-sinh/chinh-sua/:id', {
		templateUrl: 'views/users/edit/edit-paleontological-form.template.html',
		controller: 'EditPaleontologicalFormCtrl'
	})
	.when('/tho-nhuong/chinh-sua/:id', {
		templateUrl: 'views/users/edit/edit-land-form.template.html',
		controller: 'EditLandFormCtrl'
	})
	.when('/dia-chat/chinh-sua/:id', {
		templateUrl: 'views/users/edit/edit-geological-form.template.html',
		controller: 'EditGeologicalFormCtrl'
	})
	.when('/bai-dang', {
		templateUrl: 'views/users/manage-post/manage.template.html'
	})
	.when('/bai-dang/dong-vat', {
		templateUrl: 'views/users/manage-post/manage-post.template.html',
		controller: 'AnimalManageController'
	})
	.when('/bai-dang/thuc-vat', {
		templateUrl: 'views/users/manage-post/manage-post.template.html',
		controller: 'VegetableManageController'
	})
	.when('/bai-dang/tho-nhuong', {
		templateUrl: 'views/users/manage-post/manage-post.template.html',
		controller: 'LandManageController'
	})
	.when('/bai-dang/dia-chat', {
		templateUrl: 'views/users/manage-post/manage-post.template.html',
		controller: 'GeologicalManageController'
	})
	.when('/bai-dang/co-sinh', {
		templateUrl: 'views/users/manage-post/manage-post.template.html',
		controller: 'PaleontologicalManageController'
	})
	.when('/bai-dang/test-over', {
		templateUrl: 'views/testover.template.html'
	})
	.otherwise({ redirectTo: '/co-sinh' })
}]);