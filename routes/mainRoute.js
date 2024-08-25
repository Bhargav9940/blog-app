const { Router } = require("express");
const router = Router();
const Blog = require("../models/blog");

router.get("/", async (req, res) => {
    const allBlogs = await Blog.find({});
    return res.render("home", {
    user: req.user,
    blogs: allBlogs
  });
})

module.exports = router;