"use strict";

var express = require("express");

var router = express.Router();

var _require = require("../tokenFunctions/index.js"),
    createAccessToken = _require.createAccessToken,
    createRefreshToken = _require.createRefreshToken,
    sendRefreshToken = _require.sendRefreshToken,
    sendAccessToken = _require.sendAccessToken;

var _require2 = require("jsonwebtoken"),
    verify = _require2.verify,
    sign = _require2.sign;

var _require3 = require("bcryptjs"),
    hash = _require3.hash,
    compare = _require3.compare;

var UsersRegistered = require("../models/UsersRegistered.js");

var _require4 = require("../isAuth.js"),
    isAuth = _require4.isAuth;

var sendEmail = require("../emailSender.js");

require("dotenv/config");

router.post("/register", function _callee(req, res) {
  var _req$body, email, password, hashedPassword, newUser, userAlreadyTaken, userSaved, token;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, email = _req$body.email, password = _req$body.password;
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(hash(password, 10));

        case 4:
          hashedPassword = _context.sent;
          newUser = new UsersRegistered({
            email: email,
            password: hashedPassword
          });
          _context.next = 8;
          return regeneratorRuntime.awrap(UsersRegistered.findOne({
            email: email
          }));

        case 8:
          userAlreadyTaken = _context.sent;

          if (!userAlreadyTaken) {
            _context.next = 11;
            break;
          }

          return _context.abrupt("return", res.send("User already Taken"));

        case 11:
          _context.next = 13;
          return regeneratorRuntime.awrap(newUser.save());

        case 13:
          userSaved = _context.sent;
          token = sign({
            id: userSaved._id
          }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: 86400
          });
          return _context.abrupt("return", res.status(200).json({
            token: token,
            userSaved: userSaved
          }));

        case 18:
          _context.prev = 18;
          _context.t0 = _context["catch"](1);
          res.send({
            error: "".concat(_context.t0.message)
          });

        case 21:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 18]]);
});
router.post("/login", function _callee2(req, res) {
  var userFound, matchPassword, accesstoken, refreshtoken;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(UsersRegistered.findOne({
            email: req.body.email
          }));

        case 3:
          userFound = _context2.sent;

          if (userFound) {
            _context2.next = 6;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "User Not Found"
          }));

        case 6:
          _context2.next = 8;
          return regeneratorRuntime.awrap(compare(req.body.password, userFound.password));

        case 8:
          matchPassword = _context2.sent;

          if (matchPassword) {
            _context2.next = 11;
            break;
          }

          return _context2.abrupt("return", res.status(401).json({
            token: null,
            message: "Invalid Password"
          }));

        case 11:
          accesstoken = createAccessToken(userFound.id);
          refreshtoken = createRefreshToken(userFound.id);
          userFound.refreshtoken = refreshtoken;
          sendRefreshToken(res, refreshtoken);
          sendAccessToken(res, req, accesstoken);
          _context2.next = 21;
          break;

        case 18:
          _context2.prev = 18;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0);

        case 21:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 18]]);
});
router.post("/logout", function (_req, res) {
  res.clearCookie("refreshtoken", {
    path: "/refresh_token"
  });
  return res.send({
    message: "Logged out"
  });
});
router.post("/protected", function _callee3(req, res) {
  var userId;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          try {
            userId = isAuth(req);

            if (userId !== null) {
              res.send({
                data: "You are a valid user, please don't share the information that you will find here"
              });
            }
          } catch (err) {
            res.send({
              error: "".concat(err.message)
            });
          }

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
});
router.post("/refresh_token", function _callee4(req, res) {
  var token, payload, user, accesstoken, refreshtoken;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          token = req.cookies.refreshtoken;
          console.log(token);

          if (token) {
            _context4.next = 4;
            break;
          }

          return _context4.abrupt("return", res.send({
            accesstoken: ""
          }));

        case 4:
          payload = null;
          _context4.prev = 5;
          payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
          _context4.next = 12;
          break;

        case 9:
          _context4.prev = 9;
          _context4.t0 = _context4["catch"](5);
          return _context4.abrupt("return", res.send({
            accesstoken: ""
          }));

        case 12:
          _context4.next = 14;
          return regeneratorRuntime.awrap(UsersRegistered.findOne({
            _id: payload.userId
          }));

        case 14:
          user = _context4.sent;
          console.log(user);

          if (user) {
            _context4.next = 18;
            break;
          }

          return _context4.abrupt("return", res.send({
            accesstoken: ""
          }));

        case 18:
          if (!(user.refreshtoken !== token)) {
            _context4.next = 20;
            break;
          }

          return _context4.abrupt("return", res.send({
            accesstoken: ""
          }));

        case 20:
          accesstoken = createAccessToken(user.id);
          refreshtoken = createRefreshToken(user.id);
          user.refreshtoken = refreshtoken;
          sendRefreshToken(res, refreshtoken);
          return _context4.abrupt("return", res.send({
            accesstoken: accesstoken
          }));

        case 25:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[5, 9]]);
});
router.post("/reset", function _callee5(req, res) {
  var user, accesstoken, link;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(UsersRegistered.findOne({
            email: req.body.email
          }));

        case 3:
          user = _context5.sent;
          console.log(req.body);

          if (user) {
            _context5.next = 7;
            break;
          }

          return _context5.abrupt("return", res.status(400).send("user with given email doesn't exist"));

        case 7:
          accesstoken = createAccessToken(user.id);
          link = "".concat(process.env.FRONT_URL, "/reset/").concat(user._id, "/").concat(accesstoken);
          _context5.next = 11;
          return regeneratorRuntime.awrap(sendEmail(user.email, "Password reset", link));

        case 11:
          res.send("password reset link sent to your email account");
          _context5.next = 18;
          break;

        case 14:
          _context5.prev = 14;
          _context5.t0 = _context5["catch"](0);
          res.send("An error occured");
          console.log(_context5.t0);

        case 18:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 14]]);
});
router.put("/recover", function _callee6(req, res) {
  var user, payload, hashedPassword;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap(UsersRegistered.findOne({
            _id: req.body.id
          }));

        case 3:
          user = _context6.sent;

          if (user) {
            _context6.next = 6;
            break;
          }

          return _context6.abrupt("return", res.status(400).send("invalid link or expired"));

        case 6:
          payload = null;
          _context6.prev = 7;
          payload = verify(req.body.token, process.env.ACCESS_TOKEN_SECRET);
          _context6.next = 14;
          break;

        case 11:
          _context6.prev = 11;
          _context6.t0 = _context6["catch"](7);
          return _context6.abrupt("return", res.send({
            accesstoken: ""
          }));

        case 14:
          if ((payload._id == user._id).toString) {
            _context6.next = 19;
            break;
          }

          console.log(payload);
          console.log(user._id.toString());
          console.log("fail");
          return _context6.abrupt("return", res.status(400).send("Invalid link or expired"));

        case 19:
          _context6.next = 21;
          return regeneratorRuntime.awrap(hash(req.body.password, 10));

        case 21:
          hashedPassword = _context6.sent;
          console.log(user._id.toString());
          UsersRegistered.findByIdAndUpdate({
            _id: user._id.toString()
          }, {
            password: hashedPassword
          }).then(function (user) {
            return console.log(user);
          });
          _context6.next = 30;
          break;

        case 26:
          _context6.prev = 26;
          _context6.t1 = _context6["catch"](0);
          res.send("An error occured");
          console.log(_context6.t1);

        case 30:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 26], [7, 11]]);
});
module.exports = router;