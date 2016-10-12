app.controller('AnimalFormCtrl', ['$scope','$http','AuthService', function ($scope, $http, AuthService) {

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
		console.log($scope.data);
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
				console.log(data);
			},
			error: function (err) {
				console.log(err);
				alert(JSON.parse(err.responseText).error)
			}
		});
	}
}]);

app.controller('PlaceController', ['$scope','$http', function ($scope, $http) {
	$http.get('/app/database/cities.json').then(function(res){
		$scope.cities = res.data;
	}, function(res){
		console.log(res);
	});
	$http.get('/app/database/districts.json').then(function(res){
		$scope.districts = res.data;
	}, function(res){
		console.log(res);
	});

	$http.get('/app/database/wards.json').then(function(res){
		$scope.wards = res.data;
	}, function(res){
		console.log(res);
	});
}])