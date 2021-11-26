const nodemailer = require("nodemailer");
require("dotenv/config")
const sendEmail = async (email, subject, link) => {
	try {
		const transporter = nodemailer.createTransport({
			host: process.env.HOST_TYPE,
			port: 587,
			secure: false,
			auth: {
				user: process.env.USER_EMAIL,
				pass: process.env.USER_PASSWORD,
			},
			tls: {
				ciphers: process.env.CIPHER,
			},
		});

		await transporter.sendMail({
			from: process.env.USER_EMAIL,
			to: email,
			subject: subject,
			html: `<div><b>Please click on this link to change your password </b><a href="${link}">${link}</a></div>`
        });

		console.log("email sent sucessfully");
	} catch (error) {
		console.log(error, "email not sent");
	}
};

module.exports = sendEmail;
