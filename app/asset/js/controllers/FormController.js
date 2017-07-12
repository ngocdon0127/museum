async function sheetToJson(workbook, urlFields) {
    // create a Form data to put data
    var result = {};
    var roa;
    var test;
    var data;
    await workbook.SheetNames.forEach(function(sheetName) {
        roa = XLS.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        test = workbook.Sheets[sheetName];
        // console.log(test);
    });

    await $.get(urlFields).then(function success(res) {
                data = res
            }, function error(err) {
                console.log(err);
            });

    await data.forEach(function(element) {
    	try{
    		var typeData = test
    		var _tmp = test[element[0]];
	    	var prop = test[element[1]]["h"];
	    	if (typeof(_tmp) !== "undefined") {
	    		if (_tmp["t"] == "n"){
	        		result[prop] = _tmp["v"];
	    		}
	        	else {
	        		result[prop] = _tmp["h"].trim();
	        	}
	        } else{
	        	result[prop] = "";
	        }
    	} catch (e){
    		// console.log(e);
    	}
    });
    return result;
}

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
		}
	}

app.controller('AnimalFormCtrl', function ($scope, $http, AuthService, $interval) {

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

    $scope.read = function (respone) {
    	var urlFields = "/app/database/fieldsani.json"
        var result = sheetToJson(respone, urlFields)
        result.then(function success(res_tmp) {
            $scope.data = res_tmp;
            // console.log(res_tmp);
            initDefaultUnits($scope);
            $scope.$apply();
        })
    }

    $scope.error = function (e) {
        console.log(e);
    }

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
	//name of route, config in app.config.js file
	var urlRe = 'quan-ly-dong-vat';

	$scope.addPost = function(FormContent){
		
		//Bắt lỗi valid dưới client
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

	saveData = $interval(function() {
		localStorage.setItem("dataAnimal", JSON.stringify($scope.data))
	}, 900000)

	$scope.saveCookies = function () {
		localStorage.setItem("dataAnimal", JSON.stringify($scope.data))
	}
	$scope.getCookies = function () {
		$scope.data = JSON.parse(localStorage.getItem("dataAnimal"))
	}
});

app.controller('VegetableFormCtrl', function ($scope, $http, AuthService, $interval) {

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

	//name of route, config in app.config.js file
	var urlRe = 'quan-ly-thuc-vat';

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

	saveData = $interval(function() {
		localStorage.setItem("dataVeg", JSON.stringify($scope.data))
	}, 900000)

	$scope.saveCookies = function () {
		localStorage.setItem("dataVeg", JSON.stringify($scope.data))
	}
	$scope.getCookies = function () {
		$scope.data = JSON.parse(localStorage.getItem("dataVeg"))
	}
});

app.controller('GeologicalFormCtrl', function ($scope, $http, AuthService, $interval) {
	
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

	//name of route, config in app.config.js file
	var urlRe = 'quan-ly-dia-chat';
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
	saveData = $interval(function() {
		localStorage.setItem("dataGeo", JSON.stringify($scope.data))
	}, 900000)

	$scope.saveCookies = function () {
		localStorage.setItem("dataGeo", JSON.stringify($scope.data))
	}
	$scope.getCookies = function () {
		$scope.data = JSON.parse(localStorage.getItem("dataGeo"))
	}
});

app.controller('LandFormCtrl', function ($scope, $http, AuthService, $interval) {

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

	//name of route, config in app.config.js file
	var urlRe = 'quan-ly-tho-nhuong';
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

	saveData = $interval(function() {
		localStorage.setItem("dataLand", JSON.stringify($scope.data))
	}, 900000)

	$scope.saveCookies = function () {
		localStorage.setItem("dataLand", JSON.stringify($scope.data))
	}
	$scope.getCookies = function () {
		$scope.data = JSON.parse(localStorage.getItem("dataLand"))
	}
});

app.controller('PaleontologicalFormCtrl', function ($scope, $http, AuthService, $interval) {

	$http.get('/app/database/tipspal.json').then(function(res){
		$scope.tooltips = res.data;
	}, function(err){
		console.log(err);
	});

	// $scope.hola = "Kevinhoa95"
    $scope.read = function (respone) {
    	var urlFields = "/app/database/fieldspal.json"
        var result = sheetToJson(respone, urlFields)
        result.then(function success(res_tmp) {
            $scope.data = res_tmp;
            console.log(res_tmp);
            initDefaultUnits($scope);
            $scope.$apply();
        })
    }

    $scope.error = function (e) {
        console.log(e);
    }

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

	//name of route, config in app.config.js file
	var urlRe = 'quan-ly-co-sinh';
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
	saveData = $interval(function() {
		localStorage.setItem("dataPal", JSON.stringify($scope.data))
	}, 900000)

	$scope.saveCookies = function () {
		localStorage.setItem("dataPal", JSON.stringify($scope.data))
	}
	$scope.getCookies = function () {
		$scope.data = JSON.parse(localStorage.getItem("dataPal"))
	}
});

app.controller('PlaceController', function ($scope, $http, $filter, AuthService, $timeout, $interval) {
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
				alert("Lỗi không xác định!")
			});
		}, function(res){
			alert("Lỗi không xác định!")
		});
	}, function(res){
		alert("Lỗi không xác định!")
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
	$scope.star_tinh = true;

	$scope.starDatLien = function () {
		$scope.star = true;
	}
	$scope.starDao = function () {
		$scope.star_tinh = true;
		$scope.star = false;
	}

	$scope.starBien = function () {
		$scope.star = false;
		$scope.star_tinh = false;
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
			$http.get('/app/database/wards.json').then(function(res){
				$scope.wards = res.data;
				places.wards = res.data
			}, function(res){
				console.log(res);
			});
		}
		
	};
});

app.controller('CookiesManageController', function($scope, $cookies){
	
	$scope.saveCookies = function () {
		localStorage.setItem('data', JSON.stringify($scope.data));
		alert("Dữ liệu đã được lưu");
	}

	$scope.getCookies = function () {
		$scope.data = JSON.parse(localStorage.getItem('data'));
	}
})

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

