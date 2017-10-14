app.controller('SearchController', function($scope, $http, AuthService, $uibModal){
	var url = AuthService.hostName + '/content/search' ;
	$scope.searchResult = "0 kết quả"
	$scope.data = [];

	$scope.search = function (content) {
		$scope.searchResult = "Loading...";
		url = url + "?q=" + content;
		$http.get(url).then(function (res) {
        	$scope.data = res.data.matchedSamples;
        	// console.log($scope.data);
        	$scope.searchResult = $scope.data.length + " kết quả";
	    }, function (err) {
	        console.log(err);
	    });
	    // $scope.$apply()
	}

	$scope.viewby = "10"; 
    $scope.currentPage = 1;
    
    $scope.sort = function(keyname){
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.sortReverse = !$scope.sortReverse; //if true make it false and vice versa
    }

    $scope.selectedAll = false;
    $scope.selectAll = function () {
        $scope.selectedAll = !$scope.selectedAll;
        var arr = document.getElementsByClassName("check-box");
        for (var i = arr.length - 1; i >= 0; i--) {
            arr[i].checked = $scope.selectedAll;
        }
    }

    $scope.export = function (id) {
        $scope.opts = {
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl: 'views/modals/search-export.blade.html',
            controller: ModalInstanceCtrl,
            controllerAs: "$ctrl",
            resolve: {
                fields: function () {
                    return $scope.fields
                }
            }
        };

        var modalInstance = $uibModal.open($scope.opts);
        modalInstance.result.then(function () {
            var x = document.getElementsByName("fields");
            let _tmp = "";
            // Get fields to export
            if (x.length != 0) {
                _tmp = x[0].value;
            }
            if (_tmp == "") {
                AuthService.exportFile(id, _tmp);
            } else {
                let data = _tmp.replace(new RegExp("_-_", "g"), "=1&")
                data = "custom=1&" + data + "=1"
                AuthService.exportFile(id, data);
            }
        }, function () {
            // on cancel button press
        })
    };
})