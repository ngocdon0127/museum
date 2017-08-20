'use strict';

function ob(x) {
	return document.getElementById(x)
}
function instantUpload(input, sample) {
	var randomId = document.getElementById("randomStr");
	var randomStr = randomId.value
	console.log(randomStr);
	var data = new FormData()
	console.log(input.name);
	console.log(input.files);
	for (var i = 0; i < input.files.length; i++) {
		data.append('tmpfiles', input.files[i])
	}
	data.append('field', input.name)
	data.append('randomStr', randomStr)
	data.append('form', sample)
	input.disabled = true;
	$.ajax({
		url: '/content/instant-upload',
		method: 'POST',
		contentType: false,
		processData: false,
		data: data,
		success: function (res) {
			console.log('success');
			console.log(res);
			input.disabled = false;
			if (res.status == 'success') {
				// Tao danh sach cac file da upload vao bo tam
				var parentFile = document.getElementById(res.field).parentElement
				var ulTag = document.createElement("ul")
				ulTag.setAttribute("id", "ul_" + res.field)
				parentFile.appendChild(ulTag);
				// var ul = ob('ul_' + res.field);
				ulTag.innerHTML = ''
				for (var i = 0; i < res.files.length; i++) {
					var li = document.createElement('li');
					li.setAttribute('data-file-name', res.files[i]);
					li.setAttribute('data-field-name', res.field);
					li.setAttribute('data-random-str', res.randomStr);
					li.innerHTML = res.files[i];
					li.addEventListener('click', function (event) {
						console.log(event.target.getAttribute('data-file-name') + ' is about to be deleted');
						deleteTmpFile({
							fileName: event.target.getAttribute('data-file-name'),
							field: event.target.getAttribute('data-field-name'),
							randomStr: event.target.getAttribute('data-random-str')
						})
					})
					ulTag.appendChild(li)
				}
			}
		},
		error: function (err) {
			input.disabled = false;
			console.log('error');
			console.log(err);
		}
	})
}
function deleteTmpFile(file) {
	$.ajax({
		url: '/content/instant-upload/delete',
		method: 'POST',
		data: file,
		success: function (res) {
			console.log('success');
			console.log(res);
			if (res.status == 'success') {
				var ul = ob('ul_' + res.field);
				ul.innerHTML = ''
				for (var i = 0; i < res.files.length; i++) {
					var li = document.createElement('li');
					li.setAttribute('data-file-name', res.files[i]);
					li.setAttribute('data-field-name', res.field);
					li.setAttribute('data-random-str', res.randomStr);
					li.innerHTML = res.files[i];
					li.addEventListener('click', function (event) {
						console.log(event.target.getAttribute('data-file-name') + ' is about to be deleted');
						deleteTmpFile({
							fileName: event.target.getAttribute('data-file-name'),
							field: event.target.getAttribute('data-field-name'),
							randomStr: event.target.getAttribute('data-random-str')
						})
					})
					ul.appendChild(li)
				}
			}
		},
		error: function (err) {
			console.log('error');
			console.log(err);
		}
	})
}
$(document).ready(function () {
	var inputs = document.querySelectorAll('.inputfile');
	// console.log(inputs);
	Array.prototype.forEach.call(inputs, function(input)
	{
		// console.log(input);
		try {
			var label = input.nextElementSibling;
			var	labelVal = label.innerHTML;
		} catch (e){
			// todo
			console.log(e);
		}
		var sample = document.getElementById("sample")
		var sampleVal = sample.value
		// console.log(sampleVal);
		// label.querySelector( 'span' ).innerHTML = "No file chosen";
		//catch event file change
		input.addEventListener('change', function(e)
		{
			var max_sizes = this.getAttribute('max-file-size');
			console.log(this.name);
			//Kiem tra xem dung luong file co vuot qua dung luong cho phep
			var fileName = '';
			if (max_sizes != null) {
				var totals_size = 0;
				var files = e.currentTarget.files;
				for (var i = 0; i < files.length; i++){
					totals_size += files[i].size;
				}
				if (totals_size/1024/1024 > max_sizes) {
					$(this).val('')
					alert("File vượt quá dung lượng cho phép")
					return false
				}
				else{
					if(this.files && this.files.length > 1){
						fileName = (this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
					}
					else if(this.files && this.files.length == 1){
						fileName = e.target.value.split( '\\' ).pop();
					} else{
						fileName = "No file chosen...";
					}

					if( fileName )
						label.querySelector('span').innerHTML = fileName;
					else
						label.innerHTML = labelVal;
					instantUpload(this, sampleVal);

				}
			} else {
				if(this.files && this.files.length > 1){
					fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
				}
				else if(this.files && this.files.length == 1){
					fileName = e.target.value.split( '\\' ).pop();
				} else{
					fileName = "No file chosen...";
				}

				if( fileName )
					label.querySelector('span').innerHTML = fileName;
				else
					label.innerHTML = labelVal;
				instantUpload(this, sampleVal);
			}
		});

		// Firefox bug fix
		input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
		input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });
	});
});

$(document).ready(function(){
	$("#back-to-top").click(function(){
		$("html, body").animate({ scrollTop: 0 }, 'slow', 'swing');
	});
});