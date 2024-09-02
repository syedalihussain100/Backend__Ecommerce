const path = require("path");
const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const multerConfig = require("./multerConfig");

const upload = multer(multerConfig).single("image");

module.exports = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            switch (err.code) {
                case "LIMIT_INVALID_TYPE":
                    return res.status(400).json({ message: "Invalid file type! Only PNG and JPEG are allowed" });
                case "LIMIT_FILE_SIZE":
                    return res.status(400).json({ message: "File size is too large! Max size is 2MB" });
                default:
                    return res.status(400).json({ message: "Something went wrong!" });
            }
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        try {
            const filename = `${Date.now()}${path.extname(req.file.originalname)}`;
            const saveTo = path.resolve(__dirname, "../public/images/article");
            const filePath = path.join(saveTo, filename);

            await sharp(req.file.buffer)
                .resize({ width: 300, height: 300 })
                .jpeg({ quality: 30 })
                .toFile(filePath);

            req.file.filename = filename;
            req.file.filePath = filePath; // Save the local file path

            next();
        } catch (err) {
            console.log("Error ==> ", err.message);
            res.status(400).json({ message: err.message });
        }
    });
};
