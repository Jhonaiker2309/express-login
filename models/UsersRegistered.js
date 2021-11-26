const mongoose = require("mongoose");
const { Schema } = mongoose;

const modelOfSchema = {
	
	email: { type: String, required: true },
	password: { type: String, required: true },
};

const userSchema = new Schema(modelOfSchema);

const UsersRegistered = mongoose.model("UsersRegistered", userSchema);

module.exports = UsersRegistered;
