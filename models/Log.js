var bcrypt = require('bcrypt-nodejs');

var mongoose = require('mongoose');
var Animal = mongoose.model('Animal');

module.exports = function (mongoose) {
	var logSchema = mongoose.Schema({
		userId: String,
		userFullName: String,
		animal1: Object,
		animal2: Object,
		action: String
	});

	var Log = mongoose.model("Log", logSchema);
	return Log;
}