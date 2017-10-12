app.controller('SearchController', function($scope, $http, AuthService){
	var url = AuthService.hostName + '/content/dong-vat' ;
	$scope.link = "dong-vat";
	$http.get(url).then(function (res) {
        $scope.data = res.data.animals;
        // $scope.totalItems = $scope.data.length;
    }, function (err) {
        console.log(err);
    });

	$scope.search = function (content) {
		console.log(content);
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
})