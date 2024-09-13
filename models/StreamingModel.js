const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var liveSchema = new mongoose.Schema(
    {
        videoId: {
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
const StreamingModel = mongoose.model("LIVE", liveSchema);
module.exports = { StreamingModel };