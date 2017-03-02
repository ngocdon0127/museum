 
var fs = require('fs');
var path = require('path');

var CITIES = {};
var DISTRICTS = {};
var WARDS = {};

WARDS = JSON.parse(fs.readFileSync(path.join(__dirname, 'wards.json')));

console.log(WARDS);

var wardsArr = [];

for(let prop in WARDS){
	wardsArr.push({
		id: prop,
		name: WARDS[prop]["name"],
		type: WARDS[prop]["type"],
		"lon, lat": WARDS[prop]["lon, lat"],
		districtId: WARDS[prop]["districtId"],
	})
}



wardsArr.sort((a, b) => {
	return a.name.localeCompare(b.name);
})

console.log(wardsArr)

fs.writeFileSync(path.join(__dirname, 'wards-sort.json'), JSON.stringify(wardsArr, null, 4));