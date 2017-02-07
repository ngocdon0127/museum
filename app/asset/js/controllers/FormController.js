app.controller('AnimalFormCtrl', ['$scope','$http','AuthService','cfpLoadingBar', function ($scope, $http, AuthService, cfpLoadingBar) {

	$http.get('/app/database/tooltipsani.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});
	//auto complete
	function autoCom(str) {
		jQuery("#"+str).autocomplete({
			source : $scope.auto[str]
		})
	};
	var arrAuto = AuthService.arrAuto;
	
	$http.get(AuthService.hostName + '/content/dong-vat/auto').then(function(res) {
		$scope.auto = res.data;
		arrAuto.forEach(function (val) {
			autoCom(val);
		})
	}, function (err) {
		console.log(err);
	});
	var urlRe = AuthService.hostName + '/app/#!/bai-dang/dong-vat';
	$scope.addPost = function(FormContent){
		// if ($scope.FormContent.$valid) {
			cfpLoadingBar.start();
			var fd = new FormData(document.getElementById('form-content'));
			AuthService.addSample(fd, AuthService.hostName + '/content/dong-vat', urlRe);
		// } else{
		// 	angular.element("[name='" + FormContent.$name + "']").find('.ng-invalid:visible:first').focus();
		// }
	}
}]);

app.controller('VegetableFormCtrl', ['$scope','$http','AuthService','cfpLoadingBar', function ($scope, $http, AuthService,cfpLoadingBar) {

	$http.get('/app/database/tooltipsveg.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});

	function autoCom(str) {
		jQuery("#"+str).autocomplete({
			source : $scope.auto[str]
		})
	};
	var arrAuto = AuthService.arrAuto;
	$http.get(AuthService.hostName + '/content/thuc-vat/auto').then(function(res) {
		$scope.auto = res.data;
		arrAuto.forEach(function (val) {
			autoCom(val);
		})
	}, function (err) {
		console.log(err);
	}); 

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/thuc-vat';

	$scope.addPost = function(FormContent){
		// if ($scope.FormContent.$valid) {
			var fd = new FormData(document.getElementById('form-content'));
			AuthService.addSample(fd, AuthService.hostName + '/content/thuc-vat', urlRe);
		// } else{
		// 	angular.element("[name='" + FormContent.$name + "']").find('.ng-invalid:visible:first').focus();
		// }
	}
}]);

app.controller('GeologicalFormCtrl', ['$scope','$http','AuthService','cfpLoadingBar', function ($scope, $http, AuthService, cfpLoadingBar) {
	
	$http.get('/app/database/tooltipsgeo.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});
	function autoCom(str) {
		jQuery("#"+str).autocomplete({
			source : $scope.auto[str]
		})
	};
	var arrAuto = AuthService.arrAuto;
	$http.get(AuthService.hostName + '/content/dia-chat/auto').then(function(res) {
		$scope.auto = res.data;
		arrAuto.forEach(function (val) {
			autoCom(val);
		})
	}, function (err) {
		console.log(err);
	});

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/dia-chat';
	$scope.addPost = function(FormContent){
		// if ($scope.FormContent.$valid) {
			var fd = new FormData(document.getElementById('form-content'));
			AuthService.addSample(fd, AuthService.hostName + '/content/dia-chat', urlRe);
		// } else{
		// 	angular.element("[name='" + FormContent.$name + "']").find('.ng-invalid:visible:first').focus();
		// }
	}
}]);

app.controller('LandFormCtrl', ['$scope','$http','AuthService','cfpLoadingBar', function ($scope, $http, AuthService, cfpLoadingBar) {

	$http.get('/app/database/tooltipslan.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});

	function autoCom(str) {
		jQuery("#"+str).autocomplete({
			source : $scope.auto[str]
		})
	};
	var arrAuto = AuthService.arrAuto;
	$http.get(AuthService.hostName + '/content/tho-nhuong/auto').then(function(res) {
		$scope.auto = res.data;
		arrAuto.forEach(function (val) {
			autoCom(val);
		})
	}, function (err) {
		console.log(err);
	});

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/tho-nhuong';
	$scope.addPost = function(FormContent){
		// if ($scope.FormContent.$valid) {
			var fd = new FormData(document.getElementById('form-content'));
			AuthService.addSample(fd, AuthService.hostName + '/content/tho-nhuong', urlRe);
		// } else{
		// 	angular.element("[name='" + FormContent.$name + "']").find('.ng-invalid:visible:first').focus();
		// }
	}
}]);

app.controller('PaleontologicalFormCtrl', ['$scope','$http','AuthService','cfpLoadingBar', function ($scope, $http, AuthService, cfpLoadingBar) {

	$http.get('/app/database/tooltipspal.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});

	function autoCom(str) {
		jQuery("#"+str).autocomplete({
			source : $scope.auto[str]
		})
	};
	var arrAuto = AuthService.arrAuto;
	$http.get(AuthService.hostName + '/content/co-sinh/auto').then(function(res) {
		$scope.auto = res.data;
		arrAuto.forEach(function (val) {
			autoCom(val);
		})
	}, function (err) {
		console.log(err);
	});

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/co-sinh';
	$scope.addPost = function(FormContent){
		// if ($scope.FormContent.$valid) {
			var fd = new FormData(document.getElementById('form-content'));
			AuthService.addSample(fd, AuthService.hostName + '/content/co-sinh', urlRe);
		// } else{
		// 	angular.element("[name='" + FormContent.$name + "']").find('.ng-invalid:visible:first').focus();
		// }
	}
}]);

app.controller('PlaceController', ['$scope','$http','$filter', function ($scope, $http, $filter) {
	var places = {};
	$http.get('/app/database/cities.json').then(function(res){
		$scope.cities = res.data;
		places.cities = res.data;
		$http.get('/app/database/districts.json').then(function(res){
			// $scope.districts = res.data;
			places.districts = res.data; // pre load
			$http.get('/app/database/wards.json').then(function(res){
				// $scope.wards = res.data;
				places.wards = res.data // pre load
				// console.log('cached');
			}, function(res){
				console.log(res);
			});
		}, function(res){
			console.log(res);
		});
	}, function(res){
		console.log(res);
	});
	$scope.cityChange = function(){
		if ('districts' in places){
			// console.log('districts cache hit');
			$scope.districts = places.districts;
		}
		else {
			// console.log('districts cache miss')
			$http.get('/app/database/districts.json').then(function(res){
				$scope.districts = res.data;
				places.districts = res.data;
			}, function(res){
				console.log(res);
			});
		}
		
	}
	$scope.star = true;
	$scope.showstar = function () {
		$scope.star = true;
	}

	$scope.hidestar = function () {
		$scope.star = false;
	}

	$scope.districtChange = function() {
		if ('wards' in places){
			// console.log('wards cache hit')
			$scope.wards = places.wards;
		}
		else {
			// console.log('wards cache miss')
			$http.get('/app/database/wards.json').then(function(res){
				$scope.wards = res.data;
				places.wards = res.data
			}, function(res){
				console.log(res);
			});
		}
		
	};
}]);