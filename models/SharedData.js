var mongoose = require('mongoose');

module.exports = function (mongoose) {
	var sharedDataSchema = mongoose.Schema({
		maDeTai: [String]
	});

	var SharedData = mongoose.model("SharedData", sharedDataSchema);
	return SharedData;
}