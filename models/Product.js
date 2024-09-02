const mongoose = require("mongoose");

var productSchema = new mongoose.Schema(
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
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        information: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1, 
        },
        images: {
            type: [String],
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
            default: "product",
        },
    },
    { timestamps: true }
);

const productModel = mongoose.model("Product", productSchema);
module.exports = { productModel };
