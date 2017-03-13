app.controller('AnimalManageController', ['$scope', '$http', 'AuthService', '$route', function ($scope, $http, AuthService, $route) {
	var url = AuthService.hostName + '/content/dong-vat';
	$http.get(url).then(function (res) {
		$scope.data = res.data.animals;
		$scope.status = res.data.status;
		$scope.link = 'dong-vat';
	}, function (err) {
		console.log(err);
		$scope.status = res.data.status;
	});

	$scope.selectedAll = false;
	$scope.selectAll = function () {
		$scope.selectedAll = !$scope.selectedAll;
		var arr = document.getElementsByClassName("check-box");
		for (var i = arr.length - 1; i >= 0; i--) {
			arr[i].checked = $scope.selectedAll;
		}
	}

	$scope.export = function (id) {
		AuthService.exportFile(id);
	};

	$scope.deletePost = function(id){
		var urlDelete = AuthService.hostName + "/content/dong-vat";
		var r = confirm("Xoá bài đăng");
		if (r == true) {
			AuthService.deleteP(id, urlDelete);
		}
	}
	$scope.approvePost = function (id, approved) {
		AuthService.approvePost(id, approved, $scope.link)
	}

}]);

app.controller('VegetableManageController', ['$scope', '$http', 'AuthService', '$route', function ($scope, $http, AuthService, $route) {
	var url = AuthService.hostName + '/content/thuc-vat';
	$http.get(url).then(function (res) {
		$scope.data = res.data.vegetables;
		$scope.status = res.data.status;
		$scope.link = 'thuc-vat';
	}, function (err) {
		console.log(err);
		$scope.status = res.data.status;
	});

	$scope.selectedAll = false;
	$scope.selectAll = function () {
		$scope.selectedAll = !$scope.selectedAll;
		var arr = document.getElementsByClassName("check-box");
		for (var i = arr.length - 1; i >= 0; i--) {
			arr[i].checked = $scope.selectedAll;
		}
	}

	$scope.export = function (id) {
		AuthService.exportFile(id);
	};

	$scope.deletePost = function(id){
		var urlDelete = AuthService.hostName + "/content/thuc-vat";
		var r = confirm("Xóa bài đăng?");
		if (r == true) {
			AuthService.deleteP(id, urlDelete);
		}
	}
	$scope.approvePost = function (id, approved) {
		AuthService.approvePost(id, approved, $scope.link)
	}
}]);

app.controller('LandManageController', ['$scope', '$http', 'AuthService', '$route', function ($scope, $http, AuthService, $route) {
	var url = AuthService.hostName + '/content/tho-nhuong';
	$http.get(url).then(function (res) {
		$scope.data = res.data.soils;
		$scope.status = res.data.status;
		$scope.link = 'tho-nhuong';
	}, function (err) {
		console.log(err);
		$scope.status = res.data.status;
	});

	$scope.selectedAll = false;
	$scope.selectAll = function () {
		$scope.selectedAll = !$scope.selectedAll;
		var arr = document.getElementsByClassName("check-box");
		for (var i = arr.length - 1; i >= 0; i--) {
			arr[i].checked = $scope.selectedAll;
		}
	}

	$scope.export = function (id) {
		AuthService.exportFile(id);
	};

	$scope.deletePost = function(id){
		var urlDelete = AuthService.hostName + "/content/tho-nhuong";
		var r = confirm("Xóa bài đăng?");
		if (r == true) {
			AuthService.deleteP(id, urlDelete);
		}
	}
	$scope.approvePost = function (id, approved) {
		AuthService.approvePost(id, approved, $scope.link)
	}
}]);
app.controller('GeologicalManageController', ['$scope', '$http', 'AuthService', '$route', function ($scope, $http, AuthService, $route) {
	var url = AuthService.hostName + '/content/dia-chat';
	$http.get(url).then(function (res) {
		$scope.data = res.data.geologicals;
		$scope.status = res.data.status;
		$scope.link = 'dia-chat';
	}, function (err) {
		console.log(err);
		$scope.status = res.data.status;
	});

	$scope.selectedAll = false;
	$scope.selectAll = function () {
		$scope.selectedAll = !$scope.selectedAll;
		var arr = document.getElementsByClassName("check-box");
		for (var i = arr.length - 1; i >= 0; i--) {
			arr[i].checked = $scope.selectedAll;
		}
	}

	$scope.export = function (id) {
		AuthService.exportFile(id);
	};

	$scope.deletePost = function(id){
		var urlDelete = AuthService.hostName + "/content/dia-chat";
		var r = confirm("Xóa bài đăng?");
		if (r == true) {
			AuthService.deleteP(id, urlDelete);
		}
	}
	$scope.approvePost = function (id, approved) {
		AuthService.approvePost(id, approved, $scope.link)
	}
}]);

app.controller('PaleontologicalManageController', ['$scope', '$http', 'AuthService', '$route', function ($scope, $http, AuthService, $route) {
	var url = AuthService.hostName + '/content/co-sinh';
	$http.get(url).then(function (res) {
		$scope.data = res.data.paleontologicals;
		$scope.status = res.data.status;
		$scope.link ='co-sinh';
	}, function (err) {
		console.log(err);
		$scope.status = res.data.status;
	});

	$scope.selectedAll = false;
	$scope.selectAll = function () {
		$scope.selectedAll = !$scope.selectedAll;
		var arr = document.getElementsByClassName("check-box");
		for (var i = arr.length - 1; i >= 0; i--) {
			arr[i].checked = $scope.selectedAll;
		}
	}

	$scope.export = function (id) {
		AuthService.exportFile(id);
	};

	$scope.deletePost = function(id){
		var urlDelete = AuthService.hostName + "/content/co-sinh";
		var r = confirm("Xóa bài đăng?");
		if (r == true) {
			AuthService.deleteP(id, urlDelete);
		}
	}
	$scope.approvePost = function (id, approved) {
		AuthService.approvePost(id, approved, $scope.link)
	}
}]);