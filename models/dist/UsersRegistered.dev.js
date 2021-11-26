"use strict";

var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var modelOfSchema = {
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
};
var userSchema = new Schema(modelOfSchema);
var UsersRegistered = mongoose.model("UsersRegistered", userSchema);
module.exports = UsersRegistered;