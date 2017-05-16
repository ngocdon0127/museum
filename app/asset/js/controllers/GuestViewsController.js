app.controller('GuestGeologicalController', function($scope, $http, $filter, AuthService){
	// $scope.test = "test";

	$scope.filter_property = 'maDeTai';
	$scope.value = "";

	$scope.pageSize = 10;
	

	$scope.posts = [];

	$scope.updatePosts = function(page){
		console.log($scope.currentPage);
		$scope.posts = $filter('propertyFilter')($scope.data, $scope.filter_property, $scope.value);
		$scope.visible_posts = $filter('limitTo')($scope.posts, $scope.pageSize, $scope.pageSize*(page - 1));
	}


	function get_list_property_for_filter(object_list, property_name){
		var result = [''];
		object_list.forEach(function(element){
			if(element.hasOwnProperty(property_name)){
				var value = element[property_name];
				if(result.indexOf(value) == -1)
					result.push(value);
			}
		});
		return result;
	};

	$http.get(AuthService.hostName + '/content/dia-chat/')
	.then(function(res){
		$scope.data = res.data.geologicals;
		$scope.updatePosts();
		$scope.filter_list = get_list_property_for_filter($scope.data, $scope.filter_property);
		console.log($scope.filter_list);
		console.log($scope.data)
	}, function(err){
		$scope.message = err;
	})
});