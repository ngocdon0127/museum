var fs = require('fs');
var path = require('path');

var CITIES = {};
var DISTRICTS = {};
var WARDS = {};
CITIES = JSON.parse(fs.readFileSync(path.join(__dirname, 'cities.json')));

DISTRICTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'districts.json')));

WARDS = JSON.parse(fs.readFileSync(path.join(__dirname, 'wards.json')));

console.log(CITIES);

var citiesArr = [];

for(let prop in CITIES){
	citiesArr.push({
		id: prop,
		name: CITIES[prop].name,
		type: CITIES[prop].type
	})
}

citiesArr.sort((a, b) => {
	return a.name.localeCompare(b.name)
})

console.log(citiesArr)

citiesArr.map((city) => {
	delete city.id;
})

fs.writeFileSync(path.join(__dirname, 'cities-sort.json'), JSON.stringify(citiesArr, null, 4));

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