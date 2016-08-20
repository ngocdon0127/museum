app.controller('AnimalFormCtrl', ['$scope','$http', function ($scope, $http) {

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
		// console.log(res.data);
	}, function(res){
		console.log(res);
	});
	$http.get('/app/database/districts.json').then(function(res){
		$scope.districts = res.data;
		// console.log(res.data);
	}, function(res){
		console.log(res);
	});

	$http.get('/app/database/wards.json').then(function(res){
		$scope.wards = res.data;
		// console.log(res.data);
	}, function(res){
		console.log(res);
	});
}])