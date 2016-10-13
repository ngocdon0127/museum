app.controller('EditAnimalFormCtrl', ['$http','$scope','AuthService','$routeParams', function($http,$scope,AuthService, $routeParams){
	var url = AuthService.hostName + '/content/dong-vat/' + $routeParams.id;
	$http.get(url).then(function (res) {
		console.log(res);
		$scope.animal = res.data.animal;
	});
}]);