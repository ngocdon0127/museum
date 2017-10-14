app.controller('SearchController', function($scope, $http, AuthService){
	var url = AuthService.hostName + '/content/search' ;
	$scope.link = "dong-vat";
	$scope.data = [];

	$scope.search = function (content) {
		url = url + "?q=" + content;
		$http.get(url).then(function (res) {
        	$scope.data = res.data.matchedSamples;
        	console.log($scope.data);
	    }, function (err) {
	        console.log(err);
	    });
	    $scope.$apply()
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