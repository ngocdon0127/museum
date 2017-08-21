app.config(function($locationProvider, $stateProvider, $urlRouterProvider, $httpProvider, $compileProvider) {
	$compileProvider.debugInfoEnabled(false);
	$httpProvider.useApplyAsync(1000);
	$locationProvider.html5Mode(false);
	$locationProvider.hashPrefix('!');
	$stateProvider
	.state('home', {
		url: '/',
		templateUrl: 'views/users/home.template.html'
	})
	.state('them-dong-vat', {
		url: '/dong-vat',
		templateUrl: 'views/users/add-animal-form.template.html',
		controller: 'AnimalFormCtrl',
		access : {
			sample : "dongvat",
			action : "create",
			redirectTo: "home",
			restrict: true
		}
	})
	.state('them-thuc-vat', {
		url: '/thuc-vat',
		templateUrl: 'views/users/add-vegetable-form.template.html',
		controller: 'VegetableFormCtrl',
		access : {
			sample : "thucvat",
			action : "create",
			redirectTo: "home",
			restrict: true
		}
	})
	.state('them-dia-chat', {
		url: '/dia-chat',
		templateUrl: 'views/users/add-geological-form.template.html',
		controller: 'GeologicalFormCtrl',
		access : {
			sample : "diachat",
			action : "create",
			redirectTo: "home",
			restrict: true
		}
	})
	.state('them-tho-nhuong', {
		url: '/tho-nhuong',
		templateUrl: 'views/users/add-land-form.template.html',
		controller: 'LandFormCtrl',
		access : {
			sample : "thonhuong",
			action : "create",
			redirectTo: "home",
			restrict: true
		}
	})
	.state('them-co-sinh', {
		url: '/co-sinh',
		templateUrl: 'views/users/add-paleontological-form.template.html',
		controller: 'PaleontologicalFormCtrl',
		access : {
			sample : "cosinh",
			action : "create",
			redirectTo: "home",
			restrict: true
		}
	})
	.state('chinh-sua-dong-vat', {
		url: '/dong-vat/chinh-sua/:id',
		templateUrl: 'views/users/edit/edit-animal-form.template.html',
		controller: 'EditAnimalFormCtrl',
		access : {
			sample : "dongvat",
			action : "edit",
			redirectTo: "home",
			restrict: true
		}
	})
	.state('chinh-sua-thuc-vat', {
		url: '/thuc-vat/chinh-sua/:id',
		templateUrl: 'views/users/edit/edit-vegetable-form.template.html',
		controller: 'EditVegetableFormCtrl',
		access : {
			sample : "thucvat",
			action : "edit",
			redirectTo: "home",
			restrict: true
		}
	})
	.state('chinh-sua-co-sinh', {
		url: '/co-sinh/chinh-sua/:id',
		templateUrl: 'views/users/edit/edit-paleontological-form.template.html',
		controller: 'EditPaleontologicalFormCtrl',
		access : {
			sample : "cosinh",
			action : "edit",
			redirectTo: "home",
			restrict: true
		}
	})
	.state('chinh-sua-tho-nhuong', {
		url: '/tho-nhuong/chinh-sua/:id',
		templateUrl: 'views/users/edit/edit-land-form.template.html',
		controller: 'EditLandFormCtrl',
		access : {
			sample : "thonhuong",
			action : "edit",
			redirectTo: "home",
			restrict: true
		}
	})
	.state('chinh-sua-dia-chat', {
		url: '/dia-chat/chinh-sua/:id',
		templateUrl: 'views/users/edit/edit-geological-form.template.html',
		controller: 'EditGeologicalFormCtrl',
		access : {
			sample : "diachat",
			action : "edit",
			redirectTo: "home",
			restrict: true
		}
	})
	.state('quan-ly', {
		url: '/quan-ly-mau',
		templateUrl: 'views/users/manage-post/manage.template.html'
	})
	.state('quan-ly-dong-vat', {
		url: '/quan-ly-mau/dong-vat',
		templateUrl: 'views/users/manage-post/manage-post.template.html',
		controller: 'AnimalManageController',
		access : {
			sample : "dongvat",
			action : "create",
			redirectTo: "home",
			restrict: true
		}
	})
	.state('quan-ly-thuc-vat', {
		url: '/quan-ly-mau/thuc-vat',
		templateUrl: 'views/users/manage-post/manage-post.template.html',
		controller: 'VegetableManageController',
		access : {
			sample : "thucvat",
			action : "create",
			redirectTo: "home",
			restrict: true
		}
	})
	.state('quan-ly-tho-nhuong', {
		url: '/quan-ly-mau/tho-nhuong',
		templateUrl: 'views/users/manage-post/manage-post.template.html',
		controller: 'LandManageController',
		access : {
			sample : "thonhuong",
			action : "create",
			redirectTo: "home",
			restrict: true
		}
	})
	.state('quan-ly-dia-chat', {
		url: '/quan-ly-mau/dia-chat',
		templateUrl: 'views/users/manage-post/manage-post.template.html',
		controller: 'GeologicalManageController',
		access : {
			sample : "diachat",
			action : "create",
			redirectTo: "home",
			restrict: true
		}
	})
	.state('quan-ly-co-sinh', {
		url: '/quan-ly-mau/co-sinh',
		templateUrl: 'views/users/manage-post/manage-post.template.html',
		controller: 'PaleontologicalManageController',
		access : {
			sample : "cosinh",
			action : "create",
			redirectTo: "home",
			restrict: true
		}
	})
	.state('guest-test', {
		url: '/guest/test',
		templateUrl: 'views/guest/test.template.html',
		controller: 'OfflineCtrl'
	})
	.state('error-page', {
		url: '/loi-trang',
		templateUrl: 'views/errors/error.template.html',
		controller: 'OfflineCtrl'
	});
	$urlRouterProvider.otherwise('/');
});

app.run(function($rootScope, $location, $state, $stateParams, $http, AuthService){
	$rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
	$rootScope.$on('$stateChangeStart', function(event, toState, toStateParams){
		var url = AuthService.hostName + "/users/me?datatype=json"
		AuthService.getRestrict().then(function success(res) {
			$rootScope.restricted = res;
			$rootScope.username = res.user.fullname;
			$rootScope.maDeTai = res.user.maDeTai;
			
			if (toState.access) {
				var sample = toState.access.sample;
				var action = toState.access.action;
				if (!res.restrict[sample][action]) {
					$state.go('home')
				}
			}
		}, function error(err) {
			console.log(err)
		});
		// console.log(toStateParams);
		// if (toState.access.restrict && AuthService.getRestrict(toState.access.sample)) {
		// 	console.log(toStateParams);
		// 	$state.go('home');
			
		// }
	});
});