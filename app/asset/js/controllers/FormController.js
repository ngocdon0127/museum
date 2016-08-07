app.controller('AnimalFormCtrl', ['$scope', function ($scope) {
	$scope.addPost = function(){
		var fd = new FormData(document.getElementById('form-animals'));
		console.log(fd);
		// $.ajax({
		// 	url: AuthService.hostName + '/api/house',
		// 	method: 'POST',
		// 	contentType: false,
		// 	processData: false,
		// 	data: fd,
		// 	success: function (data) {
		// 		console.log("data");
		// 	},
		// 	error: function (err) {
		// 		console.log(err);
		// 	}
		// });
	}
}])