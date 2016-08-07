app.controller('AnimalFormCtrl', ['$scope', function ($scope) {
	$scope.addPost = function(){
		var fd = new FormData(document.getElementById('form-animal'));
		// /content/dong-vat
		console.log(fd);
		$.ajax({
			url: '/content/dong-vat',
			method: 'POST',
			contentType: false,
			processData: false,
			data: fd,
			success: function (data) {
				console.log(data);
			},
			error: function (err) {
				console.log(err);
			}
		});
	}
}])