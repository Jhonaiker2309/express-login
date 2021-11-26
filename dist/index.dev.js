"use strict";

var express = require("express");

var cookieParser = require("cookie-parser");

var cors = require("cors");

var mongoose = require("mongoose");

var app = express();

var userRoutes = require("./routes/userRoutes.js");

require("dotenv/config");

app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use("", userRoutes);
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
app.listen(process.env.PORT, function () {
  return console.log("Server listening on port ".concat(process.env.PORT, "!"));
});