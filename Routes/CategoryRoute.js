const express = require("express");
const {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getallCategory,
} = require("../Controller/CategoryController");
const router = express.Router();
const { checkRole, verifyToken } = require("../middleware/authMiddleware");


router.post("/category", verifyToken, checkRole(['user', 'admin']), createCategory);
router.put("/category/:id", verifyToken, checkRole(['user', 'admin']),updateCategory);
router.delete("/category/:id",verifyToken, checkRole(['user', 'admin']), deleteCategory);
router.get("/category/:id", getCategory);
router.get("/category", getallCategory);

module.exports = router;