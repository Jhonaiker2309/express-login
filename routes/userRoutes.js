const express = require("express");
const router = express.Router();
const {
	createAccessToken,
	createRefreshToken,
	sendRefreshToken,
	sendAccessToken,
} = require("../tokenFunctions/index.js");
const { verify, sign } = require("jsonwebtoken");
const { hash, compare } = require("bcryptjs");
const UsersRegistered = require("../models/UsersRegistered.js");
const { isAuth } = require("../isAuth.js");
const sendEmail = require("../emailSender.js");
require("dotenv/config");

router.post("/register", async (req, res) => {
	const { email, password } = req.body;

	try {
		const hashedPassword = await hash(password, 10);
		
		const newUser = new UsersRegistered({
			
			email: email,
			password: hashedPassword,
		});

        const userAlreadyTaken = await UsersRegistered.findOne({email})
        if(userAlreadyTaken){
          return res.send("User already Taken")
        }

		const userSaved = await newUser.save();
		const token = sign(
			{ id: userSaved._id },
			process.env.REFRESH_TOKEN_SECRET,
			{
				expiresIn: 86400, 
			},
		);

		return res.status(200).json({ token, userSaved });
	} catch (e) {
		res.send({
			error: `${e.message}`,
		});
	}
});

router.post("/login", async (req, res) => {
	try {
		
		const userFound = await UsersRegistered.findOne({ email: req.body.email });

		if (!userFound) return res.status(400).json({ message: "User Not Found" });

		const matchPassword = await compare(req.body.password, userFound.password);

		if (!matchPassword)
			return res.status(401).json({
				token: null,
				message: "Invalid Password",
			});

		const accesstoken = createAccessToken(userFound.id);
		const refreshtoken = createRefreshToken(userFound.id);
		
		userFound.refreshtoken = refreshtoken;
		
		sendRefreshToken(res, refreshtoken);
		sendAccessToken(res, req, accesstoken);
	} catch (error) {
		console.log(error);
	}
});

router.post("/logout", (_req, res) => {
	res.clearCookie("refreshtoken", { path: "/refresh_token" });
	
	return res.send({
		message: "Logged out",
	});
});

router.post("/protected", async (req, res) => {
	try {
		const userId = isAuth(req);
		if (userId !== null) {
			res.send({
				data: "You are a valid user, please don't share the information that you will find here",
			});
		}
	} catch (err) {
		res.send({
			error: `${err.message}`,
		});
	}
});


router.post("/refresh_token", async (req, res) => {
	const token = req.cookies.refreshtoken;
	
	console.log(token);
	if (!token) return res.send({ accesstoken: "" });
	
	let payload = null;
	try {
		payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
	} catch (err) {
		return res.send({ accesstoken: "" });
	}
	

	const user = await UsersRegistered.findOne({ _id: payload.userId });
	console.log(user);
	if (!user) return res.send({ accesstoken: "" });
	
	if (user.refreshtoken !== token) return res.send({ accesstoken: "" });
	
	const accesstoken = createAccessToken(user.id);
	const refreshtoken = createRefreshToken(user.id);
	
	user.refreshtoken = refreshtoken;
	
	sendRefreshToken(res, refreshtoken);
	return res.send({ accesstoken });
});

router.post("/reset", async (req, res) => {
    
	try {
      
		const user = await UsersRegistered.findOne({ email: req.body.email });
        console.log(req.body)
		if (!user) return res.status(400).send("user with given email doesn't exist");

		const accesstoken = createAccessToken(user.id);

		const link = `${process.env.FRONT_URL}/reset/${user._id}/${accesstoken}`;
		await sendEmail(user.email, "Password reset", link);

		res.send("password reset link sent to your email account");
	} catch (error) {
		res.send("An error occured");
		console.log(error);
	}
});

router.put("/recover", async (req, res) => {
	try {
		const user = await UsersRegistered.findOne({ _id: req.body.id });
		if (!user) return res.status(400).send("invalid link or expired");

		let payload = null;
		try {
			payload = verify(req.body.token, process.env.ACCESS_TOKEN_SECRET);
		} catch (err) {
			return res.send({ accesstoken: "" });
		}

		if (!(payload._id == user._id).toString) {
			console.log(payload);
			console.log(user._id.toString());
			console.log("fail");
			return res.status(400).send("Invalid link or expired");
		}

		const hashedPassword = await hash(req.body.password, 10);
		console.log(user._id.toString());
		UsersRegistered.findByIdAndUpdate(
			{ _id: user._id.toString() },
			{ password: hashedPassword },
		).then((user) => console.log(user));
	} catch (error) {
		res.send("An error occured");
		console.log(error);
	}
});

module.exports = router