var bcrypt = require('bcrypt-nodejs');

var mongoose = require('mongoose');

module.exports = function (mongoose) {
	var logSchema = mongoose.Schema({
		userId: String,
		userFullName: String,
		action: String,
		time: Date,
		objType: String,
		obj1: Object,
		obj2: Object
	});

	var Log = mongoose.model("Log", logSchema);
	return Log;
}