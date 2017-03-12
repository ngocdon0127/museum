'use strict';
$(document).ready(function () {
	// console.log("Hello world");
	;setTimeout(function() {
		(function( document, window, index){
			// console.log("inside");
			var inputs = document.querySelectorAll('.inputfile');
			// console.log(inputs)
			Array.prototype.forEach.call( inputs, function(input)
			{
				// console.log("inside two");
				var label = input.nextElementSibling;
				var	labelVal = label.innerHTML;

				input.addEventListener( 'change', function( e )
				{
					var fileName = '';
					if(this.files && this.files.length > 1){
						console.log(fileName)
						console.log(label);
						fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
					}
					else
						fileName = e.target.value.split( '\\' ).pop();

					if( fileName )
						label.querySelector( 'span' ).innerHTML = fileName;
					else
						label.innerHTML = labelVal;
				});

				// Firefox bug fix
				input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
				input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });
			});
		}(document, window,0));
	}, 1000)
});