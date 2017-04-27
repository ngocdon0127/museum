app.controller('AnimalManageController', ['$scope', '$http', 'AuthService', function ($scope, $http, AuthService) {
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

	// $scope.deletePost = function(id){
	// 	var r = confirm("Xoá bài đăng");
	// 	if (r == true) {
	// 		AuthService.deleteP(id, url);
	// 	}
	// }
	$scope.approvePost = function (id, approved) {
		AuthService.approvePost(id, approved, 'dong-vat')
	}

}]);

app.controller('VegetableManageController', ['$scope', '$http', 'AuthService', function ($scope, $http, AuthService) {
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

	// $scope.export = function (id) {
	// 	AuthService.exportFile(id);
	// };

	$scope.approvePost = function (id, approved) {
		AuthService.approvePost(id, approved, 'thuc-vat')
	}
}]);

app.controller('LandManageController', ['$scope', '$http', 'AuthService', function ($scope, $http, AuthService) {
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

	// $scope.export = function (id) {
	// 	AuthService.exportFile(id);
	// };

	$scope.approvePost = function (id, approved) {
		AuthService.approvePost(id, approved, 'tho-nhuong')
	}
}]);
app.controller('GeologicalManageController', ['$scope', '$http', 'AuthService', function ($scope, $http, AuthService) {
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

	// $scope.export = function (id) {
	// 	AuthService.exportFile(id);
	// };

	$scope.approvePost = function (id, approved) {
		AuthService.approvePost(id, approved, 'dia-chat')
	}
}]);

app.controller('PaleontologicalManageController', ['$scope', '$http', 'AuthService', function ($scope, $http, AuthService) {
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

	// $scope.export = function (id) {
	// 	AuthService.exportFile(id);
	// };

	$scope.approvePost = function (id, approved) {
		AuthService.approvePost(id, approved, 'co-sinh')
	}
}]);

app.controller('ModalCtrl', function($scope,  $uibModal, AuthService) {
	$scope.showModal = function(id, link) {
		$scope.opts = {
			backdrop: true,
			backdropClick: true,
			dialogFade: false,
			keyboard: true,
			templateUrl : 'views/modals/delete.blade.html',
			controller : ModalInstanceCtrl
	    };
	    var url = AuthService.hostName + "/content/" + link;

	    var modalInstance = $uibModal.open($scope.opts);
	    modalInstance.result.then(function(){
	        //on ok button press
	       	AuthService.deleteP(id, url);
	    },function(){
	        //on cancel button press
	    });
    };

    $scope.export = function (id) {
		AuthService.exportFile(id);
	};
});

var ModalInstanceCtrl = function($scope, $uibModalInstance, $uibModal) {
	$scope.ok = function () {
		$uibModalInstance.close();
	};
	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
}