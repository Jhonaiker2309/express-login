"use strict";

var nodemailer = require("nodemailer");

require("dotenv/config");

var sendEmail = function sendEmail(email, subject, link) {
  var transporter;
  return regeneratorRuntime.async(function sendEmail$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          transporter = nodemailer.createTransport({
            host: process.env.HOST_TYPE,
            port: 587,
            secure: false,
            auth: {
              user: process.env.USER_EMAIL,
              pass: process.env.USER_PASSWORD
            },
            tls: {
              ciphers: process.env.CIPHER
            }
          });
          _context.next = 4;
          return regeneratorRuntime.awrap(transporter.sendMail({
            from: process.env.USER_EMAIL,
            to: email,
            subject: subject,
            html: "<div><b>Please click on this link to change your password </b><a href=\"".concat(link, "\">").concat(link, "</a></div>")
          }));

        case 4:
          console.log("email sent sucessfully");
          _context.next = 10;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0, "email not sent");

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

module.exports = sendEmail;