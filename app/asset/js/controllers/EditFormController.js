app.controller('EditAnimalFormCtrl', ['$http','$scope','AuthService','$routeParams','$filter','$timeout','cfpLoadingBar', function($http,$scope,AuthService, $routeParams, $filter, $timeout, cfpLoadingBar){
	var url = AuthService.hostName + '/content/dong-vat/' + $routeParams.id;
	
	$http.get(url).then(function (res) {
		// console.log(res.data.animal);
		res.data.animal.ngayNhapMau = new Date(res.data.animal.ngayNhapMau);
		res.data.animal.thoiGianThuMau = new Date(res.data.animal.thoiGianThuMau);
		res.data.animal.thoiGianPhanTich = new Date(res.data.animal.thoiGianPhanTich);
		$scope.data = res.data.animal;
		$scope.status = res.data.status;
		$scope.data.id = $routeParams.id;

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
		cfpLoadingBar.start();
		var fd = new FormData(document.getElementById('form-content'));
		$.ajax({
			url: '/content/dong-vat',
			method: 'PUT',
			contentType: false,
			processData: false,
			data: fd,
			success: function (data) {
				cfpLoadingBar.complete();
				console.log(cfpLoadingBar)
				alert(data.status);
				window.location = urlRe;
			},
			error: function (err) {
				cfpLoadingBar.complete();
				cfpLoadingBar.set(0);
				console.log(err);
				alert(JSON.parse(err.responseText).error);
			}
		});
	}
}]);

app.controller('EditPaleontologicalFormCtrl', ['$http','$scope','AuthService','$routeParams','$timeout', function($http,$scope,AuthService, $routeParams, $timeout){
	var url = AuthService.hostName + '/content/co-sinh/' + $routeParams.id;
	
	$http.get(url).then(function (res) {
		res.data.paleontological.ngayNhapMau = new Date(res.data.paleontological.ngayNhapMau);
		res.data.paleontological.thoiGianThuMau = new Date(res.data.paleontological.thoiGianThuMau);
		res.data.paleontological.thoiGianPhanTich = new Date(res.data.paleontological.thoiGianPhanTich);
		$scope.data = res.data.paleontological;
		$scope.status = res.data.status;
		$scope.data.id = $routeParams.id;
		$timeout(function(){
			document.getElementsByName('tinh')[0].click()
			document.getElementsByName('huyen')[0].click()
		}, 1000);
	}, function (err){
		$scope.status = err.data.status;
	});

	var url = AuthService.hostName + '/content/co-sinh';
	var urlRe = AuthService.hostName + '/app/#!/bai-dang/co-sinh';
	$scope.updatePost = function(){
		var fd = new FormData(document.getElementById('form-content'));
		$.ajax({
			url: '/content/co-sinh',
			method: 'PUT',
			contentType: false,
			processData: false,
			data: fd,
			success: function (data) {
				alert(data.status);
				window.location = urlRe;
			},
			error: function (err) {
				console.log(err);
				alert(JSON.parse(err.responseText).error);
			}
		});
	}
}]);

app.controller('EditVegetableFormCtrl', ['$http','$scope','AuthService','$routeParams','$timeout', function($http,$scope,AuthService, $routeParams, $timeout){
var url = AuthService.hostName + '/content/thuc-vat/' + $routeParams.id;
	// console.log($routeParams.id);
	
	$http.get(url).then(function (res) {
		// console.log(res.data.animal.ngayNhapMau);
		res.data.vegetable.ngayNhapMau = new Date(res.data.vegetable.ngayNhapMau);
		res.data.vegetable.thoiGianThuMau = new Date(res.data.vegetable.thoiGianThuMau);
		res.data.vegetable.thoiGianPhanTich = new Date(res.data.vegetable.thoiGianPhanTich);
		$scope.data = res.data.vegetable;
		$scope.status = res.data.status;
		$scope.data.id = $routeParams.id;
		$timeout(function(){
			document.getElementsByName('tinh')[0].click()
			document.getElementsByName('huyen')[0].click()
		}, 1000);
	}, function (err){
		$scope.status = err.data.status;
	});

	var url = AuthService.hostName + '/content/thuc-vat';
	var urlRe = AuthService.hostName + '/app/#!/bai-dang/thuc-vat';
	$scope.updatePost = function(){
		var fd = new FormData(document.getElementById('form-content'));
		$.ajax({
			url: '/content/thuc-vat',
			method: 'PUT',
			contentType: false,
			processData: false,
			data: fd,
			success: function (data) {
				alert(data.status);
				window.location = urlRe;
			},
			error: function (err) {
				console.log(err);
				alert(JSON.parse(err.responseText).error);
			}
		});
	}
}]);

app.controller('EditGeologicalFormCtrl', ['$http','$scope','AuthService','$routeParams','$timeout', function($http,$scope,AuthService, $routeParams, $timeout){
	var url = AuthService.hostName + '/content/dia-chat/' + $routeParams.id;
	// console.log($routeParams.id);
	
	$http.get(url).then(function (res) {
		// console.log(res.data.animal.ngayNhapMau);
		res.data.geological.ngayNhapMau = new Date(res.data.geological.ngayNhapMau);
		res.data.geological.thoiGianThuMau = new Date(res.data.geological.thoiGianThuMau);
		res.data.geological.thoiGianPhanTich = new Date(res.data.geological.thoiGianPhanTich);
		$scope.data = res.data.geological;
		$scope.status = res.data.status;
		$scope.data.id = $routeParams.id;
		$timeout(function(){
			document.getElementsByName('tinh')[0].click()
			document.getElementsByName('huyen')[0].click()
		}, 1000);
	}, function (err){
		$scope.status = err.data.status;
	});

	var url = AuthService.hostName + '/content/dia-chat';
	var urlRe = AuthService.hostName + '/app/#!/bai-dang/dia-chat';
	$scope.updatePost = function(){
		var fd = new FormData(document.getElementById('form-content'));
		$.ajax({
			url: '/content/dia-chat',
			method: 'PUT',
			contentType: false,
			processData: false,
			data: fd,
			success: function (data) {
				alert(data.status);
				window.location = urlRe;
			},
			error: function (err) {
				console.log(err);
				alert(JSON.parse(err.responseText).error);
			}
		});
	}
}]);

app.controller('EditLandFormCtrl', ['$http','$scope','AuthService','$routeParams','$timeout', function($http,$scope,AuthService, $routeParams, $timeout){
	var url = AuthService.hostName + '/content/tho-nhuong/' + $routeParams.id;
	// console.log($routeParams.id);
	
	$http.get(url).then(function (res) {
		// console.log(res.data.soil);
		res.data.soil.ngayNhapMau = new Date(res.data.soil.ngayNhapMau);
		res.data.soil.thoiGianThuMau = new Date(res.data.soil.thoiGianThuMau);
		res.data.soil.thoiGianPhanTich = new Date(res.data.soil.thoiGianPhanTich);
		$scope.data = res.data.soil;
		$scope.status = res.data.status;
		$scope.data.id = $routeParams.id;
		$timeout(function(){
			document.getElementsByName('tinh')[0].click()
			document.getElementsByName('huyen')[0].click()
		}, 1000);
	}, function (err){
		$scope.status = err.data.status;
	});

	var url = AuthService.hostName + '/content/tho-nhuong';
	var urlRe = AuthService.hostName + '/app/#!/bai-dang/tho-nhuong';
	$scope.updatePost = function(){
		var fd = new FormData(document.getElementById('form-content'));
		$.ajax({
			url: '/content/tho-nhuong',
			method: 'PUT',
			contentType: false,
			processData: false,
			data: fd,
			success: function (data) {
				alert(data.status);
				window.location = urlRe;
			},
			error: function (err) {
				console.log(err);
				alert(JSON.parse(err.responseText).error);
			}
		});
	}
}]);