app.controller('AnimalFormCtrl', ['$scope','$http','AuthService', function ($scope, $http, AuthService) {

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
		$scope.auto = res.data;
		arrAuto.forEach(function (val) {
			autoCom(val);
		})
	}, function (err) {
		console.log(err);
	});
	
	$scope.addPost = function(){
		// console.log($scope.FormData.$valid);
		// if ($scope.FormData.$valid) {
			var fd = new FormData(document.getElementById('form-content'));
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
					catch (e){
						// do not care
					}
					
				}
			});
		// } else{
		// 	angular.element("[name='" + FormData.$name + "']").find('.ng-invalid:visible:first').focus();
		// }
	}
}]);

app.controller('VegetableFormCtrl', ['$scope','$http','AuthService', function ($scope, $http, AuthService) {

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
	$http.get(AuthService.hostName + '/content/thuc-vat/auto').then(function(res) {
		$scope.auto = res.data;
		arrAuto.forEach(function (val) {
			autoCom(val);
		})
	}, function (err) {
		console.log(err);
	}); 

	$scope.tooltips =

	$scope.addPost = function(){
		var fd = new FormData(document.getElementById('form-content'));
		$.ajax({
			url: '/content/thuc-vat',
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
				catch (e){
					// do not care
				}
			}
		});
	}
}]);

app.controller('GeologicalFormCtrl', ['$scope','$http','AuthService', function ($scope, $http, AuthService) {
	
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
		$scope.auto = res.data;
		arrAuto.forEach(function (val) {
			autoCom(val);
		})
	}, function (err) {
		console.log(err);
	});

	$scope.addPost = function(){
		var fd = new FormData(document.getElementById('form-content'));
		$.ajax({
			url: '/content/dia-chat',
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
				catch (e){
					
				}
			}
		});
	}
}]);

app.controller('LandFormCtrl', ['$scope','$http','AuthService', function ($scope, $http, AuthService) {

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
		$scope.auto = res.data;
		arrAuto.forEach(function (val) {
			autoCom(val);
		})
	}, function (err) {
		console.log(err);
	});

	$scope.addPost = function(){
		var fd = new FormData(document.getElementById('form-content'));
		$.ajax({
			url: '/content/tho-nhuong',
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
				catch (e){
					// do not care
					console.log(e);
				}
				
			}
		});
	}
}]);

app.controller('PaleontologicalFormCtrl', ['$scope','$http','AuthService', function ($scope, $http, AuthService) {

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
		$scope.auto = res.data;
		arrAuto.forEach(function (val) {
			autoCom(val);
		})
	}, function (err) {
		console.log(err);
	});

	$scope.addPost = function(){
		var fd = new FormData(document.getElementById('form-content'));
		$.ajax({
			url: '/content/co-sinh',
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
				catch (e){
					// do not care
				}
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