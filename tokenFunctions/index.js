const { sign } = require("jsonwebtoken");


const createAccessToken = (userId) => {
	return sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});
};

const createRefreshToken = (userId) => {
	return sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});
};

const sendAccessToken = (res, req, accesstoken) => {
	res.send({
		accesstoken,
		email: req.body.email,
	});
};

const sendRefreshToken = (res, token) => {
	res.cookie("refreshtoken", token, {
		path: "/refresh_token",
        httpOnly: true
	}); 
};

module.exports = {
	createAccessToken,
	createRefreshToken,
	sendAccessToken,
	sendRefreshToken,
};
