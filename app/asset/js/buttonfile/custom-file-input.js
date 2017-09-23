'use strict';

function ob(x) {
	return document.getElementById(x)
}

function loadFile() {
	// console.log("Load data");
}

// Tao the li tuong ung voi cac file truyen vao
function createLiTags(data, ulTag, files, urlDelete) {
// 	console.log("Link api delete");
// 	console.log(urlDelete);
	for (var i = 0; i < files.length; i++) {
		var li = document.createElement('li');
		li.setAttribute('class', 'list-group-item');
		li.setAttribute('style', 'overflow: auto;')
		var txtFile = "";
		if ( files[i].length > 20) {
			txtFile = files[i].slice(0, 20) + "...";
		} else{
			txtFile = files[i]
		}
		var txtNode = document.createTextNode(txtFile);

		// Tao cac the hien thi danh sach cac file
		var spanParent = document.createElement('span');
		spanParent.setAttribute('class', 'pull-right')

		var div = document.createElement('div')
		div.setAttribute('id', 'progressbar')
		spanParent.append(div)

		var spanChild = document.createElement('span');
		spanChild.setAttribute('data-file-name', files[i]);
		spanChild.setAttribute('data-field-name', data.field);
		spanChild.setAttribute('data-random-str', data.randomStr);
		spanChild.setAttribute('data-form-val', data.form);
		spanChild.setAttribute('data-form-id', data.id);
		spanChild.setAttribute('class', 'glyphicon glyphicon-remove')
		spanChild.setAttribute('style', 'cursor: pointer;')
		// Bat su kien xoa file trong bo nho tam
		spanChild.addEventListener('click', function(event){
			// console.log(event.target.getAttribute('data-file-name') + ' is about to be deleted');
			deleteTmpFile({
				fileName: event.target.getAttribute('data-file-name'),
				field: event.target.getAttribute('data-field-name'),
				randomStr: event.target.getAttribute('data-random-str'),
				form: event.target.getAttribute('data-form-val'),
				id: event.target.getAttribute('data-form-id')
			}, urlDelete)
		});
		spanParent.appendChild(spanChild);
		li.appendChild(txtNode);
		li.appendChild(spanParent);
		ulTag.appendChild(li)
	}
}

// Tao the ul
function createTags(res) {
	var ulTag = ob('ul_' + res.field);
	if (ulTag == null) {
		var parentFile = document.getElementsByName(res.field)[0].parentElement
		var ulTag = document.createElement("ul")
		ulTag.setAttribute("id", "ul_" + res.field)
		ulTag.setAttribute("class", "list-group")
		parentFile.appendChild(ulTag);
	} else{
		ulTag.innerHTML = ''
	}
	var data = {
		field : res.field,
		randomStr: res.randomStr,
		form: res.form,
		id: res.id
	}
	var urlDeleteTmp = "/content/instant-upload"
	createLiTags(data, ulTag, res.files, urlDeleteTmp)
	var urlDeleteSaved = "/content/" + res.form + "/file"
	createLiTags(data, ulTag, res.savedFiles, urlDeleteSaved)
}

function instantUpload(input, formData) {
	var randomId = document.getElementById("randomStr");
	var randomStr = randomId.value

	var data = new FormData()
	for (var i = 0; i < input.files.length; i++) {
		data.append('tmpfiles', input.files[i])
	}
	data.append('field', input.name)
	data.append('randomStr', randomStr)
	data.append('form', formData.form)
	data.append('id', formData.id)
	input.disabled = true;
	$.ajax({
		url: '/content/instant-upload',
		method: 'POST',
		contentType: false,
		processData: false,
		data: data,
		success: function (res) {
			console.log(res);
			input.disabled = false;
			if (res.status == 'success') {
				createTags(res)
			}
		},
		error: function (err) {
			input.disabled = false;
			console.log(err);
		}
	})
}

function deleteTmpFile(file, url) {
	$.ajax({
		url: url,
		method: 'DELETE',
		data: file,
		success: function (res) {
			console.log(res);
			if (res.status == 'success') {
				createTags(res)
			}
		},
		error: function (err) {
			console.log(err);
		}
	})
}

$(document).ready(function () {
	var inputs = document.querySelectorAll('.inputfile');
	// console.log(inputs);
	Array.prototype.forEach.call(inputs, function(input)
	{
		try {
			var label = input.nextElementSibling;
			var	labelVal = label.innerHTML;
		} catch (e){
			console.log(e);
		}
		
		//bat su kien file change
		input.addEventListener('change', function(e)
		{
			var max_sizes = this.getAttribute('max-file-size');
			var sample = document.getElementById("sample")
			var sampleVal = sample.value
			var obId =  document.getElementById("obId");
			var sampleId = "";
			if (obId !== null) {
				sampleId = obId.value;
			}

			var formData = {
				form: sampleVal,
				id: sampleId
			}
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
						fileName = (this.getAttribute('data-multiple-caption' ) || '' ).replace( '{count}', this.files.length);
					}
					else if(this.files && this.files.length == 1){
						fileName = e.target.value.split( '\\' ).pop();
					} else{
						fileName = "No file chosen...";
					}

					if(fileName)
						if (fileName.length > 20) {
							label.querySelector('span').innerHTML = fileName.slice(0, 20) + '...';
						} else{
							label.querySelector('span').innerHTML = fileName;
						}
					else
						label.innerHTML = labelVal;
					instantUpload(this, formData);
					this.value = null;
					return false
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

				if(fileName)
					if (fileName.length > 20) {
						label.querySelector('span').innerHTML = fileName.slice(0, 20) + '...';
					} else{
						label.querySelector('span').innerHTML = fileName;
					}
				else
					label.innerHTML = labelVal;
				//auto upload data and delete from input
				instantUpload(this, formData);
				this.value = null;
				return false
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