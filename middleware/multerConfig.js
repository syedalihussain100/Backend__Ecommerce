const multer = require("multer");
const { MulterError } = multer;

module.exports = {
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype !== "image/png" &&
            file.mimetype !== "image/jpeg" &&
            file.mimetype !== "image/jpg" // Added support for .jpg
        ) {
            return cb(new MulterError("LIMIT_INVALID_TYPE"));
        }

        return cb(null, true);
    },
    limits: {
        fileSize: 1024 * 1024 * 2, // 2 MB
    },
    storage: multer.memoryStorage(),
};











// const multer = require("multer");
// const { MulterError } = multer;

// module.exports = {
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype !== "image/png" && file.mimetype !== "image/jpeg") {
//             return cb(new MulterError("LIMIT_INVALID_TYPE"));
//         }

//         return cb(null, true);
//     },
//     limits: {
//         fileSize: 1024 * 1024 * 2, // 2 MB
//     },
//     storage: multer.memoryStorage(),
// };
