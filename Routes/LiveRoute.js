const express = require("express");
const {
    createVideoId,
    deleteVideoId,
    getAllVideos,
    getVideoById,
    updateVideoId
} = require("../Controller/liveStreamingController");
const router = express.Router();
const { checkRole, verifyToken } = require("../middleware/authMiddleware");



router.route("/live").post(verifyToken, checkRole(['admin']), createVideoId);
router.route("/live").get(verifyToken, checkRole(['admin', 'user']), getAllVideos);
router.route("/live/:id").get(verifyToken, checkRole(['admin', 'user']), getVideoById);
router.route("/live/:id").put(verifyToken, checkRole(['admin']), updateVideoId);
router.route("/live/:id").delete(verifyToken, checkRole(['admin']), deleteVideoId);








module.exports = router;



