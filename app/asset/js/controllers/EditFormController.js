app.controller('EditAnimalFormCtrl', ['$http','$scope','AuthService','$routeParams', function($http,$scope,AuthService, $routeParams){
	var url = AuthService.hostName + '/content/dong-vat/' + $routeParams.id;
	$http.get(url).then(function (res) {
		console.log(res);
		$scope.animal = res.data.animal;
	});

	var url = AuthService.hostName + '/content/dong-vat'
	console.log($routeParams.id);
	
	$scope.updatePost = function(){
		$scope.animal.animalId = $routeParams.id;
		console.log(url);
		console.log("---------data-----------");
		console.log($scope.animal);
		$http.put(url, $scope.animal).then(function (res) {
			console.log("Edit success");
		}, function (err) {
			console.log("Edit fail");
		});
	}
}]);