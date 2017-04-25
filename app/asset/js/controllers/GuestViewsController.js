app.controller('GuestGeologicalController', function($scope, $http, AuthService){
	// $scope.test = "test";

	$scope.filter_property = 'maDeTai';
	$scope.value = "";

	function get_list_property_for_filter(object_list, property_name){
		var result = [];
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
		$scope.posts = res.data.geologicals;
		$scope.filter_list = get_list_property_for_filter($scope.posts, $scope.filter_property);
		console.log($scope.filter_list);
		console.log($scope.posts)
	}, function(err){
		$scope.message = err;
	})
});