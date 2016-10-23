// var nodes = [];
// var arr = [];
// var tree = '';

function generate (schema) {
	if (typeof(schema) != 'object'){
		tree = nodes.join('.');
		var pos = tree.lastIndexOf('.');
		(pos >= 0) ? (tree = tree.substring(0, pos)) : (tree = "");
		arr.push({
			name: nodes[nodes.length - 1], 
			schemaProp: tree,
			label: '',
			required: false,
			type: "String",
			regex: "^.{0,100}$",
			autoCompletion: false
		});
	}
	else {
		for (var i in schema){
			nodes.push(i);
			generate(schema[i]);
			nodes.splice(nodes.length - 1, 1);
		}
	}
}

// JSON.stringify(arr, null, 4);

function autoFill () {
	var inputs = document.getElementsByTagName('input');
	for(var i = 0; i < inputs.length; i++) {
		try {
			switch (inputs[i].getAttribute('type')){
				case 'text':
					console.log('text ' + i);
					inputs[i].value = $($(inputs[i]).parent().parent().children()[0]).children()[0].innerHTML;
					console.log('done text ' + i);
					break;
				case 'number':
					console.log('number ' + i);
					inputs[i].value = Math.floor(Math.random() * 100);
					console.log('done number ' + i);
					break;
				case 'date':
					console.log('date ' + i);
					var x = new Date();
					inputs[i].value = x.getFullYear() + '-' + (x.getMonth() >= 9 ? (x.getMonth() + 1) : ( '0' + (x.getMonth() + 1))) + '-' + x.getDate();
					console.log('done date ' + i);
					break;
				default:
					break;
			}
			
		}
		catch (e) {
			console.log(e);
		}
	}
}