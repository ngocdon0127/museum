
//filter wards by district id
app.filter('customDistrict', function() {
  return function(input, search) {
    if (!input) return input;
    if (!search) return search;
    var result = [];
    angular.forEach(input, function(value, key) {
      if (value.districtId == search) {
        result.push(value)
      }
    });
    return result;
  }
});

//filter district by city id
app.filter('customCity', function() {
  return function(input, search) {
    if (!input) return input;
    if (!search) return search;
    var result = [];
    angular.forEach(input, function(value, key) {
      if (value.cityId == search) {
        result.push(value);
      }
    });
    return result;
  }
});