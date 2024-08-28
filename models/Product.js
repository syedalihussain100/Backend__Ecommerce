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
        quantity: {
            type: Number,
            required: true,
        },
        // sold: {
        //     type: Number,
        //     default: 0,
        // },
        images: [],
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
    },
    { timestamps: true }
);

//Export the model
const productModel = mongoose.model("Product", productSchema)
module.exports = { productModel }