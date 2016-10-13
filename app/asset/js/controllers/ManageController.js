app.controller('AnimalManageController', ['$scope', '$http', 'AuthService', function ($scope, $http, AuthService) {
	var url = AuthService.hostName + '/content/dong-vat';
	$http.get(url).then(function (res) {
		console.log(res);
	}, function (err) {
		console.log(err);
	})
}])