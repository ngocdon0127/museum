app.controller('AnimalManageController', ['$scope', '$http', 'AuthService', '$route', function ($scope, $http, AuthService, $route) {
	var url = AuthService.hostName + '/content/dong-vat';
	$http.get(url).then(function (res) {
		$scope.data = res.data.animals;
		$scope.status = res.data.status;
	}, function (err) {
		console.log(err);
		$scope.status = res.data.status;
	});

	$scope.deletePost = function(id){
		var urlDelete = AuthService.hostName + "/content/dong-vat";
		var r = confirm("Xoá bài đăng");
		if (r == true) {
			AuthService.deleteP(id, urlDelete);
		}
	}
}]);

app.controller('VegetableManageController', ['$scope', '$http', 'AuthService', '$route', function ($scope, $http, AuthService, $route) {
	var url = AuthService.hostName + '/content/thuc-vat';
	$http.get(url).then(function (res) {
		$scope.data = res.data.vegetable;
		$scope.status = res.data.status;
	}, function (err) {
		console.log(err);
		$scope.status = res.data.status;
	});

	$scope.deletePost = function(id){
		var urlDelete = AuthService.hostName + "/content/thuc-vat";
		var r = confirm("Xóa bài đăng?");
		if (r == true) {
			AuthService.deleteP(id, urlDelete);
		}
	}
}]);

app.controller('LandManageController', ['$scope', '$http', 'AuthService', '$route', function ($scope, $http, AuthService, $route) {
	var url = AuthService.hostName + '/content/tho-nhuong';
	$http.get(url).then(function (res) {
		$scope.data = res.data.animals;
		$scope.status = res.data.status;
	}, function (err) {
		console.log(err);
		$scope.status = res.data.status;
	});

	$scope.deletePost = function(id){
		var urlDelete = AuthService.hostName + "/content/tho-nhuong";
		var r = confirm("Xóa bài đăng?");
		if (r == true) {
			AuthService.deleteP(id, urlDelete);
		}
	}
}]);
app.controller('GeologicalManageController', ['$scope', '$http', 'AuthService', '$route', function ($scope, $http, AuthService, $route) {
	var url = AuthService.hostName + '/content/dia-chat';
	$http.get(url).then(function (res) {
		$scope.data = res.data.animals;
		$scope.status = res.data.status;
	}, function (err) {
		console.log(err);
		$scope.status = res.data.status;
	});

	$scope.deletePost = function(id){
		var urlDelete = AuthService.hostName + "/content/dia-chat";
		var r = confirm("Xóa bài đăng?");
		if (r == true) {
			AuthService.deleteP(id, urlDelete);
		}
	}
}]);

app.controller('PaleontologicalManageController', ['$scope', '$http', 'AuthService', '$route', function ($scope, $http, AuthService, $route) {
	var url = AuthService.hostName + '/content/co-sinh';
	$http.get(url).then(function (res) {
		$scope.data = res.data.animals;
		$scope.status = res.data.status;
	}, function (err) {
		console.log(err);
		$scope.status = res.data.status;
	});

	$scope.deletePost = function(id){
		var urlDelete = AuthService.hostName + "/content/co-sinh";
		var r = confirm("Xóa bài đăng?");
		if (r == true) {
			AuthService.deleteP(id, urlDelete);
		}
	}
}]);