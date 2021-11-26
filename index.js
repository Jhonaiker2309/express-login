const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const userRoutes = require("./routes/userRoutes.js");
require("dotenv/config");


app.use(cookieParser());

app.use(
	cors({
		origin: process.env.FRONT_URL,
		credentials: true,
	}),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("", userRoutes);

mongoose.connect(process.env.MONGO_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

app.listen(process.env.PORT, () =>
	console.log(`Server listening on port ${process.env.PORT}!`),
);
