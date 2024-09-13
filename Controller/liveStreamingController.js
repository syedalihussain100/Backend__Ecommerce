const asyncHandler = require("express-async-handler");
const { StreamingModel } = require("../models/StreamingModel");



const createVideoId = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.body;

        if (!videoId) {
            return res.status(400).json({ message: "Video ID is required" });
        }

        const existingVideo = await StreamingModel.findOne({ videoId });

        if (existingVideo) {
            return res.status(400).json({ message: "Video ID already exists" });
        }

        // Create new video entry
        const newVideo = new StreamingModel({
            videoId,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newVideo.save(); // Save new video to database

        return res.status(201).json({ message: "Video ID created successfully", video: newVideo });


    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Find video by ID
        const video = await StreamingModel.findById(id);

        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        return res.status(200).json(video);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// Get all Videos (Read All)
const getAllVideos = asyncHandler(async (req, res) => {
    try {
        const videos = await StreamingModel.find();

        return res.status(200).json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// Update Video ID
const updateVideoId = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { videoId } = req.body;

        // Check if videoId is provided
        if (!videoId) {
            return res.status(400).json({ message: "Video ID is required" });
        }

        // Find video by ID and update
        const updatedVideo = await StreamingModel.findByIdAndUpdate(
            id,
            { videoId, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedVideo) {
            return res.status(404).json({ message: "Video not found" });
        }

        return res.status(200).json({ message: "Video ID updated successfully", video: updatedVideo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// Delete Video ID
const deleteVideoId = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Find video by ID and delete
        const deletedVideo = await StreamingModel.findByIdAndDelete(id);

        if (!deletedVideo) {
            return res.status(404).json({ message: "Video not found" });
        }

        return res.status(200).json({ message: "Video ID deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = { createVideoId, getVideoById, getAllVideos, updateVideoId, deleteVideoId }