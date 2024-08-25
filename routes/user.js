const { Router } = require("express");
const User = require("../models/user");
const { createToken } = require("../services/authentication");

const router = Router();

router.get("/signin", (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("signup");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    //throws error for incorrect password
    const token = await User.matchPasswordAndGenerateToken(email, password);

    //matchPasswordAndGenerateToken -- checks password and generates token
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect Email or Password",
    });
  }
});

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  await User.create({
    fullName,
    email,
    password,
  });
  return res.redirect("/user/signin");
});

router.get("/logout", (req, res) => {
  if (!req.user) return res.redirect("/");
  res.clearCookie("token").redirect("/");
});

router.get("/profile", async (req, res) => {
  if (!req.user) return res.redirect("/");
  const result = await User.findOne({ _id: req.user._id });
  const url = result.profileImageURL;
  res.render("profile", {
    url: url,
    user: req.user,
  });
});

router.post("/profile", async (req, res) => {
  const userId = req.user._id;
  if (req.body.image)
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          profileImageURL: req.body.image,
          fullName: req.body.fullName,
          email: req.body.email,
        },
      }
    );
  else
    await User.findOneAndUpdate(
      { _id: userId },
      { $set: { fullName: req.body.fullName, email: req.body.email } }
    );

    req.user.fullName = req.body.fullName;
    req.user.email = req.body.email;
    const token = createToken(req.user);
    res.cookie("token", token);
    return res.json({message: "success!"});
});

module.exports = router;
