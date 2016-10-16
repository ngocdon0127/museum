app.controller('EditAnimalFormCtrl', ['$http','$scope','AuthService','$routeParams','$filter','$timeout', '$window', function($http,$scope,AuthService, $routeParams, $filter, $timeout, $window){

	var url = AuthService.hostName + '/content/dong-vat/' + $routeParams.id;
	// console.log($routeParams.id);
	
	$http.get(url).then(function (res) {
		// console.log(res.data.animal.ngayNhapMau);
		res.data.animal.ngayNhapMau = new Date(res.data.animal.ngayNhapMau);
		res.data.animal.thoiGianThuMau = new Date(res.data.animal.thoiGianThuMau);
		res.data.animal.thoiGianPhanTich = new Date(res.data.animal.thoiGianPhanTich);
		$scope.animal = res.data.animal;
		$scope.status = res.data.status;
		$scope.animal.animalId = $routeParams.id;
		$timeout(function(){
			document.getElementsByName('tinh')[0].click()
			document.getElementsByName('huyen')[0].click()
		}, 1000);
	}, function (err){
		$scope.status = err.data.status;
	});

	var url = AuthService.hostName + '/content/dong-vat';
	var urlRe = AuthService.hostName + '/app/#!/bai-dang/dong-vat';
	$scope.updatePost = function(){
		var fd = new FormData(document.getElementById('form-animal'));
		$.ajax({
			url: '/content/dong-vat',
			method: 'PUT',
			contentType: false,
			processData: false,
			data: fd,
			success: function (data) {
				alert(data.status);
				$window.location.href = urlRe;
			},
			error: function (err) {
				console.log(err);
				alert(JSON.parse(err.responseText).error);
			}
		});
	}
}]);

app.controller('EditPaleontologicalFormCtrl', ['$http','$scope','AuthService','$routeParams', function($http,$scope,AuthService, $routeParams){
	var url = AuthService.hostName + '/content/dong-vat/' + $routeParams.id;
	$http.get(url).then(function (res) {
		$scope.animal = res.data.animal;
	});

	var url = AuthService.hostName + '/content/dong-vat';
	
	$scope.updatePost = function(){
		$scope.animal.animalId = $routeParams.id;
		console.log($scope.animal);
		$http.put(url, $scope.animal).then(function (res) {
			console.log("Edit success");
		}, function (err) {
			console.log("Edit fail");
		});
	}
}]);

app.controller('EditVegetableFormCtrl', ['$http','$scope','AuthService','$routeParams', function($http,$scope,AuthService, $routeParams){
	var url = AuthService.hostName + '/content/dong-vat/' + $routeParams.id;
	$http.get(url).then(function (res) {
		$scope.animal = res.data.animal;
	});

	var url = AuthService.hostName + '/content/dong-vat';
	
	$scope.updatePost = function(){
		$scope.animal.animalId = $routeParams.id;
		console.log($scope.animal);
		$http.put(url, $scope.animal).then(function (res) {
			console.log("Edit success");
		}, function (err) {
			console.log("Edit fail");
		});
	}
}]);

app.controller('EditGeologicalFormCtrl', ['$http','$scope','AuthService','$routeParams', function($http,$scope,AuthService, $routeParams){
	var url = AuthService.hostName + '/content/dong-vat/' + $routeParams.id;
	$http.get(url).then(function (res) {
		$scope.animal = res.data.animal;
	});

	var url = AuthService.hostName + '/content/dong-vat';
	
	$scope.updatePost = function(){
		$scope.animal.animalId = $routeParams.id;
		console.log($scope.animal);
		$http.put(url, $scope.animal).then(function (res) {
			console.log("Edit success");
		}, function (err) {
			console.log("Edit fail");
		});
	}
}]);

app.controller('EditLandFormCtrl', ['$http','$scope','AuthService','$routeParams', function($http,$scope,AuthService, $routeParams){
	var url = AuthService.hostName + '/content/dong-vat/' + $routeParams.id;
	$http.get(url).then(function (res) {
		$scope.animal = res.data.animal;
	});

	var url = AuthService.hostName + '/content/dong-vat';
	
	$scope.updatePost = function(){
		$scope.animal.animalId = $routeParams.id;
		console.log($scope.animal);
		$http.put(url, $scope.animal).then(function (res) {
			console.log("Edit success");
		}, function (err) {
			console.log("Edit fail");
		});
	}
}]);