require("dotenv").config();
const { Router } = require("express");
const multer = require("multer");
const { GridFsStorage }= require("multer-gridfs-storage");
const router = Router();
const { loadImg }= require("../connection");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

const storage = new GridFsStorage({
    url: process.env.MONGO_URL,    
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const userId = req.user._id;
            const fileInfo = {
                filename: `${Date.now()}-${file.originalname}`,
                bucketName: "uploads",
            };
            resolve(fileInfo);
        });
    },
});
 
const upload = multer({ storage });

router.get("/add-new", (req, res) => {
    return res.render("addBlog", {
        user: req.user,
    });
});

router.post("/", upload.single('coverImage'), async (req, res) => {
    const { title, body } = req.body;
    const imgName = req.file.filename;
    const blog = await Blog.create({
            title,
            body,
            createdBy: req.user._id,
            imgName: imgName,
        });
    return res.redirect(`/blog/${blog._id}`);
});


router.get("/myBlogs", async(req, res) => {
    if(!req.user) return res.redirect("/");
    const blogs = await Blog.find({createdBy: req.user._id.toString()});
    return res.render("myBlogs", {
        user: req.user,
        blogs: blogs,
    });
});

router.get("/:id", async(req, res) => {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    if(!blog) return res.redirect("/");
    const comments = await Comment.find({blogId: req.params.id}).populate("createdBy");
    return res.render("blog", {
        user: req.user,
        blog,
        comments,
        imgName: blog.imgName,
    });
});

router.get("/image/:imgName", (req, res) => {
    loadImg(res, req.params.imgName);
})

router.post("/comment/:blogId", async (req, res) => {
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
});

//as delete method not available in HTML forms, so post is used
router.post("/delete/:id", async (req, res) => {
    await Blog.findOneAndDelete({_id: req.params.id});
    return res.redirect("/");
});

module.exports = router; 