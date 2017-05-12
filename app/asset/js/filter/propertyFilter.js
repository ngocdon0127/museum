app.filter('propertyFilter', function(){
	return function(input, property, value){
		if(value == '')
			return input;
		if (input && property && value){
			var result = [];
			angular.forEach(input, function(item){
				if(item[property] == value)
					result.push(item);
			});
			return result;
		}
		else 
			return [];
	}
});