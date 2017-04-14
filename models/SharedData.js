var mongoose = require('mongoose');

module.exports = function (mongoose) {
	var sharedDataSchema = mongoose.Schema({
		deTai: [{
			maDeTai: String,
			tenDeTai: String,
			donViChuTri: String
		}]
	});

	var SharedData = mongoose.model("SharedData", sharedDataSchema);
	return SharedData;
}