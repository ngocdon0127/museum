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

	$scope.latChange = function () {
		$scope.data.viDo = $scope.vido_do + " độ " + $scope.vido_phut + " phút " + $scope.vido_giay + " giây";
	}
	$scope.lonChange = function () {
		$scope.data.kinhDo = $scope.kinhdo_do + " độ " + $scope.kinhdo_phut + " phút " + $scope.kinhdo_giay + " giây";
	}

	$scope.dms = function () {
		$scope.data.viDo = "";
		$scope.data.kinhDo = "";
		$scope.showCoor = true;
	}
	$scope.dd = function () {
		$scope.data.viDo = ""
		$scope.data.kinhDo = ""
		$scope.showCoor = false
	}

	$scope.saveCookies = function () {
		console.log("saving data")
		localStorage.setItem("dataAnimal", JSON.stringify($scope.data))
		console.log($scope.data);
	}
	$scope.getCookies = function () {
		console.log("Get data")
		$scope.data = JSON.parse(localStorage.getItem("dataAnimal"))
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

	$scope.latChange = function () {
		$scope.data.viDo = $scope.vido_do + " độ " + $scope.vido_phut + " phút " + $scope.vido_giay + " giây";
	}
	$scope.lonChange = function () {
		$scope.data.kinhDo = $scope.kinhdo_do + " độ " + $scope.kinhdo_phut + " phút " + $scope.kinhdo_giay + " giây";
	}

	$scope.dms = function () {
		$scope.data.viDo = "";
		$scope.data.kinhDo = "";
		$scope.showCoor = true;
	}
	$scope.dd = function () {
		$scope.data.viDo = ""
		$scope.data.kinhDo = ""
		$scope.showCoor = false
	}

	$scope.saveCookies = function () {
		console.log("saving data")
		localStorage.setItem("dataAnimal", JSON.stringify($scope.data))
		console.log($scope.data);
	}
	$scope.getCookies = function () {
		console.log("Get data")
		$scope.data = JSON.parse(localStorage.getItem("dataAnimal"))
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

	$scope.latChange = function () {
		$scope.data.viDo = $scope.vido_do + " độ " + $scope.vido_phut + " phút " + $scope.vido_giay + " giây";
	}
	$scope.lonChange = function () {
		$scope.data.kinhDo = $scope.kinhdo_do + " độ " + $scope.kinhdo_phut + " phút " + $scope.kinhdo_giay + " giây";
	}

	$scope.dms = function () {
		$scope.data.viDo = "";
		$scope.data.kinhDo = "";
		$scope.showCoor = true;
	}
	$scope.dd = function () {
		$scope.data.viDo = ""
		$scope.data.kinhDo = ""
		$scope.showCoor = false
	}

	$scope.saveCookies = function () {
		console.log("saving data")
		localStorage.setItem("dataAnimal", JSON.stringify($scope.data))
		console.log($scope.data);
	}
	$scope.getCookies = function () {
		console.log("Get data")
		$scope.data = JSON.parse(localStorage.getItem("dataAnimal"))
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

	$scope.latChange = function () {
		$scope.data.viDo = $scope.vido_do + " độ " + $scope.vido_phut + " phút " + $scope.vido_giay + " giây";
	}
	$scope.lonChange = function () {
		$scope.data.kinhDo = $scope.kinhdo_do + " độ " + $scope.kinhdo_phut + " phút " + $scope.kinhdo_giay + " giây";
	}

	$scope.dms = function () {
		$scope.data.viDo = "";
		$scope.data.kinhDo = "";
		$scope.showCoor = true;
	}
	$scope.dd = function () {
		$scope.data.viDo = ""
		$scope.data.kinhDo = ""
		$scope.showCoor = false
	}

	$scope.saveCookies = function () {
		console.log("saving data")
		localStorage.setItem("dataAnimal", JSON.stringify($scope.data))
		console.log($scope.data);
	}
	$scope.getCookies = function () {
		console.log("Get data")
		$scope.data = JSON.parse(localStorage.getItem("dataAnimal"))
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

	$scope.latChange = function () {
		$scope.data.viDo = $scope.vido_do + " độ " + $scope.vido_phut + " phút " + $scope.vido_giay + " giây";
	}
	$scope.lonChange = function () {
		$scope.data.kinhDo = $scope.kinhdo_do + " độ " + $scope.kinhdo_phut + " phút " + $scope.kinhdo_giay + " giây";
	}

	$scope.dms = function () {
		$scope.data.viDo = "";
		$scope.data.kinhDo = "";
		$scope.showCoor = true;
	}
	$scope.dd = function () {
		$scope.data.viDo = ""
		$scope.data.kinhDo = ""
		$scope.showCoor = false
	}

	$scope.saveCookies = function () {
		console.log("saving data")
		localStorage.setItem("dataAnimal", JSON.stringify($scope.data))
		console.log($scope.data);
	}
	$scope.getCookies = function () {
		console.log("Get data")
		$scope.data = JSON.parse(localStorage.getItem("dataAnimal"))
	}
}]);

app.controller('PlaceController', ['$scope','$http','$filter', function ($scope, $http, $filter) {
	$http.get('/app/database/cities.json').then(function(res){
		$scope.cities = res.data;
	}, function(res){
		console.log(res);
	});
	$scope.cityChange = function(){
		$http.get('/app/database/districts.json').then(function(res){
			$scope.districts = res.data;
		}, function(res){
			console.log(res);
		});
	}
	$scope.star = true;
	$scope.showstar = function () {
		$scope.star = true;
	}

	$scope.hidestar = function () {
		$scope.star = false;
	}

	$scope.districtChange = function() {
		$http.get('/app/database/wards.json').then(function(res){
			$scope.wards = res.data;
		}, function(res){
			console.log(res);
		});
	};
}]);
