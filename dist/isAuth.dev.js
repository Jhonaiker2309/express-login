"use strict";

var _require = require("jsonwebtoken"),
    verify = _require.verify;

var isAuth = function isAuth(req) {
  var authorization = req.headers["authorization"];
  if (!authorization) throw new Error("You need to login.");
  var token = authorization.split(" ")[1];

  var _verify = verify(token, process.env.ACCESS_TOKEN_SECRET),
      userId = _verify.userId;

  return userId;
};

module.exports = {
  isAuth: isAuth
};