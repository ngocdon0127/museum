app.controller('AnimalFormCtrl', ['$scope','$http', function ($scope, $http) {
	$http.get('/app/database/cities.json').then(function(res){
		$scope.cities = res.data;
		console.log(res.data);
	}, function(res){
		console.log(res);
	});
	$scope.cityChange = function(){
		angular.forEach($scope.places, function (value) {
			console.log
			if (value.name == $scope.animalForm.city) {
				$scope.districts = value.districts;
			};
		});
	}
	$scope.addPost = function(){
		var fd = new FormData(document.getElementById('form-animal'));
		$.ajax({
			url: '/content/dong-vat',
			method: 'POST',
			contentType: false,
			processData: false,
			data: fd,
			success: function (data) {
				console.log(data);
			},
			error: function (err) {
				console.log(err);
			}
		});
	}
}])