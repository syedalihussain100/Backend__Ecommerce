const { checkRole, verifyToken } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const { articleImgResize, uploadPhoto } = require("../middleware/uploadImage");
const { createArticle, GetAllArticle, IdArticle, deleteArticle, updateArticle, rating, createCategory, getallCategory,getCategory } = require("../Controller/ArticleController");
const uploadImageHandler = require("../middleware/ArticleUploadImageMiddleware");

router.route("/article").post(verifyToken, checkRole(['admin', 'user']), uploadImageHandler, createArticle)
router.route("/article").get(GetAllArticle);
router.route("/article/:id").get(IdArticle);
router.route("/article/:id").delete(verifyToken, checkRole(['admin', 'user']), deleteArticle);
router.route("/article/:id").put(verifyToken, checkRole(['admin', 'user']), updateArticle);
router.route("/article/rating").put(verifyToken, checkRole(['user', 'admin']), rating);
router.route("/article/category").post(verifyToken, checkRole(['user', 'admin']), createCategory);
router.get("/article/category", getallCategory);
router.get("/article/category/:id", getCategory);



module.exports = router