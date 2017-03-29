function initDefaultUnits(_scope) {
	setTimeout((function (_scope) {
		return function () {
			var donVis = [
				{
					field: 'chieuCao',
					unitField: 'donVi_chieuCao',
					defaultValue: 'm'
				},
				{
					field: 'chieuRong',
					unitField: 'donVi_chieuRong',
					defaultValue: 'm'
				},
				{
					field: 'chieuDai',
					unitField: 'donVi_chieuDai',
					defaultValue: 'm'
				},
				{
					field: 'trongLuong',
					unitField: 'donVi_trongLuong',
					defaultValue: 'kg'
				},
				{
					field: 'theTich',
					unitField: 'donVi_theTich',
					defaultValue: 'l'
				}
			]
			donVis.map(function (donVi) {
				// document.getElementsByName(donVi.unitField)[0].value = donVi.defaultValue;
				_scope.data[donVi.unitField] = donVi.defaultValue;
			})
		}
	})(_scope), 200);
}

function saveData(id, data) {
		return function () {
			localStorage.setItem(id, JSON.stringify(data))
			console.log(data);
		}
	}

app.controller('AnimalFormCtrl', ['$scope','$http','AuthService', function ($scope, $http, AuthService) {

	// setInterval(saveData("dataAni", $scope.data), 2000);
	// setTimeout(getData("dataAni"), 1000);

	$http.get('/app/database/tipsani.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});

	// default unit
	initDefaultUnits($scope);

	// render flexdatalist
	AuthService.renderFlexdatalist()

	// DatePicker
	AuthService.initDatePicker(null, null);
	
	//auto complete

	var arrAuto = AuthService.arrAuto;
	
	$http.get(AuthService.hostName + '/content/dong-vat/auto').then(function(res) {
		$scope.auto = res.data;
		// console.log(res.data);
		arrAuto.forEach(function (val) {
			AuthService.autoCom(val, $scope);
		})
	}, function (err) {
		console.log(err);
	});
	var urlRe = AuthService.hostName + '/app/#!/bai-dang/dong-vat';

	$scope.addPost = function(FormContent){
			
		// if ($scope.FormContent.$valid) {
			AuthService.startSpinner();
			var fd = new FormData(document.getElementById('form-content'));
			AuthService.addSample(fd, AuthService.hostName + '/content/dong-vat', urlRe);
		// } else{
		// 	angular.element("[name='" + FormContent.$name + "']").find('.ng-invalid:visible:first').focus();
		// }
	}
	$scope.latChange = function () {
		$scope.data.viDo = $scope.vido_do + " ° " + $scope.vido_phut + " ' " + $scope.vido_giay + '"';
	}
	$scope.lonChange = function () {
		$scope.data.kinhDo = $scope.kinhdo_do + " ° " + $scope.kinhdo_phut + " ' " + $scope.kinhdo_giay + '"';
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
		localStorage.setItem("dataAnimal", JSON.stringify($scope.data))
		console.log($scope.data);
	}
	$scope.getCookies = function () {
		$scope.data = JSON.parse(localStorage.getItem("dataAnimal"))
	}
}]);

app.controller('VegetableFormCtrl', ['$scope','$http','AuthService', function ($scope, $http, AuthService) {

	$http.get('/app/database/tipsveg.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});

	// default unit
	initDefaultUnits($scope);

	// render flexdatalist
	AuthService.renderFlexdatalist()

	// DatePicker
	AuthService.initDatePicker(null, null);

	var arrAuto = AuthService.arrAuto;
	$http.get(AuthService.hostName + '/content/thuc-vat/auto').then(function(res) {
		$scope.auto = res.data;
		arrAuto.forEach(function (val) {
			AuthService.autoCom(val, $scope);
		})
	}, function (err) {
		console.log(err);
	}); 

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/thuc-vat';

	$scope.addPost = function(FormContent){
		// if ($scope.FormContent.$valid) {
			AuthService.startSpinner();

			var fd = new FormData(document.getElementById('form-content'));
			AuthService.addSample(fd, AuthService.hostName + '/content/thuc-vat', urlRe);
		
		// } else{
		// 	angular.element("[name='" + FormContent.$name + "']").find('.ng-invalid:visible:first').focus();
		// }
	}

	$scope.latChange = function () {
		$scope.data.viDo = $scope.vido_do + " ° " + $scope.vido_phut + " ' " + $scope.vido_giay + '"';
		console.log($scope.data.viDo)
	}
	$scope.lonChange = function () {
		$scope.data.kinhDo = $scope.kinhdo_do + " ° " + $scope.kinhdo_phut + " ' " + $scope.kinhdo_giay + '"';
		console.log($scope.data.kinhDo)
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
		localStorage.setItem("dataVeg", JSON.stringify($scope.data))
		console.log($scope.data);
	}
	$scope.getCookies = function () {
		console.log("Get data")
		$scope.data = JSON.parse(localStorage.getItem("dataVeg"))
	}
}]);

app.controller('GeologicalFormCtrl', ['$scope','$http','AuthService', function ($scope, $http, AuthService) {
	
	$http.get('/app/database/tipsgeo.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});

	// default unit
	initDefaultUnits($scope);

	// render flexdatalist
	AuthService.renderFlexdatalist()

	// DatePicker
	AuthService.initDatePicker(null, null);

	var arrAuto = AuthService.arrAuto;
	$http.get(AuthService.hostName + '/content/dia-chat/auto').then(function(res) {
		$scope.auto = res.data;
		arrAuto.forEach(function (val) {
			AuthService.autoCom(val, $scope);
		})
	}, function (err) {
		console.log(err);
	});

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/dia-chat';
	$scope.addPost = function(FormContent){
		// if ($scope.FormContent.$valid) {
			AuthService.startSpinner();
			var fd = new FormData(document.getElementById('form-content'));
			AuthService.addSample(fd, AuthService.hostName + '/content/dia-chat', urlRe);
		// } else{
		// 	angular.element("[name='" + FormContent.$name + "']").find('.ng-invalid:visible:first').focus();
		// }
	}

	$scope.latChange = function () {
		$scope.data.viDo = $scope.vido_do + " ° " + $scope.vido_phut + " ' " + $scope.vido_giay + '"';
	}
	$scope.lonChange = function () {
		$scope.data.kinhDo = $scope.kinhdo_do + " ° " + $scope.kinhdo_phut + " ' " + $scope.kinhdo_giay + '"';
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
		localStorage.setItem("dataGeo", JSON.stringify($scope.data))
		console.log($scope.data);
	}
	$scope.getCookies = function () {
		console.log("Get data")
		$scope.data = JSON.parse(localStorage.getItem("dataGeo"))
	}
}]);

app.controller('LandFormCtrl', ['$scope','$http','AuthService', function ($scope, $http, AuthService) {

	$http.get('/app/database/tipslan.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});

	// default unit
	initDefaultUnits($scope);

	// render flexdatalist
	AuthService.renderFlexdatalist()

	// DatePicker
	AuthService.initDatePicker(null, null);

	var arrAuto = AuthService.arrAuto;
	$http.get(AuthService.hostName + '/content/tho-nhuong/auto').then(function(res) {
		$scope.auto = res.data;
		arrAuto.forEach(function (val) {
			AuthService.autoCom(val, $scope);
		})
	}, function (err) {
		console.log(err);
	});

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/tho-nhuong';
	$scope.addPost = function(FormContent){
		// if ($scope.FormContent.$valid) {
			AuthService.startSpinner();
			var fd = new FormData(document.getElementById('form-content'));
			AuthService.addSample(fd, AuthService.hostName + '/content/tho-nhuong', urlRe);
		// } else{
		// 	angular.element("[name='" + FormContent.$name + "']").find('.ng-invalid:visible:first').focus();
		// }
	}

	$scope.latChange = function () {
		$scope.data.viDo = $scope.vido_do + " ° " + $scope.vido_phut + " ' " + $scope.vido_giay + '"';
	}
	$scope.lonChange = function () {
		$scope.data.kinhDo = $scope.kinhdo_do + " ° " + $scope.kinhdo_phut + " ' " + $scope.kinhdo_giay + '"';
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
		localStorage.setItem("dataLand", JSON.stringify($scope.data))
		console.log($scope.data);
	}
	$scope.getCookies = function () {
		console.log("Get data")
		$scope.data = JSON.parse(localStorage.getItem("dataLand"))
	}
}]);

app.controller('PaleontologicalFormCtrl', ['$scope','$http','AuthService','bsLoadingOverlayService', function ($scope, $http, AuthService, bsLoadingOverlayService) {

	$http.get('/app/database/tipspal.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});

	// default unit
	initDefaultUnits($scope);

	// render flexdatalist
	AuthService.renderFlexdatalist()

	// DatePicker
	AuthService.initDatePicker(null, null);

	var arrAuto = AuthService.arrAuto;
	$http.get(AuthService.hostName + '/content/co-sinh/auto').then(function(res) {
		$scope.auto = res.data;
		arrAuto.forEach(function (val) {
			AuthService.autoCom(val, $scope);
		})
	}, function (err) {
		console.log(err);
	});

	var urlRe = AuthService.hostName + '/app/#!/bai-dang/co-sinh';
	$scope.addPost = function(FormContent){
		// if ($scope.FormContent.$valid) {
			AuthService.startSpinner();
			var fd = new FormData(document.getElementById('form-content'));
			AuthService.addSample(fd, AuthService.hostName + '/content/co-sinh', urlRe);
		// } else{
		// 	angular.element("[name='" + FormContent.$name + "']").find('.ng-invalid:visible:first').focus();
		// }
	}

	$scope.latChange = function () {
		$scope.data.viDo = $scope.vido_do + " ° " + $scope.vido_phut + " ' " + $scope.vido_giay + '"';
	}
	$scope.lonChange = function () {
		$scope.data.kinhDo = $scope.kinhdo_do + " ° " + $scope.kinhdo_phut + " ' " + $scope.kinhdo_giay + '"';
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
		localStorage.setItem("dataPal", JSON.stringify($scope.data))
		console.log($scope.data);
	}
	$scope.getCookies = function () {
		console.log("Get data")
		$scope.data = JSON.parse(localStorage.getItem("dataPal"))
	}
}]);

app.controller('PlaceController', ['$scope','$http','$filter', 'AuthService', '$timeout', function ($scope, $http, $filter, AuthService, $timeout) {
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
	function bodauTiengViet(str) {
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        return str;
    }
	$scope.countryChange = function () {
	    var x = $scope.data.quocGia;
		if (bodauTiengViet(x) == "viet nam") {
			$scope.star = true;
		} else {
			$scope.star = false;
		}
	}

	$scope.cityChange = function(){
		if ('districts' in places){
			var x = document.getElementById($scope.data.tinh);
			if (x == null) {
				$scope.data.huyen = ""
				$scope.data.xa = ""
			} else {
				// Get id to render data for district
				$scope.id_tinh = x.value
				$scope.districts = places.districts;
				$timeout(function () {
					$('#render_districts').flexdatalist({
						minLength: 0
					});
				}, 200)
				// })
				// console.log($scope.districts);
			}
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
			var x = document.getElementById($scope.data.huyen);
			if (x == null) {
				$scope.data.xa = ""
			} else{
				$scope.id_huyen = x.value
				$scope.wards = places.wards;
				$timeout(function () {
					$('#render_wards').flexdatalist({
						minLength: 0
					});
				}, 200)
			}
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

app.controller('CookiesManageController', ['$scope', '$cookies', function($scope, $cookies){
	
	$scope.saveCookies = function () {
		console.log("saving data")
		localStorage.setItem('data', JSON.stringify($scope.data));
		console.log("saved")
	}

	$scope.getCookies = function () {
		console.log("Get data")
		$scope.data = JSON.parse(localStorage.getItem('data'));
		$cookies.remove('data')
	}
}])

app.controller('HttpIntegrationController', function($scope, $http, $sce, bsLoadingOverlayService) {
	$scope.result = $sce.trustAsHtml('Fetch result here');
	$scope.fetchRandomText = function() {
		$http.get('http://hipsterjesus.com/api/')
			.success(function(data) {
				$scope.result = $sce.trustAsHtml(data.text);
			})
			.error(function() {
				$scope.result = $sce.trustAsHtml('Can not get the article');
			});
	};
});
