app.controller('EditAnimalFormCtrl', ['$http','$scope','AuthService','$routeParams','$timeout','cfpLoadingBar', function($http,$scope,AuthService, $routeParams, $timeout, cfpLoadingBar){
	var url = AuthService.hostName + '/content/dong-vat/' + $routeParams.id;
	
	$http.get('/app/database/tipsani.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});

	var arrAuto = AuthService.arrAuto;
	
	$http.get(AuthService.hostName + '/content/dong-vat/auto').then(function(res) {
		$scope.auto = res.data;
		// console.log(res.data);
		setTimeout(function () {
			arrAuto.forEach(function (val) {
				// autoCom(val);
				AuthService.autoCom(val, $scope);
			})
			// Fetch data to datalist
			AuthService.fetchFlexdatalist($scope);
		}, 500)
	}, function (err) {
		console.log(err);
	});

	$http.get(url).then(function (res) {

		$scope.data = res.data.animal;
		$scope.status = res.data.status;
		$scope.data.id = $routeParams.id;

		// DatePicker
		AuthService.initDatePicker($scope.data);

		$timeout(function(){
			// console.log($scope.data.huyen)
			document.getElementsByName('tinh')[0].click()
			document.getElementsByName('huyen')[0].click()
		}, 1000);
	}, function (err){
		$scope.status = err.data.status;
	});

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/dong-vat';
	$scope.updatePost = function(){
		cfpLoadingBar.start();
		var fd = new FormData(document.getElementById('form-content'));
		AuthService.editForm(fd, AuthService.hostName + '/content/dong-vat', urlRe);
	}
}]);

app.controller('EditPaleontologicalFormCtrl', ['$http','$scope','AuthService','$routeParams','$timeout','cfpLoadingBar', function($http,$scope,AuthService, $routeParams, $timeout, cfpLoadingBar){
	var url = AuthService.hostName + '/content/co-sinh/' + $routeParams.id;
	
	$http.get('/app/database/tipspal.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});

	var arrAuto = AuthService.arrAuto;
	
	$http.get(AuthService.hostName + '/content/co-sinh/auto').then(function(res) {
		$scope.auto = res.data;
		// console.log(res.data);
		setTimeout(function () {
			arrAuto.forEach(function (val) {
				// autoCom(val);
				AuthService.autoCom(val, $scope);
			})
			// Fetch data to datalist
			AuthService.fetchFlexdatalist($scope);
		}, 500)
	}, function (err) {
		console.log(err);
	});

	$http.get(url).then(function (res) {
		$scope.data = res.data.paleontological;
		$scope.status = res.data.status;
		$scope.data.id = $routeParams.id;

		// DatePicker
		AuthService.initDatePicker($scope.data);

		$timeout(function(){
			document.getElementsByName('tinh')[0].click()
			document.getElementsByName('huyen')[0].click()
		}, 1000);
	}, function (err){
		$scope.status = err.data.status;
	});

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/co-sinh';
	$scope.updatePost = function(){
		cfpLoadingBar.start();
		var fd = new FormData(document.getElementById('form-content'));
		AuthService.editForm(fd, AuthService.hostName + '/content/co-sinh', urlRe);
	}
}]);

app.controller('EditVegetableFormCtrl', ['$http','$scope','AuthService','$routeParams','$timeout','cfpLoadingBar', function($http,$scope,AuthService, $routeParams, $timeout, cfpLoadingBar){
	var url = AuthService.hostName + '/content/thuc-vat/' + $routeParams.id;
	
	$http.get('/app/database/tipsveg.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});

	var arrAuto = AuthService.arrAuto;
	
	$http.get(AuthService.hostName + '/content/thuc-vat/auto').then(function(res) {
		$scope.auto = res.data;
		// console.log(res.data);
		setTimeout(function () {
			arrAuto.forEach(function (val) {
				// autoCom(val);
				AuthService.autoCom(val, $scope);
			})
			// Fetch data to datalist
			AuthService.fetchFlexdatalist($scope);
		}, 500)
	}, function (err) {
		console.log(err);
	});

	$http.get(url).then(function (res) {
		$scope.data = res.data.vegetable;
		$scope.status = res.data.status;
		$scope.data.id = $routeParams.id;

		// DatePicker
		AuthService.initDatePicker($scope.data);

		$timeout(function(){
			document.getElementsByName('tinh')[0].click()
			document.getElementsByName('huyen')[0].click()
		}, 1000);
	}, function (err){
		$scope.status = err.data.status;
	});

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/thuc-vat';
	$scope.updatePost = function(){
		cfpLoadingBar.start();
		var fd = new FormData(document.getElementById('form-content'));
		AuthService.editForm(fd, AuthService.hostName + '/content/thuc-vat', urlRe);
	}
}]);

app.controller('EditGeologicalFormCtrl', ['$http','$scope','AuthService','$routeParams','$timeout','cfpLoadingBar', function($http,$scope,AuthService, $routeParams, $timeout, cfpLoadingBar){
	var url = AuthService.hostName + '/content/dia-chat/' + $routeParams.id;
	
	$http.get('/app/database/tipsgeo.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});

	var arrAuto = AuthService.arrAuto;
	
	$http.get(AuthService.hostName + '/content/dia-chat/auto').then(function(res) {
		$scope.auto = res.data;
		// console.log(res.data);
		setTimeout(function () {
			arrAuto.forEach(function (val) {
				// autoCom(val);
				AuthService.autoCom(val, $scope);
			})
			// Fetch data to datalist
			AuthService.fetchFlexdatalist($scope);
		}, 500)
	}, function (err) {
		console.log(err);
	});

	$http.get(url).then(function (res) {

		$scope.data = res.data.geological;
		$scope.status = res.data.status;
		$scope.data.id = $routeParams.id;

		// DatePicker
		AuthService.initDatePicker($scope.data);
		
		$timeout(function(){
			document.getElementsByName('tinh')[0].click()
			document.getElementsByName('huyen')[0].click()
		}, 1000);
	}, function (err){
		$scope.status = err.data.status;
	});

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/dia-chat';
	$scope.updatePost = function(){
		cfpLoadingBar.start();
		var fd = new FormData(document.getElementById('form-content'));
		AuthService.editForm(fd, AuthService.hostName + '/content/dia-chat', urlRe);
	}
}]);

app.controller('EditLandFormCtrl', ['$http','$scope','AuthService','$routeParams','$timeout','cfpLoadingBar', function($http,$scope,AuthService, $routeParams, $timeout, cfpLoadingBar){
	var url = AuthService.hostName + '/content/tho-nhuong/' + $routeParams.id;
	// console.log($routeParams.id);
	
	$http.get('/app/database/tipslan.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});

	var arrAuto = AuthService.arrAuto;
	
	$http.get(AuthService.hostName + '/content/tho-nhuong/auto').then(function(res) {
		$scope.auto = res.data;
		// console.log(res.data);
		setTimeout(function () {
			arrAuto.forEach(function (val) {
				// autoCom(val);
				AuthService.autoCom(val, $scope);
			})
			// Fetch data to datalist
			AuthService.fetchFlexdatalist($scope);
		}, 500)
	}, function (err) {
		console.log(err);
	});

	$http.get(url).then(function (res) {
		$scope.data = res.data.soil;
		$scope.status = res.data.status;
		$scope.data.id = $routeParams.id;
		
		// DatePicker
		AuthService.initDatePicker($scope.data);

		$timeout(function(){
			document.getElementsByName('tinh')[0].click()
			document.getElementsByName('huyen')[0].click()
		}, 1000);
	}, function (err){
		$scope.status = err.data.status;
	});

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/tho-nhuong';
	$scope.updatePost = function(){
		cfpLoadingBar.start();
		var fd = new FormData(document.getElementById('form-content'));
		AuthService.editForm(fd, AuthService.hostName + '/content/tho-nhuong', urlRe);
	}
}]);