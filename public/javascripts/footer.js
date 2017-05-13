try {
	$.ajax({
		url: '/users/me',
		success: function (data) {
			if (data.status == 'success'){
				$('#userLevel').text(data.user.level)
			}
		},
		error: function (err) {
			// console.log(err);
		}
	})
}
catch (e){

}