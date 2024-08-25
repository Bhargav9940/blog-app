require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8000;

const { connectToMongoDB } = require("./connection.js");
const cookieParser = require("cookie-parser");
const Blog = require("./models/blog");

const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

connectToMongoDB(process.env.MONGO_URL).then(() => {
  console.log("MongoDB is connected!");
  app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
});

//route registration
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const mainRoute = require("./routes/mainRoute");

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));  

//middleware
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));
app.use(express.json({ limit: "10mb" }));

app.use("/", mainRoute);
app.use("/user", userRoute);
app.use("/blog", blogRoute);




