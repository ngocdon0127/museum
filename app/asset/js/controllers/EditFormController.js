app.controller('EditAnimalFormCtrl', ['$http','$scope','AuthService','$routeParams','$timeout','cfpLoadingBar', function($http,$scope,AuthService, $routeParams, $timeout, cfpLoadingBar){
	var url = AuthService.hostName + '/content/dong-vat/' + $routeParams.id;
	
	$http.get('/app/database/tooltipsani.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});
	//auto complete
	// function autoCom(str) {
	// 	jQuery("#"+str).autocomplete({
	// 		source : $scope.auto[str]
	// 	})
	// };

	

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
		// console.log(res.data.animal);
		// res.data.animal.ngayNhapMau = new Date(res.data.animal.ngayNhapMau);
		// res.data.animal.thoiGianThuMau = new Date(res.data.animal.thoiGianThuMau);
		// res.data.animal.thoiGianPhanTich = new Date(res.data.animal.thoiGianPhanTich);

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
	
	$http.get('/app/database/tooltipsani.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});
	//auto complete
	// function autoCom(str) {
	// 	jQuery("#"+str).autocomplete({
	// 		source : $scope.auto[str]
	// 	})
	// };

	

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
		// res.data.paleontological.ngayNhapMau = new Date(res.data.paleontological.ngayNhapMau);
		// res.data.paleontological.thoiGianThuMau = new Date(res.data.paleontological.thoiGianThuMau);
		// res.data.paleontological.thoiGianPhanTich = new Date(res.data.paleontological.thoiGianPhanTich);
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
	
	$http.get('/app/database/tooltipsani.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});
	//auto complete
	// function autoCom(str) {
	// 	jQuery("#"+str).autocomplete({
	// 		source : $scope.auto[str]
	// 	})
	// };

	

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
		// res.data.vegetable.ngayNhapMau = new Date(res.data.vegetable.ngayNhapMau);
		// res.data.vegetable.thoiGianThuMau = new Date(res.data.vegetable.thoiGianThuMau);
		// res.data.vegetable.thoiGianPhanTich = new Date(res.data.vegetable.thoiGianPhanTich);
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
	
	$http.get('/app/database/tooltipsani.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});
	//auto complete
	// function autoCom(str) {
	// 	jQuery("#"+str).autocomplete({
	// 		source : $scope.auto[str]
	// 	})
	// };

	

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
		// res.data.geological.ngayNhapMau = new Date(res.data.geological.ngayNhapMau);
		// res.data.geological.thoiGianThuMau = new Date(res.data.geological.thoiGianThuMau);
		// res.data.geological.thoiGianPhanTich = new Date(res.data.geological.thoiGianPhanTich);

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
	
	$http.get('/app/database/tooltipsani.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});
	//auto complete
	// function autoCom(str) {
	// 	jQuery("#"+str).autocomplete({
	// 		source : $scope.auto[str]
	// 	})
	// };

	

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
		// console.log(res.data.soil);
		// res.data.soil.ngayNhapMau = new Date(res.data.soil.ngayNhapMau);
		// res.data.soil.thoiGianThuMau = new Date(res.data.soil.thoiGianThuMau);
		// res.data.soil.thoiGianPhanTich = new Date(res.data.soil.thoiGianPhanTich);
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