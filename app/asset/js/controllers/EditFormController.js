app.controller('EditAnimalFormCtrl', ['$http','$scope','AuthService','$routeParams','$filter', function($http,$scope,AuthService, $routeParams, $filter){

	var url = AuthService.hostName + '/content/dong-vat/' + $routeParams.id;
	$http.get(url).then(function (res) {
		// console.log(res.data.animal.ngayNhapMau);
		res.data.animal.ngayNhapMau = new Date(res.data.animal.ngayNhapMau);
		res.data.animal.thoiGianThuMau = new Date(res.data.animal.thoiGianThuMau);
		res.data.animal.thoiGianPhanTich = new Date(res.data.animal.thoiGianPhanTich);
		$scope.animal = res.data.animal;
		$scope.status = res.data.status;
	}, function (err){
		// console.log(err);
		$scope.status = err.data.status;
	});

	var url = AuthService.hostName + '/content/dong-vat';
	
	$scope.updatePost = function(){
		$scope.animal.animalId = $routeParams.id;
		var fd = new FormData(document.getElementById('form-animal'));
		$.ajax({
			url: '/content/dong-vat',
			method: 'PUT',
			contentType: false,
			processData: false,
			data: fd,
			success: function (data) {
				alert(data.status);
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