const mongoose = require("mongoose");

var articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            required: true,
        },
        category: [],
        color:[],
        quantity: {
            type: Number,
            required: true,
        },
        image: {
            type: String,
        },
        link: {
            type: String,
            required: true
        },
        tags: [],
        ratings: [
            {
                star: Number,
                comment: String,
                postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            },
        ],
        totalrating: {
            type: String,
            default: 0,
        },
        type: {
            type: String,
            default: "article",
        },
    },
    { timestamps: true }
);

const articleModel = mongoose.model("ARTICLE", articleSchema);
module.exports = { articleModel };
