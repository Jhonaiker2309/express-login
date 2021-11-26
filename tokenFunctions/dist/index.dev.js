"use strict";

var _require = require("jsonwebtoken"),
    sign = _require.sign;

var createAccessToken = function createAccessToken(userId) {
  return sign({
    userId: userId
  }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m"
  });
};

var createRefreshToken = function createRefreshToken(userId) {
  return sign({
    userId: userId
  }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d"
  });
};

var sendAccessToken = function sendAccessToken(res, req, accesstoken) {
  res.send({
    accesstoken: accesstoken,
    email: req.body.email
  });
};

var sendRefreshToken = function sendRefreshToken(res, token) {
  res.cookie("refreshtoken", token, {
    path: "/refresh_token",
    httpOnly: true
  });
};

module.exports = {
  createAccessToken: createAccessToken,
  createRefreshToken: createRefreshToken,
  sendAccessToken: sendAccessToken,
  sendRefreshToken: sendRefreshToken
};