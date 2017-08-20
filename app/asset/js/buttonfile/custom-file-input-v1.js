'use strict';
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
		// label.querySelector( 'span' ).innerHTML = "No file chosen";
		//catch event file change
		input.addEventListener('change', function(e)
		{
			// var reader = new FileReader();
			// reader.onload = function(){
	  //       	var text = reader.result;
	  //       	console.log(reader.result.substring(0, 200));
	  //     	};
			
			// reader.readAsText(e.target.files[0])
			var max_sizes = this.getAttribute('max-file-size');
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