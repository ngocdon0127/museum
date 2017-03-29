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
		setTimeout(function () {
			// Load name for input file
			$scope.getName = function (arr) {
				return arr.length ? arr[0] : "No file chosen...";
			}
			arrAuto.forEach(function (val) {
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
			if (isNaN($scope.data.viDo)) {
				var coor = $scope.data.viDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
				$scope.vido_do = parseInt(coor[1].trim());
				$scope.vido_phut = parseInt(coor[2].trim());
				$scope.vido_giay = parseInt(coor[3].trim());
				var coor = $scope.data.kinhDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
				$scope.kinhdo_do = parseInt(coor[1].trim());
				$scope.kinhdo_phut = parseInt(coor[2].trim());
				$scope.kinhdo_giay = parseInt(coor[3].trim());
				document.getElementById("vitri-dms").checked = true;
				$scope.showCoor = true;
			} else {
				document.getElementById("vitri-dd").checked = true;
				$scope.showCoor = false;
			}
			if ($scope.data.fDiaDiemThuMau == "bien") {
				document.getElementById("trenBien").checked = true;
			} else{
				document.getElementById("datLien").checked = true;
			}
			document.getElementsByName('tinh')[0].click()
			document.getElementsByName('huyen')[0].click()
		}, 1000);
	}, function (err){
		$scope.status = err.data.status;
	});

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/dong-vat';
	$scope.updatePost = function(){
		cfpLoadingBar.start();
		AuthService.startSpinner();
		var fd = new FormData(document.getElementById('form-content'));
		AuthService.editForm(fd, AuthService.hostName + '/content/dong-vat', urlRe);
	}

	//coordinate change
	$scope.latChange = function () {
		$scope.data.viDo = $scope.vido_do + " ° " + $scope.vido_phut + " ' " + $scope.vido_giay + '"';
	}
	$scope.lonChange = function () {
		$scope.data.kinhDo = $scope.kinhdo_do + " ° " + $scope.kinhdo_phut + " ' " + $scope.kinhdo_giay + '"';
	}

	$scope.dms = function () {
		$scope.showCoor = true;
	}
	$scope.dd = function () {
		$scope.showCoor = false
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
		setTimeout(function () {
			// Load name for input file
			$scope.getName = function (arr) {
				return arr.length ? arr[0] : "No file chosen...";
			}
			arrAuto.forEach(function (val) {
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
			if (isNaN($scope.data.viDo)) {
				var coor = $scope.data.viDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
				$scope.vido_do = parseInt(coor[1].trim());
				$scope.vido_phut = parseInt(coor[2].trim());
				$scope.vido_giay = parseInt(coor[3].trim());
				var coor = $scope.data.kinhDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
				$scope.kinhdo_do = parseInt(coor[1].trim());
				$scope.kinhdo_phut = parseInt(coor[2].trim());
				$scope.kinhdo_giay = parseInt(coor[3].trim());
				document.getElementById("vitri-dms").checked = true;
				$scope.showCoor = true;
			} else {
				document.getElementById("vitri-dd").checked = true;
				$scope.showCoor = false;
			}
			if ($scope.data.fDiaDiemThuMau == "bien") {
				document.getElementById("trenBien").checked = true;
			} else{
				document.getElementById("datLien").checked = true;
			}
			document.getElementsByName('tinh')[0].click()
			document.getElementsByName('huyen')[0].click()
		}, 1000);
	}, function (err){
		$scope.status = err.data.status;
	});

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/co-sinh';
	$scope.updatePost = function(){
		cfpLoadingBar.start();
		AuthService.startSpinner();
		var fd = new FormData(document.getElementById('form-content'));
		AuthService.editForm(fd, AuthService.hostName + '/content/co-sinh', urlRe);
	}

	//coordinate change
	$scope.latChange = function () {
		$scope.data.viDo = $scope.vido_do + " ° " + $scope.vido_phut + " ' " + $scope.vido_giay + '"';
	}
	$scope.lonChange = function () {
		$scope.data.kinhDo = $scope.kinhdo_do + " ° " + $scope.kinhdo_phut + " ' " + $scope.kinhdo_giay + '"';
	}

	$scope.dms = function () {
		$scope.showCoor = true;
	}
	$scope.dd = function () {
		$scope.showCoor = false
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
		setTimeout(function () {
			// Load name for input file
			$scope.getName = function (arr) {
				return arr.length ? arr[0] : "No file chosen...";
			}
			arrAuto.forEach(function (val) {
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
			if (isNaN($scope.data.viDo)) {
				var coor = $scope.data.viDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
				$scope.vido_do = parseInt(coor[1].trim());
				$scope.vido_phut = parseInt(coor[2].trim());
				$scope.vido_giay = parseInt(coor[3].trim());
				var coor = $scope.data.kinhDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
				$scope.kinhdo_do = parseInt(coor[1].trim());
				$scope.kinhdo_phut = parseInt(coor[2].trim());
				$scope.kinhdo_giay = parseInt(coor[3].trim());
				document.getElementById("vitri-dms").checked = true;
				$scope.showCoor = true;
			} else {
				document.getElementById("vitri-dd").checked = true;
				$scope.showCoor = false;
			}
			if ($scope.data.fDiaDiemThuMau == "bien") {
				document.getElementById("trenBien").checked = true;
			} else{
				document.getElementById("datLien").checked = true;
			}
			document.getElementsByName('tinh')[0].click()
			document.getElementsByName('huyen')[0].click()
		}, 1000);
	}, function (err){
		$scope.status = err.data.status;
	});

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/thuc-vat';
	$scope.updatePost = function(){
		cfpLoadingBar.start();
		AuthService.startSpinner();
		var fd = new FormData(document.getElementById('form-content'));
		AuthService.editForm(fd, AuthService.hostName + '/content/thuc-vat', urlRe);
	}

	//coordinate change
	$scope.latChange = function () {
		$scope.data.viDo = $scope.vido_do + " ° " + $scope.vido_phut + " ' " + $scope.vido_giay + '"';
	}
	$scope.lonChange = function () {
		$scope.data.kinhDo = $scope.kinhdo_do + " ° " + $scope.kinhdo_phut + " ' " + $scope.kinhdo_giay + '"';
	}

	$scope.dms = function () {
		$scope.showCoor = true;
	}
	$scope.dd = function () {
		$scope.showCoor = false
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
		setTimeout(function () {
			// Load name for input file
			$scope.getName = function (arr) {
				return arr.length ? arr[0] : "No file chosen...";
			}
			arrAuto.forEach(function (val) {
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
			if (isNaN($scope.data.viDo)) {
				var coor = $scope.data.viDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
				try{
					$scope.vido_do = parseInt(coor[1].trim());
					$scope.vido_phut = parseInt(coor[2].trim());
					$scope.vido_giay = parseInt(coor[3].trim());
					var coor = $scope.data.kinhDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
					$scope.kinhdo_do = parseInt(coor[1].trim());
					$scope.kinhdo_phut = parseInt(coor[2].trim());
					$scope.kinhdo_giay = parseInt(coor[3].trim());
				} catch(e){
					console.log(e)
				}
				document.getElementById("vitri-dms").checked = true;
				$scope.showCoor = true;
			} else {
				document.getElementById("vitri-dd").checked = true;
				$scope.showCoor = false;
			}
			if ($scope.data.fDiaDiemThuMau == "bien") {
				document.getElementById("trenBien").checked = true;
			} else{
				document.getElementById("datLien").checked = true;
			}
			document.getElementsByName('tinh')[0].click()
			document.getElementsByName('huyen')[0].click()
		}, 1000);
	}, function (err){
		$scope.status = err.data.status;
	});

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/dia-chat';
	$scope.updatePost = function(){
		cfpLoadingBar.start();
		AuthService.startSpinner();
		var fd = new FormData(document.getElementById('form-content'));
		AuthService.editForm(fd, AuthService.hostName + '/content/dia-chat', urlRe);
	}

	//coordinate change
	$scope.latChange = function () {
		$scope.data.viDo = $scope.vido_do + " ° " + $scope.vido_phut + " ' " + $scope.vido_giay + '"';
	}
	$scope.lonChange = function () {
		$scope.data.kinhDo = $scope.kinhdo_do + " ° " + $scope.kinhdo_phut + " ' " + $scope.kinhdo_giay + '"';
	}

	$scope.dms = function () {
		$scope.showCoor = true;
	}
	$scope.dd = function () {
		$scope.showCoor = false
	}
}]);

app.controller('EditLandFormCtrl', ['$http','$scope','AuthService','$routeParams','$timeout','cfpLoadingBar', function($http,$scope,AuthService, $routeParams, $timeout, cfpLoadingBar){
	var url = AuthService.hostName + '/content/tho-nhuong/' + $routeParams.id;
	
	$http.get('/app/database/tipslan.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});

	var arrAuto = AuthService.arrAuto;
	
	$http.get(AuthService.hostName + '/content/tho-nhuong/auto').then(function(res) {
		$scope.auto = res.data;
		setTimeout(function () {
			// Load name for input file
			$scope.getName = function (arr) {
				return arr.length ? arr[0] : "No file chosen...";
			}
			arrAuto.forEach(function (val) {
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
			// if ($scope.data.viDo != null) {
				if (isNaN($scope.data.viDo)) {
					var coor = $scope.data.viDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
					$scope.vido_do = parseInt(coor[1].trim());
					$scope.vido_phut = parseInt(coor[2].trim());
					$scope.vido_giay = parseInt(coor[3].trim());
					var coor = $scope.data.kinhDo.match('([0-9 ]+)\°([0-9 ]+)\'([0-9 ]+)\"')
					$scope.kinhdo_do = parseInt(coor[1].trim());
					$scope.kinhdo_phut = parseInt(coor[2].trim());
					$scope.kinhdo_giay = parseInt(coor[3].trim());
					document.getElementById("vitri-dms").checked = true;
					$scope.showCoor = true;
				} else {
					document.getElementById("vitri-dd").checked = true;
					$scope.showCoor = false;
				}
				if ($scope.data.fDiaDiemThuMau == "bien") {
					document.getElementById("trenBien").checked = true;
				} else{
					document.getElementById("datLien").checked = true;
				}
				document.getElementsByName('tinh')[0].click()
				document.getElementsByName('huyen')[0].click()
			// }
		}, 1000);
	}, function (err){
		$scope.status = err.data.status;
	});

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/tho-nhuong';
	$scope.updatePost = function(){
		cfpLoadingBar.start();
		AuthService.startSpinner();
		var fd = new FormData(document.getElementById('form-content'));
		AuthService.editForm(fd, AuthService.hostName + '/content/tho-nhuong', urlRe);
	}

	//coordinate change
	$scope.latChange = function () {
		$scope.data.viDo = $scope.vido_do + " ° " + $scope.vido_phut + " ' " + $scope.vido_giay + '"';
	}
	$scope.lonChange = function () {
		$scope.data.kinhDo = $scope.kinhdo_do + " ° " + $scope.kinhdo_phut + " ' " + $scope.kinhdo_giay + '"';
	}

	$scope.dms = function () {
		$scope.showCoor = true;
	}
	$scope.dd = function () {
		$scope.showCoor = false
	}
}]);