//select the house by the district, wards
app.filter('customDistrict', function() {
  return function(input, search) {
  	// console.dir(input);
    if (!input) return input;
    if (!search) return input;
    var result = {};
    angular.forEach(input, function(value, key) {
      if (input[key].districtId == search) {
        result[key] = input[key];
      }
    });
    // console.log(result);
    return result;
  }
});
app.filter('customCity', function() {
  return function(input, search) {
    // console.dir(input);
    if (!input) return input;
    if (!search) return input;
    var result = {};
    angular.forEach(input, function(value, key) {
      if (input[key].cityId == search) {
        result[key] = input[key];
      }
    });
    // console.log(result);
    return result;
  }
});