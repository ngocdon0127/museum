var bcrypt = require('bcrypt-nodejs');

module.exports = function (mongoose) {
	var userSchema = mongoose.Schema({
		username: String,
		// level: Number,
		maDeTai: String,
		password: String,
		fullname: String,
		lastLogin: Date,
		created_at: Date
	});
	
	userSchema.methods.hashPassword = function (plainPassword) {
		return bcrypt.hashSync(plainPassword, bcrypt.genSaltSync(8), null);
	}

	userSchema.methods.validPassword = function (plainPassword) {
		return bcrypt.compareSync(plainPassword, this.password);
	}

	var User = mongoose.model("User", userSchema);
	return User;
}