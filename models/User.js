var bcrypt = require('bcrypt-nodejs');

module.exports = function (mongoose) {
	var userSchema = mongoose.Schema({
		username: String,
		password: String,
		fullname: String,
		permission: Number
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