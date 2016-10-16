app.controller('AnimalFormCtrl', ['$scope','$http','AuthService', function ($scope, $http, AuthService) {

//auto complete
	function autoCom(str) {
		$("#"+str).autocomplete({
			source : $scope.data[str]
		})
	};
	var arrAuto = [
	'tenDongNghia','gioi',
	'nganh', 'lop', 
	'phanLop', 
	'bo', 
	'phanBo', 
	'lienHo',
	'ho',
	'phanHo',
	'toc', 
	'giong', 
	'loai', 
	'duoiLoai', 
	'coQuanThuMau', 
	'quocGia', 'tinh', 
	'huyen', 'xa', 'thon', 
	'coQuanToChucPhanTich', 
	'coQuanXuLy'
	,'boPhanLayMauDNA', 
	'trangThaiGiuMauDNA',
	'coQuanNhapVatMau'];
	$http.get(AuthService.hostName + '/content/dong-vat/auto').then(function(res) {
		$scope.data = res.data;
		arrAuto.forEach(function (val) {
			autoCom(val);
		})
	}, function (err) {
		console.log(err);
	});

	$scope.addPost = function(FormAnimal){
		console.log($scope.FormAnimal.$valid);
		if ($scope.FormAnimal.$valid) {
			console.log("Submitted");
			var fd = new FormData(document.getElementById('form-animal'));
			$.ajax({
				url: '/content/dong-vat',
				method: 'POST',
				contentType: false,
				processData: false,
				data: fd,
				success: function (data) {
					alert(data.status);
				},
				error: function (err) {
					console.log(err);
					alert(JSON.parse(err.responseText).error);
					var element = document.getElementsByName(JSON.parse(err.responseText).field)[0];
					try {
						// element.value = '';
						// element.setAttribute('placeholder', 'Wrong format');
					}
					catch (e){
						// do not care
					}
					element.style.background = '#EE543A';
					setTimeout((function (e) {
						return function () {
							e.style.background = 'white';
						}
					})(element), 2000);
					$('html, body').animate({
						scrollTop: $(element).offset().top - 100
					}, 500);
				}
			});
		} else{
			angular.element("[name='" + FormAnimal.$name + "']").find('.ng-invalid:visible:first').focus();
		}
	}
}]);

app.controller('VegetableFormCtrl', ['$scope','$http','AuthService', function ($scope, $http, AuthService) {

	function autoCom(str) {
		$("#"+str).autocomplete({
			source : $scope.data[str]
		})
	};
	var arrAuto = [
	'tenDongNghia','gioi',
	'nganh', 'lop', 
	'phanLop', 
	'bo', 
	'phanBo', 
	'lienHo',
	'ho',
	'phanHo',
	'toc', 
	'giong', 
	'loai', 
	'duoiLoai', 
	'coQuanThuMau', 
	'quocGia', 'tinh', 
	'huyen', 'xa', 'thon', 
	'coQuanToChucPhanTich', 
	'coQuanXuLy'
	,'boPhanLayMauDNA', 
	'trangThaiGiuMauDNA',
	'coQuanNhapVatMau'];
	$http.get(AuthService.hostName + '/content/dong-vat/auto').then(function(res) {
		$scope.data = res.data;
		arrAuto.forEach(function (val) {
			autoCom(val);
		})
	}, function (err) {
		console.log(err);
	});

	$scope.addPost = function(){
		var fd = new FormData(document.getElementById('form-animal'));
		$.ajax({
			url: '/content/dong-vat',
			method: 'POST',
			contentType: false,
			processData: false,
			data: fd,
			success: function (data) {
				alert(data.status);
			},
			error: function (err) {
				console.log(err);
				alert(JSON.parse(err.responseText).error)
			}
		});
	}
}]);

app.controller('GeologicalFormCtrl', ['$scope','$http','AuthService', function ($scope, $http, AuthService) {

	function autoCom(str) {
		$("#"+str).autocomplete({
			source : $scope.data[str]
		})
	};
	var arrAuto = [
	'tenDongNghia','gioi',
	'nganh', 'lop', 
	'phanLop', 
	'bo', 
	'phanBo', 
	'lienHo',
	'ho',
	'phanHo',
	'toc', 
	'giong', 
	'loai', 
	'duoiLoai', 
	'coQuanThuMau', 
	'quocGia', 'tinh', 
	'huyen', 'xa', 'thon', 
	'coQuanToChucPhanTich', 
	'coQuanXuLy'
	,'boPhanLayMauDNA', 
	'trangThaiGiuMauDNA',
	'coQuanNhapVatMau'];
	$http.get(AuthService.hostName + '/content/dong-vat/auto').then(function(res) {
		$scope.data = res.data;
		arrAuto.forEach(function (val) {
			autoCom(val);
		})
	}, function (err) {
		console.log(err);
	});

	$scope.addPost = function(){
		var fd = new FormData(document.getElementById('form-animal'));
		$.ajax({
			url: '/content/dong-vat',
			method: 'POST',
			contentType: false,
			processData: false,
			data: fd,
			success: function (data) {
				alert(data.status);
			},
			error: function (err) {
				console.log(err);
				alert(JSON.parse(err.responseText).error)
			}
		});
	}
}]);

app.controller('LandFormCtrl', ['$scope','$http','AuthService', function ($scope, $http, AuthService) {

	function autoCom(str) {
		$("#"+str).autocomplete({
			source : $scope.data[str]
		})
	};
	var arrAuto = [
	'tenDongNghia','gioi',
	'nganh', 'lop', 
	'phanLop', 
	'bo', 
	'phanBo', 
	'lienHo',
	'ho',
	'phanHo',
	'toc', 
	'giong', 
	'loai', 
	'duoiLoai', 
	'coQuanThuMau', 
	'quocGia', 'tinh', 
	'huyen', 'xa', 'thon', 
	'coQuanToChucPhanTich', 
	'coQuanXuLy'
	,'boPhanLayMauDNA', 
	'trangThaiGiuMauDNA',
	'coQuanNhapVatMau'];
	$http.get(AuthService.hostName + '/content/dong-vat/auto').then(function(res) {
		$scope.data = res.data;
		arrAuto.forEach(function (val) {
			autoCom(val);
		})
	}, function (err) {
		console.log(err);
	});

	$scope.addPost = function(){
		var fd = new FormData(document.getElementById('form-animal'));
		$.ajax({
			url: '/content/dong-vat',
			method: 'POST',
			contentType: false,
			processData: false,
			data: fd,
			success: function (data) {
				alert(data.status);
			},
			error: function (err) {
				console.log(err);
				alert(JSON.parse(err.responseText).error)
			}
		});
	}
}]);

app.controller('PaleontologicalFormCtrl', ['$scope','$http','AuthService', function ($scope, $http, AuthService) {

	function autoCom(str) {
		$("#"+str).autocomplete({
			source : $scope.data[str]
		})
	};
	var arrAuto = [
	'tenDongNghia','gioi',
	'nganh', 'lop', 
	'phanLop', 
	'bo', 
	'phanBo', 
	'lienHo',
	'ho',
	'phanHo',
	'toc', 
	'giong', 
	'loai', 
	'duoiLoai', 
	'coQuanThuMau', 
	'quocGia', 'tinh', 
	'huyen', 'xa', 'thon', 
	'coQuanToChucPhanTich', 
	'coQuanXuLy'
	,'boPhanLayMauDNA', 
	'trangThaiGiuMauDNA',
	'coQuanNhapVatMau'];
	$http.get(AuthService.hostName + '/content/dong-vat/auto').then(function(res) {
		$scope.data = res.data;
		arrAuto.forEach(function (val) {
			autoCom(val);
		})
	}, function (err) {
		console.log(err);
	});

	$scope.addPost = function(){
		var fd = new FormData(document.getElementById('form-animal'));
		$.ajax({
			url: '/content/dong-vat',
			method: 'POST',
			contentType: false,
			processData: false,
			data: fd,
			success: function (data) {
				alert(data.status);
			},
			error: function (err) {
				console.log(err);
				alert(JSON.parse(err.responseText).error)
			}
		});
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

	$scope.districtChange = function() {
		$http.get('/app/database/wards.json').then(function(res){
			$scope.wards = res.data;
		}, function(res){
			console.log(res);
		});
	};
}]);