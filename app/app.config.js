app.config(function($locationProvider, $stateProvider, $urlRouterProvider) {
	$locationProvider.html5Mode(false);
	$locationProvider.hashPrefix('!');
	$stateProvider
	.state('home', {
		url: '/'
	})
	.state('them-dong-vat', {
		url: '/dong-vat',
		templateUrl: 'views/users/add-animal-form.template.html',
		controller: 'AnimalFormCtrl'
	})
	.state('them-thuc-vat', {
		url: '/thuc-vat',
		templateUrl: 'views/users/add-vegetable-form.template.html',
		controller: 'VegetableFormCtrl'
	})
	.state('them-dia-chat', {
		url: '/dia-chat',
		templateUrl: 'views/users/add-geological-form.template.html',
		controller: 'GeologicalFormCtrl'
	})
	.state('them-tho-nhuong', {
		url: '/tho-nhuong',
		templateUrl: 'views/users/add-land-form.template.html',
		controller: 'LandFormCtrl'
	})
	.state('them-co-sinh', {
		url: '/co-sinh',
		templateUrl: 'views/users/add-paleontological-form.template.html',
		controller: 'PaleontologicalFormCtrl'
	})
	.state('chinh-sua-dong-vat', {
		url: '/dong-vat/chinh-sua/:id',
		templateUrl: 'views/users/edit/edit-animal-form.template.html',
		controller: 'EditAnimalFormCtrl'
	})
	.state('chinh-sua-thuc-vat', {
		url: '/thuc-vat/chinh-sua/:id',
		templateUrl: 'views/users/edit/edit-vegetable-form.template.html',
		controller: 'EditVegetableFormCtrl'
	})
	.state('chinh-sua-co-sinh', {
		url: '/co-sinh/chinh-sua/:id',
		templateUrl: 'views/users/edit/edit-paleontological-form.template.html',
		controller: 'EditPaleontologicalFormCtrl'
	})
	.state('chinh-sua-tho-nhuong', {
		url: '/tho-nhuong/chinh-sua/:id',
		templateUrl: 'views/users/edit/edit-land-form.template.html',
		controller: 'EditLandFormCtrl'
	})
	.state('chinh-sua-dia-chat', {
		url: '/dia-chat/chinh-sua/:id',
		templateUrl: 'views/users/edit/edit-geological-form.template.html',
		controller: 'EditGeologicalFormCtrl'
	})
	.state('quan-ly', {
		url: '/quan-ly-mau',
		templateUrl: 'views/users/manage-post/manage.template.html'
	})
	.state('quan-ly-dong-vat', {
		url: '/quan-ly-mau/dong-vat',
		templateUrl: 'views/users/manage-post/manage-post.template.html',
		controller: 'AnimalManageController'
	})
	.state('quan-ly-thuc-vat', {
		url: '/quan-ly-mau/thuc-vat',
		templateUrl: 'views/users/manage-post/manage-post.template.html',
		controller: 'VegetableManageController'
	})
	.state('quan-ly-tho-nhuong', {
		url: '/quan-ly-mau/tho-nhuong',
		templateUrl: 'views/users/manage-post/manage-post.template.html',
		controller: 'LandManageController'
	})
	.state('quan-ly-dia-chat', {
		url: '/quan-ly-mau/dia-chat',
		templateUrl: 'views/users/manage-post/manage-post.template.html',
		controller: 'GeologicalManageController'
	})
	.state('quan-ly-co-sinh', {
		url: '/quan-ly-mau/co-sinh',
		templateUrl: 'views/users/manage-post/manage-post.template.html',
		controller: 'PaleontologicalManageController'
	})
	.state('testover', {
		url: '/bai-dang/test-over',
		templateUrl: 'views/testover.template.html'
	});
	$urlRouterProvider.otherwise('/');
});

app.run(function($rootScope, $location, $state, $stateParams, $http, AuthService){
	$rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
	$rootScope.$on('$stateChangeStart', function(event, next, current){
		var url = AuthService.hostName + "/users/me?datatype=json"
		$http.get(url).then(function success(res) {
			$rootScope.restricted = res.data;
			$rootScope.username = res.data.user.fullname;
		}, function error(err) {
			console.log(err)
		});
		// console.log(username);
	});
});