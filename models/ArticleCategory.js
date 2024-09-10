const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var articlecategorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

//Export the model
const ArticleCategoryModel = mongoose.model("ACategory", articlecategorySchema);
module.exports = { ArticleCategoryModel };