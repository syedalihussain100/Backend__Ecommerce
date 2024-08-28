const { checkRole, verifyToken } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const { productImgResize, uploadPhoto } = require("../middleware/uploadImage");
const { createProduct, GetProduct,IdProducts,updateProduct,deleteProduct,rating, } = require("../Controller/ProductController");


router.route("/product").post(verifyToken, checkRole(['admin']), uploadPhoto.array("images", 5), productImgResize, createProduct);
router.route("/product").get(GetProduct);
router.route("/product/:id").get(IdProducts);
router.route("/product/:id").put(verifyToken, checkRole(['admin']), updateProduct);
router.route("/product/:id").delete(verifyToken, checkRole(['admin']), deleteProduct);
router.route("/rating").put(verifyToken, checkRole(['user','admin']),rating);
router.route("/rating").put(verifyToken, checkRole(['user','admin']),rating);




module.exports = router;