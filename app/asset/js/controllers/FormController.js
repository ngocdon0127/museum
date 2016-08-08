app.controller('AnimalFormCtrl', ['$scope','$http', function ($scope, $http) {
	$http.get('/app/database/place.json').then(function(res){
		$scope.places =res.data;
		console.log($scope.places);
	}, function(res){
		console.log(res);
	});
	$scope.cityChange = function(){
		// console.log("change");
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