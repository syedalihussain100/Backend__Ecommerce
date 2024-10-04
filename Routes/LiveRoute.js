const express = require("express");
const {
    createVideoId,
    deleteVideoId,
    getAllVideos,
    getVideoById,
    updateVideoId
} = require("../Controller/liveStreamingController");
const router = express.Router();



router.route("/live").post(createVideoId);
router.route("/live").get(getAllVideos);
router.route("/live/:id").get(getVideoById);
router.route("/live/:id").put(updateVideoId);
router.route("/live/:id").delete(deleteVideoId);








module.exports = router;



