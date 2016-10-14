app.controller('AnimalManageController', ['$scope', '$http', 'AuthService', '$route', function ($scope, $http, AuthService, $route) {
	var url = AuthService.hostName + '/content/dong-vat';
	$http.get(url).then(function (res) {
		$scope.allPostAnimal = res.data.animals;
		console.log($scope.allPostAnimal);
	}, function (err) {
		console.log(err);
	});

	$scope.deletePost = function(id){
		var urlDelete = AuthService.hostName + "/content/dong-vat";
		console.log(id);
		// $http.delete(urlDelete, {animalId : id, a: 'hehe'}).then(function (res) {
		// 	console.log("Deleted");
		// 	$route.reload();
		// }, function (err) {
		// 	console.log("Fail");
		// 	console.log(err);
		// });
		$http({
			method: 'DELETE',
			url: urlDelete,
			headers: {'Content-Type': 'application/json'},
			data: {animalId: id}
		}).then(function (res) {
			console.log(res);
			$route.reload();
		}, function (err) {
			console.log(err);
		});
	}
}])